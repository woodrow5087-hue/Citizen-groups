'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const restore=require('./helpers/ux03-source.cjs');
const source=fs.readFileSync('connect-usability.css','utf8');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
// Canonical 94d373c source hashes; usable in shallow CI checkouts.
const baseline='ed11d70e5693e6560af7744077893d72f1d8e6483868b15d431a48e29d5a2742';
test('Connect exact inverse preserves the immutable accepted stylesheet',()=>assert.equal(hash(restore('connect-usability.css',source)),baseline));
test('unrelated historical mutations are not erased',()=>assert.notEqual(hash(restore('connect-usability.css',source.replace('min-height:0','min-height:1px'))),baseline));
test('declared Connect CSS mutations and duplication are rejected',()=>{
 assert.throws(()=>restore('connect-usability.css',source.replace('--ca-graphite:#17181a','--ca-graphite:pink')));
 assert.throws(()=>restore('connect-usability.css',source+require('./helpers/ux03-changes.json')['connect-usability.css'][0][0]));
});
test('conversation owners, persistence, permissions and host bridge remain unchanged',()=>{
 const hashes={'connect-member.js': 'bad0b5901f1e769a41e04c1a09adef162cb068b9f3535a3fa713df152103d331', 'rallypoint.js': '2fb24c6fdaef290296190c1ce6a9a9ecaea1069b011808e54ca8a54984406816', 'rallypoint-conversation-read-model.js': '9afbd55c66893df20a8fa783ae0c9c22f3edf3a6ff8bcccd16bca51076c5ce10', 'rally-one-intelligence.js': '7582fd7bdfec25c46f08d8473ef53248b9c494191bb73f7ac35ad6355363f1bb'};
 for(const [file,expected] of Object.entries(hashes))assert.equal(hash(fs.readFileSync(file)),expected,file);
});
function preview(denied=false){
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM(fs.readFileSync('connect-design-lab.html','utf8'),{url:'https://example.test',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 d.querySelector('#new-dialog').close=function(){this.open=false};
 d.querySelector('#new-dialog').showModal=function(){this.open=true};
 if(denied)w.RallyConnectMember={allowed:n=>n==='inbox',allowsRow:()=>false,show(){},setup(){},initial:{screen:'inbox'}};
 w.eval(fs.readFileSync('connect-design-lab.js','utf8'));
 w.eval(fs.readFileSync('connect-alive.js','utf8'));
 return {dom,w,d};
}
test('navigation focuses destination and restores actual inbox origin without losing draft',()=>{
 const {dom,d,w}=preview();
 const row=d.querySelector('.conversation-row[data-open=thread]');row.click();
 assert.equal(d.activeElement,d.querySelector('#screen-thread h2'));
 d.querySelector('#thread-input').value='unsent';
 d.querySelector('#screen-thread [data-open=inbox]').click();
 assert.equal(d.activeElement,row);assert.equal(d.querySelector('#thread-input').value,'unsent');
 d.querySelector('.people-rail [data-person=Jess]').click();
 assert.equal(d.activeElement,d.querySelector('#direct-name'));
 dom.window.close();
});
test('denied navigation does not disclose a conversation or move focus into it',()=>{
 const {dom,d}=preview(true);const row=d.querySelector('.conversation-row[data-open=thread]');row.focus();row.click();
 assert.equal(d.querySelector('#screen-thread').hidden,true);assert.equal(d.activeElement,row);dom.window.close();
});
test('new-conversation dialog returns to the compose launcher',()=>{
 const {dom,d}=preview();d.querySelector('#compose-toggle').click();d.querySelector('#new-dialog [data-person=Jess]').click();
 assert.equal(d.activeElement,d.querySelector('#direct-name'));d.querySelector('#screen-direct [data-open=inbox]').click();
 assert.equal(d.activeElement,d.querySelector('#compose-toggle'));dom.window.close();
});
