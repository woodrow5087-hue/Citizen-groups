const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'studio-concept.html'),'utf8');
const code=fs.readFileSync(path.join(root,'studio-concept.js'),'utf8');
function load(){
 const dom=new JSDOM(html,{url:'https://studio-demo.local/studio-concept.html',runScripts:'outside-only'});
 dom.window.matchMedia=()=>({matches:false});
 dom.window.eval(code);
 return dom;
}
test('studio concept contains four fully rendered agency screens and a strong prototype disclaimer',()=>{
 const d=load(),doc=d.window.document;
 assert.equal(doc.querySelectorAll('.phone-viewport').length,4);
 assert.match(doc.body.textContent,/Your people\./);
 assert.match(doc.body.textContent,/Wednesday Group/);
 assert.match(doc.body.textContent,/Serve/);
 assert.match(doc.body.textContent,/follow-ups to review/);
 assert.match(doc.body.textContent,/No real accounts, conversations, church records or notifications/);
 d.window.close();
});
test('the four-screen demonstration has interactive Today to Groups navigation and local check-in',()=>{
 const d=load(),doc=d.window.document,slot=doc.querySelector('[data-initial="today"]');
 slot.querySelector('[data-action="nav"][data-view="people"]').click();
 assert.equal(slot.querySelector('.phone').dataset.screen,'people');
 slot.querySelector('[data-action="checkin"]').click();
 assert.match(slot.textContent,/Checked in/);
 const saved=JSON.parse(d.window.localStorage.getItem('rally-point-studio-concept-v09'));
 assert.equal(saved.checkIn,true);
 d.window.close();
});
test('leader review shows only a demo-only follow-up state, and never sends a message',()=>{
 const d=load(),doc=d.window.document,slot=doc.querySelector('[data-initial="care"]');
 slot.querySelector('[data-action="review"][data-id="jake"]').click();
 assert.match(slot.textContent,/1 follow-up to review/);
 assert.match(slot.textContent,/Reviewed/);
 slot.querySelector('[data-action="reach"][data-person="Jake M."]').click();
 assert.match(doc.getElementById('studio-toast').textContent,/no message sent/i);
 d.window.close();
});
test('Read has the newest game entry while remaining independent from v0.8',()=>{
 const d=load(),doc=d.window.document,slot=doc.querySelector('[data-initial="today"]');
 slot.querySelector('[data-action="nav"][data-view="read"]').click();
 assert.equal(slot.querySelector('.phone').dataset.screen,'read');
 assert.match(slot.textContent,/VERSEPLAY/);
 assert.ok(slot.querySelector('[data-action="game"]'));
 d.window.close();
});
