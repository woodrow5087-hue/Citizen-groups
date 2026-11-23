'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('connect-design-lab.html');
const lab=read('connect-design-lab.js');
const alive=read('connect-alive.js');
const member=read('connect-member.js');
const css=read('connect-alive.css');
const shell=read('rally-one-connect-alive-shell.css');

function preview(){
 const dom=new JSDOM(html,{url:'https://example.test/connect-design-lab.html',runScripts:'outside-only',pretendToBeVisual:true});
 const {window}=dom;
 const dialog=window.document.querySelector('#new-dialog');
 dialog.showModal=function(){this.open=true};
 dialog.close=function(){this.open=false};
 window.HTMLElement.prototype.scrollIntoView=function(){};
 window.eval(lab);
 window.eval(alive);
 const $=selector=>window.document.querySelector(selector);
 return {dom,window,$,click:selector=>$(selector).click()};
}

test('Connect Alive is loaded after the existing lab, with unchanged app entry points',()=>{
 assert.ok(html.indexOf('connect-alive.css')>html.indexOf('connect-graphite-parity.css'));
 assert.ok(html.indexOf('connect-alive.js')>html.indexOf('connect-design-lab.js'));
 assert.match(read('index.html'),/rally-one-connect-alive-shell\.css/);
 const build=read('scripts/build.cjs');
 for(const file of ['connect-alive.css','connect-alive.js','rally-one-connect-alive-shell.css'])
   assert.ok(build.includes("'"+file+"'"),'missing build asset '+file);
 assert.doesNotMatch(alive,/fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage/);
 assert.match(html,/Nothing sends to another person/);
});
test('message starters fill a draft but require a deliberate Send action',()=>{
 const app=preview();
 const {window,$,click}=app;
 click('[data-open="thread"]');
 assert.equal($('#screen-thread').hidden,false);
 const cue=$('[data-care-cue="How can I help this week?"]');
 cue.click();
 assert.equal($('#thread-input').value,'How can I help this week?');
 assert.equal($('#thread-form button[type=submit]').disabled,false);
 assert.equal($('#thread-new-messages').children.length,0);
 const second=$('[data-care-cue="I\'m praying for you."]');
 second.click();
 assert.match($('#thread-input').value,/How can I help this week\?\nI'm praying for you\./);
 assert.equal($('#thread-new-messages').children.length,0);
 $('#thread-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
 assert.match($('#thread-new-messages').textContent,/How can I help this week/);
 assert.equal($('#thread-input').value,'');
 app.dom.window.close();
});
test('reply state reuses the existing versioned Wednesday repository, with safe text rendering',()=>{
 assert.match(member,/fields\.replyTo=item\.id/);
 assert.match(member,/replyToMessageId:fields\.replyTo/);
 assert.match(member,/fields\.replyTo=null/);
 assert.match(member,/const \{repository,draft,replyTo\}=thread\(\)/);
 assert.match(member,/row\.dataset\.messageId=item\.id/);
 assert.match(member,/element\('div','message-reply'/);
 assert.match(member,/textContent=name\+': '/);
 assert.match(member,/member.*access|function allowed\(screen\)/);
 assert.match(html,/id="reply-context"/);
 assert.match(html,/id="reply-cancel"/);
 assert.match(html,/id="reply-context-text"/);
});
test('styles isolate to Connect and honor accessibility and reduced motion',()=>{
 assert.match(css,/\.connect-alive-eyebrow/);
 assert.match(css,/\.message-reply-action/);
 assert.match(css,/\.care-cues-actions button/);
 assert.match(css,/min-height:44px/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/max-width:359px/);
 assert.match(shell,/\.rally-one \.connect-overlay/);
 assert.doesNotMatch(shell,/\.f09-board|\.rp-gateway/);
});
