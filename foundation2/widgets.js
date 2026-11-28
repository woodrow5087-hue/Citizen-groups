/* Shared presentation primitives. No member context, decisions, IO or state.
 * Route/action owners remain responsible for navigation and authorization. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FoundationWidgets=api;
})(globalThis,function(){
 'use strict';
 const destinations=Object.freeze(['today','groups','team','read','connect']);
 const paths=Object.freeze({
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chat:'<path d="M6 4h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-5 3v-3a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><circle cx="8.5" cy="11" r=".85" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r=".85" fill="currentColor" stroke="none"/><circle cx="15.5" cy="11" r=".85" fill="currentColor" stroke="none"/>',
  book:'<path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m0-16a3 3 0 0 1 0 6m3 3a5 5 0 0 1 3 4v3"/>',
  check:'<path d="m4 12 5 5L20 6"/>'
 });
 function esc(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 }
 function icon(name){
  if(!Object.hasOwn(paths,name))throw new TypeError('Unknown presentation icon');
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
 }
 function heading(title,detail=''){
  return '<div class="section-heading"><h2>'+esc(title)+'</h2><span>'+esc(detail)+'</span></div>';
 }
 function linkDestination(href){
  if(typeof href!=='string'||/[\u0000-\u0020\u007f\\]/.test(href)||!(/^(?:\?|\.\/(?:\?|#|$))/.test(href)))
   throw new TypeError('Utility links must remain within Foundation');
  const query=href.startsWith('?')?href.slice(1):href.startsWith('./?')?href.slice(3):'';
  const params=new URLSearchParams(query.split('#',1)[0]);
  const route=params.get('screen')||'today';
  if(params.getAll('screen').length>1||!destinations.includes(route))throw new TypeError('Unknown utility destination');
  return route;
 }
 function utility({title,detail='',icon:iconName='chat',href,route,focusId,status=false}={}){
  const destination=href===undefined||href===null?null:linkDestination(href);
  if(route!==undefined&&(!destinations.includes(route)||(destination!==null&&destination!==route)))throw new TypeError('Utility route must match its destination');
  const linked=destination!==null&&!status;
  const attributes=linked?' href="'+esc(href)+'"'+(route?' data-route="'+esc(route)+'"':'')+(focusId?' data-return-focus="'+esc(focusId)+'"':''):'';
  return '<'+(linked?'a':'aside')+' class="utility'+(linked?' utility-link':'')+'"'+attributes+(!linked?' role="status"':'')+'>'+
   '<span class="utility-icon">'+icon(iconName)+'</span><div><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small></div>'+
   (linked?icon('arrow'):'')+'</'+(linked?'a':'aside')+'>';
 }
 return Object.freeze({esc,icon,heading,utility});
});
