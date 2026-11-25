'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PNG}=require('pngjs'),visual=require('./helpers/ux03-visual.cjs');
test('owner-approved Connect source identity and complete capture inventory stay fixed',()=>{
 assert.equal(visual.reference.source,'bb8f2446a71221148587f09bdf8192d5bde57d83');
 assert.equal(Object.keys(visual.reference.files).length,10);
 const standalone=visual.expectedCaptures('standalone'),embedded=visual.expectedCaptures('embedded');
 assert.equal(standalone.length,42);assert.equal(embedded.length,44);
 for(const width of [320,375,390,430])for(const profile of ['group-member','serving','group-serving'])assert.ok(embedded.some(f=>f.startsWith(width+'-')&&f.endsWith(profile+'-inbox.png')));
 assert.ok(embedded.includes('390-500-group-serving-room-chat.png'));
 assert.ok(embedded.includes('390-844-large-group-serving-room-people.png'));
});
test('each approved Connect runtime owner rejects byte mutations and substituted reference bytes',()=>{
 for(const file of Object.keys(visual.reference.files)){
  const source=fs.readFileSync(file),changed=Buffer.from(source);changed[0]^=1;
  visual.protectSource(file,source,source);
  assert.throws(()=>visual.protectSource(file,source,changed),file);
  assert.throws(()=>visual.protectSource(file,changed,changed),file+' substituted approved source');
 }
});
test('strict Connect comparison rejects a real single-pixel change and dimension drift',async()=>{
 const {compareScreenshots}=await import('../verseplay/tests/visual-comparison.mjs');
 const image=new PNG({width:8,height:8});image.data.fill(255);const before=PNG.sync.write(image);
 visual.assertPair(compareScreenshots(before,before),'positive control');
 image.data[4*(3*8+3)]=0;const after=PNG.sync.write(image),difference=compareScreenshots(before,after);
 assert.equal(difference.rawDifferentPixels,1);assert.throws(()=>visual.assertPair(difference,'one-pixel negative control'));
 const other=new PNG({width:9,height:8});other.data.fill(255);assert.throws(()=>visual.assertPair(compareScreenshots(before,PNG.sync.write(other)),'size negative control'));
});
test('strict WebKit capture adds coverage while original Chromium assertions remain',()=>{
 assert.equal(visual.reference.engine,'webkit');
 assert.deepEqual(visual.launchOptions({UX03_VISUAL_CAPTURE:'1',BROWSER_PATH:'/test/chromium'}),{executablePath:undefined});
 assert.equal(visual.launchOptions({BROWSER_PATH:'/test/chromium'}).executablePath,'/test/chromium');
 const runner=fs.readFileSync('scripts/ux03-visual-regression.mjs','utf8');
 for(const script of ['ux03-browser-check.mjs','ux03-profile-review.mjs']){
  assert.ok(runner.includes(script));assert.ok(fs.readFileSync('.github/workflows/rally-point-preview-qa.yml','utf8').includes('node scripts/'+script+' http://127.0.0.1:8514/'));
 }
 assert.match(runner,/delete env\.UX03_HISTORICAL/);
});
test('native paint readiness discards a stale frame without consulting the reference',async()=>{
 const first=Buffer.from('old native frame'),settled=Buffer.from('settled native frame');let calls=0;
 const frame=await visual.captureStable({screenshot:async()=>++calls===1?first:settled,evaluate:async()=>{}});
 assert.equal(calls,3);assert.ok(frame.equals(settled));
});
test('a perpetually unstable native paint fails instead of accepting or relaxing pixels',async()=>{
 let calls=0;await assert.rejects(()=>visual.captureStable({screenshot:async()=>Buffer.from('frame '+(++calls)),evaluate:async()=>{}}),/did not stabilize/);
 assert.equal(calls,8);
});

test('previous approved Connect manifest and source remain reconstructable without portrait correction',()=>{
 const crypto=require('node:crypto'),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
 const raw=fs.readFileSync('test/helpers/ux03-26153ba-reference.json');
 assert.equal(hash(raw),'6b4d9a89a85c9f22a1e96af76629f56b136bb66dcb5120c05dab7177e061f1f7');
 const previous=JSON.parse(raw),changes=require('./helpers/ux03-changes.json');
 assert.equal(previous.source,'26153bab8660144e4bf8e50bbef6482b6e112d12');
 for(const [file,expected] of Object.entries(previous.files)){
  let source=fs.readFileSync(file);
  if(file==='connect-usability.css'){
   for(const [from,to] of changes[file]){
    if(hash(source)===expected)break;
    const text=source.toString();assert.equal(text.split(from).length,2);source=Buffer.from(text.replace(from,to));
   }
  }
  assert.equal(hash(source),expected,'Previous approved source changed: '+file);
 }
});

test('inbox SVG stroke correction reconstructs the approved 042ab82 stylesheet exactly',()=>{
 const crypto=require('node:crypto'),changes=require('./helpers/ux03-changes.json');
 const [from,to]=changes['connect-usability.css'][0],source=fs.readFileSync('connect-usability.css','utf8');
 assert.equal(source.split(from).length,2);
 assert.equal(crypto.createHash('sha256').update(source.replace(from,to)).digest('hex'),'37a1812254ad080dd414d113bc2047be50e507a65e3d8bfc8931f05c22d20da9');
});
