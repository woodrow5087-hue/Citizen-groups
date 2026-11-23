import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/companion-care-browser-check.mjs <preview-url>');
const out='test-results/companion-care';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
try{
 for(const [width,height] of [[320,640],[390,844],[430,932]]){
  const context=await browser.newContext({
   viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').click();
  await page.locator('[data-welcome="demo"]:visible').click();
  await page.locator('#rp-gateway').waitFor({state:'hidden'});
  const card=page.locator('#view .ro-care');
  await page.locator('.ro-care--today[data-care-stage="ready"]').waitFor();
  const readCursor=()=>page.evaluate(()=>localStorage.getItem('rallypoint-wednesday-chat-lab-v1'));
  const cursorBefore=await readCursor();

  // Opening and postponing a suggestion must never acknowledge messages.
  await page.locator('.ro-care--today [data-action="companion-snooze"]').click();
  await page.locator('.ro-care--today[data-care-stage="paused"]').waitFor();
  assert.equal(await readCursor(),cursorBefore);
  await page.locator('.ro-care--today [data-action="care-resume"]').click();
  await page.locator('.ro-care--today[data-care-stage="ready"]').waitFor();

  // Today → Groups Prayer; preview state updates only after human confirmation.
  await page.locator('.ro-care--today [data-action="care-open-prayer"]').click();
  await page.locator('.ro-care--prayer[data-care-stage="ready"]').waitFor();
  assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),'group');
  assert.equal(await readCursor(),cursorBefore,'reading a prayer does not mark chat read');
  await page.locator('.ro-care--prayer [data-action="care-mark-prayed"]').click();
  await page.locator('.ro-care--prayer[data-care-stage="prayed"]').waitFor();

  // Pray → optional local DM. A starter must not overwrite someone’s draft.
  await page.locator('.ro-care--prayer [data-action="companion-encourage"]').click();
  await page.locator('.ro-care-draft-hint').waitFor();
  const input=page.locator('#direct-input');
  await input.fill('An intentional personal note');
  await page.locator('.ro-care-draft-hint [data-action="companion-starter"]').click();
  assert.equal(await input.inputValue(),'An intentional personal note');
  await input.fill('');
  await page.locator('.ro-care-draft-hint [data-action="companion-starter"]').click();
  assert.match(await input.inputValue(),/Hey Marcus/);
  assert.equal(await page.locator('.group-direct-messages').count(),0,
    'using a starter cannot send the message');
  await page.locator('[data-action="send"][data-value="direct"]').click();
  await page.locator('.group-direct-messages').waitFor();

  // Existing group state owns the local message; the care card only projects it.
  await page.locator('#nav [data-go="today"]').click();
  await page.locator('.ro-care--today[data-care-stage="followed-up"]').waitFor();
  assert.match(await card.textContent(),/No real message was delivered/);
  await page.locator('#nav [data-go="group"]').click();
  await page.locator('.ro-care--group[data-care-stage="followed-up"]').waitFor();
  assert.equal(await page.locator('.ro-care--group .ro-care-steps li.is-complete').count(),3);
  await page.locator('.gv2-widget-chat').click();
  const frame=page.frameLocator('.connect-overlay iframe');
  await frame.locator('#screen-thread:not([hidden])').waitFor();
  await page.locator('.connect-overlay > button').click();
  await page.locator('.gv2-home').waitFor();
  await page.locator('.ro-care--group[data-care-stage="followed-up"]').waitFor();

  if(width===390){
   await page.screenshot({path:out+'/groups-care-390.png',animations:'disabled'});
   await page.locator('#nav [data-go="today"]').click();
   await page.screenshot({path:out+'/today-care-390.png',animations:'disabled'});
  }

  await page.locator('[data-action="demo-controls"]').click();
  await page.locator('[data-action="scenario"][data-value="no-memberships"]').click();
  await page.locator('#nav [data-go="today"]').click();
  assert.equal(await card.count(),0,'guest cannot see group member care');
  await page.locator('#nav [data-go="group"]').click();
  await page.locator('.group-discovery-v07').waitFor();
  assert.equal(await card.count(),0);

  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(a11y.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],
    'Companion Care guest accessibility '+width);
  assert.deepEqual(errors,[],'No JS runtime errors '+width);
  await context.close();
  console.log('Care path: Today → prayer → explicitly prayed → local DM → Today/Groups follow-through, gate and accessibility passed at '+width+'px');
 }
}finally{await browser.close();}
