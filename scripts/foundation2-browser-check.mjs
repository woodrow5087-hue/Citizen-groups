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
   await change(page,'visitor');assert.equal(await page.locator('.welcome-card').count(),1);await check(page,'visitor-'+width);
   await change(page,'unavailable');assert.equal(await page.locator('.utility[role=status]').count(),1);await check(page,'unavailable-'+width);
   await page.evaluate(()=>localStorage.setItem('rally-one-foundation2-v1:connected:journal','{"version":1,"before":{},"after":{}}'));
   await change(page,'connected');
   assert.equal(await page.locator('.storage-warning[role=alert]').count(),1,'interrupted transaction must block editing');
   assert.ok(await page.locator('button[data-command]').count()>0,'fixture must remain visible for review');
   assert.equal(await page.locator('button[data-command]:not([disabled])').count(),0,'blocked transactions must have no enabled command');
  }
  await context.close();
 }
 assert.deepEqual(report.errors,[]);
 assert.deepEqual(report.violations,[]);
 console.log('Foundation 2: '+report.scenes.length+' responsive scenes accepted; zero page errors and axe violations.');
}finally{
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 if(browser)await browser.close();
 await new Promise(done=>http.close(done));
}