// Isolated fictional rehearsal profiles, never the owner's saved browser data.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2];assert.ok(base,'Pass verified preview origin');
const out='test-results/experience-e3b/showcase';await mkdir(out,{recursive:true});
const browser=await chromium.launch(),results=[];
try{
 for(const role of ['connected','leader']){
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'America/Denver',recordVideo:{dir:out,size:{width:390,height:844}}});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-12-02T12:00:00Z'));
  await page.goto(new URL('/foundation2/',base).href);await page.locator('.greeting').waitFor();
  await page.locator('#preview-tools>summary').click();await page.locator('#scenario').selectOption(role);
  const capture=async name=>page.screenshot({path:out+'/'+role+'-'+name+'.png',fullPage:true,animations:'disabled'});
  await capture('today-entry');
  await page.locator('#primary-nav [data-route=groups]').click();
  await page.locator('[data-group-action=group-rsvp][data-value=going]').click();
  await page.locator('[data-rel-contact=anna]').click();await page.locator('[data-rel=message]').click();
  const frame=page.frameLocator('#premium-connect');await frame.locator('#direct-input').fill('Fictional rehearsal note. Saved locally; no external delivery.');
  await frame.locator('#direct-form .send-btn').click();
  assert.match(await frame.locator('#direct-new-messages').innerText(),/Fictional rehearsal note/);
  await capture('conversation');await page.locator('.connect-return').click();
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset.returnFocus),'groups-contact-anna');
  if(role==='leader'){
   await page.locator('[data-rel-entry=leader]').click();
   await page.locator('[data-rel=attendance][data-id=anna][data-value=here]').click();
   await capture('explicit-attendance');await page.locator('[data-rel=close]').click();
   await page.locator('[data-group-action=group-care-prayed]').click();
   await page.locator('[data-rel-entry=prayer]').click();await page.locator('#rel-prayer').fill('Fictional rehearsal prayer, intentionally saved by the demo leader.');
   await page.locator('[data-rel=post]').click();await page.locator('[data-rel=close]').click();
  }
  await page.locator('#primary-nav [data-route=team]').click();
  await page.locator('[data-team-action=serving-response][data-value=declined]').click();
  await page.locator('[data-team-action=serving-coverage][data-value=request]').click();await capture('coverage');
  await page.locator('[data-return-focus=team-connect]').click();await frame.getByRole('tab',{name:'Plans',exact:true}).click();await capture('room-plans');
  await page.locator('.connect-return').click();
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset.returnFocus),'team-connect');
  await page.locator('[data-team-action=serving-coverage][data-value=withdraw]').click();
  await page.locator('[data-team-action=serving-response][data-value=confirmed]').click();
  await page.locator('#primary-nav [data-route=read]').click();await capture('read');
  await page.locator('[data-read-action=read]').click();await page.locator('#read-reflection-input').fill('An optional fictional intention for the rehearsal.');
  await page.locator('#read-reflection-form button').click();
  await page.locator('[data-return-focus=classic-launch]').click();await page.locator('[data-action=memory-pick]').first().click();
  await page.reload();await page.locator('[data-read-view=home]').click();
  assert.equal(await page.locator('[data-return-focus=classic-launch]').evaluate(e=>e===document.activeElement),true);
  await page.locator('#primary-nav [data-route=today]').click();await capture('today-finish');
  if(role==='connected')assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.');
  const saved=await page.evaluate(role=>JSON.parse(localStorage.getItem('rally-one-foundation2-v1:'+role+':primary')),role);
  assert.ok(Object.keys(saved.eventResponses.records).some(k=>k.includes('2026-12-')),'Dated local rehearsal responses');
  if(role==='leader')assert.equal(saved.attendance.anna,'here');
  assert.deepEqual(errors,[]);
  const video=page.video();await ctx.close();await video.saveAs(out+'/'+role+'-journey.webm');
  results.push({role,clock:'2026-12-02T12:00:00Z',timezone:'America/Denver',fictional:true,localOnly:true,status:'passed'});
  console.log('E3B showcase rehearsal passed '+role);
 }
}finally{await browser.close();await writeFile(out+'/results.json',JSON.stringify(results,null,2));}
