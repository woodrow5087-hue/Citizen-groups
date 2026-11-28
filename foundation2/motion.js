/* Ephemeral presentation only. Existing projections and successful saves own
 * every fact below; motion never writes state, announces status or moves focus.
 * capture(root) may remember one draw's keyed geometry before replacement;
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
  let previous=null,captured=null,disposed=false,media=null;
  const active=new Set();
  const query=options.matchMedia===undefined?
   (typeof globalThis.matchMedia==='function'?globalThis.matchMedia.bind(globalThis):null):options.matchMedia;
  let mediaFailed=false;
  if(typeof query==='function')try{media=query('(prefers-reduced-motion: reduce)');}catch(_){mediaFailed=true;}
  function cancel(){
   captured=null;
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
  function viewport(root){
   try{
    const view=root?.ownerDocument?.defaultView;
    if(!view||![view.innerWidth,view.innerHeight,view.scrollX,view.scrollY].every(Number.isFinite)||view.innerWidth<=0||view.innerHeight<=0)return null;
    return {width:view.innerWidth,height:view.innerHeight,x:view.scrollX,y:view.scrollY};
   }catch(_){return null;}
  }
  function rect(node){
   try{
    const value=node?.getBoundingClientRect?.();
    if(!value||![value.left,value.top,value.width,value.height].every(Number.isFinite)||value.width<=0||value.height<=0||
     [value.left,value.top,value.width,value.height].some(number=>Math.abs(number)>1000000))return null;
    return freeze({left:value.left,top:value.top,right:value.left+value.width,bottom:value.top+value.height,width:value.width,height:value.height});
   }catch(_){return null;}
  }
  function visible(value,view){return !!(value&&view&&value.right>0&&value.left<view.width&&value.bottom>0&&value.top<view.height);}
  function domain(root,count){
   try{
    const node=find(root,'.sig-priority-domain[data-stack-size]');
    return node?.getAttribute('data-stack-size')===String(count)?node:null;
   }catch(_){return null;}
  }
  function capture(root){
   captured=null;
   if(disposed||reduced()||!previous||previous.route!=='today'||!previous.available||!previous.taskIds.length)return;
   try{
    const view=viewport(root),stack=rect(domain(root,previous.taskIds.length));
    if(!visible(stack,view)||typeof root?.querySelectorAll!=='function')return;
    const tasks=new Map();
    for(const node of root.querySelectorAll('.priority[data-motion-task],.responsibility[data-motion-task]')){
     const id=node.getAttribute('data-motion-task');
     if(!previous.taskIds.includes(id)||tasks.has(id))return;
     const bounds=rect(node);
     if(!bounds)return;
     tasks.set(id,bounds);
    }
    if(tasks.size!==previous.taskIds.length)return;
    captured={snapshot:previous,view,stack,tasks};
   }catch(_){/* Missing presentation geometry cannot interfere with a draw. */}
  }
  function currentGeometry(before,geometry,root,next){
   if(!geometry||geometry.snapshot!==before||next?.route!=='today')return null;
   const view=viewport(root);
   if(!view||Object.keys(view).some(key=>view[key]!==geometry.view[key]))return null;
   const stack=rect(domain(root,next.taskIds.length));
   if(!visible(stack,view))return null;
   const primary=find(root,'.priority[data-motion-task]');
   if(primary?.getAttribute('data-motion-task')!==next.primaryId||!visible(rect(primary),view))return null;
   return {...geometry,current:stack};
  }
  function displacement(from,to,limit){return Math.max(-limit,Math.min(limit,from-to));}
  function promotion(geometry,next,root){
   if(!geometry)return null;
   const node=find(root,'.priority[data-motion-task]');
   if(node?.getAttribute('data-motion-task')!==next.primaryId)return null;
   const from=geometry.tasks.get(next.primaryId),to=rect(node);
   if(!from||!visible(to,geometry.view))return null;
   return {node,frames:[{transform:'translate('+displacement(from.left,to.left,24)+'px, '+displacement(from.top,to.top,24)+'px)',opacity:.92},
    {transform:'translate(0px, 0px)',opacity:1}]};
  }
  function layerReflow(geometry,root){
   if(!geometry)return null;
   const node=find(root,'.sig-priority-domain .sig-stack-layer--middle');
   return node?{node,frames:[{transform:'translateY('+displacement(geometry.stack.bottom,geometry.current.bottom,12)+'px)',opacity:.68},
    {transform:'translateY(0px)',opacity:1}]}:null;
  }
  function update(value,root){
   if(disposed)return none;
   const before=previous,geometry=captured,next=snapshot(value),change=classifySnapshots(before,next);
   previous=next;
   cancel();
   if(reduced()||!root)return change;
   const measured=change.kind==='commitments'?currentGeometry(before,geometry,root,next):null;
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
     if(change.primary){
      const moved=promotion(measured,next,root);
      if(moved)animate(moved.node,moved.frames,200);
      else animate(find(root,'.priority'),[
       {transform:'translateY(5px)',opacity:.92},{transform:'translateY(0)',opacity:1}
      ],180);
     }
     if(change.stack){
      const layer=layerReflow(measured,root);
      if(layer)animate(layer.node,layer.frames,200);
      else animate(find(root,'.responsibilities'),[
       {transform:'translateY(4px)',opacity:.94},{transform:'translateY(0)',opacity:1}
      ],180);
     }
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
  return freeze({capture,update,cancel,dispose});
 }
 return freeze({classify,create});
});
