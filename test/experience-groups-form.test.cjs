'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const fs=require('node:fs'),vm=require('node:vm');
const Groups=require('../foundation2/groups.js'),Widgets=require('../foundation2/widgets.js'),Relational=require('../foundation2/relational-domain.js');
const Intelligence=require('../rally-one-intelligence.js'),AppState=require('../rally-one-app-state.js');
const chat={status:'ok',unreadCount:3,lastMessage:{author:'Jess W.',body:'Looking forward to Wednesday group!'}};
const project=(member=true)=>Groups.project(Intelligence.derive({state:AppState.initialize(()=>null,true),ui:{name:'Friend',campus:'north',memberships:{group:member,team:false}},conversation:chat,now:new Date('2026-11-25T12:00:00Z')}),chat);
const doc=(view,options)=>new JSDOM(Groups.render(view,options)).window.document;

test('Groups portrait rail uses the existing four fixture contacts and existing contact seam',()=>{
 const page=doc(project()),buttons=[...page.querySelectorAll('[data-rel-contact]')];
 assert.deepEqual(buttons.map(button=>button.dataset.relContact),['anna','jess','marcus','taylor']);
 for(const [index,button] of buttons.entries()){
  const person=Relational.contacts[index];
  assert.equal(button.type,'button');
  assert.equal(button.textContent,person.name);
  assert.equal(button.getAttribute('aria-label'),'Open '+person.name+' profile');
  assert.equal(button.dataset.returnFocus,'groups-contact-'+person.id);
  assert.equal(button.querySelector('img').getAttribute('src'),'../assets/rally-one/'+person.photo+'.webp');
  assert.equal(button.querySelector('[data-action], [data-group-action], [data-chat-open]'),null);
 }
 assert.match(page.querySelector('.group-contact-note').textContent,/Fictional group contacts/);
 assert.equal(page.querySelectorAll('[data-chat-open=group]').length,2);
 assert.equal(page.querySelector('.group-conversation button').dataset.returnFocus,'groups-conversation');
});

test('Groups private contact rail is absent for nonmembers and provider previews and disabled for blocked saves',()=>{
 const visitor=doc(project(false));
 assert.equal(visitor.querySelector('[data-rel-contact], .group-care, .group-feature, [data-chat-open], [data-group-action]'),null);
 assert.match(visitor.querySelector('.route-stage-label').textContent,/NO GROUP MEMBERSHIP/);
 const preview=doc(project(),{groupPreview:'<section class="source-preview">Source-owned preview</section>'});
 assert.ok(preview.querySelector('.source-preview'));
 assert.equal(preview.querySelector('[data-rel-contact], .group-care, .group-feature, [data-chat-open], [data-group-action]'),null);
 const blocked=doc(project(),{blocked:true});
 assert.equal(blocked.querySelectorAll('[data-rel-contact]:disabled').length,4);
 assert.equal(blocked.querySelector('[data-group-action=group-rsvp]'),null);
 assert.match(blocked.querySelector('.group-blocked').textContent,/Responses are disabled/);
});

test('Groups browser UMD uses shared presentation and contact owners without writes or a new projection',()=>{
 const sandbox={window:{FoundationWidgets:Widgets,FoundationRelationalDomain:Relational}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../foundation2/groups.js'),'utf8'),sandbox);
 const projection=project(),before=JSON.stringify(projection);
 assert.equal(sandbox.window.FoundationGroups.render(projection),Groups.render(projection));
 assert.equal(JSON.stringify(projection),before);
 assert.ok(doc(projection).querySelector('.group-widget-icon svg[aria-hidden=true]'));
 assert.ok(doc(projection).querySelector('.group-feature>img[src$="/community.webp"]'));
});
