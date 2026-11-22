'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const lab=require('../pilot-journey-lab.js');
const html=fs.readFileSync(path.resolve(__dirname,'../pilot-journey-lab.html'),'utf8');
const source=fs.readFileSync(path.resolve(__dirname,'../pilot-journey-lab.js'),'utf8');
function open(){
 const dom=new JSDOM(html,{url:'https://example.invalid/pilot-journey-lab.html'});
 const doc=dom.window.document;
 const controller=lab.mount(doc);
 assert.ok(controller,'lab mounts');
 return {dom,doc,controller,view:doc.getElementById('member-view'),options:doc.getElementById('scenario-options')};
}
test('Pilot Journey Lab is an isolated fixture-only page without sign-in, API requests or stored state',()=>{
 assert.match(html,/FICTIONAL DATA · NO REAL SIGN-IN OR API/);
 assert.equal(/fetch\s*\(|XMLHttpRequest|localStorage\s*[.(]|sessionStorage\s*[.(]|document\.cookie/.test(source),false);
 const {doc}=open();
 assert.equal(doc.querySelectorAll('form').length,0,'no fake credential form');
 assert.equal(doc.querySelectorAll('a[href^="http"]').length,0,'no outbound links');
 assert.equal(doc.querySelector('.app-bottom').textContent.includes('READ-ONLY PILOT'),true);
});
test('Six permitted view states follow the provider-neutral contract shape and never invent a gathering',()=>{
 const at=new Date('2026-11-22T17:00:00Z');
 assert.deepEqual(lab.scenarioIds,['ready','no-event','revoked','expired','wrong-organization','unavailable']);
 assert.equal(lab.makeSnapshot('ready',at).state,'ready');
 assert.equal(lab.makeSnapshot('ready',at).group.name,'Sample Wednesday Group');
 assert.equal(lab.makeSnapshot('ready',at).source,'Synthetic group connector');
 assert.equal(lab.makeSnapshot('no-event',at).nextGathering,null);
 assert.equal(lab.makeSnapshot('unavailable',at).group,null);
 for(const scenario of ['revoked','expired','wrong-organization']){
  assert.deepEqual(lab.makeSnapshot(scenario,at),
   {state:'restricted',group:null,nextGathering:null,checkedAt:null,source:null});
 }
 assert.throws(()=>lab.makeSnapshot('real-admin'),RangeError);
});
test('Member can open next gathering, see source and exact time, and return to Today',()=>{
 const {doc,controller,view}=open();
 assert.match(view.textContent,/Sample Wednesday Group/);
 const button=view.querySelector('[data-action="open-details"]');
 assert.ok(button,'verified future event exposes an explicit details action');
 button.click();
 assert.equal(controller.isDetails(),true);
 assert.match(view.textContent,/Sample group gathering/);
 assert.match(view.textContent,/Synthetic group connector/);
 assert.match(view.textContent,/read.only/i);
 view.querySelector('[data-action="back"]').click();
 assert.equal(controller.isDetails(),false);
 assert.match(view.textContent,/Today at a Glance/);
});
test('Switching from authorized to revoked removes ALL group and event details from the DOM',()=>{
 const {doc,controller,view,options}=open();
 view.querySelector('[data-action="open-details"]').click();
 assert.match(view.textContent,/Sample Wednesday Group/);
 options.querySelector('[data-scenario="revoked"]').click();
 assert.equal(controller.scenario(),'revoked');
 assert.equal(controller.isDetails(),false);
 assert.equal(view.querySelector('[data-action="open-details"]'),null);
 assert.doesNotMatch(view.textContent,/Sample Wednesday Group|Sample group gathering|Synthetic group connector/);
 assert.match(view.textContent,/only shows group information when access has been verified/);
 assert.equal(options.querySelector('[data-scenario="revoked"]').getAttribute('aria-pressed'),'true');
 assert.equal(options.querySelector('[data-scenario="ready"]').getAttribute('aria-pressed'),'false');
});
test('Expired and wrong organization get the same non-enumerating restricted view',()=>{
 const {doc,view,options}=open();
 options.querySelector('[data-scenario="expired"]').click();
 const one=view.textContent;
 options.querySelector('[data-scenario="wrong-organization"]').click();
 assert.equal(view.textContent,one);
 assert.doesNotMatch(view.textContent,/Wednesday|group gathering|person|organization 111/);
});
test('Source failure never masquerades as canceled meeting or confirmed member action',()=>{
 const {view,options}=open();
 options.querySelector('[data-scenario="unavailable"]').click();
 assert.match(view.textContent,/temporarily unavailable/i);
 assert.doesNotMatch(view.textContent,/Sample Wednesday Group|Wednesday gathering|RSVP · I’m in/);
 assert.equal(view.querySelector('[data-action="open-details"]'),null);
});
test('No upcoming event shows group but not an invented next date or details action',()=>{
 const {view,options}=open();
 options.querySelector('[data-scenario="no-event"]').click();
 assert.match(view.textContent,/Sample Wednesday Group/);
 assert.match(view.textContent,/None currently listed/);
 assert.equal(view.querySelector('[data-action="open-details"]'),null);
});
test('The isolated lab does not include the main app or any third-party service scripts',()=>{
 const scripts=[...new JSDOM(html).window.document.querySelectorAll('script[src]')].map(el=>el.getAttribute('src'));
 assert.deepEqual(scripts,['pilot-journey-lab.js']);
 assert.match(html,/content="default-src 'none'/);
 const build=fs.readFileSync(path.resolve(__dirname,'../scripts/build.cjs'),'utf8');
 for(const name of ['pilot-journey-lab.html','pilot-journey-lab.css','pilot-journey-lab.js'])
  assert.ok(build.includes("'"+name+"'"),'build must publish '+name);
});
