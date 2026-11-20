// Preserved Citizen Connect archive: Rally Point now owns index.html.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {JSDOM}=require('jsdom');
const html=readFileSync(join(__dirname,'..','premium-hybrid-archive.html'),'utf8');
const introSource=html.match(/<script id="intro-bootstrap">([\s\S]*?)<\/script>/)[1];
const key='citizen-connect-intro-seen-v1';
function open(t,{seen,reduced=false,blocked=false}={}){
 const dom=new JSDOM(html,{url:'https://preview.test',runScripts:'outside-only'});t.after(()=>dom.window.close());
 const w=dom.window,d=w.document,timers=new Map();let next=0;
 w.matchMedia=()=>({matches:reduced});
 w.setTimeout=(fn,delay)=>{timers.set(++next,{fn,delay});return next;};w.clearTimeout=id=>timers.delete(id);
 if(seen)w.sessionStorage.setItem(key,'1');
 if(blocked)Object.defineProperty(w,'sessionStorage',{get(){throw new Error('Storage blocked');}});
 const data='{"day":"2026-11-19","done":{"read":true},"reflection":"Existing saved reflection"}';
 w.localStorage.setItem('citizen-premium-hybrid-demo-v1',data);
 const previousTheme=d.querySelector('meta[name="theme-color"]').content;
 w.eval(introSource);d.dispatchEvent(new w.Event('DOMContentLoaded'));
 const fire=delay=>{const entry=[...timers].find(([,v])=>v.delay===delay);assert.ok(entry,'timer '+delay);timers.delete(entry[0]);entry[1].fn();};
 return {w,d,fire,timers,data,previousTheme,intro:d.getElementById('app-intro'),screen:d.querySelector('.phone-screen')};
}
test('intro automatically reveals the app once and preserves saved activity',t=>{
 const ui=open(t);assert.equal(ui.d.documentElement.dataset.intro,'show');assert.equal(ui.screen.inert,true);
 assert.equal(ui.d.querySelector('meta[name="theme-color"]').content,'#e6002f');
 ui.fire(1000);assert.equal(ui.d.documentElement.dataset.intro,'leaving');assert.equal(ui.screen.inert,false);
 ui.fire(200);assert.equal(ui.intro.hidden,true);assert.equal(ui.d.documentElement.dataset.intro,undefined);
 assert.equal(ui.w.sessionStorage.getItem(key),'1');assert.equal(ui.w.localStorage.getItem('citizen-premium-hybrid-demo-v1'),ui.data);
 assert.equal(ui.d.querySelector('meta[name="theme-color"]').content,ui.previousTheme);
});
test('tap skips immediately, cancels the auto timer and does not replay on reload',t=>{
 const ui=open(t);ui.intro.click();assert.equal(ui.screen.inert,false);assert.equal(ui.d.activeElement.id,'app-content');
 assert.equal([...ui.timers.values()].some(v=>v.delay===1000),false);ui.fire(200);
 const reload=open(t,{seen:true});assert.equal(reload.d.documentElement.dataset.intro,undefined);assert.equal(reload.timers.size,0);
 assert.equal(reload.w.localStorage.getItem('citizen-premium-hybrid-demo-v1'),reload.data);
});
test('keyboard skip respects reduced motion with no fade delay',t=>{
 const ui=open(t,{reduced:true});ui.intro.focus();
 ui.d.dispatchEvent(new ui.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
 assert.equal(ui.intro.hidden,true);assert.equal(ui.d.documentElement.dataset.intro,undefined);assert.equal(ui.d.activeElement.id,'app-content');assert.equal(ui.timers.size,0);
});
test('intro remains dismissible if session storage is blocked',t=>{
 const ui=open(t,{blocked:true,reduced:true});assert.equal(ui.d.documentElement.dataset.intro,'show');ui.intro.click();
 assert.equal(ui.intro.hidden,true);assert.equal(ui.screen.inert,false);assert.equal(ui.w.localStorage.getItem('citizen-premium-hybrid-demo-v1'),ui.data);
});
