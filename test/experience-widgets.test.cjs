'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),vm=require('node:vm');
const Widgets=require('../foundation2/widgets.js');
const fragment=html=>JSDOM.fragment(html);

test('widget heading and utility content stay text, including attribute boundaries',()=>{
 const value='<img src=x onerror="bad()"> & \'quoted\'';
 const heading=fragment(Widgets.heading(value,value));
 assert.equal(heading.querySelector('h2').textContent,value);
 assert.equal(heading.querySelector('span').textContent,value);
 assert.equal(heading.querySelector('img'),null);
 const utility=fragment(Widgets.utility({title:value,detail:value,href:'?screen=read',route:'read',focusId:'read" onclick="bad()'}));
 assert.equal(utility.querySelector('strong').textContent,value);
 assert.equal(utility.querySelector('small').textContent,value);
 assert.equal(utility.querySelector('a').getAttribute('data-return-focus'),'read" onclick="bad()');
 assert.equal(utility.querySelector('[onclick],img'),null);
});

test('shared outline icons are decorative, nonfocusable and have no label/state responsibility',()=>{
 for(const name of ['arrow','chat','book','people','check']){
  const svg=fragment(Widgets.icon(name)).querySelector('svg');
  assert.equal(svg.getAttribute('aria-hidden'),'true');
  assert.equal(svg.getAttribute('focusable'),'false');
  assert.equal(svg.getAttribute('viewBox'),'0 0 24 24');
  assert.equal(svg.hasAttribute('tabindex'),false);
  assert.equal(svg.querySelector('title'),null);
 }
 assert.throws(()=>Widgets.icon('untrusted'),TypeError);
});

test('valid utility links preserve native navigation and focus contract without adding actions',()=>{
 for(const route of ['today','groups','team','read','connect']){
  const href='?screen='+route;
  const link=fragment(Widgets.utility({title:'Open '+route,detail:'Existing destination',href,route,focusId:'from-'+route})).querySelector('a');
  assert.equal(link.getAttribute('href'),href);
  assert.equal(link.getAttribute('data-route'),route);
  assert.equal(link.getAttribute('data-return-focus'),'from-'+route);
  assert.equal(link.querySelectorAll('svg').length,2);
  assert.equal(link.hasAttribute('role'),false);
  assert.equal(link.querySelector('[data-action],button'),null);
 }
 assert.equal(fragment(Widgets.utility({title:'Read',href:'./?screen=read',route:'read'})).querySelector('a').getAttribute('href'),'./?screen=read');
 assert.equal(fragment(Widgets.utility({title:'Today',href:'./',route:'today'})).querySelector('a').getAttribute('href'),'./');
});

test('unknown, executable, external and conflicting link targets fail closed',()=>{
 for(const href of ['javascript:alert(1)','data:text/html,bad','https://example.com/','//example.com/','./../index.html','./evil','./\\evil',' ?screen=read','?screen=read\n','?screen=unknown','?screen=connect&screen=read'])
  assert.throws(()=>Widgets.utility({title:'No',href}),TypeError,href);
 assert.throws(()=>Widgets.utility({title:'No',href:'?screen=read',route:'connect'}),TypeError);
 assert.throws(()=>Widgets.utility({title:'No',href:'?screen=read',route:'admin'}),TypeError);
});

test('missing/unavailable utility data produces a status region with no invented destination',()=>{
 for(const options of [{title:'Conversation unavailable',detail:'Saved messages cannot be read.',route:'connect'},{title:'Paused',href:'?screen=groups',route:'groups',status:true}]){
  const card=fragment(Widgets.utility(options)).firstElementChild;
  assert.equal(card.tagName,'ASIDE');
  assert.equal(card.getAttribute('role'),'status');
  assert.equal(card.querySelector('a,button,[data-route]'),null);
 }
});

test('browser UMD rendering has no document, network or persistence dependency',()=>{
 const code=fs.readFileSync(require.resolve('../foundation2/widgets.js'),'utf8');
 const sandbox={URLSearchParams};
 for(const name of ['document','localStorage','sessionStorage','fetch','XMLHttpRequest'])
  Object.defineProperty(sandbox,name,{get(){throw Error('Unexpected IO: '+name);}});
 vm.runInNewContext(code,sandbox);
 assert.equal(typeof sandbox.FoundationWidgets.utility,'function');
 assert.match(sandbox.FoundationWidgets.utility({title:'Read',href:'?screen=read',route:'read'}),/data-route="read"/);
 assert.equal(Widgets.esc(null),'');
});
