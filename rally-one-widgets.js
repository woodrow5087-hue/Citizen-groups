/* UX-02 presentation only. Decorates already-authorized, already-ranked content.
 * No data fetching, storage, decisions, new actions or event interception.
 */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RallyWidgets=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const components=Object.freeze({
 header:'.f09-greeting,.gv2-heading,.team-v08-hero',
 priority:'.f09b-hero,.gv2-group-hero,.team-schedule-card',
 card:'.f09b-row,.f09b-glance,.f10-entry,.gv2-widget,.gv2-care,.r1-care-flow,.team-huddle,.team-message-preview',
 status:'.f09b-status,.pill,.team-response-caption',
 people:'.gv2-today-people,.gv2-rail,.team-v08-hero-row',
 action:'.f09b-primary,.f09b-row-cta,.btn,.gv2-widget-cta,.gv2-hero-action'
});
const iconPaths=Object.freeze({message:'M4 5h16v11H9l-5 4V5z',calendar:'M5 5h14v15H5zM8 3v4m8-4v4M5 10h14',heart:'M12 20 4 12C-1 4 8 1 12 7c4-6 13-3 8 5z',arrow:'m9 5 7 7-7 7'});
function icon(doc,name){const el=doc.createElementNS('http://www.w3.org/2000/svg','svg');el.setAttribute('viewBox','0 0 24 24');el.setAttribute('class','rw-icon');el.setAttribute('aria-hidden','true');el.setAttribute('focusable','false');const p=doc.createElementNS(el.namespaceURI,'path');p.setAttribute('d',iconPaths[name]);el.append(p);return el;}
function apply(view){
 const surface=view.querySelector('.f09-board,.gv2-home')||[...view.querySelectorAll('.team-screen-v08')].find(el=>el.querySelector('.team-schedule-card'));if(!surface)return null;
 const kind=surface.matches('.f09-board')?'today':surface.matches('.gv2-home')?'groups':'team';
 surface.classList.add('rw-root');surface.dataset.widgetSurface=kind;
 for(const [name,selector] of Object.entries(components))surface.querySelectorAll(selector).forEach(el=>el.classList.add('rw-'+name));
 surface.querySelectorAll('.rw-header h1 br').forEach(br=>br.replaceWith(view.ownerDocument.createTextNode(' ')));
 if(kind==='groups')for(const [selector,name]of [['.gv2-widget-chat .gv2-widget-icon','message'],['.gv2-widget-gather .gv2-widget-icon','calendar'],['.gv2-care-icon','heart'],['.gv2-widget-cta i,.gv2-hero-action b,.gv2-care>b','arrow']])surface.querySelectorAll(selector).forEach(el=>el.replaceChildren(icon(view.ownerDocument,name)));
 if(kind==='today'){
  const hero=surface.querySelector('[data-priority]');
  surface.dataset.widgetState=hero?.dataset.priority||'unknown';
  surface.dataset.widgetAudience=surface.dataset.audience||'unknown';
  // DOM order and visual order agree; retain the very same button/listeners.
  const priorities=surface.querySelector('.f09b-priorities'),ask=surface.querySelector('.f10-entry');if(priorities&&ask)priorities.after(ask);
  if(surface.dataset.widgetState==='caught-up'){
   const symbol=hero.querySelector('.f09b-hero-symbol');if(symbol){symbol.textContent='✓';symbol.setAttribute('aria-hidden','true');}
  }
 }
 return kind;
}
return Object.freeze({components,apply});
});
