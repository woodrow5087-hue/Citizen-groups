// Read-only diagnostics. Never run DOM/style reads before the original snapshot.
import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
export function observeSvg(page){
 const events=[],responses=[];
 page.on('response',r=>{if(/\.(css|html|js)(?:\?|$)/.test(r.url()))responses.push(r);});
 page.on('requestfinished',r=>events.push({type:'requestfinished',url:r.url(),at:Date.now()}));
 page.on('requestfailed',r=>events.push({type:'requestfailed',url:r.url(),failure:r.failure()}));
 page.on('console',m=>{if(['error','warning'].includes(m.type()))events.push({type:m.type(),text:m.text()});});
 page.on('domcontentloaded',()=>events.push({type:'domcontentloaded',at:Date.now()}));
 page.on('load',()=>events.push({type:'load',at:Date.now()}));
 return async function save(frame,snapshot,path,metadata){
  const started=Date.now();
  const dom=await frame.locator('body').evaluate(()=>{
   const properties=['color','stroke','stroke-width','fill','opacity','display','visibility','transform','vector-effect','width','height','zoom','font-family','font-size'];
   const selectors=['#search-toggle','#search-toggle svg','#search-toggle use','#compose-toggle','#compose-toggle svg','#compose-toggle use','#i-search','#i-edit','#i-search path','#i-search circle','#i-edit path'];
   const targets=selectors.flatMap(selector=>[...document.querySelectorAll(selector)].map(e=>({selector,e})));
   const style=e=>Object.fromEntries(properties.map(p=>[p,getComputedStyle(e).getPropertyValue(p)]));
   const node=e=>({tag:e.tagName,attributes:Object.fromEntries([...e.attributes].map(a=>[a.name,a.value])),style:style(e),rect:e.getBoundingClientRect().toJSON()});
   const nodes=targets.map(({selector,e})=>{let bbox;try{const b=e.getBBox?.();bbox=b?{x:b.x,y:b.y,width:b.width,height:b.height}:null;}catch(error){bbox={error:String(error)};}return {selector,...node(e),bbox,html:e.outerHTML,ancestors:(()=>{const result=[];for(let a=e.parentElement;a;a=a.parentElement)result.push(node(a));return result;})()};});
   function rules(list,conditions=[]){return [...list].flatMap(rule=>{
    if(rule.selectorText){const matches=targets.filter(({e})=>{try{return e.matches(rule.selectorText);}catch{return false;}}).map(t=>t.selector);return matches.length?[{selector:rule.selectorText,text:rule.cssText,matches,conditions}]:[];}
    if(rule.cssRules){const condition=rule.conditionText||null;return rules(rule.cssRules,[...conditions,{type:rule.constructor.name,condition,mediaMatches:rule.media?matchMedia(rule.media.mediaText).matches:null}]);}
    return [];
   });}
   return {samplePhase:'AFTER original screenshot, BEFORE axe; reads may flush native style/layout',instanceLimit:'SVG use shadow/instance tree is not exposed; symbol styles describe definition nodes, not cloned instance styles',readyState:document.readyState,baseURI:document.baseURI,url:location.href,userAgent:navigator.userAgent,platform:navigator.platform,devicePixelRatio,innerWidth,innerHeight,screen:{width:screen.width,height:screen.height,colorDepth:screen.colorDepth},visualViewport:visualViewport?{width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale,offsetLeft:visualViewport.offsetLeft,offsetTop:visualViewport.offsetTop}:null,reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches,fonts:{status:document.fonts.status,manrope:[400,500,600,700,800].map(w=>({weight:w,loaded:document.fonts.check(w+' 16px Manrope')}))},images:[...document.images].map(i=>({src:i.currentSrc,complete:i.complete,width:i.naturalWidth,height:i.naturalHeight})),htmlAttributes:Object.fromEntries([...document.documentElement.attributes].map(a=>[a.name,a.value])),bodyAttributes:Object.fromEntries([...document.body.attributes].map(a=>[a.name,a.value])),activeElement:document.activeElement?.outerHTML,visibleScreens:[...document.querySelectorAll('.screen:not([hidden])')].map(e=>e.id),nodes,links:[...document.querySelectorAll('link')].map(e=>({html:e.outerHTML,sheet:!!e.sheet})),scripts:[...document.scripts].map(e=>({src:e.src,defer:e.defer,async:e.async,type:e.type})),inlineStyles:[...document.querySelectorAll('style')].map(e=>e.outerHTML),duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,ids)=>ids.indexOf(id)!==i),stylesheets:[...document.styleSheets].map((sheet,index)=>{try{return {index,href:sheet.href,disabled:sheet.disabled,media:sheet.media.mediaText,ruleCount:sheet.cssRules.length,relevantRules:rules(sheet.cssRules)};}catch(error){return {index,href:sheet.href,error:String(error)};}}),resources:performance.getEntriesByType('resource').map(r=>r.toJSON()),navigation:performance.getEntriesByType('navigation').map(r=>r.toJSON())};
  });
  const resources=await Promise.all(responses.map(async r=>{try{const body=await r.body();return {url:r.url(),status:r.status(),headers:await r.allHeaders(),bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')};}catch(error){return {url:r.url(),error:String(error)};}}));
  await writeFile(path,JSON.stringify({metadata,startedAt:started,screenshotSHA256:createHash('sha256').update(snapshot).digest('hex'),events,resources,dom},null,2));
 };
}
