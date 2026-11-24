'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const {restoreUXSource,baseline}=require('./helpers/ux01-source.cjs');
const {navigate}=require('../rally-one-navigation.js');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const blob=s=>{const b=Buffer.from(s);return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');};
for(const [name,sha] of Object.entries(baseline))test('UX01 exact accepted baseline: '+name,()=>{
 assert.equal(blob(restoreUXSource(name)),sha);
 assert.notEqual(blob(restoreUXSource(name,read(name)+'\n/* unauthorized */')),sha);
});
function render(leader=false,readToday=false,rallyOne=true){
 const src=read('rallypoint.js'),fn=src.slice(src.indexOf('function read(){'),src.indexOf('function play(){'));
 const context={rallyOne,currentReading:()=>({name:'Sample pathway',title:'Sample title',passage:'John 15:12',description:'Sample',excerpt:'Sample excerpt'}),e:String,s:{read:readToday,question:'A question',plan:'sermon',prayed:false},icon:()=>'',H:{rhythmEditor:()=>'<button data-action="rhythm-test">Rhythm</button>'},canLead:()=>leader,VP:{render:()=>'<section id="reading-memorize"><button data-action="memory-test">Memory</button></section>'},footer:()=>'<p>Local demo</p>'};
 return new JSDOM(vm.runInNewContext(fn+'\nread()',context)).window.document;
}
test('UX01 compact landing retains one native game entry and all original reading actions',()=>{
 const doc=render();
 assert.equal(doc.querySelectorAll('[data-verse-circuit-entry]').length,1);
 assert.equal(doc.querySelector('.ux-circuit').getAttribute('href'),'verse-circuit-playground.html');
 assert.equal(doc.querySelectorAll('details[open]').length,0);
 assert.ok(doc.querySelector('[data-go="play"]'));
 assert.equal(doc.querySelectorAll('[data-ux-read-panel="classic"] summary').length,1);
 assert.ok(doc.querySelector('[data-action="read"]'));
 assert.ok(doc.querySelector('[data-action="pray"]'));
 assert.ok(doc.querySelector('[data-action="rhythm-test"]'));
 assert.ok(doc.querySelector('[data-action="memory-test"]'));
 assert.equal(doc.querySelector('.read-leader-card'),null);
 assert.ok(render(true).querySelector('.read-leader-card'));
 assert.match(render(false,true).querySelector('[data-action="read"]').textContent,/Read today/);
 assert.equal(render(false,false,false).querySelector('.ux-read'),null);
});
for(const target of ['scripture','questions','memorize'])test('UX01 deep link reveals '+target+' before focus',()=>{
 const doc=render(),node=doc.getElementById('reading-'+target),panel=node.closest('details'),events=[];
 node.focus=()=>{assert.equal(panel.open,true);events.push('focus');};
 node.scrollIntoView=()=>events.push('scroll');
 const view={scrollTop:5,querySelector:sel=>doc.querySelector(sel)};
 navigate('read',null,target,{rallyOne:true,memberContext:()=>null,openConnect:()=>{},closeDialog:()=>{},s:{view:'today'},clearFeedback:()=>{},resetIndex:()=>{},f09Preview:false,canLead:()=>false,render:()=>{},$:id=>id==='view'?view:doc.getElementById(id)});
 assert.deepEqual(events,['focus','scroll']);assert.equal(view.scrollTop,0);
});
