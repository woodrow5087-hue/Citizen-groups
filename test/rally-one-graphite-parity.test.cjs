'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const app=read('rally-one-graphite-parity.css');
const connect=read('connect-graphite-parity.css');
const index=read('index.html');
const lab=read('connect-design-lab.html');
const build=read('scripts/build.cjs');

test('graphite parity styles are shipped to both app and Connect in correct cascade order',()=>{
  assert.equal((index.match(/href="rally-one-graphite-parity\.css"/g)||[]).length,1);
  assert.ok(index.indexOf('href="rally-one-graphite-parity.css"')>index.indexOf('href="rally-one.css"'));
  assert.equal((lab.match(/href="connect-graphite-parity\.css"/g)||[]).length,1);
  assert.ok(lab.indexOf('href="connect-graphite-parity.css"')>lab.indexOf('href="connect-design-lab.css"'));
  for(const file of ['rally-one-graphite-parity.css','connect-graphite-parity.css'])
    assert.ok(build.includes("'"+file+"'"),'build missing '+file);
});
test('Today hero and welcome are frozen; graphite updates target other route classes',()=>{
  assert.match(app,/\.rally-one \.premium-alive\.is-groups-v07/);
  assert.match(app,/\.rally-one \.premium-alive\.is-team-v08/);
  assert.match(app,/\.rally-one \.premium-alive\.is-read-v09/);
  assert.match(app,/\.premium-alive:not\(\.is-play-v08\) #nav/);
  assert.ok(!app.includes('.f09-board'),'Today styles must remain untouched');
  assert.ok(!app.includes('.rp-gateway'),'Welcome flow styles must remain untouched');
  assert.ok(!app.includes('@import'),'No remote styles');
  assert.ok(!app.includes('display:none!important'),'No hiding content or navigation');
});
test('graphite screens use the same five-color hierarchy and keep explicit accessible states',()=>{
  for(const value of ['#222120','#302e2c','#c90031','#f4dfbd','#f9e0dc'])assert.ok(app.includes(value),value);
  assert.match(app,/button:focus-visible/);
  assert.match(app,/prefers-reduced-motion:reduce/);
  assert.match(app,/max-width:350px/);
  assert.match(app,/min-height:44px/);
  assert.match(connect,/\.screen-inbox/);
  assert.match(connect,/\.message\.incoming \.bubble/);
  assert.match(connect,/\.message\.outgoing \.bubble/);
  assert.match(connect,/button:focus-visible/);
  assert.match(connect,/max-width:350px/);
});
