'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const css=source('rallypoint-team-unification.css');
const html=source('index.html');
const build=source('scripts/build.cjs');

/* Approved develop after F-11 Groups (PR #94). Do not let a visual-only Team
 * pass rewrite logic, Today/Groups/Read styles, or the serving state model. */
const frozen=Object.freeze({
  /* Connect usability v2: approved openConnect keyboard viewport change; pin remains exact. */
 /* Groups v2 isolated overview routing + preserved Connect and other tab behavior. */
 /* Companion Care flow: scoped UI insertion and explicit action only; no other tab redesign. */
 /* M5B: scoped, read-only Unified Focus ranking within existing Today Priority Board. */
 /* M6: controlled member context read and explicit action transitions; old tabs retain same surfaces. */
 'rallypoint.js':'a6a10a7d85a9ed8d33c6d2bccd9b7809384e2960',
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
  'rallypoint-group-experience.js':'1428e32bb786dda1822cd3ae3b2972507c3feeba'
});
function gitBlob(name){
 const bytes=fs.readFileSync(path.join(root,name));
 return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
}
test('Team CSS loads only once, last after approved Groups, and is copied by build',()=>{
 assert.equal((html.match(/href="rallypoint-team-unification\.css"/g)||[]).length,1);
 assert.ok(html.indexOf('href="rallypoint-team-unification.css"')>html.indexOf('href="rallypoint-visual-unification.css"'));
 assert.ok(build.includes("'rallypoint-team-unification.css'"));
 assert.ok(build.includes("'rallypoint-visual-unification.css'"));
 assert.doesNotMatch(build,/pilot-journey-lab|pilot\/planning-center/);
});
test('Every CSS selector belongs to Team, with no global/Today/Groups/Read leakage',()=>{
 const src=css.replace(/\/\*[\s\S]*?\*\//g,'');
 let chunk='',count=0,media=0;
 for(const ch of src){
  if(ch==='{'){
   const header=chunk.trim();chunk='';
   if(header.startsWith('@media')){media++;continue}
   for(const sel of header.split(',')){
    const s=sel.trim();
    assert.ok(s.startsWith('.premium-alive.is-team-v08'),'Unscoped selector: '+s);
    assert.doesNotMatch(s,/\.is-(?:f09-board|f09-dashboard|groups-v07|read-v09|fluid-today)/);
   }
   count++;
  }else if(ch==='}'){chunk=''}else{chunk+=ch}
 }
 assert.ok(count>=50,'Expected meaningful Team-only refinement');
 assert.ok(media>=2,'Small-screen and reduced motion rules required');
 assert.doesNotMatch(css,/@import|!important/);
});
test('Today, approved Groups, Read, navigation and serving model remain byte-for-byte intact',()=>{
 for(const [name,sha] of Object.entries(frozen))
  assert.equal(gitBlob(name),sha,'Unapproved change: '+name);
});
test('Warm shell remains consistent with approved Today and Groups; serving hero stays matte red',()=>{
 assert.match(css,/--tu-paper:#FDF7F1/);
 assert.match(css,/--tu-red:#E3002B/);
 assert.match(css,/\.premium-alive\.is-team-v08 \.header\{/);
 assert.match(css,/\.premium-alive\.is-team-v08 main\{background:var\(--tu-paper\)/);
 assert.match(css,/\.premium-alive\.is-team-v08 \.team-v08-hero\{[\s\S]*?background:#E3002B/);
 assert.match(css,/\.premium-alive\.is-team-v08 \.bottom\{/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/\.premium-alive\.is-team-v08 \.spotify-link img\{[\s\S]*?brightness\(0\)/);
});
test('Existing Team functions and simulated role/status language remain intact',()=>{
 const js=source('rallypoint.js');
 for(const token of ['Confirm serving',"Can't make it",'Request coverage','Withdraw request','team-preview','team-empty-try','TEAM CONVERSATION','AUTHORIZED TEAM LEADER','Welcome Team'])
  assert.ok(js.includes(token),'Missing original Team contract: '+token);
 assert.match(js,/teamStatus==='confirmed'/);
 assert.match(js,/teamStatus==='declined'/);
 assert.match(js,/data-action="pane" data-area="team"/);
 assert.match(js,/fictional team/);
});
test('Teams includes no new routes, external URLs, auth connectors or media dependencies',()=>{
 assert.doesNotMatch(css,/url\(|@import|@font-face/);
 assert.doesNotMatch(css,/planningcenteronline|https?:\/\//);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/focus-visible/);
 assert.match(css,/min-height:44px/);
 assert.match(css,/min-height:48px/);
});
