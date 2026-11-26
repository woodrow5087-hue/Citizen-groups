'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const reference=require('./ux03-reference.json');
const viewports=[[320,568,false],[375,667,false],[390,844,false],[430,932,false],[390,500,false],[390,844,true]];
function launchOptions(env,defaults={}){
 // WebKit is additive strict pixel coverage. Existing Chromium runs stay unchanged.
 if(env.UX03_VISUAL_CAPTURE==='1')return {executablePath:env.RALLY_WEBKIT_EXECUTABLE||undefined};
 return {executablePath:env.BROWSER_PATH,...defaults};
}
function expectedCaptures(kind){
 const files=[];
 for(const [width,height,large] of viewports){
  const key=width+'-'+height+(large?'-large':'');
  if(kind==='standalone')for(const state of ['inbox','empty-search','thread','direct','room-chat','room-plans','room-people'])files.push(key+'-'+state+'.png');
  else{
   assert.equal(kind,'embedded');
   for(const profile of (large||height===500?['group-serving']:['group-member','serving','group-serving'])){
    files.push(key+'-'+profile+'-inbox.png');
    if(profile==='group-serving')for(const state of ['thread','direct','room-chat','room-plans','room-people'])files.push(key+'-'+profile+'-'+state+'.png');
   }
  }
 }
 return files.sort();
}
function protectSource(file,approved,candidate){
 assert.ok(Object.hasOwn(reference.files,file),'Unknown Connect source');
 assert.equal(crypto.createHash('sha256').update(approved).digest('hex'),reference.files[file],'Approved Connect source hash changed: '+file);
 assert.ok(approved.equals(candidate),'Protected Connect source changed: '+file);
}
function assertPair(result,label){
 assert.equal(result.sameDimensions,true,'Connect dimensions changed: '+label);
 assert.equal(result.rawDifferentPixels,0,'Connect raw pixel regression: '+label+' '+JSON.stringify(result));
}
async function settlePaint(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function prepareVisualState(target){
 await target.evaluate(async()=>{
  document.documentElement.getBoundingClientRect();
  await Promise.all([400,500,600,700,800].map(weight=>document.fonts.load(weight+' 16px Manrope')));
  await document.fonts.ready;
  await Promise.all([...document.images].map(image=>image.decode()));
  const scroll=document.querySelector('.screen:not([hidden]) .scroll-area');
  if(scroll){scroll.scrollTop=0;scroll.scrollLeft=0;}
  document.documentElement.getBoundingClientRect();
 });
}
async function directDraftPose(page){
 return page.locator('#direct-input').evaluate(e=>({
  value:e.value,selectionStart:e.selectionStart,selectionEnd:e.selectionEnd,selectionDirection:e.selectionDirection,
  focused:e===document.activeElement,rootFontSize:getComputedStyle(document.documentElement).fontSize,
  clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,
  rect:e.getBoundingClientRect().toJSON(),scrollTop:e.scrollTop,scrollLeft:e.scrollLeft
 }));
}
function assertDirectDraftPose(actual,before){
 const {scrollTop,scrollLeft,...unchanged}=actual;
 const {scrollTop:previousTop,scrollLeft:previousLeft,...expected}=before;
 assert.equal(scrollTop,0,'Doubled-text direct draft vertical scroll pose drifted');
 assert.equal(scrollLeft,0,'Doubled-text direct draft horizontal scroll pose drifted');
 assert.deepEqual(unchanged,expected,'Direct draft content, selection, focus or geometry changed during visual capture');
}
async function verifyDirectDraftPose(page,before){assertDirectDraftPose(await directDraftPose(page),before);}
async function normalizeDirectDraftPose(page){
 const before=await directDraftPose(page);
 assert.equal(before.value,'Jess draft','Unexpected direct-message visual fixture');
 assert.equal(before.rootFontSize,'32px','Scroll normalization is only for the doubled-text fixture');
 assert.equal(before.focused,true,'Preserve the focused draft fixture');
 // Native WebKit caret/autosize may retain either 0 or 2px here. Normalize only
 // this known single-line visual fixture; do not blur, resize or edit the draft.
 await page.locator('#direct-input').evaluate(e=>{e.scrollTop=0;e.scrollLeft=0;});
 await settlePaint(page);await verifyDirectDraftPose(page,before);
 return before;
}
async function captureStable(page){
 let previous;
 for(let frame=0;frame<8;frame++){
  const current=await page.screenshot({animations:'disabled',fullPage:true});
  if(previous?.equals(current))return current;
  previous=current;await settlePaint(page);
 }
 throw Error('Connect native paint did not stabilize');
}
module.exports={reference,launchOptions,expectedCaptures,protectSource,assertPair,settlePaint,prepareVisualState,assertDirectDraftPose,normalizeDirectDraftPose,verifyDirectDraftPose,captureStable};
