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
  // M5B does not add another card to Today. Prayer is still explicitly
  // available in its existing Groups surface, with its own local state.
  await page.locator('.f09-board').waitFor();
  assert.equal(await page.locator('.ro-care--today').count(),0);
  await page.locator('#nav [data-go="group"]').click();
  await page.locator('.ro-care--group[data-care-stage="ready"]').waitFor();
  const readCursor=()=>page.evaluate(()=>localStorage.getItem('rallypoint-wednesday-chat-lab-v1'));
  const cursorBefore=await readCursor();

  // The canonical Ask route is tested after the existing explicit care journey
  // in an isolated synthetic session below (no change to reference screenshots).
  // Opening and postponing a suggestion must never acknowledge messages.
  await page.locator('.ro-care--group [data-action="companion-snooze"]').click();
  await page.locator('.ro-care--group[data-care-stage="paused"]').waitFor();
  assert.equal(await readCursor(),cursorBefore);
  await page.locator('.ro-care--group [data-action="care-resume"]').click();
  await page.locator('.ro-care--group[data-care-stage="ready"]').waitFor();

  // Today → Groups Prayer; preview state updates only after human confirmation.
  await page.locator('.ro-care--group [data-action="care-open-prayer"]').click();
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
  await page.locator('.f09-board').waitFor();
  assert.equal(await page.locator('.ro-care--today').count(),0);
  assert.equal(await page.locator('.f09b-hero[data-priority^="care-"]').count(),0,
   'completed care is no longer a suggested action in Today');
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
  // New independent synthetic profile, no raw prayer content in the Ask answer.
  const routeContext=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const routePage=await routeContext.newPage();
  await routePage.goto(base);
  await routePage.locator('[data-welcome="login"]:visible').click();
  await routePage.locator('[data-welcome="demo"]:visible').click();
  await routePage.locator('#rp-gateway').waitFor({state:'hidden'});
  await routePage.evaluate(()=>{
    const key='rallypoint-phase1-2026',state=JSON.parse(localStorage.getItem(key));
    state.rsvp='going';state.teamStatus='confirmed';state.read=true;state.prayed=true;
    state.companionChoices={snoozedUntil:{'group-unread':'2099-01-01T00:00:00Z','group-unavailable':'2099-01-01T00:00:00Z'}};
    state.companionCare={};localStorage.setItem(key,JSON.stringify(state));
  });
  await routePage.reload();await routePage.locator('.f09-board').waitFor();
  const raw=()=>routePage.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')));
  const cursor=()=>routePage.evaluate(()=>localStorage.getItem('rallypoint-wednesday-chat-lab-v1'));
  const priorCursor=await cursor();
  await routePage.locator('[data-action="f10-open"]').click();
  await routePage.locator('.f10-chip[data-value="next"]').click();
  await routePage.locator('[data-action="f10-care-route"][data-value="care-prayer"]').click();
  await routePage.locator('.ro-care--prayer[data-care-stage="ready"]').waitFor();
  assert.equal((await raw()).companionCare.marcus,undefined);
  await routePage.locator('.ro-care--prayer [data-action="care-mark-prayed"]').click();
  await routePage.locator('#nav [data-go="today"]').click();
  await routePage.locator('[data-action="f10-open"]').click();
  await routePage.locator('.f10-chip[data-value="next"]').click();
  await routePage.locator('[data-action="f10-care-route"][data-value="care-check-in"]').click();
  await routePage.locator('.ro-care-draft-hint').waitFor();
  await routePage.locator('#direct-input').fill('An intentional local check-in');
  assert.equal((await raw()).companionCare.marcus.completedAt,undefined);
  assert.equal(await cursor(),priorCursor);
  // A failed write must preserve the draft and not claim a completed check-in.
  await routePage.evaluate(()=>{const original=Storage.prototype.setItem;window.__restoreCareStorage=()=>{Storage.prototype.setItem=original;};Storage.prototype.setItem=function(){throw Error('synthetic blocked write');};});
  await routePage.locator('[data-action="send"][data-value="direct"]').click();
  assert.equal(await routePage.locator('#direct-input').inputValue(),'An intentional local check-in');
  assert.equal((await raw()).companionCare.marcus.completedAt,undefined);
  assert.equal((await raw()).directMessages.marcus,undefined);
  await routePage.evaluate(()=>window.__restoreCareStorage());
  await routePage.locator('[data-action="send"][data-value="direct"]').click();
  assert.ok((await raw()).companionCare.marcus.completedAt);
  assert.equal((await raw()).directMessages.marcus.length,1);
  assert.equal(await cursor(),priorCursor);
  await routePage.locator('#nav [data-go="today"]').click();
  await routePage.locator('[data-action="f10-open"]').click();
  await routePage.locator('.f10-chip[data-value="next"]').click();
  assert.equal(await routePage.locator('[data-action="f10-care-route"]').count(),0);
  await routeContext.close();
  await context.close();
  console.log('Care path: Today → prayer → explicitly prayed → local DM → Today/Groups follow-through, gate and accessibility passed at '+width+'px');
 }
}finally{await browser.close();}
