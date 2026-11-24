import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/s10c5-member-journeys-browser-check.mjs <preview-url>');
const out='test-results/s10c5-journeys';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
const evidence=[];
const scenes=['visitor','group-member','serving','care','leader'];
try {
 for(const scene of scenes){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  const result={scene,width:390,reducedMotion:true,checks:[]};
  evidence.push(result);
  const mark=label=>result.checks.push(label);
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')));
  const profile=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-today-ui-v1')));
  const cursor=()=>page.evaluate(()=>localStorage.getItem('rallypoint-wednesday-chat-lab-v1'));
  const nav=id=>page.locator('#nav [data-go="'+id+'"]').click();
  const action=name=>page.locator('[data-action="'+name+'"]:visible');
  const response=page.locator('.f10-response'),routes=page.locator('.f10-route');
  const open=async()=>{await action('f10-open').click();await response.waitFor();};
  const close=()=>action('close-dialog').click();
  const ask=async text=>{
   await page.locator('#f10-query').fill(text);
   await page.locator('[data-form="f10-query"] button[type="submit"]').click();
   await response.waitFor();
  };
  const route=(id,pane)=>page.locator('.f10-route[data-go="'+id+'"]'+(pane?'[data-pane="'+pane+'"]':''));
  const assertNoRoutes=async()=>assert.equal(await routes.count(),0);
  const choose=async id=>{
   await action('demo-controls').click();
   await page.locator('[data-action="s7-scenario"][data-value="'+id+'"]').click();
   await page.locator('.f09-board').waitFor();
  };
  const reload=async()=>{await page.reload();await page.locator('.f09-board').waitFor();assert.equal(await page.locator('#rp-gateway').isVisible(),false);assert.equal(await page.locator('.f10-panel').count(),0);};
  try{
   await page.clock.setFixedTime(new Date('2026-11-25T12:00:00'));
   await page.goto(base);
   await page.locator('[data-welcome="login"]:visible').click();
   await page.locator('[data-welcome="demo"]:visible').click();
   await page.locator('#rp-gateway').waitFor({state:'hidden'});
   await choose(scene==='care'?'group-member':scene==='serving'?'group-serving':scene);
   assert.equal(await page.locator('.f09b-hero').count(),1);
   assert.ok(await page.locator('.f09b-row').count()<=1);
   if(scene==='visitor'){
    const before=await state(),u=await profile();
    await open();await ask('I just moved here and want to make friends.');
    assert.match(await response.textContent(),/There’s room for you/);
    assert.equal(await routes.count(),1);
    await route('group').click();await page.locator('.group-discovery-v07').waitFor();
    assert.equal(await page.locator('.gv2-home').count(),0);
    assert.deepEqual((await profile()).memberships,u.memberships);
    await nav('read');await nav('today');await reload();await open();
    assert.equal(await page.locator('.f10-earlier-turn').count(),0);
    await ask('Any member-requested check-ins to review?');await assertNoRoutes();
    assert.doesNotMatch(await response.textContent(),/Taylor|Marcus/);
    await ask('Who can I pray for?');await assertNoRoutes();
    assert.equal((await state()).rsvp,before.rsvp);
    assert.deepEqual((await profile()).memberships,{group:false,team:false});
    await close();mark('discovery, no enrollment, private route denial, saved visitor, session reset');
   }
   if(scene==='group-member'){
    const prior=await cursor(),s=await state();
    await open();await ask('What should I focus on today?');
    assert.equal(await cursor(),prior);assert.equal((await state()).rsvp,s.rsvp);
    await page.locator('.f10-route[data-action="f10-confirm"][data-value="rsvp"]').click();
    assert.equal((await state()).rsvp,'going');
    assert.equal(await cursor(),prior);
    await close();await nav('group');await page.locator('.gv2-home').waitFor();
    assert.equal(await cursor(),prior);
    await page.locator('.gv2-widget-chat').click();
    await page.frameLocator('.connect-overlay iframe').locator('#screen-thread:not([hidden])').waitFor();
    await page.locator('.connect-overlay > button').click();
    assert.notEqual(await cursor(),prior);
    await nav('today');await reload();assert.equal((await state()).rsvp,'going');
    assert.equal(await page.locator('[data-priority="group-rsvp"]').count(),0);
    assert.equal(await page.locator('[data-priority="group-unread"]').count(),0);
    await open();await ask('How can I get more connected?');await route('group').click();
    await page.locator('.gv2-home').waitFor();await nav('today');
    mark('Ask RSVP, independent read cursor, persistence and authorized reconnection');
   }
   if(scene==='serving'){
    await open();await ask('I only have ten minutes. What matters most?');
    assert.deepEqual(await routes.evaluateAll(nodes=>nodes.map(n=>n.dataset.value)),['rsvp','serve']);
    assert.match(await response.textContent(),/Let’s keep this manageable/);
    await close();await nav('team');
    await page.locator('[data-action="shift"][data-value="declined"]').click();
    assert.equal((await state()).teamStatus,'declined');
    await nav('today');await reload();assert.equal((await state()).teamStatus,'declined');
    assert.equal(await page.locator('[data-priority="serve-response"]').count(),0);
    await open();await ask('Am I serving Sunday?');
    assert.match(await response.textContent(),/Declined|declined/);
    assert.equal(await page.locator('.f10-route[data-value="serve"]').count(),0);
    await close();await choose('serving');
    await open();await ask('What needs my attention?');
    await page.locator('.f10-route[data-action="f10-confirm"][data-value="serve"]').click();
    assert.equal((await state()).teamStatus,'confirmed');
    await close();await reload();assert.equal((await state()).teamStatus,'confirmed');
    await open();await ask('What needs my attention?');await assertNoRoutes();
    assert.match(await response.textContent(),/caught up|No current sample commitment/i);
    await ask('Who can I pray for?');await assertNoRoutes();
    await close();mark('ordered competing commitments, decline, explicit confirm, reload and group privacy');
   }
   if(scene==='care'){
    const prior=await cursor(),before=await state();
    await open();await ask("I don't want to pray for anyone today.");await assertNoRoutes();
    assert.match(await response.textContent(),/don’t need to take a care step/);
    assert.deepEqual((await state()).companionCare,before.companionCare);
    await ask('Who can I pray for?');await page.locator('.f10-route[data-value="care-prayer"]').click();
    await page.locator('.ro-care--prayer[data-care-stage="ready"]').waitFor();
    await page.locator('.ro-care--prayer [data-action="care-mark-prayed"]').click();
    await nav('today');await open();await ask('How can I follow up after praying?');
    await page.locator('.f10-route[data-value="care-check-in"]').click();
    await page.locator('#direct-input').fill('Synthetic journey check-in');
    assert.equal((await state()).companionCare.marcus.completedAt,undefined);
    await page.locator('[data-action="send"][data-value="direct"]').click();
    const saved=await state();assert.ok(saved.companionCare.marcus.completedAt);
    assert.equal(saved.directMessages.marcus.at(-1).text,'Synthetic journey check-in');
    assert.equal(await cursor(),prior);
    await nav('today');await reload();await open();await ask('Have I followed up already?');
    assert.match(await response.textContent(),/No real message was delivered/);await assertNoRoutes();
    assert.equal((await state()).directMessages.marcus.length,saved.directMessages.marcus.length);
    await close();await choose('visitor');await open();await ask('Who can I pray for?');await assertNoRoutes();
    assert.doesNotMatch(await response.textContent(),/Marcus|Synthetic journey check-in/);
    await close();mark('declined preference, explicit prayer, draft not delivery, saved check-in and revoked scope');
   }
   if(scene==='leader'){
    await open();await ask('Any member-requested check-ins to review?');
    assert.match(await response.textContent(),/Taylor/);
    await page.locator('.f10-route[data-requested-check-in="1"]').click();
    await page.locator('.r1-request').waitFor();
    assert.ok(!(await state()).reached.includes('taylor'));
    await page.locator('.r1-request [data-action="reached"]').click();
    await nav('today');await reload();assert.ok((await state()).reached.includes('taylor'));
    await open();await ask('Any member-requested check-ins to review?');await assertNoRoutes();
    assert.match(await response.textContent(),/No requested check-in is open/);
    await close();await choose('visitor');await reload();await open();
    await ask('Any member-requested check-ins to review?');await assertNoRoutes();
    assert.doesNotMatch(await response.textContent(),/Taylor/);
    await ask('Who in my group is lonely or at risk of leaving?');await assertNoRoutes();
    await ask('I am thinking about ending my life.');await assertNoRoutes();
    assert.match(await response.textContent(),/911/);assert.match(await response.textContent(),/988/);
    assert.match(await response.textContent(),/cannot contact help or monitor your safety/);
    await close();mark('explicit review, reload, permission loss, profiling refusal and synthetic distress boundary');
   }
   await nav('today');await open();
   assert.equal(await page.locator('.f10-panel').count(),1);
   const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   assert.deepEqual(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],scene+' Ask WCAG');
   await page.screenshot({path:out+'/'+scene+'-ask-390.png',animations:'disabled'});
   await close();
   assert.equal(await page.locator('#nav button').count(),4);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.deepEqual(errors,[]);
   result.status='passed';mark('Ask accessibility, no overflow, four tabs, no runtime errors');
   console.log('10C.5 passed '+scene);
  }catch(err){result.status='failed';result.error=String(err);throw err;}
  finally{await context.close();}
 }
}finally{
 await writeFile(out+'/journey-results.json',JSON.stringify({browser:browser.version(),viewport:'390x844',mode:'synthetic local preview; no actual device',journeys:evidence},null,2)+'\n');
 await browser.close();
}
