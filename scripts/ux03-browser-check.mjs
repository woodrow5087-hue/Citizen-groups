import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import visual from '../test/helpers/ux03-visual.cjs';
const base=process.argv[2];assert.ok(base,'preview URL required');
const historical=process.env.UX03_HISTORICAL==='1';
const out=process.env.UX03_OUTPUT_DIR||'test-results/ux03/'+(historical?'accepted':'candidate');await mkdir(out,{recursive:true});
const browserType=process.env.UX03_VISUAL_CAPTURE==='1'?{chromium,webkit}[visual.reference.engine]:chromium;
let browser=await browserType.launch(visual.launchOptions(process.env,{args:['--disable-gpu','--disable-lcd-text','--disable-font-subpixel-positioning','--font-render-hinting=none','--disable-yuv-image-decoding']}));
const reports=[];let visualCase=0;
if(process.env.UX03_VISUAL_CAPTURE==='1')console.log('Strict Connect engine:',browserType.name(),await browser.version());
try{
for(const [width,height,large] of [[320,568,false],[375,667,false],[390,844,false],[430,932,false],[390,500,false],[390,844,true]]){
 // Isolate rounded-image raster caches across visual viewport/profile cases.
 if(process.env.UX03_VISUAL_CAPTURE==='1'&&visualCase++>0){await browser.close();browser=await browserType.launch(visual.launchOptions(process.env,{args:['--disable-gpu','--disable-lcd-text','--disable-font-subpixel-positioning','--font-render-hinting=none','--disable-yuv-image-decoding']}));}
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'UTC',locale:'en-US'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime(new Date('2026-11-23T12:00:00Z'));
 await page.goto(new URL('connect-design-lab.html',base).href);
 if(large)await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 if(process.env.UX03_VISUAL_CAPTURE==='1')await visual.prepareVisualState(page);
 const key=width+'-'+height+(large?'-large':'');
 async function capture(state){
  await page.evaluate(async()=>{document.documentElement.getBoundingClientRect();await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  // Capture the uninstrumented UI before axe opens its analysis page.
  let snapshot;
  if(process.env.UX03_VISUAL_CAPTURE==='1'){
   await visual.settlePaint(page);await visual.prepareVisualState(page);await visual.settlePaint(page);
   const directPose=large&&state==='direct'?await visual.normalizeDirectDraftPose(page):null;
   snapshot=await visual.captureStable(page);
   if(directPose)await visual.verifyDirectDraftPose(page,directPose);
  }
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  if(!historical)assert.deepEqual(audit.violations.map(v=>[v.id,v.nodes.map(n=>n.target)]),[],key+' '+state);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'overflow '+state);
  if(!snapshot)snapshot=await page.screenshot({animations:'disabled'});
  await writeFile(out+'/'+key+'-'+state+'.png',snapshot);
 }
 await capture('inbox');
 if(!historical)assert.ok(await page.locator('.conversation-list').evaluate(e=>!!(e.compareDocumentPosition(document.querySelector('#moment-open'))&Node.DOCUMENT_POSITION_FOLLOWING)));
 await page.locator('#search-toggle').click();await page.locator('#conversation-search').fill('no such conversation');
 assert.equal(await page.locator('#no-results').isVisible(),true);await capture('empty-search');
 await page.locator('#conversation-search').press('Escape');
 if(!historical)assert.equal(await page.locator('#search-toggle').evaluate(e=>e===document.activeElement),true);
 await page.locator('.conversation-row[data-open=thread]').click();
 if(!historical)assert.equal(await page.locator('#screen-thread h2').evaluate(e=>e===document.activeElement),true);
 await capture('thread');
 await page.locator('#thread-input').fill('Unsent local draft');await page.locator('#thread-input').press('Enter');
 assert.ok((await page.locator('#thread-input').inputValue()).includes('Unsent local draft'));
 await page.locator('#screen-thread [data-open=inbox]').click();
 if(!historical)assert.equal(await page.locator('.conversation-row[data-open=thread]').evaluate(e=>e===document.activeElement),true);
 await page.locator('.people-rail [data-person=Jess]').click();await page.locator('#direct-input').fill('Jess draft');
 await capture('direct');await page.locator('#screen-direct [data-open=inbox]').click();
 await page.locator('.people-rail [data-person="Alex Morgan"]').click();assert.equal(await page.locator('#direct-input').inputValue(),'');
 await page.locator('#screen-direct [data-open=inbox]').click();await page.locator('.people-rail [data-person=Jess]').click();assert.equal(await page.locator('#direct-input').inputValue(),'Jess draft');
 await page.locator('#screen-direct [data-open=inbox]').click();await page.locator('.conversation-row[data-open=room]').click();
 await capture('room-chat');await page.locator('[data-room-tab=plans]').click();await capture('room-plans');
 await page.locator('[data-room-tab=people]').click();await capture('room-people');
 await page.locator('[data-room-tab=people]').press('ArrowLeft');assert.equal(await page.locator('[data-room-tab=plans]').getAttribute('aria-selected'),'true');
 if(!historical){
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.room-tabs button').first().evaluate(e=>getComputedStyle(e).transform),'none');
  const reducedDuration=await page.locator('.room-tabs button').first().evaluate(e=>getComputedStyle(e).transitionDuration);
  assert.ok(reducedDuration.endsWith('s'));
  assert.equal(Number(reducedDuration.slice(0,-1)),0.000001);
  await page.emulateMedia({reducedMotion:'no-preference'});
  assert.notEqual(await page.locator('.room-tabs button').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 }
 assert.deepEqual(errors,[]);reports.push({width,height,large,states:7,axe:historical?'historical capture only':'passed',focus:historical?'historical capture':'passed'});
 await context.close();
}
await writeFile(out+'/report.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports));
}finally{await browser.close();}
