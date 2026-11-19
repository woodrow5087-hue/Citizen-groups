const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {JSDOM}=require('jsdom');
const root=join(__dirname,'..');
const html=readFileSync(join(root,'index.html'),'utf8');
const files=['model','scripture','data','app'].map(f=>readFileSync(join(root,'experience',f+'.js'),'utf8'));
const key='citizen-premium-hybrid-demo-v1',extraKey='citizen-connect-experience-vnext-v1';
function open(t,saved,extra){
 const dom=new JSDOM(html,{url:'https://preview.test',runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());
 const {window}=dom,doc=window.document;
 const NativeDate=window.Date;window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-11-19T12:00:00']))}};
 window.HTMLElement.prototype.scrollIntoView=function(){};
 if(saved)window.localStorage.setItem(key,JSON.stringify(saved));
 if(extra)window.localStorage.setItem(extraKey,JSON.stringify(extra));
 files.forEach(source=>window.eval(source));
 const click=selector=>{const el=doc.querySelector(selector);assert.ok(el,selector);el.click();};
 const type=(id,value)=>{const el=doc.getElementById(id);assert.ok(el,id);el.value=value;el.dispatchEvent(new window.Event('input',{bubbles:true}));};
 return {doc,window,click,type,nav:id=>click('#nav [data-nav="'+id+'"]'),action:id=>click('[data-action="'+id+'"]'),saved:()=>JSON.parse(window.localStorage.getItem(key)),extra:()=>JSON.parse(window.localStorage.getItem(extraKey)),text:()=>doc.querySelector('#app-content').textContent};
}
module.exports={open,key,extraKey};
