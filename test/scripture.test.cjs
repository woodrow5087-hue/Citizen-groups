const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../experience/scripture.js'),'utf8'),sandbox);
const chapters=sandbox.window.CitizenScripture;
test('offline WEB library contains ten complete ordered chapters and the accurately retained featured text',()=>{
 assert.equal(chapters.length,10);assert.equal(chapters.reduce((sum,c)=>sum+c.verses.length,0),249);
 assert.deepEqual(Array.from(chapters,c=>c.verses.length),[25,39,33,31,27,33,6,11,21,23]);
 for(const c of chapters)assert.deepEqual(Array.from(c.verses,v=>v.number),Array.from({length:c.verses.length},(_,i)=>i+1));
 const romans=chapters.find(c=>c.book==='Romans'&&c.chapter===8);
 assert.equal(romans.verses[25].text,'In the same way, the Spirit also helps our weaknesses, for we don’t know how to pray as we ought. But the Spirit himself makes intercession for us with groanings which can’t be uttered.');
 assert.equal(romans.verses[27].text,'We know that all things work together for good for those who love God, to those who are called according to his purpose.');
});
