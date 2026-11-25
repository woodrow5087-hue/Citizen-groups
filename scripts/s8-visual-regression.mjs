// PR #119 remains immutable for every unaffected surface. Read alone uses the
// owner-approved premium commit 16868e6. Prior accepted Read 4e3baa9 is retained
// as a separately captured historical reference with its intentional delta.
// No saved image baselines, masks, tolerances, or application style overrides.
import assert from 'node:assert/strict';
import invariant from './s9br-onboarding-source-invariant.cjs';
import ux from '../test/helpers/ux01-source.cjs';
import restoreConnect from '../test/helpers/ux03-source.cjs';
import {createServer} from 'node:http';
import {readFile,readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
import {compareScreenshots} from '../verseplay/tests/visual-comparison.mjs';
const reference=process.argv[2];
assert.ok(reference,'Usage: node scripts/s8-visual-regression.mjs <approved-119-dist> <approved-ux01-read-dist> <approved-premium-read-dist>');
const readReference=process.argv[3];
assert.ok(readReference,'An immutable approved UX-01 Read reference build is required');
const premiumReference=process.argv[4];
assert.ok(premiumReference,'An immutable owner-approved UX-1E reference build is required');
const adaptiveReference=process.argv[5];
assert.ok(adaptiveReference,'Owner-approved UX02 build required');
const adaptiveStates=new Set(['today','groups','team','visitor','group-member','serving','leader']);
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
const before=await serve(reference),approvedRead=await serve(readReference),approvedPremium=await serve(premiumReference),approvedAdaptive=await serve(adaptiveReference),after=await serve('dist');
// Match the proven VersePlay capture configuration: avoid GPU image-edge
// blending differences and platform-dependent LCD/subpixel text paths.
const launchBrowser=()=>chromium.launch({executablePath:process.env.BROWSER_PATH,
 // Use one RGB decode path on both sides; YUV image conversion produced
 // 1–2 channel rounding differences even in PR119-versus-itself controls.
 args:['--deterministic-mode','--disable-partial-raster','--disable-yuv-image-decoding','--disable-gpu','--disable-lcd-text','--disable-font-subpixel-positioning','--font-render-hinting=none']});
let browser=await launchBrowser();
const report={reference:'5aa88c93c3d4cd22902ef98af98c09b74ca436ce',readReference:'4e3baa96cc10ab4b32cbaecb69d19098f05840c0',premiumReadReference:'16868e6c5f86d38c296e71bb6da8f94f32446028',adaptiveReference:'ef4b8e7bfc2523d109da463b41c78c22ca40d1e9',adaptiveDeltas:[],protectedFiles:0,approvedReadDeltas:[],premiumReadDeltas:[],comparisons:[],errors:[]};
async function protectedEntries(root,directory=''){
 const files=[];
 for(const name of (await readdir(resolve(root,directory))).sort()){
  const relative=directory?`${directory}/${name}`:name;
  if((await stat(resolve(root,relative))).isDirectory())files.push(...await protectedEntries(root,relative));
  else if(relative.startsWith('assets/')||relative.startsWith('verseplay/')||relative.endsWith('.css')||
   ['rallypoint-welcome.js','blank-battle.js','rallypoint-verseplay-ui.js','rallypoint-memorize.js','rally-one-widgets.js'].includes(relative))files.push(relative);
 }
 return files;
}
async function protect(){
 const current=await protectedEntries('dist');
 assert.deepEqual(current,[...await protectedEntries(reference),'rally-one-widgets.js'].sort(),'Protected file inventory changed');
 for(const file of current){
  const actual=await readFile(resolve('dist',file)),approved=await readFile(resolve(file==='rally-one-widgets.js'?adaptiveReference:reference,file));
  if(file==='rallypoint-welcome.js')invariant.assertWelcomeSource(approved,actual);
  else if(file==='rally-one-graphite-parity.css')assert.equal(ux.restoreUXSource(file,actual.toString()),approved.toString(),'Only exact owner-approved Read and UX02 additions are permitted');
  else if(file==='connect-usability.css')assert.equal(restoreConnect(file,actual.toString()),approved.toString(),'Only declared UX03 presentation addition permitted');
  else assert.ok(actual.equals(approved),`Protected source/asset changed: ${file}`);
 }
 report.protectedFiles=current.length;
}
async function capture(page,kind,width,label){
 if(['read-reference','premium-reference'].includes(kind)&&label!=='read')return;
 if(kind==='adaptive-reference'&&!adaptiveStates.has(label))return;
 await page.evaluate(async()=>{
  await document.fonts.ready;
  await Promise.all([...document.images].map(img=>img.decode()));
 });
 // Wait for byte-stable frames. Timers are paused and motion is reduced.
 let previous,buffer;
 for(let attempt=0;attempt<8;attempt++){
  buffer=await page.screenshot({fullPage:true,animations:label==='title'?'allow':'disabled'});
  if(previous?.equals(buffer))break;
  previous=buffer;
  if(attempt===7)throw Error(`Unstable screenshot: ${kind} ${width} ${label}`);
 }
 const name=`${kind}-${width}-${label}.png`;
 await writeFile(resolve(out,name),buffer);
 if(kind==='read-reference')report.approvedReadDeltas.push({width,...compareScreenshots(await readFile(resolve(out,`before-${width}-read.png`)),buffer)});
 if(kind==='premium-reference')report.premiumReadDeltas.push({width,...compareScreenshots(await readFile(resolve(out,`read-reference-${width}-read.png`)),buffer)});
 if(kind==='adaptive-reference')report.adaptiveDeltas.push({width,state:label,...compareScreenshots(await readFile(resolve(out,`before-${width}-${label}.png`)),buffer)});
 if(kind==='after'){
  const comparison=compareScreenshots(await readFile(resolve(out,`${label==='read'?'premium-reference':adaptiveStates.has(label)?'adaptive-reference':'before'}-${width}-${label}.png`)),buffer);
  report.comparisons.push({width,state:label,reference:label==='read'?report.premiumReadReference:adaptiveStates.has(label)?report.adaptiveReference:report.reference,...comparison});
  assert.ok(comparison.equal,`Visual regression ${width} ${label}: ${JSON.stringify(comparison)}`);
 }
}
try{
 await protect();
 for(const [kind,base] of [['before',before.url],['read-reference',approvedRead.url],['premium-reference',approvedPremium.url],['adaptive-reference',approvedAdaptive.url],['after',after.url]])for(const width of [320,375,390,430]){
  // Separate rendering caches: the approved Read run must not warm only one side.
  if(width===320&&kind!=='before'){await browser.close();browser=await launchBrowser();}
  if(!['read-reference','premium-reference','adaptive-reference'].includes(kind)){
  const titleContext=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference',timezoneId:'UTC',locale:'en-US'});
  const title=await titleContext.newPage();
  title.on('pageerror',e=>report.errors.push({kind,width,message:e.message}));
  await title.clock.install({time:new Date('2026-11-23T12:00:00Z')});
  await title.clock.pauseAt(new Date('2026-11-23T12:00:00Z'));
  await title.goto(base);await title.clock.runFor(350);
  // Finish the dynamically inserted JPEG decode before sampling its resting frame.
  await title.locator('.ro-title-card').evaluate(img=>img.decode());
  // The JS clock controls reveal/ready timers, not Chromium's compositor clock.
  // Seek the real CSS fade to the same endpoint before sampling its resting frame.
  await title.evaluate(()=>{
   for(const animation of document.getAnimations()){
    animation.pause();
    const end=animation.effect.getComputedTiming().endTime;
    animation.currentTime=Number.isFinite(end)?end:900;
   }
  });
  assert.equal(await title.locator('.rp-entry-brand').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.equal(await title.locator('.ro-title-tagline text').textContent(),'We rally together so no one stands alone.');
  await capture(title,kind,width,'title');await titleContext.close();
  }
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'UTC',locale:'en-US'});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({kind,width,message:e.message}));
  // Real timers cannot move the welcome screen between the two captures.
  await page.clock.install({time:new Date('2026-11-23T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-23T12:00:00Z'));
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').waitFor();
  await capture(page,kind,width,'welcome');
  await page.locator('[data-welcome="create"]:visible').click();
  await capture(page,kind,width,'campus');
  await page.locator('[data-welcome-campus="central"]').click();
  await page.locator('[data-welcome="next"]:visible').click();
  await capture(page,kind,width,'onboarding-connection');
  await page.locator('[data-welcome-role="connected"]').click();
  await page.locator('[data-welcome="next"]:visible').click();
  await capture(page,kind,width,'onboarding-involvement');
  for(let step=0;step<3;step++)await page.locator('[data-welcome="back"]:visible').click();
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
  if(['read-reference','premium-reference'].includes(kind)){await context.close();continue;}
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
 console.log(JSON.stringify({protectedFiles:report.protectedFiles,pairs:report.comparisons.length,pr119Pairs:report.comparisons.filter(c=>c.reference===report.reference).length,approvedReadPairs:report.comparisons.filter(c=>c.reference===report.premiumReadReference).length,adaptivePairs:report.comparisons.filter(c=>c.reference===report.adaptiveReference).length,rawDifferentPixels:report.comparisons.reduce((n,c)=>n+c.rawDifferentPixels,0),errors:report.errors}));
}catch(error){report.status='failed';report.error=error.message;throw error;}
finally{
 await writeFile(resolve(out,'results.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();await Promise.all([new Promise(r=>before.server.close(r)),new Promise(r=>approvedRead.server.close(r)),new Promise(r=>approvedPremium.server.close(r)),new Promise(r=>approvedAdaptive.server.close(r)),new Promise(r=>after.server.close(r))]);
}
