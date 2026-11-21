'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {makeChatDomainBundle}=require('../scripts/build-chat-lab.cjs');
const root=path.resolve(__dirname,'..');

test('browser bundle uses the actual reviewed F-02 contracts and repository',()=>{
 const source=makeChatDomainBundle();
 const context={window:{},structuredClone};
 new vm.Script(source,{filename:'rallypoint-chat-domain.browser.js'}).runInNewContext(context);
 const api=context.window.RallyChatDomain;
 assert.equal(api.SCHEMA_VERSION,1);
 assert.equal(typeof api.assertConversationSnapshot,'function');
 assert.equal(typeof api.createMockConversationRepository,'function');
 const empty=api.emptyConversationSnapshot();
 const repo=api.createMockConversationRepository({seed:empty});
 assert.equal(repo.schemaVersion,1);
 assert.equal(repo.getSnapshot().schemaVersion,1);
 assert.ok(source.includes('setDeliveryStatus'));
 assert.ok(source.includes('readCursors'));
});

test('lab is standalone and preserves app entrypoint, CSS, browser storage, and build assets',()=>{
 const app=fs.readFileSync(path.join(root,'rallypoint.js'),'utf8');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const lab=fs.readFileSync(path.join(root,'wednesday-chat-lab.html'),'utf8');
 const logic=fs.readFileSync(path.join(root,'wednesday-chat-lab.js'),'utf8');
 const build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
 const css=fs.readFileSync(path.join(root,'wednesday-chat-lab.css'),'utf8');
 for(const key of ['wednesday-chat-lab.js','rallypoint-chat-domain.browser.js','wednesday-chat-lab.css']){
   assert.ok(lab.includes(key),'expected lab asset '+key);
   assert.equal(html.includes(key),false,'lab must not alter existing app entrypoint');
   assert.equal(app.includes(key),false,'lab must not alter running app controller');
 }
 assert.ok(build.includes('wednesday-chat-lab.html'));
 assert.ok(build.includes("require('./build-chat-lab.cjs').buildChatDomainBundle(out)"));
 assert.ok(logic.includes("'rallypoint-wednesday-chat-lab-v1'"));
 assert.equal(logic.includes("localStorage.setItem('rallypoint-phase1-2026'"),false);
 assert.equal(logic.includes("localStorage.setItem('rallypoint-today-ui-v1'"),false);
 assert.match(css,/#E3002B/);
 assert.match(css,/#242322/);
 assert.match(css,/#F3E5D6/);
 assert.match(css,/prefers-reduced-motion/);
});
