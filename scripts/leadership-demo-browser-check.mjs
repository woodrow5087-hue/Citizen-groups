import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
const base=process.argv[2];
try {
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,
   reducedMotion:width===320?'reduce':'no-preference'});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const action=name=>page.locator('[data-action="'+name+'"]:visible');
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')));
  const nav=id=>page.locator('#nav [data-go="'+id+'"]').click();
  async function scene(id){
   await page.locator('.profile-avatar').click();
   await page.locator('[data-action="s7-scenario"][data-value="'+id+'"]').click();
  }
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').click();
  await page.locator('[data-welcome="demo"]:visible').click();
  await scene('group-serving');
  await action('f09-rsvp').click();
  await page.locator('.r1-receipt button').click();
  assert.match(await page.locator('.group-gather-rsvp').innerText(),/going/);
  await nav('today');
  await action('f09-serve').click();
  await page.locator('.r1-receipt button').click();
  assert.equal((await state()).teamStatus,'confirmed');
  await nav('today');
  const portrait=page.locator('.gv2-rail-button[data-person="mandy"]');
  await portrait.click();
  await action('portrait-return').click();
  assert.equal(await portrait.evaluate(el=>el===document.activeElement),true);
  await scene('leader');
  assert.match(await page.locator('.f09b-hero h2').innerText(),/Taylor/);
  await page.locator('.f09b-hero .f09b-primary').click();
  await page.locator('.r1-request [data-action="reached"]').click();
  assert.deepEqual((await state()).reached,['taylor']);
  await action('leader-write').click();
  assert.equal((await state()).directMessages.taylor?.length??0,0);
  await page.locator('#direct-input').fill('Happy to catch up Wednesday.');
  await page.locator('[data-action="send"][data-value="direct"]').click();
  assert.equal((await state()).directMessages.taylor.at(-1).text,'Happy to catch up Wednesday.');
  await page.reload();
  assert.equal((await state()).directMessages.taylor.length,1);
  await scene('visitor');
  assert.equal(await page.locator('.r1-request').count(),0);
  assert.deepEqual(errors,[]);
  console.log(width+'px member, portrait, leader and visitor checks passed.');
  await page.close();
 }
} finally {await browser.close();}
