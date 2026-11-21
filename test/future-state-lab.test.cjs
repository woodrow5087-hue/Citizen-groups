const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'..','future-state-lab.html');
const content=fs.readFileSync(file,'utf8');
test('future-state lab is a complete standalone mobile-first HTML prototype',()=>{
  assert.match(content,/^<!doctype html>/i);
  assert.match(content,/<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/);
  assert.match(content,/<title>Rally Point — Connected Life \/ Future State Lab<\/title>/);
  assert.match(content,/<\/script><\/body><\/html>\s*$/);
  assert.match(content,/#e3002b/i);
  assert.ok((content.match(/data:image\//g)||[]).length>=5,'embedded media should travel with demo');
  assert.doesNotMatch(content,/\bfetch\s*\(/,'future-state lab must not present remote data as synced');
  assert.doesNotMatch(content,/<script[^>]+src=/i,'the demo must not require external scripts');
});
test('future-state scenario includes real interaction handlers and explicit fictional-only safeguards',()=>{
  for(const word of ['send-message','notification-open','save-step','complete-step','simulate-tomorrow','set-campus','reset']){
    assert.ok(content.includes(word),word);
  }
  assert.match(content,/fictional/i);
  assert.match(content,/localStorage/);
  assert.match(content,/Leader Care/);
});
test('static build includes the demo without changing production index',()=>{
  const source=fs.readFileSync(path.join(__dirname,'..','scripts','build.cjs'),'utf8');
  assert.match(source,/'future-state-lab\.html'/);
  assert.match(source,/'index\.html'/);
});