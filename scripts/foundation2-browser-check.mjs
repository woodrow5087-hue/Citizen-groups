/* Foundation 2 browser acceptance: isolated source server, no approved baseline edits. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const dir=resolve(root,'test-results/foundation2');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.ttf':'font/ttf'};
await mkdir(dir,{recursive:true});
const http=createServer(async(req,res)=>{
 try{
  let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/,'');
  if(!rel||rel.endsWith('/'))rel+='index.html';
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
 await page.locator('.greeting h1').waitFor();
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
 await page.locator('#scenario').selectOption(value);
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
  const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  report.violations.push(...a.violations.map(v=>({width,id:v.id,targets:v.nodes.map(n=>n.target)})));
  await change(page,'leader');
  assert.equal(await page.locator('.responsibility').count(),2,'leader follow-up missing');
  await check(page,'leader-'+width);
  await change(page,'connected');
  await page.locator('[data-command=rsvp]').first().click();
  await page.locator('[data-command=serve]').first().click();
  assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.');
  assert.match(await page.locator('.utility').innerText(),/3 new group messages/);
  await check(page,'all-set-'+width);
  if(width===390){
   await change(page,'group');await check(page,'group-member-'+width);
   await change(page,'visitor');assert.equal(await page.locator('.welcome-card').count(),1);await check(page,'visitor-'+width);
   await change(page,'unavailable');assert.equal(await page.locator('.utility[role=status]').count(),1);await check(page,'unavailable-'+width);
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