// Compare the approved immutable PR #119 build with the current preview build.
// No saved image baselines, masks, tolerances, or application style overrides.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
import {compareScreenshots} from '../verseplay/tests/visual-comparison.mjs';
const reference=process.argv[2];
assert.ok(reference,'Usage: node scripts/s8-visual-regression.mjs <approved-reference-dist>');
const out=resolve('test-results/s8-visual');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf'};
async function serve(directory){
 const root=resolve(directory);
 const server=createServer(async(req,res)=>{
  try{
   const name=decodeURIComponent(new URL(req.url,'http://local').pathname);
   let file=resolve(root,'.'+name);
   assert.ok(file.startsWith(root+sep)||file===root);
   if((await stat(file)).isDirectory())file=resolve(file,'index.html');
   res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');
   res.end(await readFile(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 return {server,url:`http://127.0.0.1:${server.address().port}/`};
}
const before=await serve(reference),after=await serve('dist');
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
const report={reference:'5aa88c93c3d4cd22902ef98af98c09b74ca436ce',comparisons:[],errors:[]};
async function capture(page,kind,width,label){
 await page.evaluate(async()=>{await document.fonts.ready;});
 // Wait for byte-stable frames. Timers are paused and motion is reduced.
 let previous,buffer;
 for(let attempt=0;attempt<8;attempt++){
  buffer=await page.screenshot({fullPage:true,animations:'disabled'});
  if(previous?.equals(buffer))break;
  previous=buffer;
  if(attempt===7)throw Error(`Unstable screenshot: ${kind} ${width} ${label}`);
 }
 const name=`${kind}-${width}-${label}.png`;
 await writeFile(resolve(out,name),buffer);
 if(kind==='after'){
  const comparison=compareScreenshots(await readFile(resolve(out,`before-${width}-${label}.png`)),buffer);
  report.comparisons.push({width,state:label,...comparison});
  assert.ok(comparison.equal,`Visual regression ${width} ${label}: ${JSON.stringify(comparison)}`);
 }
}
try{
 for(const [kind,base] of [['before',before.url],['after',after.url]])for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'UTC',locale:'en-US'});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({kind,width,message:e.message}));
  // Real timers cannot move the welcome screen between the two captures.
  await page.clock.install({time:new Date('2026-11-23T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-23T12:00:00Z'));
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').waitFor();
  await capture(page,kind,width,'welcome');
  await page.locator('[data-welcome="login"]:visible').click();
  await capture(page,kind,width,'login');
  await page.locator('[data-welcome="demo"]:visible').click();
  await page.clock.runFor(1000);
  await page.locator('#rp-gateway').waitFor({state:'hidden'});
  await page.locator('.f09-board').waitFor();
  await capture(page,kind,width,'today');
  const nav=async id=>{await page.locator(`#nav [data-go="${id}"]`).click();};
  await page.locator('.gv2-today-people [data-person="aiden"]').click();
  await page.locator('.gv2-profile').waitFor();
  await capture(page,kind,width,'portrait');
  await page.locator('[data-action="portrait-return"]').click();
  await nav('group');await page.locator('.gv2-home').waitFor();
  await capture(page,kind,width,'groups');
  await nav('team');await capture(page,kind,width,'team');
  await nav('read');await capture(page,kind,width,'read');
  await nav('today');
  await page.locator('[data-action="f10-open"]').click();
  await page.locator('.f10-panel').waitFor();
  await capture(page,kind,width,'ask-rally');
  await page.locator('[data-action="close-dialog"]').click();
  for(const role of ['visitor','group-member','serving','leader']){
   await page.locator('.profile-avatar').click();
   await page.locator(`[data-action="s7-scenario"][data-value="${role}"]`).click();
   await page.locator('.f09-board').waitFor();
   await capture(page,kind,width,role);
  }
  await context.close();
 }
 assert.deepEqual(report.errors,[]);
 report.status='passed';
 console.log(JSON.stringify({pairs:report.comparisons.length,rawDifferentPixels:report.comparisons.reduce((n,c)=>n+c.rawDifferentPixels,0),errors:report.errors}));
}catch(error){report.status='failed';report.error=error.message;throw error;}
finally{
 await writeFile(resolve(out,'results.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();await Promise.all([new Promise(r=>before.server.close(r)),new Promise(r=>after.server.close(r))]);
}
