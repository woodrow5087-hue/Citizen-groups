/* Foundation 2 — route table and read-only destination presentations.
 * The router owns URL state; the app controller owns keyboard/focus/history.
 * No direct source mutation, private content fabrication, or legacy DOM reuse.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationNavigation=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const names=Object.freeze({today:'Today',groups:'Groups',team:'Team',read:'Read',connect:'Connect'});
const tabs=Object.freeze(['today','groups','team','read']);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons=Object.freeze({
 today:'<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-7h6v7"/>',
 groups:'<circle cx="9" cy="8" r="3"/><circle cx="18" cy="9" r="2"/><path d="M2 21v-2a7 7 0 0 1 14 0v2m1-7c3 0 5 2 5 5v2"/>',
 team:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 read:'<path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/>',
 connect:'<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H9l-4.5 2 1.1-4.5A7.5 7.5 0 0 1 4 11.5V10a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7Z"/>'
});
const glyph=id=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+icons[id]+'</svg>';
function resolve(search){
 const params=new URLSearchParams(search||'');
 const key=params.get('screen')||'today';
 return Object.hasOwn(names,key)?key:'today';
}
function href(route){return route==='today'?'./':'?screen='+encodeURIComponent(route);}
function renderTabs(active){
 return tabs.map(id=>'<a href="'+href(id)+'" data-route="'+id+'"'+(active===id?' aria-current="page"':'')+'>'+glyph(id)+'<span>'+names[id]+'</span></a>').join('');
}
function summary(route,snapshot){
 if(route==='groups'||route==='team')throw new TypeError(route+' has a dedicated Gate 5 presentation owner');
 if(route==='read')throw new TypeError('Read has a dedicated Gate 6 presentation owner');
 if(route!=='connect')throw new TypeError('Unknown preview destination');
 const ctx=snapshot.context,model=snapshot.model;
 return {title:'Stay connected.',eyebrow:'CONNECT · PREVIEW',
  detail:ctx.permissions.group?'Wednesday Group conversation':'No group conversation is available for this scenario',
  status:ctx.group.status==='unavailable'?'Sample conversation unavailable':'Messaging is now integrated in Gate 4'};
}
function renderRoute(route,snapshot){
 if(route==='today'||route==='groups'||route==='team'||route==='connect'||route==='read')throw new TypeError(route+' has a dedicated presentation owner');
 const s=summary(route,snapshot);
 return '<section class="route-preview" aria-labelledby="route-title">'+
  '<span class="eyebrow">'+esc(s.eyebrow)+'</span><h1 id="route-title" tabindex="-1">'+esc(s.title)+'</h1>'+
  '<p class="route-lead">'+esc(s.detail)+'</p>'+
  '<div class="route-preview-card"><span class="route-stage-label">FOUNDATION 2 · NOT YET MIGRATED</span>'+
  '<p>'+esc(s.status)+'</p><p>These details are read-only projections from the existing synthetic member context. No new messages, attendance or membership changes occur here.</p>'+
  '<a href="../index.html" class="route-full-app">Open this feature in the existing full demo <span aria-hidden="true">↗</span></a></div>'+
  '</section>';
}
return Object.freeze({names,tabs,resolve,href,renderTabs,renderRoute,summary});
});