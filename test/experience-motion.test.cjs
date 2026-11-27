'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const Motion=require('../foundation2/motion.js');
const active=overrides=>({route:'today',owner:'combined',primaryId:'group-rsvp',taskIds:['group-rsvp','serve-response'],calm:false,available:true,receipt:'',...overrides});
const calm=overrides=>active({primaryId:null,taskIds:[],calm:true,receipt:'Sample serving response saved on this device.',...overrides});
const saved=overrides=>active({receipt:{ok:true,message:'Saved response on this device.'},...overrides});
function harness({reduced=false,legacy=false,routeTransitions=false}={}){
 const document=new JSDOM('<main><header class="greeting"><h1>Existing heading</h1></header><p class="receipt" role="status">Existing receipt</p><article class="priority"></article><section class="responsibilities"></section><article class="settled"></article><div class="group-response"></div><div class="team-availability"></div><p class="group-feedback" role="status">Existing saved feedback</p></main>').window.document;
 const root=document.querySelector('main'),calls=[],listeners=new Set();
 const media={matches:reduced};
 const add=(_type,listener)=>listeners.add(listener),remove=(_type,listener)=>listeners.delete(listener);
 if(legacy){media.addListener=listener=>listeners.add(listener);media.removeListener=listener=>listeners.delete(listener);}
 else{media.addEventListener=add;media.removeEventListener=remove;}
 for(const node of [root,...root.querySelectorAll('*')])node.animate=(frames,options)=>{
  const effect={cancelled:false,cancel(){this.cancelled=true;this.oncancel?.();}};
  calls.push({node,frames,options,effect});return effect;
 };
 const controller=Motion.create({matchMedia:query=>{assert.equal(query,'(prefers-reduced-motion: reduce)');return media;},routeTransitions});
 return {root,calls,controller,listeners,media,change(value){media.matches=value;for(const listener of listeners)listener({matches:value});}};
}

test('classification needs an actual same-persona Today commitment change',()=>{
 assert.equal(Motion.classify(null,calm()).kind,'none');
 assert.equal(Motion.classify(active(),active()).kind,'none');
 assert.equal(Motion.classify(active(),active({receipt:'Sample RSVP saved on this device.'})).kind,'none');
 assert.equal(Motion.classify(active(),active({taskIds:['serve-response','group-rsvp']})).kind,'none','Task ordering alone does not animate the stack');
 assert.deepEqual(Motion.classify(active(),saved({primaryId:'serve-response',taskIds:['serve-response']})),{kind:'commitments',primary:true,stack:true});
 assert.deepEqual(Motion.classify(active(),saved({taskIds:['group-rsvp']})),{kind:'commitments',primary:false,stack:true});
 assert.deepEqual(Motion.classify(active(),saved({primaryId:'serve-response'})),{kind:'commitments',primary:true,stack:false});
 assert.equal(Motion.classify(active(),active({primaryId:'serve-response',taskIds:['serve-response']})).kind,'none','Projection changes alone are not a saved response');
 assert.equal(Motion.classify(active(),calm()).kind,'completion');
 assert.equal(Motion.classify(active(),calm({receipt:{ok:true,message:'Current response saved.'}})).kind,'completion');
});

test('first load, persona switches, empty/review/profile draws and failed receipts cannot celebrate',()=>{
 const before=active();
 for(const after of [
  calm({owner:'group'}),calm({route:'groups'}),calm({route:'team'}),calm({route:'read'}),calm({route:'connect'}),
  calm({receipt:''}),calm({receipt:'No change: storage unavailable.'}),calm({receipt:'Saved for later.'}),
  calm({receipt:'Anything saved on this device.'}),calm({receipt:{ok:false,message:'Could not save.'}}),
  calm({receipt:{ok:true,message:'  '}}),calm({available:false}),calm({calm:false}),
  calm({taskIds:['paused'],primaryId:'paused'}),calm({taskIds:['unknown'],primaryId:null})
 ])assert.notEqual(Motion.classify(before,after).kind,'completion',JSON.stringify(after));
 for(const previous of [calm(),active({available:false}),active({owner:'visitor'}),active({taskIds:[],primaryId:null})])
  assert.notEqual(Motion.classify(previous,calm()).kind,'completion');
 assert.equal(Motion.classify(before,active({name:'Updated profile',receipt:'Sample RSVP saved on this device.'})).kind,'none');
 const {controller,calls,root}=harness();
 controller.update(calm(),root);controller.update(calm({owner:'group'}),root);
 assert.equal(calls.length,0);
 controller.dispose();
 const reload=harness();reload.controller.update(calm(),reload.root);assert.equal(reload.calls.length,0);reload.controller.dispose();
});

test('malformed and contradictory projections fail closed without repairing input',()=>{
 const before=active(),valid=calm();
 for(const invalid of [null,{},calm({owner:''}),calm({route:'unknown'}),calm({taskIds:null}),calm({taskIds:['duplicate','duplicate'],primaryId:'duplicate',calm:false}),calm({taskIds:[''],primaryId:'',calm:false}),active({primaryId:null}),calm({primaryId:'missing'}),calm({available:undefined}),calm({commitmentSignature:{untrusted:true}})]){
  assert.equal(Motion.classify(before,invalid).kind,'none');
  assert.equal(Motion.classify(invalid,valid).kind,'none');
 }
 Object.freeze(before.taskIds);Object.freeze(before);Object.freeze(valid.taskIds);Object.freeze(valid);
 const bytes=JSON.stringify([before,valid]);
 assert.equal(Motion.classify(before,valid).kind,'completion');
 assert.equal(JSON.stringify([before,valid]),bytes);
});

test('effects are capped, short transform/opacity presentations and leave DOM/styles/focus alone',()=>{
 const {controller,calls,root}=harness(),html=root.outerHTML;
 root.ownerDocument.body.tabIndex=-1;root.ownerDocument.body.focus();
 const focused=root.ownerDocument.activeElement;
 controller.update(active(),root);
 controller.update(saved({primaryId:'serve-response',taskIds:['serve-response']}),root);
 assert.equal(calls.length,2);
 assert.equal(calls[0].node.className,'priority');assert.equal(calls[1].node.className,'responsibilities');
 controller.update(calm(),root);
 assert.equal(calls.length,4);
 assert.equal(calls[0].effect.cancelled,true);assert.equal(calls[1].effect.cancelled,true);
 assert.equal(calls[2].node.className,'settled');assert.equal(calls[3].node.tagName,'H1');
 for(const {frames,options} of calls){
  assert.ok(options.duration>=180&&options.duration<=220);
  assert.equal(options.iterations,1);assert.equal(options.fill,'none');assert.equal(options.delay,undefined);
  for(const frame of frames)assert.deepEqual(Object.keys(frame).sort(),['opacity','transform']);
 }
 assert.equal(root.outerHTML,html);assert.equal(root.ownerDocument.activeElement,focused);
 controller.update(calm(),root);
 assert.equal(calls.length,4,'Repeated draws never loop completion');
 assert.equal(calls[2].effect.cancelled,true);assert.equal(calls[3].effect.cancelled,true);
 controller.dispose();
});

test('same source data and task membership never animate a redraw or an unrelated profile review',()=>{
 const {controller,calls,root}=harness();
 const mutable=saved();controller.update(mutable,root);
 mutable.taskIds.pop();mutable.primaryId='group-rsvp';
 controller.update(mutable,root);
 assert.equal(calls.length,1,'Previous presentation copies task IDs instead of retaining mutable input');
 assert.equal(calls[0].node.className,'responsibilities');
 controller.update({...mutable,name:'New name'},root);
 controller.update({...mutable,receipt:'Sample leader review saved on this device.'},root);
 assert.equal(calls.length,1);
 controller.dispose();
});

test('reduced motion is checked at every update and changes cancel in-flight effects',()=>{
 for(const legacy of [false,true]){
  const h=harness({legacy});
  h.controller.update(active(),h.root);h.controller.update(calm(),h.root);
  assert.equal(h.calls.length,2);h.change(true);
  assert.ok(h.calls.every(call=>call.effect.cancelled));
  h.controller.update(active(),h.root);h.controller.update(calm(),h.root);
  assert.equal(h.calls.length,2);
  h.change(false);h.controller.update(calm(),h.root);
  assert.equal(h.calls.length,2,'A reduced-motion completion is never replayed');
  h.controller.update(saved(),h.root);assert.equal(h.calls.length,4);
  h.controller.dispose();assert.ok(h.calls.every(call=>call.effect.cancelled));assert.equal(h.listeners.size,0);
  h.controller.update(calm(),h.root);assert.equal(h.calls.length,4);
 }
 const h=harness({reduced:true});h.controller.update(active(),h.root);h.controller.update(calm(),h.root);
 assert.equal(h.calls.length,0);h.controller.dispose();
 const changedWithoutEvent=harness();changedWithoutEvent.controller.update(active(),changedWithoutEvent.root);
 changedWithoutEvent.media.matches=true;changedWithoutEvent.controller.update(calm(),changedWithoutEvent.root);
 assert.equal(changedWithoutEvent.calls.length,0);changedWithoutEvent.controller.dispose();
});

test('route effects are opt-in and protect Connect and Read in both directions',()=>{
 for(const routeTransitions of [false,true]){
  const h=harness({routeTransitions});h.controller.update(active(),h.root);
  h.controller.update(active({route:'groups'}),h.root);
  assert.equal(h.calls.length,routeTransitions?1:0);
  if(routeTransitions)assert.equal(h.calls[0].node.className,'greeting','Only the route heading enters');
  const count=h.calls.length;
  for(const route of ['connect','today','read','team','read','connect','groups'])
   h.controller.update(active({route}),h.root);
  assert.equal(h.calls.length,count);
  h.controller.dispose();
 }
});

test('same-route Groups/Team feedback needs changed canonical commitments and a current successful save',()=>{
 for(const [route,target] of [['groups','group-response'],['team','team-availability']]){
  const before=calm({route,commitmentSignature:'["going","confirmed",false]',receipt:''});
  const after=calm({route,commitmentSignature:'["maybe","declined",true]',receipt:{ok:true,message:'Current response saved.'}});
  assert.deepEqual(Motion.classify(before,after),{kind:'commitments',primary:false,stack:false});
  assert.equal(Motion.classify(before,{...after,receipt:''}).kind,'none');
  assert.equal(Motion.classify(before,{...after,receipt:{ok:false,message:'No change.'}}).kind,'none');
  assert.equal(Motion.classify(before,{...after,commitmentSignature:before.commitmentSignature}).kind,'none');
  assert.equal(Motion.classify({...before,commitmentSignature:undefined},after).kind,'none');
  assert.equal(Motion.classify(before,{...after,available:false,calm:false}).kind,'none');
  assert.equal(Motion.classify(before,{...after,owner:'visitor'}).kind,'none');
  const h=harness(),html=h.root.outerHTML;
  h.controller.update(before,h.root);h.controller.update(after,h.root);
  assert.equal(h.calls.length,2);assert.equal(h.calls[0].node.className,target);assert.equal(h.calls[1].node.className,'group-feedback');
  assert.equal(h.root.outerHTML,html);
  h.controller.update(after,h.root);assert.equal(h.calls.length,2);
  h.controller.dispose();
 }
 const before=calm({commitmentSignature:'["going","confirmed",false]',receipt:''});
 assert.equal(Motion.classify(before,{...before,commitmentSignature:'["maybe","confirmed",false]',receipt:{ok:true,message:'Saved.'}}).kind,'none','Already calm Today never celebrates a changed response');
});

test('finished effects release ownership and cancelled finished promises are observed',async()=>{
 const h=harness();h.controller.update(active(),h.root);h.controller.update(calm(),h.root);
 for(const call of h.calls)call.effect.onfinish();
 h.controller.dispose();assert.ok(h.calls.every(call=>!call.effect.cancelled));
 const pending=harness(),effects=[];
 for(const node of pending.root.querySelectorAll('*'))node.animate=()=>{
  let reject;
  const effect={finished:new Promise((_resolve,no)=>{reject=no;}),cancel(){reject(Error('Cancelled animation'));this.oncancel?.();}};
  effects.push(effect);return effect;
 };
 pending.controller.update(active(),pending.root);pending.controller.update(calm(),pending.root);
 pending.controller.dispose();
 await Promise.resolve();
 assert.equal(effects.length,2);
});

test('animation feature failures cannot block a draw; explicit cancellation restores every owned effect',()=>{
 const h=harness();h.root.querySelector('.settled').animate=()=>{throw Error('Not supported');};
 h.controller.update(active(),h.root);assert.doesNotThrow(()=>h.controller.update(calm(),h.root));
 assert.equal(h.calls.length,1);h.controller.cancel();assert.equal(h.calls[0].effect.cancelled,true);
 h.controller.dispose();h.controller.dispose();
 const controller=Motion.create({matchMedia(){throw Error('Unavailable preference');}});
 assert.doesNotThrow(()=>{controller.update(active(),h.root);controller.update(calm(),h.root);controller.dispose();});
 assert.equal(h.calls.length,1,'An unreadable preference disables effects');
});

test('browser UMD and pure classifier have no document, network, storage, timers or domain dependency',()=>{
 const source=fs.readFileSync(require.resolve('../foundation2/motion.js'),'utf8'),sandbox={};
 for(const name of ['document','localStorage','sessionStorage','fetch','XMLHttpRequest','setTimeout','requestAnimationFrame','FoundationMemberSession','FoundationToday'])
  Object.defineProperty(sandbox,name,{get(){throw Error('Unexpected dependency: '+name);}});
 vm.runInNewContext(source,sandbox);
 assert.equal(sandbox.FoundationMotion.classify(active(),calm()).kind,'completion');
 const controller=sandbox.FoundationMotion.create({matchMedia:()=>({matches:true})});
 const before=active(),after=calm(),bytes=JSON.stringify([before,after]);
 controller.update(before,null);controller.update(after,null);controller.dispose();
 assert.equal(JSON.stringify([before,after]),bytes);
});
