/* Trusted same-origin reuse of the accepted premium Connect entry. The original
 * HTML/controllers remain immutable. This host owns only frame lifecycle/return
 * navigation; application and conversation adapters own every persisted field. */
(function(root){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function view(search){const p=new URLSearchParams(search);return p.get('thread')==='group'?{screen:'thread',person:''}:p.get('channel')==='room'?{screen:'room',person:''}:['Jess','Anna','Alex Morgan'].includes(p.get('person'))?{screen:'direct',person:p.get('person')}:{screen:'inbox',person:''};}
function href(screen,person){return '?screen=connect'+(screen==='thread'?'&thread=group':screen==='room'?'&channel=room':screen==='direct'?'&person='+encodeURIComponent(person):'');}
function render(returnRoute){return '<section class="premium-connect-page" aria-labelledby="route-title"><h1 id="route-title" class="connect-sr-only" tabindex="-1">Stay connected.</h1><div class="connect-toolbar"><button type="button" class="connect-return">‹ Back to '+esc(FoundationNavigation.names[returnRoute]||'Today')+'</button><p>Fictional conversations · Only on this device. No external delivery.</p></div><p class="connect-host-notice" role="status"></p><div id="premium-connect-mount"><p role="status">Opening Connect…</p></div></section>';}
function mount({container,host,storage,key,search,onScreen,onReturn}){
 const frame=document.createElement('iframe');frame.id='premium-connect';frame.title='Connect inbox and conversations';
 const controller=new AbortController();let disposed=false,restoring=false,loaded=false;
 let desired=view(search);const notice=document.querySelector('.connect-host-notice');
 const report=message=>{if(notice){notice.textContent=message;notice.setAttribute('role',message?'alert':'status');}};
 frame.connectMember={...host,...desired,storage,report,screenChanged(screen,person){if(!restoring&&!disposed)onScreen(screen,person);}};
 // Small viewport units stay fixed as Safari's address bar moves. This hidden
 // layout ruler is not a scroll area and never participates in focus or state.
 const ruler=document.createElement('div');ruler.setAttribute('aria-hidden','true');
 ruler.style.cssText='position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
 container.replaceChildren(frame,ruler);
 const back=document.querySelector('.connect-return');back.onclick=onReturn;
 const fit=()=>{
  if(disposed)return;
  const viewport=window.visualViewport;
  // Document coordinates are invariant under page scroll/pan. Using the
  // viewport-relative top here fed parent scrolling back into iframe height.
  const top=frame.getBoundingClientRect().top+window.scrollY;
  const stableHeight=ruler.getBoundingClientRect().height||window.innerHeight;
  // The visual viewport still shrinks for the software keyboard. Its offset
  // is a pan, not extra height; do not turn keyboard panning into a resize.
  const bottom=Math.min(stableHeight,viewport?viewport.height:window.innerHeight);
  const nav=document.getElementById('primary-nav').getBoundingClientRect().height;
  // Keep a readable inner message viewport below the accepted fixed chat chrome.
  // Short screens/larger text can scroll the parent; never collapse messages.
  const fontSize=parseFloat(getComputedStyle(document.documentElement).fontSize)||16;
  const height=Math.max(360*Math.max(1,fontSize/16),Math.floor(bottom-top-nav-14))+'px';
  if(frame.style.height!==height)frame.style.height=height;
  try{if(loaded)frame.contentDocument.documentElement.style.fontSize=getComputedStyle(document.documentElement).fontSize;}catch(_){/* disposed frame */}
 };
 const observer=new ResizeObserver(fit);observer.observe(document.querySelector('.connect-toolbar'));observer.observe(document.getElementById('primary-nav'));if(notice)observer.observe(notice);
 const mutation=new MutationObserver(fit);mutation.observe(document.documentElement,{attributes:true,attributeFilter:['style','class']});
 window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
 frame.addEventListener('load',()=>{loaded=!!frame.contentWindow.FoundationConnectFrame;fit();if(loaded){restoring=true;try{frame.contentWindow.FoundationConnectFrame.navigate(desired);}finally{restoring=false;}}});
 const base=new URL('../',window.location.href).href;
 fetch(new URL('connect-design-lab.html',base),{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Connect entry unavailable');return r.text();}).then(html=>{
  if(disposed)return;
  const marker='<script src="connect-design-lab.js" defer></script>';
  if(html.split(marker).length!==2||html.split('<head>').length!==2)throw Error('Unsupported Connect entry');
  // Isolate the accepted controller's storage dependency before deferred scripts
  // execute. This is a narrow port, not access to the original app's records.
  const port='<base href="'+esc(base)+'"><script>Object.defineProperty(window,"localStorage",{value:window.frameElement.connectMember.storage});<\/script>';
  frame.srcdoc=html.replace('<head>','<head>'+port).replace(marker,'<script src="foundation2/connect-frame.js" defer></script>'+marker);
 }).catch(error=>{if(!disposed){frame.remove();report('Connect could not open. Saved conversations are preserved. Return and try again.');}});
 fit();
 return {key,frame,restore(nextSearch){desired=view(nextSearch);Object.assign(frame.connectMember,desired);if(!loaded)return;restoring=true;try{frame.contentWindow.FoundationConnectFrame?.navigate(desired);}finally{restoring=false;}},dispose(){disposed=true;controller.abort();observer.disconnect();mutation.disconnect();window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);frame.remove();ruler.remove();}};
}
root.FoundationConnectPresentation=Object.freeze({view,href,render,mount});
})(globalThis);
