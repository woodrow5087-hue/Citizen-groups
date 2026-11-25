// Focused creative-review evidence. Does not replace any existing release gate.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {compareScreenshots} from '../verseplay/tests/visual-comparison.mjs';
const candidate=process.argv[2],baseline=process.argv[3];assert.ok(candidate&&baseline,'candidate and canonical URLs required');
const out='test-results/studio13';await mkdir(out,{recursive:true});
const launchBrowser=()=>chromium.launch({executablePath:chromium.executablePath(),args:['--deterministic-mode','--disable-partial-raster','--disable-gpu','--disable-lcd-text','--disable-font-subpixel-positioning','--font-render-hinting=none','--disable-yuv-image-decoding']});
let browser=await launchBrowser();
const report={scenarios:[],unaffected:[],errors:[]};
async function enter(page,url){await page.clock.setFixedTime(new Date('2026-11-25T12:00:00Z'));await page.goto(url);await page.locator('[data-welcome=login]:visible').click();await page.locator('[data-welcome=demo]:visible').click();await page.locator('#rp-gateway').waitFor({state:'hidden'});}
async function scene(p,id){await p.locator('.profile-avatar').click();await p.locator('[data-action=s7-scenario][data-value="'+id+'"]').click();await p.locator('#toast').waitFor({state:'hidden'});}
async function snap(p,file){await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});let previous;for(let n=0;n<8;n++){const current=await p.screenshot({animations:'disabled'});if(previous?.equals(current)){await writeFile(out+'/'+file,current);return;}previous=current;}throw Error('Unstable capture '+file);}
async function audit(p,label){
 assert.equal(await p.locator('#view').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,label+' overflow');
 const a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],label+' axe');
 assert.equal(await p.locator('#nav button').count(),4);
}
async function complete(p){
 await scene(p,'group-serving');await p.locator('[data-action=f09-rsvp]').click();await p.locator('[data-action=f09-serve]').click();
 await p.locator('#connect-entry').click();const f=p.frameLocator('.connect-overlay iframe');await f.locator('body.connect-member').waitFor();await f.locator('.conversation-row[data-open=thread]').click();await p.locator('.connect-overlay>button').click();
 // Controlled empty care fixture, through the existing schema; never shipped runtime.
 await p.evaluate(()=>{const k='rallypoint-phase1-2026',s=JSON.parse(localStorage.getItem(k));s.prayers=[];s.rhythm={};localStorage.setItem(k,JSON.stringify(s));});await p.reload();await p.locator('[data-priority=caught-up]').waitFor();
}
try{
 for(const [width,height,large]of (process.env.STUDIO13_CASES==='390'?[[390,844,false]]:[[320,568,false],[375,667,false],[390,844,false],[430,932,false],[390,568,false],[390,844,true]])){
  const c=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await enter(p,candidate);
  for(const id of (large||height===568?['group-serving','visitor']:['group-serving','group-member','serving','visitor','leader'])){
   await scene(p,id);
   if(large)await p.locator('.s13-today').evaluate(e=>{for(const n of e.querySelectorAll('h1,h2,strong,p,small,button,span,summary'))n.style.fontSize=parseFloat(getComputedStyle(n).fontSize)*2+'px';});
   assert.equal(await p.locator('.s13-today').count(),1);await audit(p,id+' '+width);
   const ids=await p.locator('[data-priority],[data-row].is-actionable').evaluateAll(es=>es.map(e=>e.dataset.priority||e.dataset.row));
   await snap(p,'candidate-'+id+'-'+width+'-'+height+(large?'-large':'')+'.png');report.scenarios.push({id,width,height,large,priorities:ids,status:'passed'});
  }
  await complete(p);if(large)await p.locator('.s13-today').evaluate(e=>{for(const n of e.querySelectorAll('h1,h2,strong,p,small,button,span,summary'))n.style.fontSize=parseFloat(getComputedStyle(n).fontSize)*2+'px';});
  assert.equal(await p.locator('.s13-today h1').innerText(),'You’re all set.');await audit(p,'All Set '+width);await snap(p,'candidate-all-set-'+width+'-'+height+(large?'-large':'')+'.png');
  if(width===390&&height===844&&!large){
   for(const [name,id]of [['deferred','serving'],['unavailable','group-member']]){
    await scene(p,id);await p.evaluate(name=>{const k='rallypoint-phase1-2026',s=JSON.parse(localStorage.getItem(k));s.prayers=[];s.rhythm={};if(name==='unavailable')s.rsvp='going';if(name==='deferred')s.companionChoices={...s.companionChoices,snoozedUntil:{'serve-response':'2026-11-26T12:00:00Z'}};localStorage.setItem(k,JSON.stringify(s));if(name==='unavailable')localStorage.setItem('rallypoint-wednesday-chat-lab-v1','blocked studio fixture');},name);await p.reload();
    await p.locator('[data-priority="'+(name==='deferred'?'paused':'group-unavailable')+'"]').waitFor();assert.notEqual(await p.locator('.s13-today h1').innerText(),'You’re all set.');await audit(p,name);await snap(p,'candidate-'+name+'.png');
   }
   await scene(p,'leader');const reason=await p.locator('.f09b-explain p').innerText();await p.locator('[data-action=f10-open]').click();await p.locator('#f10-query').fill('Why is this first?');await p.locator('[data-form=f10-query] button').click();assert.ok((await p.locator('.f10-response').innerText()).includes(reason));await p.keyboard.press('Escape');
  }
  await c.close();console.log('Studio13 cases passed',width,height,large);
 }
 // Same fixture + clock + browser: exact unaffected route comparisons and before/after.
 const contexts=[];for(const [kind,url]of [['before',baseline],['after',candidate]]){
  // Match historical gate isolation: cold browser per source avoids cross-source image decode caches.
  await browser.close();browser=await launchBrowser();
  const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});contexts.push(c);const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.clock.setFixedTime(new Date('2026-11-25T12:00:00Z'));await p.goto(url);await snap(p,kind+'-welcome.png');
  await p.locator('[data-welcome=login]:visible').click();await p.locator('[data-welcome=demo]:visible').click();await scene(p,'group-serving');await snap(p,kind+'-today.png');
  for(const id of ['group','team','read']){await p.locator('#nav [data-go='+id+']').click();await snap(p,kind+'-'+id+'.png');}
  await p.locator('#connect-entry').click();await p.frameLocator('.connect-overlay iframe').locator('body.connect-member').waitFor();await snap(p,kind+'-connect.png');await p.locator('.connect-overlay>button').click();await p.locator('#nav [data-go=today]').click();await complete(p);await snap(p,kind+'-all-set.png');
 }
 const {readFile}=await import('node:fs/promises');for(const id of ['welcome','group','team','read','connect']){const r=compareScreenshots(await readFile(out+'/before-'+id+'.png'),await readFile(out+'/after-'+id+'.png'));report.unaffected.push({id,...r});assert.equal(r.rawDifferentPixels,0,id+' unintended visual change');}
 for(const c of contexts)await c.close();assert.deepEqual(report.errors,[]);
}finally{await writeFile(out+'/stage1-results.json',JSON.stringify(report,null,2));await browser.close();}
