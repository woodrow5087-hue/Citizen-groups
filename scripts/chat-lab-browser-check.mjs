import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'test-results','wednesday-chat-lab');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://test.local').pathname);
 const file=path.resolve(root,'dist','.'+pathname);
 if(!file.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}
 catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const launch={};
if(process.env.BROWSER_PATH)launch.executablePath=process.env.BROWSER_PATH;
else if(fs.existsSync('/usr/bin/chromium'))launch.executablePath='/usr/bin/chromium';
const browser=await chromium.launch(launch);
const KEY='rallypoint-wednesday-chat-lab-v1';
const MAIN='rallypoint-phase1-2026',TODAY='rallypoint-today-ui-v1';
const waitIdle=p=>p.waitForTimeout(80);
try{
 for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[1280,900]]){
   const context=await browser.newContext({
      viewport:{width,height},isMobile:width<830,hasTouch:width<830,reducedMotion:'reduce'
   });
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/wednesday-chat-lab.html',{waitUntil:'load'});
   await page.locator('[data-message-id="seed_jess"]').waitFor();
   const frame=await page.evaluate(()=>({
     overflow:document.documentElement.scrollWidth>innerWidth+1,
     maxWidth:document.documentElement.scrollWidth,
     viewportWidth:innerWidth,
     threadVisible:document.getElementById('thread-scroll').getBoundingClientRect().height>70,
     composerVisible:document.getElementById('message-input').getBoundingClientRect().bottom<=innerHeight+2,
     brand:getComputedStyle(document.querySelector('.app-header')).backgroundColor
   }));
   assert.equal(frame.overflow,false,'horizontal overflow at '+width+': '+JSON.stringify(frame));
   assert.equal(frame.threadVisible,true,'thread not visible at '+width);
   assert.equal(frame.composerVisible,true,'composer obscured at '+width);
   assert.equal(frame.brand,'rgb(227, 0, 43)','brand red drift at '+width);
   assert.equal(await page.locator('.message-row').count(),4);
   assert.equal(await page.locator('#message-count').textContent(),'4 MESSAGES');
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],
      'accessibility violations at '+width);
   await waitIdle(page);
   await page.screenshot({path:path.join(out,'thread-'+width+'.png'),fullPage:false});
   assert.deepEqual(errors,[],'browser errors at '+width);
   await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/wednesday-chat-lab.html');
 await page.locator('[data-message-id="seed_jess"]').waitFor();
 await page.evaluate(([main,today])=>{
   localStorage.setItem(main,JSON.stringify({untouched:true,messages:['original']}));
   localStorage.setItem(today,JSON.stringify({untouched:true,seen:'old'}));
 },[MAIN,TODAY]);
 const originals=await page.evaluate(([main,today])=>[localStorage.getItem(main),localStorage.getItem(today)],[MAIN,TODAY]);
 const reaction=page.locator('[data-message-id="seed_jess"] [data-action="react"][data-emoji="❤️"]');
 await reaction.click();
 assert.equal(await reaction.getAttribute('aria-pressed'),'true');
 await page.reload();
 assert.equal(await reaction.getAttribute('aria-pressed'),'true','reaction survives reload');
 await reaction.click();
 assert.equal(await reaction.getAttribute('aria-pressed'),'false','reaction reversible');
 await page.locator('[data-message-id="seed_anna"] [data-action="reply"]').click();
 assert.equal(await page.locator('#reply-preview').isVisible(),true);
 assert.equal(await page.locator('#reply-name').textContent(),'Anna L.');
 await page.locator('#message-input').fill('A thought worth remembering.');
 await page.reload();
 assert.equal(await page.locator('#message-input').inputValue(),'A thought worth remembering.','draft preserved');
 assert.equal(await page.locator('#reply-preview').isVisible(),true,'reply anchor preserved');
 await page.locator('#send-message').click();
 const own=page.locator('.message-row.own').last();
 await own.locator('.delivery').filter({hasText:'Sent · local demo'}).waitFor({timeout:4500});
 assert.ok((await own.locator('.bubble').textContent()).includes('A thought worth remembering.'));
 assert.ok((await own.locator('.bubble-quote').textContent()).includes('Anna L.'));
 assert.equal(await page.locator('#message-input').inputValue(),'');
 assert.equal(await page.locator('#reply-preview').isVisible(),false);
 await page.locator('#fail-next').check();
 await page.locator('#message-input').fill('An intentional local failure.');
 await page.locator('#send-message').click();
 const failed=page.locator('.message-row.own').last();
 await failed.locator('.delivery.failed').waitFor({timeout:4500});
 assert.equal(await failed.locator('[data-action="retry"]').textContent(),'Retry send');
 await failed.locator('[data-action="retry"]').click();
 await failed.locator('.delivery').filter({hasText:'Sent · local demo'}).waitFor({timeout:4500});
 assert.equal(await page.locator('.message-row').count(),6);
 await page.reload();
 assert.equal(await page.locator('.message-row').count(),6,'thread persists locally');
 const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 assert.equal(stored.schemaVersion,1);
 assert.equal(stored.snapshot.messages.length,6);
 assert.ok(stored.snapshot.messages.some(m=>m.replyToMessageId==='seed_anna'));
 const after=await page.evaluate(([main,today])=>[localStorage.getItem(main),localStorage.getItem(today)],[MAIN,TODAY]);
 assert.deepEqual(after,originals,'legacy app local storage must remain unchanged');
 await page.screenshot({path:path.join(out,'replies-reactions-390.png'),fullPage:false});
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#reset-lab').click();
 await page.locator('[data-message-id="seed_jess"]').waitFor();
 assert.equal(await page.locator('.message-row').count(),4,'reset only resets separate lab');
 assert.deepEqual(await page.evaluate(([main,today])=>[localStorage.getItem(main),localStorage.getItem(today)],[MAIN,TODAY]),originals);
 assert.deepEqual(errors,[],'interactive browser errors');
 await context.close();
 console.log('Wednesday chat lab passed across 320/375/390/430/1280 widths: axe, draft/reply/reaction/failure/retry, storage isolation and reset.');
} finally {
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
