/* Ephemeral presentation only. Existing projections and successful saves own
 * every fact below; motion never writes state, announces status or moves focus.
 * update(snapshot, root) follows the real draw. The caller supplies a receipt
 * only for that draw's successful save and available:false for unknown,
 * deferred, visitor or read-only sources. commitmentSignature is an optional
 * string projection of canonical response fields, never another state owner. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FoundationMotion=api;
})(globalThis,function(){
 'use strict';
 const freeze=Object.freeze;
 const none=freeze({kind:'none',primary:false,stack:false});
 const routes=freeze(['today','groups','team','read','connect']);
 const protectedRoutes=freeze(['read','connect']);
 const receipts=freeze([
  'Sample RSVP saved on this device.',
  'Sample serving response saved on this device.',
  'Sample leader review saved on this device.'
 ]);
 function successfulReceipt(value){
  return typeof value==='string'?receipts.includes(value):
   !!(value&&value.ok===true&&typeof value.message==='string'&&value.message.trim());
 }
 function snapshot(value){
  if(!value||!routes.includes(value.route)||typeof value.owner!=='string'||!value.owner.trim()||
   !Array.isArray(value.taskIds)||value.taskIds.some(id=>typeof id!=='string'||!id.trim())||
   new Set(value.taskIds).size!==value.taskIds.length)return null;
  const primaryId=value.primaryId==null?null:value.primaryId;
  if(primaryId!==null&&(typeof primaryId!=='string'||!value.taskIds.includes(primaryId)))return null;
  if(value.route==='today'&&value.taskIds.length&&primaryId===null)return null;
  if(value.commitmentSignature!==undefined&&
   (typeof value.commitmentSignature!=='string'||!value.commitmentSignature.trim()))return null;
  // Calm without a known source or with a remaining commitment is never a
  // completion. Reject that contradiction instead of repairing the projection.
  if(value.calm===true&&(value.available!==true||value.taskIds.length||primaryId!==null))return null;
  return freeze({route:value.route,owner:value.owner,primaryId,taskIds:freeze(value.taskIds.slice()),
   calm:value.calm===true,available:value.available===true,receipt:successfulReceipt(value.receipt),
   commitmentSignature:value.commitmentSignature??null});
 }
 function classifySnapshots(before,after){
  if(!before||!after||before.owner!==after.owner)return none;
  if(before.route!==after.route){
   return protectedRoutes.includes(before.route)||protectedRoutes.includes(after.route)?none:
    freeze({kind:'route',primary:false,stack:false});
  }
  if(protectedRoutes.includes(after.route)||!before.available||!after.available||!after.receipt)return none;
  const signature=before.commitmentSignature!==null&&after.commitmentSignature!==null&&
   before.commitmentSignature!==after.commitmentSignature;
  if(after.route!=='today')return signature?freeze({kind:'commitments',primary:false,stack:false}):none;
  const primary=before.primaryId!==after.primaryId;
  const stack=before.taskIds.length!==after.taskIds.length||before.taskIds.some(id=>!after.taskIds.includes(id));
  if(!primary&&!stack)return none;
  if(before.taskIds.length&&!before.calm&&after.taskIds.length===0&&after.calm&&after.receipt)
   return freeze({kind:'completion',primary:false,stack:false});
  // An empty, deferred or unavailable result cannot receive the visual finish
  // reserved for a real response. A remaining commitment may quietly move up.
  if(after.taskIds.length&&after.primaryId!==null)
   return freeze({kind:'commitments',primary,stack});
  return none;
 }
 function classify(before,after){return classifySnapshots(snapshot(before),snapshot(after));}
 function create(options={}){
  let previous=null,disposed=false,media=null;
  const active=new Set();
  const query=options.matchMedia===undefined?
   (typeof globalThis.matchMedia==='function'?globalThis.matchMedia.bind(globalThis):null):options.matchMedia;
  let mediaFailed=false;
  if(typeof query==='function')try{media=query('(prefers-reduced-motion: reduce)');}catch(_){mediaFailed=true;}
  function cancel(){
   for(const animation of active)try{animation.cancel();}catch(_){/* A detached effect has no presentation to restore. */}
   active.clear();
  }
  function reduced(){return mediaFailed||!!media?.matches;}
  function preferenceChanged(){if(reduced())cancel();}
  if(media?.addEventListener)media.addEventListener('change',preferenceChanged);
  else if(media?.addListener)media.addListener(preferenceChanged);
  function animate(node,frames,duration){
   if(!node||typeof node.animate!=='function')return;
   try{
    const animation=node.animate(frames,{duration,easing:'cubic-bezier(.2,.7,.2,1)',iterations:1,fill:'none'});
    if(!animation||typeof animation.cancel!=='function')return;
    active.add(animation);
    const done=()=>active.delete(animation);
    animation.onfinish=done;
    animation.oncancel=done;
    // Cancelled Web Animations reject this promise. Observe both outcomes so
    // replacing a draw cannot produce an unhandled rejection.
    if(animation.finished?.then)animation.finished.then(done,done);
   }catch(_){/* Animation support must never interfere with the actual draw. */}
  }
  function find(root,selector){return typeof root?.querySelector==='function'?root.querySelector(selector):null;}
  function update(value,root){
   if(disposed)return none;
   const next=snapshot(value),change=classifySnapshots(previous,next);
   previous=next;
   cancel();
   if(reduced()||!root)return change;
   if(change.kind==='completion'){
    animate(find(root,'.settled:not(.welcome-card)'),[
     {transform:'translateY(3px)',opacity:.92},{transform:'translateY(0)',opacity:1}
    ],180);
    animate(find(root,'.greeting h1'),[
     {transform:'translateY(2px)',opacity:.88},{transform:'translateY(0)',opacity:1}
    ],180);
   }else if(change.kind==='commitments'){
    if(next.route!=='today'){
     animate(find(root,next.route==='groups'?'.group-response':'.team-availability'),[
      {transform:'translateY(3px)',opacity:.92},{transform:'translateY(0)',opacity:1}
     ],180);
     animate(find(root,'.group-feedback'),[{opacity:.82},{opacity:1}],180);
    }else{
     if(change.primary)animate(find(root,'.priority'),[
     {transform:'translateY(5px)',opacity:.92},{transform:'translateY(0)',opacity:1}
     ],180);
     if(change.stack)animate(find(root,'.responsibilities'),[
     {transform:'translateY(4px)',opacity:.94},{transform:'translateY(0)',opacity:1}
     ],180);
    }
   }else if(change.kind==='route'&&options.routeTransitions===true){
    animate(find(root,'#route-title, .greeting'),[
     {transform:'translateY(4px)',opacity:.96},{transform:'translateY(0)',opacity:1}
    ],180);
   }
   return change;
  }
  function dispose(){
   if(disposed)return;
   cancel();previous=null;disposed=true;
   if(media?.removeEventListener)media.removeEventListener('change',preferenceChanged);
   else if(media?.removeListener)media.removeListener(preferenceChanged);
  }
  return freeze({update,cancel,dispose});
 }
 return freeze({classify,create});
});
