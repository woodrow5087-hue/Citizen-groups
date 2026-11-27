// Additive E3B behavior checks. --observe-baseline measures the accepted source
// without treating its owner-reported defect as a new passing candidate gate.
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2];assert.ok(base,'Pass an independently built preview origin');
const baseline=process.argv.includes('--observe-baseline');
const engine=process.env.CONVERGENCE_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch({headless:true});
const out='test-results/experience-e3b/'+(baseline?'baseline-':'')+engine.name(),results=[];
await mkdir(out,{recursive:true});
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function role(page,value){
 if(await page.locator('#preview-tools').getAttribute('open')===null)await page.locator('#preview-tools>summary').click();
 await page.locator('#scenario').selectOption(value);
}
async function capture(page,name){await page.screenshot({path:out+'/'+name+'.png',fullPage:true,animations:'disabled'});}
try{
 for(const width of [320,375,390,430]){
  const context=await browser.newContext({viewport:{width,height:width===390?500:844},isMobile:true,hasTouch:true,timezoneId:'America/Denver',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00Z'));
  await page.goto(new URL('/foundation2/',base).href);await page.locator('.greeting h1').waitFor();
  const keys=['rallypoint-phase1-2026','rallypoint-today-ui-v1','rallypoint-wednesday-chat-lab-v1','rallypoint-blank-battle-v1'];
  const originals=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys);
  await page.locator('.header-connect').click();
  const f=page.frameLocator('#premium-connect');await f.locator('.people-rail [data-person=Jess]').click();
  for(let i=0;i<12;i++){
   await f.locator('#direct-input').fill('Local scroll rehearsal '+i+'. A fictional conversation retained on this device. '.repeat(3));
   await f.locator('#direct-form .send-btn').click();
  }
  await f.locator('#direct-input').fill('Unsent draft must survive scrolling and viewport changes.');
  await f.locator('#direct-input').evaluate(e=>e.blur());await frames(page);
  const trace=[];
  for(let i=0;i<8;i++){
   trace.push(await page.evaluate(()=>{
    const f=document.querySelector('#premium-connect'),s=f.contentDocument.querySelector('#direct-scroll');
    s.scrollTop=80;window.scrollTo(0,document.documentElement.scrollHeight);
    // Safari reports viewport panning while the browser chrome/keyboard moves.
    // Deliver that notification explicitly so this regression is deterministic.
    visualViewport.dispatchEvent(new Event('scroll'));
    visualViewport.dispatchEvent(new Event('resize'));
    return {frameHeight:f.getBoundingClientRect().height,pageHeight:document.documentElement.scrollHeight,pageY:scrollY,threadY:s.scrollTop};
   }));await frames(page);
  }
  const heights=trace.map(t=>t.frameHeight);
  if(!baseline){
   assert.ok(Math.max(...heights)-Math.min(...heights)<=1,'Viewport pan/page scroll must not feed back into frame height');
   assert.ok(trace.every(t=>Math.abs(t.threadY-80)<=1),'Host resize must not reset the conversation reading position');
  }
  results.push({width,viewportFeedback:baseline?'observation only':'passed',trace});
  await capture(page,width+'-direct');
  if(baseline){await context.close();continue;}
  // Genuine input, selection and native resize; software keyboard behavior
  // still requires the targeted physical Safari check, not this approximation.
  await f.locator('#direct-input').focus();
  await page.setViewportSize({width,height:450});await frames(page);
  assert.equal(await f.locator('#direct-input').inputValue(),'Unsent draft must survive scrolling and viewport changes.');
  assert.ok(await f.locator('#direct-scroll').evaluate(e=>e.clientHeight>80));
  await page.setViewportSize({width,height:844});await frames(page);
  await f.locator('#screen-direct [data-open=inbox]').click();
  await f.locator('.people-rail [data-person=Jess]').click();await frames(page);
  assert.ok(Math.abs(await f.locator('#direct-scroll').evaluate(e=>e.scrollTop)-80)<=1,'Controller must restore this recipient reading position');
  assert.equal(await f.locator('#direct-input').inputValue(),'Unsent draft must survive scrolling and viewport changes.');
  await page.reload();await f.locator('#direct-input').waitFor();
  assert.equal(await f.locator('#direct-input').inputValue(),'Unsent draft must survive scrolling and viewport changes.');
  await page.locator('.connect-return').click();
  assert.equal(await page.locator('.header-connect').evaluate(e=>e===document.activeElement),true);
  for(const persona of ['visitor','connected','leader']){
   await role(page,persona);await page.locator('#primary-nav [data-route=read]').click();
   await page.locator('.read-scripture').waitFor();
   const order=await page.locator('.read-page').evaluate(e=>[...e.children].filter(n=>n.matches('.read-scripture,.read-games,.read-reflection,.read-prayer')).map(n=>n.className));
   assert.deepEqual(order,['read-scripture','read-games','read-reflection','read-prayer']);
   assert.equal(await page.locator('.read-game-link').count(),3);
   assert.equal(await page.locator('.read-leader').count(),persona==='leader'?1:0);
   await capture(page,width+'-read-'+persona);
   await page.locator('.read-games-jump').click();await page.locator('[data-return-focus=classic-launch]').click();
   await page.locator('[data-action=memory-pick]').first().waitFor();
   await page.locator('[data-read-view=home]').click();
   assert.equal(await page.locator('[data-return-focus=classic-launch]').evaluate(e=>e===document.activeElement),true,'Classic return focus');
   await page.evaluate(()=>document.documentElement.style.fontSize='200%');await frames(page);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Read at 200% text must not overflow');
   if(persona==='leader')await page.locator('.read-leader>summary').click();
   const report=await new AxeBuilder({page}).analyze();
   assert.deepEqual(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],persona+' Read axe at enlarged text');
   await capture(page,width+'-read-'+persona+'-enlarged');
   await page.evaluate(()=>document.documentElement.style.fontSize='');
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.locator('.read-games-jump').focus();
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.locator('.read-games-jump').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  }
  assert.deepEqual(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys),originals,'Original app/game owners untouched');
  assert.deepEqual(errors,[]);console.log('E3B passed '+engine.name()+' '+width);await context.close();
 }
}finally{await writeFile(out+'/results.json',JSON.stringify({source:process.env.E3B_SOURCE||'working candidate',base,engine:engine.name(),baseline,results},null,2));await browser.close();}
