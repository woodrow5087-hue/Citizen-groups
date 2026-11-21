const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const memory = require('../rallypoint-memorize.js');

const ui = fs.readFileSync(path.join(__dirname,'..','blank-battle.js'),'utf8');
function setup(storage = new Map()) {
  const screen = {innerHTML:'',querySelector(){return {focus(){}}}};
  const root = {addEventListener(_,handler){this.handler=handler}};
  const document = {getElementById(id){return id === 'bb-screen' ? screen : root}};
  const localStorage = {
    getItem(key){return storage.has(key) ? storage.get(key) : null},
    setItem(key,value){storage.set(key,value)}
  };
  vm.runInNewContext(ui,{window:{RallyMemory:memory},document,localStorage});
  const click = (action,value) => root.handler({target:{closest(){return {dataset:{action,value},disabled:false}}}});
  const state = () => JSON.parse(storage.get('rallypoint-blank-battle-v1'));
  return {screen,storage,click,state};
}
test('the page begins as a five-blank word game with exactly seven word tiles', () => {
  const app = setup();
  assert.match(app.screen.innerHTML,/Romans/);
  assert.match(app.screen.innerHTML,/FILL THE MISSING WORDS/);
  assert.equal((app.screen.innerHTML.match(/class="bb-slot/g)||[]).length,5);
  assert.equal((app.screen.innerHTML.match(/class="bb-tile(?: is-used)?"/g)||[]).length,7);
});
test('an incorrect word clears only the mistake and keeps correct placements', () => {
  const app = setup();
  for(const token of ['d0','a1','a2','a3','a4'])app.click('tile',token);
  app.click('check');
  assert.deepEqual(app.state().games.romans.slots,[null,'a1','a2','a3','a4']);
  assert.equal(app.state().games.romans.misses,1);
  assert.match(app.screen.innerHTML,/data-tone="error"/);
});
test('solving without a mistake earns 100 puzzle points and three stars', () => {
  const app = setup();
  for(const token of ['a0','a1','a2','a3','a4'])app.click('tile',token);
  app.click('check');
  assert.equal(app.state().games.romans.solved,true);
  assert.match(app.screen.innerHTML,/Nicely done!/);
  assert.match(app.screen.innerHTML,/>100</);
  assert.match(app.screen.innerHTML,/3 out of 3 stars/);
  assert.match(app.screen.innerHTML,/Perfect Round earned/);
});
test('progress resumes only in the lab, reset changes the bank order, next changes the verse', () => {
  const storage = new Map([['rallypoint-phase1-2026','{"keep":true}']]);
  const app = setup(storage);
  app.click('tile','a0');
  assert.equal(setup(storage).state().games.romans.slots[0],'a0');
  app.click('reset');
  assert.equal(app.state().games.romans.round,1);
  assert.deepEqual(app.state().games.romans.slots,[null,null,null,null,null]);
  app.click('next');
  assert.equal(app.state().verseId,'sermon');
  assert.equal(storage.get('rallypoint-phase1-2026'),'{"keep":true}');
});
test('player can choose a particular blank and replace its word', () => {
  const app = setup();
  app.click('slot','3');
  app.click('tile','a3');
  assert.equal(app.state().games.romans.slots[3],'a3');
  app.click('slot','3');
  assert.equal(app.state().games.romans.slots[3],null);
});


test('premium screen displays real verse position, personal best and earned round statistics', () => {
  const app = setup();
  assert.match(app.screen.innerHTML,/VERSE 01 \/ 04/);
  assert.match(app.screen.innerHTML,/PERSONAL BEST <b>—<\/b>/);
  assert.match(app.screen.innerHTML,/HINT · −12/);
  for (const token of ['a0','a1','a2','a3','a4']) app.click('tile',token);
  assert.match(app.screen.innerHTML,/just-placed/);
  app.click('check');
  assert.match(app.screen.innerHTML,/Corrections <b>0<\/b>/);
  assert.match(app.screen.innerHTML,/Hints <b>0<\/b>/);
  assert.match(app.screen.innerHTML,/Best <b>100<\/b>/);
  app.click('reset');
  assert.match(app.screen.innerHTML,/PERSONAL BEST <b>100<\/b>/);
  app.click('next');
  assert.match(app.screen.innerHTML,/VERSE 02 \/ 04/);
});

test('earned stars and recorded corrections reflect mistakes rather than simulated rewards', () => {
  const app = setup();
  for (const token of ['d0','a1','a2','a3','a4']) app.click('tile',token);
  app.click('check');
  app.click('tile','a0');
  app.click('check');
  assert.match(app.screen.innerHTML,/Corrections <b>1<\/b>/);
  assert.match(app.screen.innerHTML,/Best <b>91<\/b>/);
  assert.doesNotMatch(app.screen.innerHTML,/Perfect Round earned/);
});
