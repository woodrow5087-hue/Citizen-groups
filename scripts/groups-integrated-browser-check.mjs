import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const results=path.join(root,'test-results','groups-integrated');
fs.mkdirSync(results,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const target=path.resolve(root,'dist','.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.end(fs.readFileSync(target));}
  catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/?skipWelcome=1';
const launch={};
if(process.env.BROWSER_PATH)launch.executablePath=process.env.BROWSER_PATH;
else if(fs.existsSync('/usr/bin/chromium'))launch.executablePath='/usr/bin/chromium';
const browser=await chromium.launch(launch);
const P='rallypoint-phase1-2026',U='rallypoint-today-ui-v1',N='rallypoint-wednesday-chat-lab-v1';
const primary={view:'today',role:'member',groupPane:'chat',groupMessages:[
 {name:'Jess W.',time:'Yesterday',text:'Old note with unknown author ID'},
 {name:'Anna L.',time:'Today',text:'Previously saved group message'}
 ],teamMessages:[],prayers:[],directMessages:{marcus:[{name:'You',time:'Just now',text:'Private old DM remains'}]},
 memoryGames:{'sermon:solo':{slots:[2,1],solved:false}},
 customFixture:{nested:{unmodified:true}}};
const ui={name:'Fictional Test',memberships:{group:true,team:true},seenGroupSignature:''};
const storage=page=>page.evaluate(([p,u,n])=>({
  primary:localStorage.getItem(p),ui:localStorage.getItem(u),chat:localStorage.getItem(n)
}),[P,U,N]);
try{
 for(const [width,height] of [[320,568],[390,844],[430,932],[1280,900]]){
   const ctx=await browser.newContext({viewport:{width,height},isMobile:width<830,hasTouch:width<830,reducedMotion:'reduce'});
   const p=await ctx.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   await p.addInitScript(([pk,uk,a,b])=>{
     if(sessionStorage.getItem('__setup__'))return;
     localStorage.setItem(pk,a);localStorage.setItem(uk,b);sessionStorage.setItem('__setup__','1');
   },[P,U,JSON.stringify(primary),JSON.stringify(ui)]);
   await p.goto(base);
   await p.locator('#nav [data-go="group"]').click();
   await p.locator('#rpx-chat [data-message-id="seed_jess"]').waitFor();
   assert.equal(await p.locator('.group-pulse-route').count(),4,'F-07 routes visible at '+width);
   assert.ok((await p.locator('.group-pulse-route[data-value="chat"]').textContent()).includes('caught up'),'opening conversation clears shared cursor');
   assert.equal(await p.locator('#nav button').count(),4,'original tabs retained');
   assert.equal(await p.locator('.rpx-legacy-records .message').count(),2,'old records stay visible');
   assert.ok((await p.locator('.rpx-legacy-records').textContent()).toLowerCase().includes('unknown historical dates'));
   assert.equal(await p.locator('#rpx-chat .message-row').count(),4,'v1 thread renders');
   const geom=await p.evaluate(()=>{
     const n=document.querySelector('#nav').getBoundingClientRect(),v=document.querySelector('#view').getBoundingClientRect();
     const chat=document.querySelector('#rpx-chat').getBoundingClientRect();
     return {overflow:document.documentElement.scrollWidth>innerWidth+1,navBottom:n.bottom,
       viewport:innerHeight,contentBottom:v.bottom,navTop:n.top,chatWidth:chat.width,available:innerWidth};
   });
   assert.equal(geom.overflow,false,'no horizontal overflow at '+width+': '+JSON.stringify(geom));
   assert.ok(geom.navBottom<=height+1,'navigation fits');
   assert.ok(geom.contentBottom<=geom.navTop+1,'thread not behind nav');
   assert.ok(geom.chatWidth<=geom.available+1,'new messaging fits phone');
   const report=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   assert.deepEqual(report.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],
     'accessibility at '+width);
   await p.screenshot({path:path.join(results,'integrated-'+width+'.png'),fullPage:false});
   assert.deepEqual(errors,[],'browser errors at '+width);
   await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(([pk,uk,a,b])=>{
   if(sessionStorage.getItem('__setup__'))return;
   localStorage.setItem(pk,a);localStorage.setItem(uk,b);sessionStorage.setItem('__setup__','1');
 },[P,U,JSON.stringify(primary),JSON.stringify(ui)]);
 await page.goto(base);
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('#rpx-chat [data-message-id="seed_jess"]').waitFor();
 const before=await storage(page);
 const heart=page.locator('#rpx-chat [data-message-id="seed_jess"] [data-action="react"][data-emoji="❤️"]');
 await heart.click();
 assert.equal(await heart.getAttribute('aria-pressed'),'true');
 await page.locator('#rpx-chat [data-message-id="seed_anna"] [data-action="reply"]').click();
 assert.equal(await page.locator('#rpx-chat #reply-name').textContent(),'Anna L.');
 await page.locator('#rpx-chat #message-input').fill('Integrated app reply—still fictional.');
 await page.locator('#nav [data-go="today"]').click();
 await page.locator('#nav [data-go="group"]').click();
 assert.equal(await page.locator('#rpx-chat #message-input').inputValue(),
   'Integrated app reply—still fictional.','draft survives navigation');
 assert.equal(await page.locator('#rpx-chat #reply-preview').isVisible(),true);
 await page.locator('#rpx-chat #send-message').click();
 const last=page.locator('#rpx-chat .message-row.own').last();
 await last.locator('.delivery').filter({hasText:'Sent · local demo'}).waitFor({timeout:5000});
 assert.ok((await last.locator('.bubble').textContent()).includes('Integrated app reply'));
 assert.ok((await last.locator('.bubble-quote').textContent()).includes('Anna L.'));
 const afterNew=await storage(page);
 // The new repository must never migrate or rewrite the old author/time labels.
 assert.deepEqual(JSON.parse(afterNew.primary).groupMessages,primary.groupMessages);
 assert.equal(JSON.parse(afterNew.primary).customFixture.nested.unmodified,true);
 assert.equal(JSON.parse(afterNew.primary).directMessages.marcus[0].text,'Private old DM remains');
 assert.ok(JSON.parse(afterNew.chat).snapshot.messages.length===5);
 await page.locator('#rpx-chat #fail-next').check();
 await page.locator('#rpx-chat #message-input').fill('Intentional failed sample.');
 await page.locator('#rpx-chat #send-message').click();
 const failed=page.locator('#rpx-chat .message-row.own').last();
 await failed.locator('.delivery.failed').waitFor({timeout:5000});
 await failed.locator('[data-action="retry"]').click();
 await failed.locator('.delivery').filter({hasText:'Sent · local demo'}).waitFor({timeout:5000});
 assert.equal(await page.locator('#rpx-chat .message-row').count(),6);
 // Older composer remains usable and writes only the original legacy collection.
 await page.locator('#group-input').fill('Classic saved note still works.');
 await page.locator('[data-action="send"][data-value="group"]').click();
 const afterLegacy=await storage(page);
 assert.equal(JSON.parse(afterLegacy.primary).groupMessages.length,3);
 assert.equal(JSON.parse(afterLegacy.primary).groupMessages.at(-1).text,'Classic saved note still works.');
 assert.equal(JSON.parse(afterLegacy.chat).snapshot.messages.length,6);
 await page.reload();
 await page.locator('#rpx-chat [data-message-id="seed_jess"]').waitFor();
 assert.equal(await page.locator('#rpx-chat .message-row').count(),6,'modern messages survive reload');
 assert.equal(await page.locator('.rpx-legacy-records .message').count(),3,'old messages survive reload');
 assert.equal(await heart.getAttribute('aria-pressed'),'true','reaction survives reload');
 // F-07: complete a connected group loop without touching modern messages or legacy archive.
 await page.locator('.group-pulse-route[data-value="gather"]').click();
 assert.ok((await page.locator('.group-gather-rsvp').textContent()).includes('still open'));
 await page.locator('[data-action="rsvp"][data-value="going"]').click();
 assert.ok((await page.locator('.group-pulse-route[data-value="gather"]').textContent()).includes('Going'));
 await page.locator('.group-pulse-route[data-value="prayer"]').click();
 await page.locator('#prayer-input').fill('A fictional prayer from connected Groups.');
 await page.locator('[data-action="send"][data-value="prayer"]').click();
 assert.ok((await page.locator('.group-pulse-route[data-value="prayer"]').textContent()).includes('1 saved sample request'));
 await page.locator('.group-prayer-next button').click();
 await page.locator('.group-member-message[data-person="anna"]').click();
 await page.locator('#direct-input').fill('Local only; no delivery.');
 await page.locator('[data-action="send"][data-value="direct"]').click();
 await page.locator('.group-pulse-route[data-value="chat"]').click();
 assert.equal(await page.locator('#rpx-chat .message-row').count(),6);
 const afterJourney=await storage(page);
 assert.deepEqual(JSON.parse(afterJourney.primary).groupMessages,
   JSON.parse(afterLegacy.primary).groupMessages,'F-07 leaves legacy messages unchanged');
 assert.equal(JSON.parse(afterJourney.primary).rsvp,'going');
 assert.equal(JSON.parse(afterJourney.primary).prayers.at(-1).text,'A fictional prayer from connected Groups.');
 assert.equal(JSON.parse(afterJourney.primary).directMessages.anna.at(-1).text,'Local only; no delivery.');
 assert.deepEqual(JSON.parse(afterJourney.chat).snapshot.messages,
   JSON.parse(afterLegacy.chat).snapshot.messages,'F-07 never migrates/rewrites modern messages');
 await page.screenshot({path:path.join(results,'full-journey-390.png'),fullPage:false});
 assert.deepEqual(errors,[],'full conversation journey browser errors');
 await ctx.close();

 const revoked=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const denied=await revoked.newPage();
 await denied.addInitScript(([pk,uk,a,b])=>{
   localStorage.setItem(pk,a);localStorage.setItem(uk,b);
 },[P,U,JSON.stringify(primary),JSON.stringify({...ui,memberships:{group:false,team:true}})]);
 await denied.goto(base);
 await denied.locator('#nav [data-go="group"]').click();
 assert.equal(await denied.locator('#rpx-chat').count(),0,'revoked fixture cannot open thread');
 await revoked.close();

 const damaged=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const damagedPage=await damaged.newPage();
 const broken='{not-json-original';
 await damagedPage.addInitScript(([pk,uk,nk,a,b,raw])=>{
   localStorage.setItem(pk,a);localStorage.setItem(uk,b);localStorage.setItem(nk,raw);
 },[P,U,N,JSON.stringify(primary),JSON.stringify(ui),broken]);
 await damagedPage.goto(base);
 await damagedPage.locator('#nav [data-go="group"]').click();
 assert.ok((await damagedPage.locator('#rpx-chat #lab-error').textContent()).includes('could not be read'));
 assert.equal(await damagedPage.evaluate(k=>localStorage.getItem(k),N),broken,
   'unreadable modern saved conversation never overwritten');
 await damaged.close();
 console.log('F-06 integrated Groups: mobile/axe, original archive and new conversation, replies, drafts, reactions, retry, refresh, revocation and malformed snapshot passed.');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
