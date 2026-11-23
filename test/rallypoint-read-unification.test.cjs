'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=source('rallypoint-read-unification.css');
const html=source('index.html');
const build=source('scripts/build.cjs');
const route='.premium-alive.is-read-v09:not(.is-play-v08)';

/* Exact approved Develop Git blob SHA hashes after Team PR #96 was merged.
 * Protect Today, Groups, Team, Reader source and ALL Blank Battle assets. */
const frozen=Object.freeze({
 /* Connect usability v2: approved openConnect keyboard viewport change; pin remains exact. */
 /* Groups v2 isolated overview routing + preserved Connect and other tab behavior. */
 /* Companion Care flow: scoped UI insertion and explicit action only; no other tab redesign. */
 /* M5B: scoped, read-only Unified Focus ranking within existing Today Priority Board. */
 'rallypoint.js':'d908c009ef1ad75f2f4feb34ced95de8909b253f',
 'rallypoint-phase1.css':'db0bbe26f995fbde1e35a1e4c3a5ef3a6d799833',
 'rallypoint-groups-v07.css':'513c03013506bdaa0d9a99ced6c4d455fd15c386',
 'rallypoint-team-v08.css':'dff9ce0ef59d02a4752bf740407b08324f0459ac',
 'rallypoint-read-v09.css':'bf6b7713522365d607c934fd3af7477681f6c74e',
 'rallypoint-premium-alive.css':'c3187de629017039075f24586e77199e9ff68856',
 'rallypoint-smart-dashboard.css':'d3ffe64f0ee3573219cc868b2a7dd6c70adc8d87',
 'rallypoint-priority-board.css':'2ec12e300ed7d438af53d995fdcbc0462cf3db18',
 'rallypoint-personal-companion.js':'d8527afdcd9cf43c82fe3237407b21d67a1b8c5a',
 'rallypoint-today-fluid.css':'ec805ff013396ebb0d3561fb46e4f5d194317344',
 'rallypoint-wednesday-integrated.css':'5ef59a5668c0040ed57667888846cafa5abcc403',
 'rallypoint-visual-unification.css':'d11ad051543ce411c5507fe31e7e997e4f92eba5',
 'rallypoint-unified-v08.css':'75f632a9568c4fc34cad6f9cf6a611b0dfb53358',
 'rallypoint-group-view.js':'1a6d106dad134d331d9bb72a5870af939bab32ce',
 'rallypoint-group-experience.js':'1428e32bb786dda1822cd3ae3b2972507c3feeba',
 'rallypoint-team-unification.css':'b7326167eb2290aa489d82fe104422dbfeb9af6d',
 'rallypoint-verseplay.css':'f7dd538fdefae731dc9e9fc9e9b8cc951cc7a2f1',
 'rallypoint-verseplay-ui.js':'d89ddb1c230217d3ef68dc7bbf7c0dd00dcf0fc0',
 'rallypoint-memorize.js':'d83f02e832e9da86e47100839c777616995817f8',
 'blank-battle.js':'94307329826d269e5177832ce9de586d1406b3c0',
 'blank-battle.css':'1ffd371cba7ca984f42161723cc3391ac0b6f6a5'
});
function gitBlob(file){
 const buf=fs.readFileSync(path.join(root,file));
 return crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
}
test('Read CSS is last and included in production-independent static preview build',()=>{
 assert.equal((html.match(/href="rallypoint-read-unification\.css"/g)||[]).length,1);
 assert.ok(html.indexOf('href="rallypoint-read-unification.css"')>html.indexOf('href="rallypoint-team-unification.css"'));
 assert.ok(build.includes("'rallypoint-read-unification.css'"));
 assert.ok(build.includes("'rallypoint-visual-unification.css'"));
 assert.ok(build.includes("'rallypoint-team-unification.css'"));
 assert.ok(!/pilot-journey-lab|planning-center/.test(build),'No pilot source in application build');
});
test('Every new CSS selector is Read-only AND excludes the Blank Battle route',()=>{
 const src=css.replace(/\/\*[\s\S]*?\*\//g,'');
 let chunk='',rules=0,media=0;
 for(const ch of src){
  if(ch==='{'){
   const header=chunk.trim();chunk='';
   if(header.startsWith('@media')){media++;continue}
   const selectors=header.split(',');
   for(const selector of selectors){
    const value=selector.trim();
    assert.ok(value.startsWith(route),'Unscoped or game-leaking CSS selector: '+value);
    assert.doesNotMatch(value,/\.is-(?:team-v08|groups-v07|f09-board|f09-dashboard|fluid-today)/);
   }
   rules++;
  }else if(ch==='}')chunk='';
  else chunk+=ch;
 }
 assert.ok(rules>=50,'Expected substantive styling pass');
 assert.ok(media>=2,'Small-screen and reduced-motion required');
 assert.doesNotMatch(css,/@import|@font-face|!important|url\(/);
});
test('Read style selectors actually stop matching when game mode is entered',()=>{
 const dom=new JSDOM('<section class="premium-alive is-read-v09"><header class="header"></header><main><div class="read-screen-v09"></div></main><nav class="bottom"></nav></section>');
 const doc=dom.window.document;
 for(const part of ['.header','main','.bottom','.read-screen-v09']){
  assert.equal(doc.querySelectorAll(route+' '+part).length,1);
 }
 doc.querySelector('.premium-alive').classList.add('is-play-v08');
 for(const part of ['.header','main','.bottom','.read-screen-v09']){
  assert.equal(doc.querySelectorAll(route+' '+part).length,0,'CSS would leak to Blank Battle: '+part);
 }
});
test('Every existing approved screen and game source is byte-for-byte unchanged',()=>{
 for(const [name,sha] of Object.entries(frozen))
  assert.equal(gitBlob(name),sha,'Unapproved source mutation: '+name);
});
test('Read uses warm shell, muted intro, preserved dark/lime game feature and focused cards',()=>{
 assert.match(css,/--ru-paper:#FDF7F1/);
 assert.match(css,/--ru-red:#E3002B/);
 assert.match(css,/\.read-v09-hero\{[\s\S]*?linear-gradient/);
 assert.match(css,/\.rp-game-entry\{/);
 assert.match(css,/\.read-focus-card\{/);
 assert.match(css,/\.card\.read-question-card\{/);
 assert.match(css,/\.read-memory-card\{/);
 assert.match(css,/\.read-screen-v09 \.disclaimer\{/);
 assert.match(css,/\.spotify-link img\{[\s\S]*?brightness\(0\)/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});
test('Original reading, leader permissions, game route and action semantics remain intact',()=>{
 const js=source('rallypoint.js');
 for(const word of ['PLAY BLANK BATTLE','Mark as read','Open group conversation','Mark prayer time','Shape the conversation.','Save local question','Back to Read']){
  assert.ok(js.includes(word),'Read source contract missing: '+word);
 }
 assert.match(js,/s\.view==='read'\|\|s\.view==='play'/);
 assert.match(js,/s\.view==='play'\)/);
 assert.match(js,/s\.view==='play'\)mountBlankBattle\(\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/focus-visible/);
 assert.match(css,/min-height:48px/);
 assert.match(css,/min-height:46px/);
});
