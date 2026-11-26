/* Foundation 2 browser acceptance: isolated source server, no approved baseline edits. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const {makeChatDomainBundle}=createRequire(import.meta.url)('./build-chat-lab.cjs');
const canonicalChatBundle=makeChatDomainBundle();
const {makeServingPreviewBundle}=createRequire(import.meta.url)('./build-serving-preview.cjs');
const {makeGroupPreviewBundle}=createRequire(import.meta.url)('./build-group-preview.cjs');
const observedAt=Date.parse('2026-11-26T00:45:00Z');
const bundles=new Map([
 ['foundation2/serving-fixtures.js',await makeServingPreviewBundle(observedAt)],
 ['foundation2/group-fixtures.js',await makeGroupPreviewBundle(observedAt)]
]);
const dir=resolve(root,'test-results/foundation2');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.ttf':'font/ttf'};
await mkdir(dir,{recursive:true});
const http=createServer(async(req,res)=>{
 try{
  let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/,'');
  if(!rel||rel.endsWith('/'))rel+='index.html';
  if(rel==='rallypoint-chat-domain.browser.js'){
   res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});
   res.end(canonicalChatBundle);return;
  }
  if(bundles.has(rel)){
   res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});
   res.end(bundles.get(rel));return;
  }
  const filename=resolve(root,rel);
  if(!filename.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(filename);
  res.writeHead(200,{'Content-Type':types[extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found');}
});
const port=await new Promise(done=>http.listen(0,'127.0.0.1',()=>done(http.address().port)));
const report={scenes:[],errors:[],violations:[]};
let browser;
async function check(page,name){
 await page.locator('#today h1').waitFor();
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>null)));});
 const sizing=await page.evaluate(()=>({
  viewport:innerWidth,width:document.documentElement.scrollWidth,
  controls:[...document.querySelectorAll('button[data-command]')].map(b=>[b.getBoundingClientRect().width,b.getBoundingClientRect().height]),
  compactButtons:[...document.querySelectorAll('.action-compact')].map(b=>b.getBoundingClientRect().width),
  photos:[...document.querySelectorAll('.priority-photo img,.settled-photo img,.welcome-photo img')].map(i=>i.naturalWidth)
 }));
 assert.ok(sizing.width<=sizing.viewport+1,name+' horizontally overflows');
 assert.ok(sizing.controls.every(([w,h])=>w>=43&&h>=43),name+' has undersized response buttons');
 assert.ok(sizing.compactButtons.every(w=>w<=121),name+' has oversized secondary action');
 assert.ok(sizing.photos.every(n=>n>0),name+' failed to display approved photograph');
 await page.screenshot({path:dir+'/'+name+'.png',fullPage:true,animations:'disabled'});
 report.scenes.push({name,sizing});
}
async function change(page,value){
 await page.locator('#preview-tools>summary').click();
 // Selecting the same saved scenario does not fire a change event.
 if(await page.locator('#scenario').inputValue()===value){
  await page.locator('#preview-tools>summary').click();
 }else{
  await page.locator('#scenario').selectOption(value);
 }
 assert.equal(await page.locator('#preview-tools[open]').count(),0);
}
try{
 browser=await chromium.launch({headless:true,args:['--disable-gpu','--disable-lcd-text','--disable-font-subpixel-positioning']});
 for(const [width,height] of [[320,680],[390,844],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,timezoneId:'America/Denver',reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({width,message:e.message}));
  await page.clock.setFixedTime(new Date('2026-11-26T00:45:00Z'));
  await page.goto('http://127.0.0.1:'+port+'/foundation2/',{waitUntil:'load'});
  await check(page,'connected-'+width);
  assert.equal(await page.locator('#primary-nav a[data-route]').count(),4,'four navigation destinations required');
  assert.equal(await page.locator('#primary-nav [aria-current="page"]').count(),1,'only one current tab');
  await page.locator('#primary-nav a[data-route=groups]').click();
  assert.match(page.url(),/screen=groups/,'Groups route did not update URL');
  assert.equal(await page.locator('#today h1').innerText(),'Your people.');
  assert.equal(await page.locator('#today [data-command]').count(),0,'unmigrated Groups must be read-only');
  assert.equal(await page.locator('#primary-nav a[data-route=groups][aria-current=page]').count(),1);
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'today','route focus was not restored to main landmark');
  await check(page,'groups-route-'+width);
  await page.goBack();
  assert.equal(await page.locator('article.priority').count(),1,'back navigation lost Today');
  assert.equal(await page.locator('#primary-nav a[data-route=today][aria-current=page]').count(),1);
  await page.locator('.header-connect').click();
  assert.equal(await page.locator('#today h1').innerText(),'Stay connected.');
  assert.equal(await page.locator('.header-connect[aria-current=page]').count(),1);
  await check(page,'connect-route-'+width);
  await page.goBack();
  assert.equal(await page.locator('.greeting').count(),1,'Connect return failed');
  await page.locator('#primary-nav a[data-route=read]').click();
  assert.equal(await page.locator('.read-scripture').count(),1,'Canonical Read page missing');
  assert.ok((await page.locator('.read-scripture blockquote').innerText()).includes('love one another'));
  await check(page,'read-home-'+width);
  await page.goBack();
  assert.equal(await page.locator('.greeting').count(),1,'Read-to-Today back failed');
  const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  report.violations.push(...a.violations.map(v=>({width,id:v.id,targets:v.nodes.map(n=>n.target)})));
  await change(page,'leader');
  assert.equal(await page.locator('.responsibility').count(),2,'leader follow-up missing');
  await check(page,'leader-'+width);
  await change(page,'connected');
  const canonicalBefore=await page.evaluate(()=>({
   primary:localStorage.getItem('rallypoint-phase1-2026'),
   today:localStorage.getItem('rallypoint-today-ui-v1')
  }));
  await page.locator('[data-command=rsvp]').first().click();
  await page.locator('[data-command=serve]').first().click();
  assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.');
  assert.match(await page.locator('.utility').innerText(),/3 new group messages/);
  await check(page,'all-set-'+width);
  await page.reload();
  await page.locator('.greeting h1').waitFor();
  assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.','saved response did not survive reload');
  assert.equal(await page.locator('[data-command=rsvp],[data-command=serve]').count(),0,'completed action reappeared after reload');
  const canonicalAfter=await page.evaluate(()=>({
   primary:localStorage.getItem('rallypoint-phase1-2026'),
   today:localStorage.getItem('rallypoint-today-ui-v1')
  }));
  assert.deepEqual(canonicalAfter,canonicalBefore,'Foundation 2 must not mutate original application storage');
  if(width===390){
   // Gate 4: true F-02 group conversation, not an imitation chat widget.
   // The inbox must preserve browser history, drafts, read receipts, and
   // storage isolation before later Groups and Team migrations.
   await page.locator('.header-connect').click();
   assert.equal(await page.locator('.connect-thread-entry').count(),1,'group inbox missing');
   assert.match(await page.locator('.chat-unread').innerText(),/3 new/);
   await check(page,'connect-inbox-'+width);
   await page.locator('[data-chat-open=group]').click();
   assert.match(page.url(),/thread=group/);
   assert.equal(await page.locator('.chat-message').count(),4);
   assert.equal(await page.locator('#chat-compose').count(),1);
   await check(page,'connect-thread-'+width);
   const threadAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   report.violations.push(...threadAxe.violations.map(v=>({width,id:v.id,targets:v.nodes.map(n=>n.target)})));
   await page.locator('#chat-draft').fill('Draft survives a browser reload');
   await page.reload();
   assert.equal(await page.locator('#chat-draft').inputValue(),'Draft survives a browser reload');
   await page.locator('#chat-compose button[type=submit]').click();
   assert.equal(await page.locator('.chat-message').count(),5);
   assert.equal(await page.locator('#chat-draft').inputValue(),'');
   assert.match(await page.locator('.chat-message').last().innerText(),/Draft survives a browser reload/);
   await page.locator('.chat-message').first().locator('[data-chat-reply]').click();
   await page.locator('#chat-draft').fill('An explicitly saved sample reply');
   await page.locator('#chat-compose button[type=submit]').click();
   assert.match(await page.locator('.chat-quote').last().innerText(),/Jess W/);
   assert.equal(await page.locator('.chat-message').count(),6);
   await check(page,'connect-sent-'+width);
   await page.goBack();
   assert.equal(await page.locator('.connect-thread-entry').count(),1,'thread-to-inbox back failed');
   assert.equal(await page.locator('.chat-unread').count(),0,'read cursor failed to persist');
   await page.goBack();
   assert.equal(await page.locator('.greeting').count(),1,'inbox-to-Today back failed');
   const originalAfterChat=await page.evaluate(()=>({
    primary:localStorage.getItem('rallypoint-phase1-2026'),
    today:localStorage.getItem('rallypoint-today-ui-v1'),
    originalChat:localStorage.getItem('rallypoint-wednesday-chat-lab-v1')
   }));
   assert.deepEqual([originalAfterChat.primary,originalAfterChat.today],[canonicalBefore.primary,canonicalBefore.today]);
   assert.equal(originalAfterChat.originalChat,null,'Foundation 2 contaminated the original Connect key');
   await change(page,'leader');
   await page.locator('[data-command=rsvp]').first().click();
   await page.locator('[data-command=serve]').first().click();
   await page.locator('.leader-actions>summary').click();
   await page.locator('[data-command=leader]').first().click();
   await page.locator('.leader-actions>summary').click();
   await page.locator('[data-command=leader]').first().click();
   await page.reload();
   await change(page,'leader');
   assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.','leader review did not survive reload');
   // Explicit deep-link route and browser back/forward acceptance.
   await page.goto('http://127.0.0.1:'+port+'/foundation2/?screen=read');
   assert.equal(await page.locator('#today h1').innerText(),'Make space.');
   assert.equal(await page.locator('#primary-nav a[data-route=read][aria-current=page]').count(),1);
   await check(page,'read-deep-link-'+width);
   await page.locator('#primary-nav a[data-route=team]').focus();
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#today h1').innerText(),'Your team.');
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'today','keyboard navigation did not focus route');
   await check(page,'team-keyboard-route-'+width);
   await page.goBack();
   assert.equal(await page.locator('#today h1').innerText(),'Make space.','browser history did not restore Read');
   await page.goto('http://127.0.0.1:'+port+'/foundation2/');
   await change(page,'group');await check(page,'group-member-'+width);
   assert.equal(await page.locator('[data-command=rsvp]').count(),1,'scenario state leaked across membership contexts');
   await page.locator('#primary-nav a[data-route=groups]').click();
   assert.equal(await page.locator('.group-gathering').count(),1,'Group must be a real migrated screen');
   assert.equal(await page.locator('[data-group-action=group-rsvp]').count(),2);
   await page.locator('[data-group-action=group-rsvp][data-value=maybe]').click();
   assert.equal(await page.locator('.group-response-status strong').innerText(),'Maybe');
   await page.reload();
   assert.equal(await page.locator('#scenario').inputValue(),'group','Synthetic scenario did not survive reload');
   assert.equal(await page.locator('.group-response-status strong').innerText(),'Maybe','Group RSVP did not survive reload');
   await page.locator('#primary-nav a[data-route=today]').click();
   assert.match(await page.locator('.schedule').innerText(),/Maybe/,'Today did not share Groups RSVP');
   await page.locator('#primary-nav a[data-route=groups]').click();
   await page.locator('[data-group-action=group-rsvp][data-value=going]').click();
   assert.equal(await page.locator('.group-response-status strong').innerText(),'Going');
   assert.ok(await page.locator('[data-group-action=group-care-prayed]').count()>0);
   await page.locator('[data-group-action=group-care-prayed]').click();
   assert.match(await page.locator('.group-care').innerText(),/Prayer marked on this device/);
   await page.locator('.group-conversation [data-chat-open=group]').click();
   assert.equal(await page.locator('.chat-message').count(),4,'Group must open the canonical F-02 thread');
   await page.goBack();
   assert.equal(await page.locator('.group-conversation').count(),1,'thread return must restore Groups');
   await check(page,'group-rsvp-shared-'+width);
   await page.locator('#primary-nav a[data-route=today]').click();
   assert.match(await page.locator('.schedule').innerText(),/Going/,'Today did not share Groups confirmation');
   // Gate 5B: Team availability uses the same guarded response as Today.
   await change(page,'team');
   await page.locator('#primary-nav a[data-route=team]').click();
   assert.equal(await page.locator('.team-assignment').count(),1);
   assert.equal(await page.locator('[data-team-action=serving-response]').count(),2);
   await check(page,'team-member-'+width);
   await page.locator('[data-team-action=serving-response][data-value=confirmed]').click();
   assert.equal(await page.locator('.team-availability strong').innerText(),'Confirmed');
   await page.reload();
   assert.equal(await page.locator('#scenario').inputValue(),'team','Team scenario changed on reload');
   assert.equal(await page.locator('.team-availability strong').innerText(),'Confirmed','Serving confirmation lost after reload');
   await page.locator('[data-team-action=serving-response][data-value=declined]').click();
   assert.equal(await page.locator('.team-availability strong').innerText(),'Unable to serve');
   await page.reload();
   assert.equal(await page.locator('.team-availability strong').innerText(),'Unable to serve','Declined serving response lost');
   const request=page.locator('[data-team-action="serving-coverage"]');
   assert.equal(await request.count(),1,'Coverage control missing after decline');
   assert.equal(await request.getAttribute('data-value'),'request');
   await request.click();
   assert.match(await page.locator('.team-coverage').innerText(),/fictional local coverage request saved/);
   await page.reload();
   assert.equal(await page.locator('[data-team-action="serving-coverage"]').getAttribute('data-value'),'withdraw','Coverage request lost after reload');
   await page.locator('[data-team-action="serving-coverage"]').click();
   assert.equal(await page.locator('[data-team-action="serving-coverage"]').getAttribute('data-value'),'request','Withdrawing coverage did not update state');
   await page.reload();
   assert.equal(await page.locator('[data-team-action="serving-coverage"]').getAttribute('data-value'),'request','Withdrawn coverage request reappeared');
   await page.locator('[data-team-action="serving-coverage"]').click();
   await page.locator('[data-team-action="serving-response"][data-value="confirmed"]').click();
   assert.equal(await page.locator('[data-team-action="serving-coverage"]').count(),0,'Confirm must cancel coverage');
   await check(page,'team-response-shared-'+width);
   await page.locator('#primary-nav a[data-route=today]').click();
   // Gate 6: read + optional prayer + reflection are guarded, persistent state.
   await change(page,'group');
   await page.locator('#primary-nav a[data-route=read]').click();
   await page.locator('[data-read-action=read][data-value=true]').click();
   await page.locator('[data-read-action=pray][data-value=true]').click();
   await page.locator('#read-reflection-input').fill('Be kind to someone today.');
   await page.locator('#read-reflection-form button[type=submit]').click();
   assert.match(await page.locator('.read-saved-note').innerText(),/Be kind to someone today/);
   await page.reload();
   assert.equal(await page.locator('.read-scripture [data-read-action=read]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('[data-read-action=pray]').getAttribute('aria-pressed'),'true');
   assert.match(await page.locator('.read-saved-note').innerText(),/Be kind to someone today/);
   await check(page,'read-saved-'+width);
   // Original Classic VersePlay renderer and action engine run on F2 guarded state.
   await page.locator('a[data-read-view=classic]').click();
   assert.equal(await page.locator('.verseplay').count(),1);
   assert.equal(await page.locator('.vp-tile').count()>0,true);
   await page.locator('[data-action=memory-hint]').click();
   await page.reload();
   assert.equal(await page.locator('.vp-progress[aria-valuenow="1"]').count(),1,'Classic VersePlay progress lost');
   for(const token of ['a1','a2','a3','a4'])await page.locator('[data-action=memory-pick][data-value='+token+']').click();
   await page.locator('[data-action=memory-check]').click();
   assert.equal(await page.locator('.vp-victory').count(),1,'Original puzzle solution was not accepted');
   await check(page,'classic-verseplay-complete-'+width);
   await page.goBack();
   assert.equal(await page.locator('.read-scripture').count(),1,'Classic VersePlay back return failed');
   const fullGame=await context.newPage();
   await fullGame.goto('http://127.0.0.1:'+port+'/blank-battle.html');
   await fullGame.locator('#bb-screen .bb-board').waitFor();
   assert.ok(await fullGame.locator('[data-action=tile]').count()>0,'Original Blank Battle not playable');
   await fullGame.goto('http://127.0.0.1:'+port+'/verse-circuit-playground.html');
   await fullGame.locator('[data-action=launch]').waitFor();
   assert.equal(await fullGame.locator('[data-action=launch]').count(),1,'Original Verse Circuit not loaded');
   await fullGame.close();
   await page.clock.setFixedTime(new Date('2026-11-27T12:00:00Z'));
   await page.reload();
   assert.equal(await page.locator('[data-read-action=reflection-complete]').count(),1,'Due reflection unavailable');
   await page.locator('[data-read-action=reflection-complete]').click();
   assert.match(await page.locator('.read-saved-note').innerText(),/Marked complete/);
   await page.locator('#primary-nav a[data-route=today]').click();
   await change(page,'visitor');assert.equal(await page.locator('.welcome-card').count(),1);await check(page,'visitor-'+width);
   await change(page,'unavailable');assert.equal(await page.locator('.utility[role=status]').count(),1);await check(page,'unavailable-'+width);
   await page.evaluate(()=>localStorage.setItem('rally-one-foundation2-v1:connected:journal','{"version":1,"before":{},"after":{}}'));
   await change(page,'connected');
   assert.equal(await page.locator('.storage-warning[role=alert]').count(),1,'interrupted transaction must block editing');
   assert.ok(await page.locator('button[data-command]').count()>0,'fixture must remain visible for review');
   assert.equal(await page.locator('button[data-command]:not([disabled])').count(),0,'blocked transactions must have no enabled command');
  }
  // F2-07 shares one read-only sample and truthful failure states on Today and Team.
  const openTab=async tab=>page.locator('#primary-nav a[data-route='+tab+']').click();
  const serving=page.locator('[data-serving-preview]');
  const storageBeforePreview=await page.evaluate(()=>JSON.stringify(localStorage));
  await openTab('today');
  await change(page,'serving-ready');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'today','Scenario switch must return focus to the main content');
  assert.equal(await serving.getAttribute('data-serving-preview'),'ready');
  assert.match(await serving.innerText(),/Welcome Team[\s\S]*North Campus/);
  assert.equal(await page.locator('[data-command=serve]').count(),0);
  assert.equal(await page.locator('.schedule .event').count(),0,'Local schedule must not replace the provider observation');
  const assigned=await serving.innerText();
  const startsAt=await serving.locator('time').getAttribute('datetime');
  await check(page,'serving-preview-today-'+width);
  await openTab('team');
  assert.equal(await serving.innerText(),assigned);
  assert.equal(await serving.locator('time').getAttribute('datetime'),startsAt);
  assert.equal(await page.locator('[data-team-action]').count(),0);
  await check(page,'serving-preview-team-'+width);
  if(width===390){
   await page.reload();
   assert.equal(await page.locator('#scenario').inputValue(),'serving-ready');
   assert.equal(await serving.innerText(),assigned);
   for(const [mode,state,message] of [
    ['denied','restricted',/schedule is restricted/],
    ['outage','unavailable',/unavailable.*next shift is unknown/],
    ['stale','stale',/out of date.*next shift is unknown/]
   ]){
    await change(page,'serving-'+mode);
    assert.equal(await serving.getAttribute('data-serving-preview'),state);
    assert.match(await serving.getByRole('status').innerText(),message);
    assert.equal(await page.locator('[data-team-action],main time').count(),0);
    const failure=await serving.innerText();
    await check(page,'serving-preview-'+mode+'-team-'+width);
    await openTab('today');
    assert.equal(await serving.innerText(),failure);
    assert.equal(await page.locator('[data-command=serve],main time,.settled').count(),0);
    await check(page,'serving-preview-'+mode+'-today-'+width);
    const servingAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    report.violations.push(...servingAxe.violations.map(v=>({width,mode,id:v.id,targets:v.nodes.map(n=>n.target)})));
    await openTab('team');
   }
   await change(page,'serving-ready');
   assert.equal(await serving.innerText(),assigned,'A ready observation must be visible again after switching from stale');
   try{
    await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
    await check(page,'serving-preview-team-enlarged-text-'+width);
   }finally{
    await page.evaluate(()=>{document.documentElement.style.removeProperty('font-size');});
   }
   const teamAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   report.violations.push(...teamAxe.violations.map(v=>({width,mode:'serving-ready',id:v.id,targets:v.nodes.map(n=>n.target)})));
   assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),storageBeforePreview,'Provider rehearsal must not write local state');
   await change(page,'team');
   assert.equal(await serving.count(),0);
   assert.equal(await page.locator('.team-availability strong').innerText(),'Confirmed','Local fixture state must survive rehearsal');
   await change(page,'visitor');
   assert.equal(await serving.count(),0,'Visitor must not see the prior volunteer assignment');
   assert.equal(await page.locator('[data-team-action]').count(),0);
  }
  const groupPreview=page.locator('[data-group-preview]');
  const beforeGroupPreview=await page.evaluate(()=>JSON.stringify(localStorage));
  await openTab('today');
  await change(page,'group-ready');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'today');
  assert.equal(await groupPreview.getAttribute('data-group-preview'),'ready');
  assert.match(await groupPreview.innerText(),/North Campus Group[\s\S]*Community gathering/);
  assert.equal(await page.locator('[data-command=rsvp],.schedule .event').count(),0);
  const groupReady=await groupPreview.innerText();
  await check(page,'group-preview-ready-today-'+width);
  await openTab('groups');
  assert.equal(await groupPreview.innerText(),groupReady);
  assert.equal(await page.locator('[data-group-action],[data-chat-open]').count(),0);
  await check(page,'group-preview-ready-groups-'+width);
  if(width===390){
   await page.reload();
   assert.equal(await page.locator('#scenario').inputValue(),'group-ready');
   assert.equal(await groupPreview.innerText(),groupReady);
   for(const [mode,state,message] of [
    ['empty','empty',/No upcoming gathering is scheduled/],
    ['denied','restricted',/sample group is restricted/],
    ['outage','unavailable',/schedule is unavailable.*gathering is unknown/],
    ['stale','unavailable',/schedule is unavailable.*gathering is unknown/]
   ]){
    await change(page,'group-'+mode);
    assert.equal(await groupPreview.getAttribute('data-group-preview'),state);
    assert.match(await groupPreview.getByRole('status').innerText(),message);
    assert.equal(await page.locator('main time,[data-group-action],[data-chat-open]').count(),0);
    const groupOutcome=await groupPreview.innerText();
    await check(page,'group-preview-'+mode+'-groups-'+width);
    await openTab('today');
    assert.equal(await groupPreview.innerText(),groupOutcome);
    assert.equal(await page.locator('main time,[data-command=rsvp],.settled').count(),0);
    await check(page,'group-preview-'+mode+'-today-'+width);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    report.violations.push(...result.violations.map(v=>({width,mode:'group-'+mode,id:v.id,targets:v.nodes.map(n=>n.target)})));
    await openTab('groups');
   }
   await change(page,'group-ready');
   assert.equal(await groupPreview.innerText(),groupReady);
   const groupsAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   report.violations.push(...groupsAxe.violations.map(v=>({width,mode:'group-ready',id:v.id,targets:v.nodes.map(n=>n.target)})));
   await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
   await check(page,'group-preview-groups-enlarged-text-'+width);
   await page.evaluate(()=>{document.documentElement.style.removeProperty('font-size');});
   await page.locator('.header-connect').click();
   assert.equal(await page.locator('.connect-thread-entry').count(),0,'Read-only group preview must not expose local chat');
   await openTab('groups');
   assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),beforeGroupPreview);
   await change(page,'group');
   assert.equal(await groupPreview.count(),0);
   assert.equal(await page.locator('.group-response-status strong').innerText(),'Going');
   await change(page,'visitor');
   assert.equal(await groupPreview.count(),0);
   assert.equal(await page.locator('[data-group-action]').count(),0);
  }
  await context.close();

  const journeyContext=await browser.newContext({
   viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,timezoneId:'America/Denver',reducedMotion:'reduce'
  });
  const journey=await journeyContext.newPage();
  journey.on('pageerror',e=>report.errors.push({width,message:e.message}));
  await journey.clock.setFixedTime(new Date(observedAt));
  await journey.goto('http://127.0.0.1:'+port+'/foundation2/');
  const primary=route=>journey.locator('#primary-nav [data-route='+route+']');
  const currentFocus=()=>journey.evaluate(()=>document.activeElement?.dataset.returnFocus??document.activeElement?.id);
  const scroll=()=>journey.evaluate(()=>window.scrollY);
  async function auditJourney(mode){
   if(width!==390)return;
   const audit=await new AxeBuilder({page:journey}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   report.violations.push(...audit.violations.map(v=>({width,mode,id:v.id,targets:v.nodes.map(n=>n.target)})));
  }
  await change(journey,'visitor');
  assert.equal(await journey.locator('[data-command]').count(),0);
  await journey.getByRole('link',{name:'Explore groups'}).click();
  assert.equal(await journey.locator('#today h1').innerText(),'Find your people.');
  assert.equal(await currentFocus(),'today');
  await check(journey,'gate8-visitor-groups-'+width);
  await auditJourney('gate8-visitor');
  await journey.goBack();
  assert.equal(await currentFocus(),'today-groups');
  await journey.locator('.utility[data-route=read]').click();
  await journey.getByRole('link',{name:'Jump to VersePlay'}).click();
  assert.equal(await currentFocus(),'read-games-title');
  assert.ok(await scroll()>100,'VersePlay jump must scroll within Read');
  const launch=journey.locator('a[data-read-view=classic]');
  await launch.scrollIntoViewIfNeeded();
  const beforeGame=await scroll();
  await launch.click();
  assert.equal(await currentFocus(),'today');
  await journey.getByRole('link',{name:/Back to Read/}).click();
  await launch.waitFor();
  assert.equal(await currentFocus(),'classic-launch');
  assert.ok(Math.abs(await scroll()-beforeGame)<3,'Closing Classic must restore the Read position');
  await check(journey,'gate8-read-return-'+width);
  await journey.goForward();
  assert.equal(await journey.locator('#today h1').innerText(),'Classic VersePlay');
  await journey.goBack();
  assert.equal(await currentFocus(),'classic-launch','Browser Back must restore the game link too');
  await journey.goBack();
  assert.equal(await currentFocus(),'today-read');

  await change(journey,'group');
  assert.equal(await journey.locator('[data-command=rsvp]').count(),1);
  assert.equal(await journey.locator('[data-command=serve]').count(),0);
  await journey.locator('.utility[data-route=connect]').click();
  assert.equal(await journey.locator('.connect-thread-entry').count(),1);
  await journey.goBack();
  assert.equal(await currentFocus(),'today-connect');
  await primary('groups').click();
  const groupConversation=journey.locator('[data-return-focus=groups-conversation]');
  await groupConversation.scrollIntoViewIfNeeded();
  const beforeThread=await scroll();
  await groupConversation.click();
  await journey.getByRole('link',{name:/Back to Groups/}).click();
  await groupConversation.waitFor();
  assert.ok(Math.abs(await scroll()-beforeThread)<3,'Closing the thread must restore the Groups position');
  assert.equal(await currentFocus(),'groups-conversation');
  await check(journey,'gate8-group-conversation-return-'+width);
  await auditJourney('gate8-group');
  await journey.locator('[data-group-action=group-rsvp][data-value=maybe]').click();
  await primary('today').click();
  assert.match(await journey.locator('.schedule').innerText(),/Maybe/);

  await change(journey,'team');
  assert.equal(await journey.locator('[data-command=serve]').count(),1);
  assert.equal(await journey.locator('[data-command=rsvp]').count(),0);
  await primary('team').click();
  await journey.getByRole('button',{name:'Can’t make it'}).click();
  assert.equal(await journey.locator('.team-assignment + .team-coverage').count(),1);
  await journey.getByRole('button',{name:'Request sample coverage'}).click();
  assert.match(await journey.locator('.team-coverage').innerText(),/coverage request saved/);
  await check(journey,'gate8-volunteer-coverage-'+width);
  await auditJourney('gate8-volunteer');
  await primary('today').click();
  assert.equal(await journey.locator('.greeting h1').innerText(),'You’re all set.');
  assert.equal(await journey.locator('[data-command=serve]').count(),0);
  await primary('team').click();
  assert.match(await journey.locator('.team-coverage').innerText(),/coverage request saved/);

  if(width===390){
   await primary('read').click();
   await journey.evaluate(()=>{document.documentElement.style.fontSize='200%';});
   await journey.getByRole('link',{name:'Jump to VersePlay'}).click();
   await check(journey,'gate8-read-enlarged-text-'+width);
   const metrics=await journey.evaluate(()=>{
    const nav=document.querySelector('#primary-nav').getBoundingClientRect();
    const title=document.querySelector('#read-games-title').getBoundingClientRect();
    return {navTop:nav.top,titleBottom:title.bottom,animation:getComputedStyle(document.querySelector('.read-games-jump')).transitionDuration};
   });
   assert.ok(metrics.titleBottom<metrics.navTop,'Jump target must be visible above fixed navigation');
   assert.equal(metrics.animation,'0s','Reduced motion must disable transitions');
   await auditJourney('gate8-read-enlarged');
  }
  await journeyContext.close();
 }
 assert.deepEqual(report.errors,[]);
 assert.deepEqual(report.violations,[]);
 console.log('Foundation 2: '+report.scenes.length+' responsive scenes accepted; zero page errors and axe violations.');
}finally{
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 if(browser)await browser.close();
 await new Promise(done=>http.close(done));
}