import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/m5-member-journeys-browser-check.mjs <preview-url>');
const out='test-results/m5-member-journeys';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
const scenarios=[
 {id:'visitor',role:'guest',group:false,team:false},
 {id:'group-member',role:'connected',group:true,team:false},
 {id:'serving-volunteer',role:'connected',group:false,team:true},
 {id:'leader-review',role:'leader',group:true,team:false}
];
async function onboard(page,scenario){
 await page.goto(new URL('/?rallyOne=1&welcome=1',base).href);
 await page.locator('[data-welcome="create"]:visible').click();
 await page.locator('[data-welcome-campus="central"]:visible').click();
 await page.locator('#rp-gateway [data-welcome="next"]').click();
 await page.locator('[data-welcome-role="'+scenario.role+'"]:visible').click();
 await page.locator('#rp-gateway [data-welcome="next"]').click();
 if(scenario.role!=='guest'){
  if(!scenario.group)await page.locator('[data-welcome-membership="group"]').click();
  if(scenario.team)await page.locator('[data-welcome-membership="team"]').click();
 }
 await page.locator('#rp-onboard-name').fill(scenario.id==='visitor'?'Jamie':'Alex');
 await page.locator('[data-welcome="finish"]:visible').click();
 await page.locator('#rp-gateway').waitFor({state:'hidden'});
 await page.locator('.f09-board').waitFor();
 const saved=await page.evaluate(()=>({
  ui:JSON.parse(localStorage.getItem('rallypoint-today-ui-v1')),
  app:JSON.parse(localStorage.getItem('rallypoint-phase1-2026'))
 }));
 assert.deepEqual(saved.ui.memberships,{group:scenario.group,team:scenario.team},scenario.id+' permissions');
 assert.equal(saved.app.role,'member','Onboarding never grants leader fixture');
}
async function audit(page,name){
 const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 assert.deepEqual(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],name+' WCAG');
}
async function assertFocus(page,label){
 assert.equal(await page.locator('.f09b-hero').count(),1,label+' one primary action');
 assert.ok(await page.locator('.f09b-row').count()<=1,label+' at most one secondary action');
 assert.equal(await page.locator('.ro-care--today').count(),0,label+' no second care widget');
 const surface=page.locator('.f09b-priorities');
 assert.ok(await surface.isVisible(),label+' existing board is still visible');
}
try{
 for(const scenario of scenarios){
  const context=await browser.newContext({
   viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.clock.setFixedTime(new Date('2026-11-25T12:00:00'));
  await onboard(page,scenario);
  await assertFocus(page,scenario.id);
  if(scenario.id==='visitor'){
   await page.locator('.f09b-hero[data-priority="welcome-community"]').waitFor();
   assert.equal(await page.locator('.ro-care').count(),0);
   await page.screenshot({path:out+'/01-visitor-today-390.png',animations:'disabled'});
   await page.locator('.f09b-hero .f09b-primary').click();
   await page.locator('.group-discovery-v07 .gv2-public-rail').waitFor();
   assert.equal(await page.locator('.gv2-rail-button[data-person]').count(),6);
   assert.equal(await page.locator('.gv2-home').count(),0);
   await page.locator('#nav [data-go="team"]').click();
   await page.locator('.team-empty-v08').waitFor();
  }
  if(scenario.id==='group-member'){
   await page.locator('.f09b-hero[data-priority="group-rsvp"]').waitFor();
   await page.screenshot({path:out+'/02-group-today-390.png',animations:'disabled'});
   await page.locator('.f09b-hero [data-action="f09-rsvp"]').click();
   assert.equal(await page.locator('[data-priority="group-rsvp"]').count(),0);
   await page.locator('.f09b-hero[data-priority="group-unread"]').waitFor();
   await page.locator('.f09b-hero [data-go="group"][data-pane="chat"]').click();
   const frame=page.frameLocator('.connect-overlay iframe');
   await frame.locator('#screen-thread:not([hidden])').waitFor();
   await page.locator('.connect-overlay > button').click();
   await page.locator('.f09b-hero[data-priority="care-prayer"]').waitFor();
   await page.locator('.f09b-hero [data-action="care-open-prayer"]').click();
   await page.locator('.ro-care--prayer').waitFor();
   await page.locator('.ro-care--prayer [data-action="care-mark-prayed"]').click();
   await page.locator('#nav [data-go="today"]').click();
   await page.locator('.f09b-hero[data-priority="care-check-in"]').waitFor();
   await assertFocus(page,'group after prayer');
   await page.screenshot({path:out+'/02-group-care-390.png',animations:'disabled'});
  }
  if(scenario.id==='serving-volunteer'){
   await page.locator('.f09b-hero[data-priority="serve-response"]').waitFor();
   await page.screenshot({path:out+'/03-serving-today-390.png',animations:'disabled'});
   await page.locator('.f09b-hero [data-action="f09-serve"]').click();
   assert.equal(await page.locator('[data-priority="serve-response"]').count(),0);
   await page.locator('.f09b-hero[data-priority="caught-up"]').waitFor();
   assert.equal(await page.locator('.ro-care').count(),0,'no private group prayer shown');
   await page.locator('#nav [data-go="team"]').click();
   await page.locator('.team-screen-v08:not(.team-empty-v08)').waitFor();
   assert.match(await page.locator('#view').textContent(),/Confirmed|confirmed/);
  }
  if(scenario.id==='leader-review'){
   await page.locator('.f09b-hero[data-priority="group-rsvp"]').waitFor();
   assert.equal(await page.locator('[data-priority="leader-checkins"]').count(),0);
   await page.locator('[data-action="demo-controls"]').click();
   await page.locator('#role').click();
   await page.locator('[data-action="close-dialog"]').click();
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')).role),'leader');
   await page.screenshot({path:out+'/04-leader-today-390.png',animations:'disabled'});
   await page.locator('.f09b-hero [data-action="f09-rsvp"]').click();
   await page.locator('.f09b-hero [data-go="group"][data-pane="chat"]').click();
   const frame=page.frameLocator('.connect-overlay iframe');
   await frame.locator('#screen-thread:not([hidden])').waitFor();
   await page.locator('.connect-overlay > button').click();
   await page.locator('.f09b-hero[data-priority="leader-checkins"]').waitFor();
   await page.locator('.f09b-hero [data-go="group"][data-pane="leader"]').click();
   await page.locator('.gv2-detail-heading').waitFor();
   assert.equal(await page.locator('[data-action="reached"]').count(),2);
   await page.locator('[data-action="reached"][data-person="marcus"]').click();
   await page.locator('[data-action="reached"][data-person="taylor"]').click();
   await page.locator('#nav [data-go="today"]').click();
   assert.equal(await page.locator('[data-priority="leader-checkins"]').count(),0,
    'reviewed check-ins must disappear, not become an engagement score');
   await assertFocus(page,'leader after follow-through');
  }
  await page.locator('#nav [data-go="today"]').click();
  await audit(page,scenario.id+' Today');
  await assertFocus(page,scenario.id+' final');
  assert.deepEqual(errors,[],scenario.id+' JavaScript runtime errors');
  await context.close();
  console.log('M5C journey passed: '+scenario.id);
 }
 // Deliberately check compact/tall viewport layouts without repeating the
 // expensive full onboarding/leader lifecycle for every device size.
 for(const [width,height] of [[320,640],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').click();
  await page.locator('[data-welcome="demo"]:visible').click();
  await page.locator('#rp-gateway').waitFor({state:'hidden'});
  await assertFocus(page,'default '+width);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,
   'M5B board must not overflow at '+width);
  await page.screenshot({path:out+'/today-'+width+'.png',animations:'disabled'});
  await context.close();
  console.log('M5C viewport passed: '+width);
 }
}finally{await browser.close();}
