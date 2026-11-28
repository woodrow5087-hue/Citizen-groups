/* Rally Signature S1 — pure, escaped presentation primitives.
 * No context, storage, decisions, navigation or animation engine lives here.
 * stack() accepts only markup already escaped by its owning renderer; every
 * other public function escapes the supplied text/attributes itself.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FoundationSignature=api;
})(globalThis,function(){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paths=Object.freeze({
  arrow:'<path d="m9 5 7 7-7 7"/>',
  calendar:'<path d="M7 3v4m10-4v4M4 10h16M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="m8 15 2 2 5-5"/>',
  check:'<path d="m5 12 4.5 4.5L19 7"/>',
  chat:'<path d="M20 11a8 8 0 0 1-8 8H9l-5 2 1.4-5A8 8 0 1 1 20 11Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M2 21v-2a7 7 0 0 1 14 0v2m1-16a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5v1"/>',
  book:'<path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/>',
  heart:'<path d="m12 20-8-7.7a5.1 5.1 0 0 1 7.2-7.2L12 6l.8-.9a5.1 5.1 0 0 1 7.2 7.2Z"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  spark:'<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>'
 });
 function icon(name){
  if(!Object.hasOwn(paths,name))throw new TypeError('Unknown Signature icon');
  return '<svg class="sig-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
 }
 function classes(value){
  if(typeof value!=='string'||value&& !/^[a-zA-Z][a-zA-Z0-9_-]*(?: [a-zA-Z][a-zA-Z0-9_-]*)*$/.test(value))throw new TypeError('Invalid Signature class name');
  return value?' '+value:'';
 }
 function tone(value){
  if(!['red','ink','paper'].includes(value))throw new TypeError('Unknown Signature tone');
  return value;
 }
 function attributes(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Signature attributes must be an object');
  return Object.entries(input).map(([key,value])=>{
   if(!/^(?:id|title|role|type|name|value|disabled|tabindex|data-[a-z0-9-]+|aria-[a-z0-9-]+)$/.test(key))throw new TypeError('Unsupported Signature attribute');
   if(value===null||value===undefined)return '';
   if(key==='disabled')return value?' disabled':'';
   if(key==='type'&&!['button','submit','reset'].includes(value))throw new TypeError('Unsupported Signature button type');
   if(!['string','number','boolean'].includes(typeof value))throw new TypeError('Signature attributes require scalar values');
   return ' '+key+'="'+esc(value)+'"';
  }).join('');
 }
 function internalHref(value){
  if(typeof value!=='string'||/[\u0000-\u0020\u007f\\]/.test(value)||! /^(?:\?(?!\/)|#[a-zA-Z][\w-]*$|\.\/(?:\?|#|$))/.test(value))throw new TypeError('Signature links must remain relative to Foundation');
  return value;
 }
 function action({label,icon:iconName='arrow',tone:color='red',split=false,href=null,attrs={},className=''}={}){
  const tag=href===null?'button':'a';
  const type=tag==='button'&&!Object.hasOwn(attrs,'type')?' type="button"':'';
  const link=tag==='a'?' href="'+esc(internalHref(href))+'"':'';
  return '<'+tag+type+link+' class="sig-action sig-action--'+tone(color)+(split?' sig-action--split':'')+classes(className)+'"'+attributes(attrs)+'><span class="sig-action-label">'+esc(label)+'</span>'+
   (iconName?'<span class="sig-action-icon">'+icon(iconName)+'</span>':'')+'</'+tag+'>';
 }
 function heading(title,detail=''){
  return '<div class="section-heading sig-section"><h2>'+esc(title)+'</h2>'+(detail?'<span>'+esc(detail)+'</span>':'')+'</div>';
 }
 function stack(trustedMarkup,{className='',tone:color='ink'}={}){
  if(typeof trustedMarkup!=='string')throw new TypeError('Signature stack requires renderer-owned markup');
  return '<div class="sig-stack sig-stack--'+tone(color)+classes(className)+'"><span class="sig-stack-layer sig-stack-layer--back" aria-hidden="true"></span><span class="sig-stack-layer sig-stack-layer--middle" aria-hidden="true"></span><div class="sig-stack-front">'+trustedMarkup+'</div></div>';
 }
 function dateBadge(date,{className=''}={}){
  if(!(date instanceof Date)||!Number.isFinite(date.valueOf()))return '<span class="sig-date sig-date--unknown'+classes(className)+'"><span class="sig-date-number" aria-hidden="true">—</span><span class="sig-date-weekday">Date unavailable</span></span>';
  return '<time class="sig-date'+classes(className)+'" datetime="'+esc(date.toISOString())+'" aria-label="'+esc(date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}))+'"><span class="sig-date-month">'+esc(date.toLocaleDateString('en-US',{month:'short'}))+'</span><span class="sig-date-number">'+esc(date.getDate())+'</span><span class="sig-date-weekday">'+esc(date.toLocaleDateString('en-US',{weekday:'short'}))+'</span></time>';
 }
 function completion({complete=false,title='',detail='',remaining=null}={}){
  if(remaining!==null&&(!Number.isInteger(remaining)||remaining<0))throw new TypeError('Remaining responses must be a known nonnegative integer');
  if(complete===true&&remaining!==null&&remaining!==0)throw new TypeError('Completion contradicts remaining responses');
  return '<div class="sig-completion'+(complete===true?' sig-completion--complete':'')+'"><span class="sig-completion-mark" aria-hidden="true">'+(complete===true?icon('check'):'<span class="sig-completion-count">'+(remaining===null?'—':String(remaining))+'</span>')+'</span><div class="sig-completion-copy"><strong class="sig-serif">'+esc(title)+'</strong>'+(detail?'<p>'+esc(detail)+'</p>':'')+'</div></div>';
 }
 return Object.freeze({icon,heading,action,stack,dateBadge,completion});
});
