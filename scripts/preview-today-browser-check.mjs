import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import {chromium} from 'playwright';

const base=process.argv[2];
// Validate the newest interaction milestone before the broader route audits.
await import('./connect-usability-browser-check.mjs');
// Verify Groups 2.0 interaction and member permissions before the broader dashboard audit.
await import('./groups-v2-browser-check.mjs');
const out='test-results/preview-today';
await mkdir(out,{recursive:true});
const executablePath=process.env.BROWSER_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({executablePath});
const welcome=(page,action)=>page.locator('[data-welcome="'+action+'"]:visible');
const screen=(page,name)=>page.locator('#rp-gateway[data-screen="'+name+'"]');
async function audit(page,label){
  const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  assert.deepEqual(report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[],label);
  assert.ok(await page.evaluate(()=>{
    const gateway=document.querySelector('#rp-gateway');
    return document.documentElement.scrollWidth<=innerWidth+1
      && (gateway.hidden||gateway.scrollWidth<=gateway.clientWidth+1);
  }),label+' fits the viewport');
}
async function capture(page,width,name){
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:out+'/rally-one-'+name+'-'+width+'.png',animations:'disabled'});
}
async function accountJourney(width,height){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  const profile=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-today-ui-v1')||'{}'));
  try{
    await page.clock.setFixedTime(new Date('2026-11-25T12:00:00'));
    await page.goto(base);
    await screen(page,'welcome').waitFor();
    assert.equal(await page.locator('.ro-title-card').evaluate(img=>img.decode().then(()=>img.naturalWidth)),1536);
    assert.equal(await page.locator('main').evaluate(el=>el.inert),true);
    assert.equal(await welcome(page,'create').evaluate(el=>el===document.activeElement),true);
    await audit(page,'Rally One welcome '+width);
    await capture(page,width,'welcome');
    await welcome(page,'create').click();
    await page.locator('[data-welcome-campus="north"]').click();
    assert.notEqual((await profile()).campus,'north','Draft campus is saved only when setup finishes');
    await audit(page,'Rally One campus '+width);
    if(width===390)await capture(page,width,'campus');
    await welcome(page,'next').click();
    const kind=width===320?'guest':width===430?'leader':'connected';
    await page.locator('[data-welcome-role="'+kind+'"]').click();
    await audit(page,'Rally One connection '+width);
    if(width===390)await capture(page,width,'connection');
    await welcome(page,'next').click();
    if(kind!=='guest')await page.locator('[data-welcome-membership="team"]').click();
    if(kind==='leader')await page.getByText('Leadership needs verification').waitFor();
    await page.locator('#rp-onboard-name').fill('Alex');
    await welcome(page,'back').click();
    assert.equal(await page.locator('[data-welcome-role="'+kind+'"]').getAttribute('aria-pressed'),'true');
    await welcome(page,'next').click();
    assert.equal(await page.locator('#rp-onboard-name').inputValue(),'Alex');
    if(kind!=='guest')assert.equal(await page.locator('[data-welcome-membership="team"]').getAttribute('aria-pressed'),'true');
    await audit(page,'Rally One personalization '+width);
    if(width===390)await capture(page,width,'personalize');
    await welcome(page,'finish').click();
    await page.locator('#rp-gateway').waitFor({state:'hidden'});
    await page.getByRole('heading',{name:/Alex/}).waitFor();
    assert.equal(await page.locator('.ro-campus').textContent(),'North campus');
    const saved=await profile();
    assert.deepEqual({name:saved.name,campus:saved.campus,group:saved.memberships.group,team:saved.memberships.team},
      {name:'Alex',campus:'north',group:kind!=='guest',team:kind!=='guest'});
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')).role),'member');
    await audit(page,'Rally One first Today '+width);
    await capture(page,width,'today');
    for(const tab of ['group','team','read']){
      await page.locator('#nav [data-go="'+tab+'"]').click();
      assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),tab);
      await audit(page,'Rally One '+tab+' '+width);
      if(width===390)await capture(page,width,tab);
    }
    await page.evaluate(()=>sessionStorage.clear());
    await page.reload();
    assert.equal(await page.locator('#rp-gateway').isVisible(),false,'Saved profiles bypass the title on a new session');
    assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),'today');
    await page.goto(new URL('/?rallyOne=1&welcome=1',base).href);
    await screen(page,'welcome').waitFor();
    await welcome(page,'login').click();
    assert.equal(await page.locator('#rp-login-email').evaluate(el=>el.readOnly),true);
    await audit(page,'Rally One preview sign-in '+width);
    await welcome(page,'demo').click();
    await page.locator('#rp-gateway').waitFor({state:'hidden'});
    assert.equal((await profile()).name,'Alex','Replaying the intro preserves the saved profile');
  }finally{await context.close();}
}
async function animatedTitle(){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  try{
    await page.clock.install({time:new Date('2026-11-25T12:00:00')});
    await page.clock.pauseAt(new Date('2026-11-25T12:01:00'));
    await page.goto(new URL('/?rallyOne=1&welcome=1',base).href);
    await screen(page,'splash').waitFor();
    assert.equal(await page.locator('#rp-entry-actions').evaluate(el=>el.inert),true);
    await page.clock.fastForward(500);
    await capture(page,390,'title');
    await page.clock.fastForward(1100);
    await screen(page,'welcome').waitFor();
    assert.equal(await page.locator('#rp-entry-actions').evaluate(el=>el.inert),false);
  }finally{await page.close();}
}
try{
  await animatedTitle();
  for(const [width,height] of [[320,568],[390,844],[430,932]]){
    await accountJourney(width,height);
    const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    await page.clock.setFixedTime(new Date('2026-11-25T12:00:00'));
    await page.goto(base);
    await page.locator('#rp-entry [data-welcome="login"]').click();
    await page.locator('#rp-onboard [data-welcome="demo"]').click();
    await page.locator('.f09-board').waitFor({state:'visible'});
    const openTab=async tab=>{
      await page.locator('#nav [data-go="'+tab+'"]').click();
      assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),tab);
    };
    const agendaStatus=id=>page.locator('.f09b-agenda-row[data-agenda="'+id+'"] .f09b-status').textContent();
    const priority=id=>page.locator('.f09b-hero[data-priority="'+id+'"], .f09b-row[data-row="'+id+'"]');
    const chatState=()=>page.evaluate(()=>localStorage.getItem('rallypoint-wednesday-chat-lab-v1'));
    const initialChatState=await chatState();
    assert.equal(await agendaStatus('group'),'RSVP open');
    assert.equal(await agendaStatus('serve'),'Needs reply');
    assert.equal(await agendaStatus('scripture'),'To read');
    assert.equal(await priority('group-unread').count(),1);
    for(const [query,selector] of [
      ['','.rally-one .f09-board'],['?rallyOne=0','.f09-board'],['?f09=legacy','.pa-companion'],['?f09=1','.f09-stack-controls'],
      ['?f10=1','.f10-entry'],['?f103=1','.f10-entry']
    ]){
      await page.goto(new URL('/'+query,base).href);
      await page.locator(selector).waitFor();
      assert.equal(await page.locator('.f10-panel').count(),0);
      assert.equal(await page.locator('.f10-entry').count(),Number(!query||query.startsWith('?f10')));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(width===390 && (query==='' || query==='?f09=legacy')){
        await page.evaluate(()=>document.fonts.ready);
        await page.screenshot({path:out+'/'+(query?'earlier-today':'priority-board')+'-390.png'});
      }
    }
    await page.locator('.f10-entry-button').click();
    await page.locator('.f10-panel').waitFor({state:'visible'});
    await page.goto(base);
    assert.equal(await page.locator('.f10-entry').count(),1);
    assert.equal(await chatState(),initialChatState,'visiting Today never acknowledges the thread');

    await openTab('group');
    await page.locator('#rpx-chat').waitFor({state:'visible'});
    assert.notEqual(await chatState(),initialChatState,'opening the thread saves its read cursor');
    await page.locator('.tabs [data-area="group"][data-value="gather"]').click();
    await page.locator('[data-action="rsvp"][data-value="going"]').click();
    await openTab('today');
    assert.equal(await agendaStatus('group'),'Going');
    assert.equal(await priority('group-rsvp').count(),0);
    assert.equal(await priority('group-unread').count(),0);

    await openTab('team');
    await page.locator('[data-action="shift"][data-value="confirmed"]').click();
    await openTab('today');
    assert.equal(await agendaStatus('serve'),'Confirmed');
    assert.equal(await priority('serve-response').count(),0);
    assert.equal(await priority('caught-up').count(),1);

    await openTab('read');
    await page.locator('[data-action="read"]').click();
    await page.locator('.rp-game-entry-play').click();
    await page.locator('.rp-play-screen').waitFor({state:'visible'});
    await page.locator('.rp-play-back').click();
    await page.locator('.rp-game-entry-play').waitFor({state:'visible'});
    await openTab('today');
    assert.equal(await agendaStatus('scripture'),'Read');
    assert.equal(await priority('scripture-read').count(),0);

    await page.reload();
    assert.equal(await agendaStatus('group'),'Going');
    assert.equal(await agendaStatus('serve'),'Confirmed');
    assert.equal(await agendaStatus('scripture'),'Read');
    await page.close();
    console.log('Rally One onboarding, accessibility and cross-tab regression passed at '+width+' px');
  }
}finally{await browser.close();}

// Exercise the integrated four-tab entry against the same review build.
await import('./connect-member-browser-check.mjs');
// Final Connect usability pass piggybacks on the established preview QA run.
// Moved into preflight below so Connect is exercised even if an unrelated legacy theme audit fails.
