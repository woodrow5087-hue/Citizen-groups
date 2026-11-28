/* Additive S3 gate: real commitment identities, bounded native presentation,
 * and usable navigation. This does not replace any earlier assertion/baseline. */
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

const base=process.argv[2];assert.ok(base,'Pass an independently built/deployed preview origin');
const engine=process.env.CONVERGENCE_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch({headless:true,...(engine===webkit&&process.env.RALLY_WEBKIT_EXECUTABLE?{executablePath:process.env.RALLY_WEBKIT_EXECUTABLE}:{})});
const out='test-results/signature-s3',results=[];await mkdir(out,{recursive:true});
const source=process.env.SIGNATURE_SOURCE||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const sourceStatus=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
const primaryKey='rally-one-foundation2-v1:connected:primary';
const conversationKey='rally-one-foundation2-v1:connected:conversation';
const legacyKeys=['rallypoint-phase1-2026','rallypoint-today-ui-v1','rallypoint-wednesday-chat-lab-v1','rallypoint-blank-battle-v1'];
const viewports=[{width:320,height:760},{width:375,height:760},{width:390,height:500},{width:430,height:760}];
let failure=null,currentPage=null;

// Observe genuine browser effects without pausing time or wrapping the motion,
// renderer, storage or state owners. No private classifier is consulted.
function installMotionObserver(){
 const seen=new WeakSet();
 window.__signatureS3Motion={phase:'load',effects:[],frames:[]};
 function sample(){
  const state=window.__signatureS3Motion;
  const active=document.getAnimations().filter(animation=>['running','pending'].includes(animation.playState));
  const owned=active.filter(animation=>animation.effect?.target?.matches?.('.priority,.responsibilities,.sig-stack-layer--middle,.settled:not(.welcome-card),.greeting h1'));
  if(owned.length)state.frames.push({phase:state.phase,active:owned.length});
  for(const animation of owned){
   if(seen.has(animation))continue;seen.add(animation);
   const target=animation.effect.target,timing=animation.effect.getTiming();
   state.effects.push({phase:state.phase,target:target.className||target.tagName,task:target.dataset.motionTask||null,
    duration:Number(timing.duration),delay:Number(timing.delay)||0,iterations:timing.iterations,fill:timing.fill,
    keyframes:animation.effect.getKeyframes().map(frame=>({transform:frame.transform,opacity:frame.opacity,
     properties:Object.keys(frame).filter(key=>!['offset','computedOffset','easing','composite'].includes(key))}))});
  }
  requestAnimationFrame(sample);
 }
 requestAnimationFrame(sample);
}
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const raw=(page,key)=>page.evaluate(key=>localStorage.getItem(key),key);
const originals=page=>page.evaluate(keys=>Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),legacyKeys);
const snapshot=page=>page.evaluate(()=>({size:document.querySelector('.sig-priority-domain')?.getAttribute('data-stack-size'),
 primary:document.querySelector('.priority')?.getAttribute('data-motion-task')||null,
 tasks:[...document.querySelectorAll('.priority[data-motion-task],.responsibility[data-motion-task]')].map(node=>node.dataset.motionTask)}));
async function overflow(page,label){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' horizontal overflow');}
async function settleEffects(page){
 // WebKit can retain completed CSS transition objects whose old finished
 // promises never settle. Observe only the live structural effects instead.
 await page.waitForFunction(()=>!document.getAnimations().some(animation=>
  animation.effect?.target?.matches?.('.priority,.responsibilities,.sig-stack-layer--middle,.settled:not(.welcome-card),.greeting h1')&&
  ['running','pending'].includes(animation.playState)),null,{polling:'raf',timeout:2000});
 await frames(page);
 assert.deepEqual(await page.evaluate(()=>document.getAnimations().filter(animation=>
  animation.effect?.target?.matches?.('.priority,.responsibilities,.sig-stack-layer--middle,.settled:not(.welcome-card),.greeting h1')&&
  ['running','pending'].includes(animation.playState)).map(animation=>animation.effect.target.className||animation.effect.target.tagName)),[],
  'Structural native effects finish within the bounded observation');
}

// Inset points remain within the rounded native target rather than testing its
// transparent extreme corner. A painted decorative sibling cannot intercept it.
async function navigationHits(page,label,{connect=true}={}){
 const hits=await page.evaluate(connect=>{
  const nodes=[...document.querySelectorAll('#primary-nav a'),...(connect?[document.querySelector('.header-connect')]:[])];
  return nodes.map(node=>{
   if(!node)return {missing:true};
   const rect=node.getBoundingClientRect(),dx=Math.min(16,rect.width/3),dy=Math.min(16,rect.height/3);
   const points=[[rect.x+rect.width/2,rect.y+rect.height/2],[rect.left+dx,rect.top+dy],[rect.right-dx,rect.top+dy],[rect.left+dx,rect.bottom-dy],[rect.right-dx,rect.bottom-dy]];
   return {route:node.dataset.route,width:rect.width,height:rect.height,label:node.getAttribute('aria-label')||node.textContent.trim(),
    visible:rect.left>=0&&rect.top>=0&&rect.right<=innerWidth+1&&rect.bottom<=innerHeight+1,
    points:points.map(([x,y])=>{const hit=document.elementFromPoint(x,y);return !!hit&&(hit===node||node.contains(hit));})};
  });
 },connect);
 assert.equal(hits.length,connect?5:4,label+' retains four tabs and consistent Connect');
 assert.ok(hits.every(hit=>!hit.missing&&hit.width>=44&&hit.height>=44&&hit.visible&&hit.points.every(Boolean)),label+' native 44px navigation hit targets: '+JSON.stringify(hits));
 return hits;
}
async function labelsWhole(page,label){
 const labels=await page.locator('#primary-nav a>span').evaluateAll(nodes=>nodes.map(node=>{
  const range=document.createRange();range.selectNodeContents(node);
  return {text:node.textContent,lines:range.getClientRects().length,overflow:node.scrollWidth>node.clientWidth+1};
 }));
 assert.equal(labels.length,4);
 assert.ok(labels.every(value=>value.lines===1&&!value.overflow),label+' whole destination labels: '+JSON.stringify(labels));
}
async function bottomClearance(page,label){
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await frames(page);
 const value=await page.evaluate(()=>{
  const nav=document.getElementById('primary-nav').getBoundingClientRect();
  const nodes=[...document.querySelectorAll('.preview-footer>span,.preview-footer>a')];
  const last=document.querySelector('.signature-today')?.lastElementChild;if(last)nodes.push(last);
  return {navTop:nav.top,items:nodes.map(node=>{const rect=node.getBoundingClientRect();return {tag:node.tagName,className:node.className,bottom:rect.bottom};})};
 });
 assert.ok(value.items.length>=3&&value.items.every(item=>item.bottom<=value.navTop-3),label+' final content/footer clear floating navigation: '+JSON.stringify(value));
 const footer=page.locator('.preview-footer>a');await footer.evaluate(node=>node.scrollIntoView({block:'end'}));await frames(page);await footer.focus();
 const focus=await footer.evaluate(node=>{const rect=node.getBoundingClientRect(),nav=document.getElementById('primary-nav').getBoundingClientRect(),hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);return {focused:node===document.activeElement,bottom:rect.bottom,navTop:nav.top,hit:!!hit&&(hit===node||node.contains(hit))};});
 assert.ok(focus.focused&&focus.hit&&focus.bottom<=focus.navTop-3,label+' final footer link/focus remains unobscured: '+JSON.stringify(focus));
 await navigationHits(page,label+' at document bottom',{connect:false});
}
async function safeInsetClearance(page,label){
 const original=await page.evaluate(()=>({value:document.documentElement.style.getPropertyValue('--sig-safe-bottom'),priority:document.documentElement.style.getPropertyPriority('--sig-safe-bottom')}));
 try{
  await page.evaluate(()=>document.documentElement.style.setProperty('--sig-safe-bottom','34px'));await frames(page);
  const clearance=await page.locator('#primary-nav').evaluate(node=>({bottom:node.getBoundingClientRect().bottom,viewport:innerHeight}));
  assert.ok(clearance.bottom<=clearance.viewport-34,label+' floating navigation honors simulated 34px safe inset: '+JSON.stringify(clearance));
  await bottomClearance(page,label+' simulated safe inset');
 }finally{
  await page.evaluate(original=>{const style=document.documentElement.style;if(original.value)style.setProperty('--sig-safe-bottom',original.value,original.priority);else style.removeProperty('--sig-safe-bottom');},original);
  await frames(page);
 }
}
async function enlargedNavigation(page,label){
 const primaryBefore=await raw(page,primaryKey),conversationBefore=await raw(page,conversationKey);
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%';window.scrollTo(0,0);});await frames(page);
 await overflow(page,label+' 200%');await labelsWhole(page,label+' 200%');
  const compactLabels=await page.locator('.responsibility .sig-action-label').evaluateAll(nodes=>nodes.map(node=>{const range=document.createRange();range.selectNodeContents(node);return {text:node.textContent,lines:range.getClientRects().length,overflow:node.scrollWidth>node.clientWidth+1};}));
  assert.ok(compactLabels.every(value=>value.lines===1&&!value.overflow),label+' enlarged short response labels remain whole: '+JSON.stringify(compactLabels));
 await navigationHits(page,label+' 200%');
 for(const [route,selector] of [['groups','.group-page'],['team','.team-page'],['read','.read-page']]){
  const target=page.locator('#primary-nav [data-route='+route+']');await target.focus();await page.keyboard.press('Enter');
  await page.locator(selector).waitFor();
  assert.equal(new URL(page.url()).searchParams.get('screen'),route,label+' native keyboard route '+route);
  assert.equal(await page.locator('body.signature-mode,.shell.signature-shell,.signature-today').count(),0,'S3 is Today-only');
  if(route==='read')assert.equal(await page.locator('.read-game-link').count(),3,'Original game entries remain reachable');
  await page.goBack();await page.locator('.signature-today').waitFor();
  assert.equal(await page.locator('#today').evaluate(node=>node===document.activeElement),true,'Browser Back preserves existing main-focus fallback');
  await page.evaluate(()=>window.scrollTo(0,0));await frames(page);await navigationHits(page,label+' returned '+route+' 200%');
 }
 // An existing named agenda origin exercises the app-owned return-focus path.
 const agenda=page.locator('[data-return-focus=agenda-group]');assert.equal(await agenda.count(),1);
 await agenda.scrollIntoViewIfNeeded();await agenda.focus();await page.keyboard.press('Enter');await page.locator('.group-page').waitFor();
 await page.goBack();await page.locator('.signature-today').waitFor();
 const restored=await page.locator('[data-return-focus=agenda-group]').evaluate(node=>{
  const rect=node.getBoundingClientRect(),nav=document.getElementById('primary-nav').getBoundingClientRect(),hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
  return {focused:node===document.activeElement,clear:rect.top>=0&&rect.bottom<=nav.top-3,hit:!!hit&&(hit===node||node.contains(hit))};
 });
 assert.ok(restored.focused&&restored.clear&&restored.hit,label+' enlarged agenda return focus/hit stays visible: '+JSON.stringify(restored));
 await page.evaluate(()=>window.scrollTo(0,0));await frames(page);
 await page.locator('.header-connect').focus();await page.keyboard.press('Enter');
 await page.frameLocator('#premium-connect').locator('body.connect-member').waitFor();
 await page.locator('.connect-return').click();await page.locator('.signature-today').waitFor();
 assert.equal(await page.locator('.header-connect').evaluate(node=>node===document.activeElement),true,'Connect return preserves its named origin at 200%');
 assert.equal(await raw(page,primaryKey),primaryBefore,'Navigation does not save another response');
 assert.equal(await raw(page,conversationKey),conversationBefore,'Inbox navigation does not read a conversation');
 await bottomClearance(page,label+' 200%');
 if(label.includes('All Set'))await safeInsetClearance(page,label+' 200%');
 await page.evaluate(()=>{document.documentElement.style.fontSize='';window.scrollTo(0,0);});await frames(page);await settleEffects(page);
}

async function realResponses(page,reduced,label){
 const before=await snapshot(page);
 assert.equal(before.size,'2',label+' starts with two actual responsibilities');assert.equal(before.tasks.length,2);
 assert.equal(new Set(before.tasks).size,2);assert.ok(before.tasks.includes(before.primary));
 const initialConversation=await raw(page,conversationKey);
 // DOM activation runs the existing actual command/save handler, as in the
 // retained E2B motion gate. The next control is hit-tested while it moves.
 const motion=await page.evaluate(async reduced=>{
  const evidence=window.__signatureS3Motion;evidence.phase='promotion';evidence.effects=[];evidence.frames=[];
  const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  function layerState(){
   const domain=document.querySelector('.sig-priority-domain');
   function inspect(selector){
    const node=domain?.querySelector(selector);if(!node)return null;
    const style=getComputedStyle(node),bounds=node.getBoundingClientRect();
    return {display:style.display,visibility:style.visibility,opacity:Number(style.opacity),width:bounds.width,height:bounds.height,
     visible:style.display!=='none'&&!['hidden','collapse'].includes(style.visibility)&&Number(style.opacity)>0&&bounds.width>0&&bounds.height>0};
   }
   return {size:domain?.dataset.stackSize,count:domain?.querySelectorAll('.sig-stack-layer').length??0,
    back:inspect('.sig-stack-layer--back'),middle:inspect('.sig-stack-layer--middle')};
  }
  const twoLayers=layerState();
  const initial=document.querySelector('.priority[data-motion-task]'),secondary=document.querySelector('.responsibility[data-motion-task]');
  const old=secondary?.getBoundingClientRect();
  if(!initial||!secondary)throw Error('Expected two keyed real responsibilities');
  const promotedId=secondary.dataset.motionTask,oldPrimaryId=initial.dataset.motionTask;
  const serve=document.querySelector('[data-command=serve]');if(!serve)throw Error('Expected real serving response');serve.focus({preventScroll:true});serve.click();
  let active=[];
  for(let i=0;i<8;i++){
   await nextFrame();active=document.getAnimations().filter(animation=>animation.effect?.target?.matches?.('.priority,.responsibilities,.sig-stack-layer--middle')&&['running','pending'].includes(animation.playState));
   if(reduced||active.length)break;
  }
  const primary=document.querySelector('.priority[data-motion-task]'),domain=document.querySelector('.sig-priority-domain');
  const promoted=primary?.dataset.motionTask,oneSize=domain?.dataset.stackSize;
  const oneLayers=layerState();
  const effect=active.find(animation=>animation.effect.target===primary),first=effect?.effect.getKeyframes()[0];
  let firstXY=null;try{if(first?.transform){const matrix=new DOMMatrixReadOnly(first.transform);firstXY={x:matrix.m41,y:matrix.m42};}}catch(_){}
  const rect=primary?.getBoundingClientRect();let currentXY={x:0,y:0};
  try{if(primary){const matrix=new DOMMatrixReadOnly(getComputedStyle(primary).transform);currentXY={x:matrix.m41,y:matrix.m42};}}catch(_){}
  const canonical=rect?{left:rect.left-currentXY.x,top:rect.top-currentXY.y,width:rect.width,height:rect.height}:null;
  const oldVisible=!!old&&old.right>0&&old.left<innerWidth&&old.bottom>0&&old.top<innerHeight;
  const newVisible=!!canonical&&canonical.left+canonical.width>0&&canonical.left<innerWidth&&canonical.top+canonical.height>0&&canonical.top<innerHeight;
  const expected=old&&canonical?{x:Math.max(-24,Math.min(24,old.left-canonical.left)),y:Math.max(-24,Math.min(24,old.top-canonical.top))}:null;
  window.scrollTo(0,0);await nextFrame();
  function hits(){return [...document.querySelectorAll('#primary-nav a,.header-connect')].map(node=>{
   const box=node.getBoundingClientRect(),dx=Math.min(16,box.width/3),dy=Math.min(16,box.height/3);
   const points=[[box.x+box.width/2,box.y+box.height/2],[box.left+dx,box.top+dy],[box.right-dx,box.top+dy],[box.left+dx,box.bottom-dy],[box.right-dx,box.bottom-dy]];
   return {route:node.dataset.route,width:box.width,height:box.height,visible:box.left>=0&&box.top>=0&&box.right<=innerWidth+1&&box.bottom<=innerHeight+1,
    hit:points.every(([x,y])=>{const target=document.elementFromPoint(x,y);return !!target&&(target===node||node.contains(target));})};
  });}
  const promotionHits=hits(),activeAtNav=document.getAnimations().some(animation=>animation.effect?.target?.matches?.('.priority,.responsibilities,.sig-stack-layer--middle')&&['running','pending'].includes(animation.playState));
  const rsvp=document.querySelector('[data-command=rsvp]');if(!rsvp)throw Error('Promoted actual RSVP control missing');
  rsvp.scrollIntoView({block:'center'});rsvp.focus({preventScroll:true});
  const button=rsvp.getBoundingClientRect(),hit=document.elementFromPoint(button.x+button.width/2,button.y+button.height/2);
  const control={hit:!!hit&&(hit===rsvp||rsvp.contains(hit)),focused:document.activeElement===rsvp,blocked:rsvp.disabled||!!rsvp.closest('[inert]')||getComputedStyle(rsvp).pointerEvents==='none',
   activeAtClick:document.getAnimations().some(animation=>animation.effect?.target?.matches?.('.priority,.responsibilities,.sig-stack-layer--middle')&&['running','pending'].includes(animation.playState))};
  evidence.phase='completion';rsvp.click();
  for(let i=0;i<8;i++){await nextFrame();if(reduced||document.getAnimations().some(animation=>animation.effect?.target?.matches?.('.settled,.greeting h1')))break;}
  window.scrollTo(0,0);await nextFrame();
  const completionHits=hits(),zeroSize=document.querySelector('.sig-priority-domain')?.dataset.stackSize;
  const zeroLayers=layerState();
  const target=document.querySelector('.settled'),layout=node=>node?{top:node.offsetTop,left:node.offsetLeft,width:node.offsetWidth,height:node.offsetHeight}:null;
  const layoutBefore=layout(target);
  const motionDeadline=performance.now()+2000;
  while(document.getAnimations().some(animation=>animation.effect?.target?.matches?.('.priority,.responsibilities,.sig-stack-layer--middle,.settled:not(.welcome-card),.greeting h1')&&(animation.playState==='running'||animation.pending))){
   if(performance.now()>motionDeadline)throw Error('Owned commitment effects did not finish within 2s');
   await nextFrame();
  }
  await nextFrame();
  const sourceRect=old?{left:old.left,top:old.top,right:old.right,bottom:old.bottom,width:old.width,height:old.height}:null;
  return {oldPrimaryId,promotedId,promoted,oneSize,zeroSize,sourceRect,canonicalRect:canonical,oldVisible,newVisible,expected,firstXY,
   presentation:reduced?'suppressed':Number(effect?.effect.getTiming().duration)===200?'keyed-promotion':'geometry-free-fallback',
   layers:{two:twoLayers,one:oneLayers,zero:zeroLayers},activeAtNav,promotionHits,completionHits,control,layoutBefore,layoutAfter:layout(target),effects:evidence.effects,frames:evidence.frames};
 },reduced);
 assert.equal(motion.promoted,motion.promotedId,'Actual secondary identity becomes primary');assert.notEqual(motion.promoted,motion.oldPrimaryId);
 assert.equal(motion.oneSize,'1','Real first save reduces the stack domain to one');assert.equal(motion.zeroSize,'0','Real last save clears the stack domain');
 assert.ok(motion.layers.two.size==='2'&&motion.layers.two.count===2&&motion.layers.two.back?.visible&&motion.layers.two.middle?.visible,label+' two actual responses paint both decorative layers: '+JSON.stringify(motion.layers.two));
 assert.ok(motion.layers.one.size==='1'&&motion.layers.one.back?.display==='none'&&!motion.layers.one.back.visible&&motion.layers.one.middle?.visible,label+' one real response hides the back plane and retains its thin middle base: '+JSON.stringify(motion.layers.one));
 assert.ok(motion.layers.zero.size==='0'&&motion.layers.zero.count===0&&motion.layers.zero.back===null&&motion.layers.zero.middle===null,label+' real completion removes decorative stack layers: '+JSON.stringify(motion.layers.zero));
 for(const [phase,hits] of [['promotion',motion.promotionHits],['completion',motion.completionHits]])assert.ok(hits.length===5&&hits.every(hit=>hit.width>=44&&hit.height>=44&&hit.visible&&hit.hit),label+' '+phase+' native nav/Connect hit testing: '+JSON.stringify(hits));
 assert.ok(motion.control.hit&&motion.control.focused&&!motion.control.blocked,label+' remaining real control is hit-testable/focusable');
 assert.deepEqual(motion.layoutAfter,motion.layoutBefore,'Finished completion leaves its final layout unchanged');
 if(reduced)assert.deepEqual(motion.effects,[],label+' reduced motion never starts a commitment effect');
 else{
  assert.ok(motion.activeAtNav&&motion.control.activeAtClick,label+' navigation and remaining response remain usable during real promotion');
  assert.ok(motion.effects.some(effect=>effect.phase==='promotion'&&effect.task===motion.promotedId),'Promotion animates the real retained task identity');
  assert.ok(motion.effects.some(effect=>effect.phase==='completion'&&/settled|greeting|^H1$/.test(effect.target)),'Actual final response earns completion motion');
  assert.ok(motion.frames.every(frame=>frame.active<=2),'At most two owned effects are active');
  assert.ok(['promotion','completion'].every(phase=>motion.effects.filter(effect=>effect.phase===phase).length<=2),'Each response owns at most two native effects');
  assert.ok(motion.effects.every(effect=>effect.duration>=180&&effect.duration+effect.delay<=220&&effect.iterations===1&&effect.fill==='none'&&effect.keyframes.every(frame=>frame.properties.every(key=>['transform','opacity'].includes(key)))),'Bounded transform/opacity effects');
  if(motion.newVisible){
   assert.equal(motion.presentation,'keyed-promotion',label+' visible keyed source uses the real geometry path');
   assert.ok(motion.firstXY&&Math.abs(motion.firstXY.x-motion.expected.x)<1&&Math.abs(motion.firstXY.y-motion.expected.y)<1,label+' native first frame follows bounded keyed source geometry: '+JSON.stringify({first:motion.firstXY,expected:motion.expected}));
  }
 }
 assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.');
 assert.equal(await page.locator('.sig-completion--complete').count(),1);assert.equal(await page.locator('[data-command]').count(),0);
 assert.match(await page.locator('a.utility[href="?screen=connect"]').innerText(),/3 new group messages/,'Unread remains optional after completion');
 assert.equal(await raw(page,conversationKey),initialConversation,'Responses do not mark messages read');
 const saved=JSON.parse(await raw(page,primaryKey));
 const records=Object.entries(saved.eventResponses?.records||{});assert.equal(records.length,2,'Both explicit responses are dated records');
 for(const [kind,value] of [['group','going'],['team','confirmed']]){
  const matches=records.filter(([id,record])=>id.startsWith('fixture:connected:'+kind+':north:')&&record.kind===kind);
  assert.equal(matches.length,1,'One real dated '+kind+' record');assert.equal(matches[0][1].value,value);
  assert.ok(Number.isFinite(Date.parse(matches[0][0].slice(('fixture:connected:'+kind+':north:').length))),'Response date is valid');
 }
 await page.reload();await page.locator('.sig-completion--complete').waitFor();await frames(page);
 assert.deepEqual(await page.evaluate(()=>window.__signatureS3Motion.effects),[],'Calm reload does not replay completion or stale captured geometry');
 assert.equal(await raw(page,conversationKey),initialConversation);
 return motion;
}

async function noPersonaReplay(page,label){
 for(const role of ['visitor','unavailable','connected']){
  await page.evaluate(()=>{window.__signatureS3Motion.phase='persona';window.__signatureS3Motion.effects=[];});
  const tools=page.locator('#preview-tools');if(await tools.getAttribute('open')===null)await tools.locator(':scope > summary').click();
  await page.locator('#scenario').selectOption(role);await page.locator('.signature-today').waitFor();await frames(page);
  assert.deepEqual(await page.evaluate(()=>window.__signatureS3Motion.effects),[],label+' '+role+' switch cannot reuse captured commitment motion');
  if(role!=='connected')assert.equal(await page.locator('.sig-completion--complete').count(),0,role+' is not a completed member');
 }
}

function auditCompositionStorage(){
 const prototype=Storage.prototype,methods={};
 for(const name of ['getItem','setItem','removeItem','clear','key'])methods[name]=prototype[name];
 const length=Object.getOwnPropertyDescriptor(prototype,'length');
 methods.setItem.call(localStorage,'rally-one-foundation2-v1:connected:primary','unchanged-composition-primary');
 methods.setItem.call(sessionStorage,'rally-one-foundation2-v1:selected-scenario','unchanged-composition-scenario');
 window.__signatureS3GalleryStorageCalls=[];
 for(const name of Object.keys(methods))prototype[name]=function(...args){window.__signatureS3GalleryStorageCalls.push({method:name,key:args[0]??null});return methods[name].apply(this,args);};
 if(length?.get)Object.defineProperty(prototype,'length',{...length,get(){window.__signatureS3GalleryStorageCalls.push({method:'length'});return length.get.call(this);}});
 window.__signatureS3GallerySentinels=()=>[methods.getItem.call(localStorage,'rally-one-foundation2-v1:connected:primary'),methods.getItem.call(sessionStorage,'rally-one-foundation2-v1:selected-scenario')];
}
async function compositionPrototypes(){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'America/Denver'});
 await context.addInitScript(auditCompositionStorage);
 const page=await context.newPage();currentPage=page;const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(new URL('/foundation2/signature-gallery.html',base).href);await page.locator('#composition-studies').waitFor();
 assert.equal(await page.locator('.gallery-composition-study').count(),2,'Both distinct composition prototypes remain available');
 const state=study=>study.evaluate(node=>({title:node.querySelector('.gallery-study-heading h3').textContent,
  remaining:node.querySelector('.sig-comp-day-sheet').dataset.responseCount,
  pending:[...node.querySelectorAll('[data-sig-action=composition-response]')].map(button=>button.dataset.sigValue),
  allSet:!!node.querySelector('.sig-comp-allset'),unread:node.querySelector('.sig-comp-unread').textContent.trim()}));
 const checks=[];
 for(const mode of ['brief','connected']){
  const study=page.locator('[data-study='+mode+']'),other=page.locator('[data-study='+(mode==='brief'?'connected':'brief')+']');
  const otherMarkup=await other.evaluate(node=>node.outerHTML),before=await state(study);
  assert.equal(before.remaining,'2');assert.deepEqual(before.pending,['serve','rsvp']);assert.equal(before.allSet,false);assert.equal(before.unread,'3 new messages');
  const secondary=study.locator('.sig-comp-secondary [data-sig-action=composition-response][data-sig-value=rsvp]');
  await secondary.focus();await page.keyboard.press('Space');
  const one=await state(study);assert.equal(one.remaining,'1');assert.deepEqual(one.pending,['serve']);assert.equal(one.allSet,false);assert.equal(one.unread,before.unread);
  const remaining=study.locator('[data-sig-action=composition-response][data-sig-value=serve]');
  assert.equal(await remaining.evaluate(node=>node===document.activeElement),true,'Secondary-first specimen reply restores focus to the remaining actual control');
  assert.equal(await other.evaluate(node=>node.outerHTML),otherMarkup,'One prototype response cannot change the other study');
  await page.keyboard.press('Enter');
  const complete=await state(study);assert.equal(complete.remaining,'0');assert.deepEqual(complete.pending,[]);assert.equal(complete.allSet,true);assert.equal(complete.unread,before.unread);
  assert.equal(await study.locator('.sig-comp-allset-title').evaluate(node=>node===document.activeElement),true,'Prototype All Set receives its own native focus target');
  assert.equal(await other.evaluate(node=>node.outerHTML),otherMarkup,'Prototype completion cannot change the other study');
  const unread=study.locator('.sig-comp-unread');await unread.focus();await page.keyboard.press('Enter');
  await page.locator('#gallery-dialog[open]').waitFor();assert.equal(await page.locator('#gallery-dialog-title').innerText(),'Connect');
  await page.keyboard.press('Escape');await page.locator('#gallery-dialog[open]').waitFor({state:'hidden'});
  assert.equal(await unread.evaluate(node=>node===document.activeElement),true,'Composition detail returns focus to its exact gallery source');
  assert.deepEqual(await state(study),complete,'Optional message detail cannot change specimen responses or unread');
  checks.push({mode,before,one,complete,secondaryFirstKeyboard:'passed',independent:'passed',dialogReturnFocus:'passed'});
 }
 assert.notEqual(checks[0].before.title,checks[1].before.title,'Composition prototypes remain separately named studies');
 for(const mode of ['brief','connected']){
  const study=page.locator('[data-study='+mode+']'),other=page.locator('[data-study='+(mode==='brief'?'connected':'brief')+']');
  const otherMarkup=await other.evaluate(node=>node.outerHTML),reset=study.locator('[data-sig-action=composition-reset]');
  await reset.focus();await page.keyboard.press('Enter');
  const restored=await state(study);assert.equal(restored.remaining,'2');assert.deepEqual(restored.pending,['serve','rsvp']);assert.equal(restored.allSet,false);assert.equal(restored.unread,'3 new messages');
  assert.equal(await study.locator('[data-sig-action=composition-response][data-sig-value=serve]').evaluate(node=>node===document.activeElement),true,'Study reset restores focus to its first native response control');
  assert.equal(await other.evaluate(node=>node.outerHTML),otherMarkup,'Reset remains independent of the other composition');
  checks.find(check=>check.mode===mode).reset=restored;
 }
 assert.deepEqual(await page.evaluate(()=>window.__signatureS3GalleryStorageCalls),[],'Composition prototypes perform zero native storage reads, writes or enumeration');
 assert.deepEqual(await page.evaluate(()=>window.__signatureS3GallerySentinels()),['unchanged-composition-primary','unchanged-composition-scenario']);
 assert.deepEqual(errors,[],'Composition prototypes have no page errors');
 await writeFile(out+'/'+engine.name()+'-gallery-prototypes.json',JSON.stringify({source,viewport:{width:390,height:844},checks,storage:'zero instrumented native Storage IO',pageErrors:errors},null,2));
 results.push({source,engine:engine.name(),surface:'gallery-compositions',viewport:{width:390,height:844},studies:['brief','connected'],secondaryFirstKeyboard:'passed',responseAndResetIndependence:'passed',optionalUnread:'unchanged at 3',dialogReturnFocus:'passed',storage:'zero instrumented native Storage IO',pageErrors:errors});
 await context.close();currentPage=null;console.log('SIGNATURE S3 gallery prototypes passed '+engine.name());
}

try{
 let geometries=0;
 for(const reduced of [false,true])for(const viewport of [...viewports,...(!reduced?[{width:390,height:844}]:[])]){
  const label=engine.name()+' '+viewport.width+'x'+viewport.height+' '+(reduced?'reduced':'normal');
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference',timezoneId:'America/Denver'});
  await context.addInitScript(installMotionObserver);
  const page=await context.newPage();currentPage=page;const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00Z'));
  await page.goto(new URL('/foundation2/',base).href);await page.locator('.sig-priority-domain[data-stack-size="2"]').waitFor();
  await page.evaluate(()=>document.fonts.ready);await frames(page);
  const original=await originals(page);await overflow(page,label);await navigationHits(page,label+' pending');
  await enlargedNavigation(page,label+' pending');
  const motion=await realResponses(page,reduced,label);
  if(!reduced&&motion.newVisible&&Math.abs(motion.expected.y)>5)geometries++;
  await safeInsetClearance(page,label+' All Set');
  await enlargedNavigation(page,label+' All Set');await noPersonaReplay(page,label);
  await bottomClearance(page,label+' All Set');await overflow(page,label+' finish');
  assert.deepEqual(await originals(page),original,'Legacy storage owners remain untouched');assert.deepEqual(errors,[],label+' page errors');
  const file=engine.name()+'-'+viewport.width+'x'+viewport.height+'-'+(reduced?'reduced':'normal');
  await page.screenshot({path:out+'/'+file+'.png',fullPage:true,animations:'disabled'});
  await writeFile(out+'/'+file+'-motion.json',JSON.stringify(motion,null,2));
  results.push({source,engine:engine.name(),viewport,reducedMotion:reduced,realResponses:'passed',nativeNavigation:'passed',enlargedNavigation:'passed',focusAndClearance:'passed',noReplay:'passed',geometryObserved:!reduced&&motion.newVisible,pageErrors:errors});
  await context.close();currentPage=null;console.log('SIGNATURE S3 passed '+label);
 }
 assert.ok(geometries>0,'At least one real on-screen promotion must prove nontrivial source-keyed geometry rather than the geometry-free nudge');
 await compositionPrototypes();
}catch(error){
 failure={message:error.message,stack:error.stack};
 if(currentPage)try{await currentPage.screenshot({path:out+'/'+engine.name()+'-failure.png',fullPage:true,animations:'disabled'});}catch(_){}
 throw error;
}finally{
 await browser.close();
 await writeFile(out+'/results-'+engine.name()+'.json',JSON.stringify({source,sourceStatus,attribution:sourceStatus?'Working-tree candidate based on source SHA':'Clean exact source SHA',base,engine:engine.name(),results,failure},null,2));
}
