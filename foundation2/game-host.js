/* Trusted reuse of the original standalone engines and their storage owners.
 * Only Foundation entry/return and truthful storage feedback are adapted. */
(function(root){
'use strict';
const entries={blank:'blank-battle.html',circuit:'verse-circuit-playground.html'};
function mount(container,kind,onReturn){
 const frame=document.createElement('iframe');frame.id='foundation-game';frame.title=kind==='blank'?'Blank Battle':'Verse Circuit';
 const notice=document.createElement('p');notice.setAttribute('role','status');
 const abort=new AbortController();let disposed=false;
 const report=()=>{notice.textContent='Progress could not be saved. This session remains playable; earlier saved progress is preserved.';};
 // The engine retains its accepted schema/migration rules. The port only
 // forwards native operations and makes caught storage failures visible.
 frame.gamePort={getItem(key){try{return localStorage.getItem(key);}catch(e){report();throw e;}},setItem(key,value){try{localStorage.setItem(key,value);}catch(e){report();throw e;}},removeItem(key){try{localStorage.removeItem(key);}catch(e){report();throw e;}}};
 const back=document.createElement('button');back.textContent='‹ Return to Read';back.onclick=onReturn;
 container.replaceChildren(back,notice,frame);
 const base=new URL('../',location.href).href;
 fetch(new URL(entries[kind],base),{signal:abort.signal}).then(r=>{if(!r.ok)throw Error();return r.text();}).then(html=>{
  if(disposed)return;
  const setup='<base href="'+base+'"><script>Object.defineProperty(window,"localStorage",{value:window.frameElement.gamePort});document.addEventListener("click",function(e){const a=e.target.closest("a.brand,a.bb-brand");if(a&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();window.frameElement.returnToRead();}});<\/script>';
  frame.returnToRead=onReturn;frame.srcdoc=html.replace('<head>','<head>'+setup);
 }).catch(()=>{if(!disposed)notice.textContent='The original game could not open. Saved progress is preserved. Return to Read and try again.';});
 const fit=()=>{frame.style.height=Math.max(600,innerHeight-100)+'px';try{frame.contentDocument.documentElement.style.fontSize=getComputedStyle(document.documentElement).fontSize;}catch{}};
 const observer=new MutationObserver(fit);observer.observe(document.documentElement,{attributes:true,attributeFilter:['style','class']});frame.addEventListener('load',fit);window.addEventListener('resize',fit);fit();
 return {dispose(){disposed=true;abort.abort();observer.disconnect();window.removeEventListener('resize',fit);frame.remove();}};
}
root.FoundationGameHost=Object.freeze({mount});
})(globalThis);
