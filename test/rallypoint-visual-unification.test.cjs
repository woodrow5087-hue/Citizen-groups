'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {restoreStateSource}=require('./helpers/s9br-state-source.cjs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const css=source('rallypoint-visual-unification.css');
const html=source('index.html');
const build=source('scripts/build.cjs');

/* Exact Git blob hashes of the already approved Develop PR #90 baseline.
 * A visual-only refinement must not modify any of these modules, even if a
 * later Codex pass tries to "clean up" app logic while changing styles. */
const frozen=Object.freeze({
 /* Connect usability v2: approved openConnect keyboard viewport change; pin remains exact. */
 /* Groups v2 isolated overview routing + preserved Connect and other tab behavior. */
 /* Companion Care flow: scoped UI insertion and explicit action only; no other tab redesign. */
 /* M5B: scoped, read-only Unified Focus ranking within existing Today Priority Board. */
 /* M6: controlled member context read and explicit action transitions; old tabs retain same surfaces. */
 /* Leadership demo: receipt, scoped leader request, and portrait return navigation. */
 /* S8D: shared pure intelligence assembly; existing rendering and DOM effects retained. */
 /* S9B-R2: only launch policy extracted; original controller reconstruction is tested in s9br-launch-mode.test.cjs. */
 'rallypoint.js':'26ab4ffcec2941d2f6b15df051265246a7e0f381',
 'rally-one-launch-mode.js':'9609c528b6d2364ad8cb5cbe464937153a4988df',
 'rallypoint-phase1.css':'db0bbe26f995fbde1e35a1e4c3a5ef3a6d799833',
 'rallypoint-groups-v07.css':'513c03013506bdaa0d9a99ced6c4d455fd15c386',
 'rallypoint-team-v08.css':'dff9ce0ef59d02a4752bf740407b08324f0459ac',
 'rallypoint-read-v09.css':'bf6b7713522365d607c934fd3af7477681f6c74e',
 'rallypoint-premium-alive.css':'c3187de629017039075f24586e77199e9ff68856',
 'rallypoint-smart-dashboard.css':'d3ffe64f0ee3573219cc868b2a7dd6c70adc8d87',
 'rallypoint-priority-board.css':'2ec12e300ed7d438af53d995fdcbc0462cf3db18',
 'rallypoint-personal-companion.js':'d8527afdcd9cf43c82fe3237407b21d67a1b8c5a',
 'rallypoint-today-fluid.css':'ec805ff013396ebb0d3561fb46e4f5d194317344',
 'rallypoint-wednesday-integrated.css':'5ef59a5668c0040ed57667888846cafa5abcc403'
});
function gitBlobSha(name){
 const bytes=name==='rallypoint.js'?Buffer.from(restoreStateSource()):fs.readFileSync(path.join(root,name));
 return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
}

test('Groups CSS loads last, exactly once, and build includes it without new JS entries',()=>{
 const target='rallypoint-visual-unification.css';
 assert.equal((html.match(/href="rallypoint-visual-unification\.css"/g)||[]).length,1);
 assert.ok(html.indexOf('href="'+target+'"')>html.indexOf('href="rallypoint-personal-companion.css"'));
 assert.ok(build.includes("'"+target+"'"));
 assert.ok(build.includes("'rallypoint-groups-v07.css'"));
 assert.ok(!/pilot-journey-lab|pilot\/planning-center/.test(build));
});
test('Every CSS selector is anchored to the Groups route, never global/Today/Team/Read',()=>{
 // Remove comments, then treat each CSS block opening as a selector or @media.
 const src=css.replace(/\/\*[\s\S]*?\*\//g,'');
 let candidate='',rules=0,atRules=0;
 for(const char of src){
  if(char==='{'){
   const header=candidate.trim();candidate='';
   if(header.startsWith('@media')){atRules++;continue}
   for(const sel of header.split(',')){
    const item=sel.trim();
    assert.ok(item.startsWith('.premium-alive.is-groups-v07'), 'Unscoped selector: '+item);
    assert.doesNotMatch(item,/\.is-(?:f09-board|f09-dashboard|team-v08|read-v09|fluid-today)/);
   }
   rules++;
  }else if(char==='}'){
   candidate='';
  }else candidate+=char;
 }
 assert.ok(rules>=35,'Expected a real visual pass, not a placeholder');
 assert.ok(atRules>=2,'Narrow-width and reduced-motion coverage required');
 assert.ok(!css.includes('@import'),'No external font/CSS dependencies');
 assert.ok(!css.includes('!important'),'Do not override behavior flags or hide inaccessible content');
});
test('Frozen Today/Team/Read/Games/navigation and provider bridge are byte-for-byte unchanged',()=>{
 for(const [name,sha] of Object.entries(frozen))
  assert.equal(gitBlobSha(name),sha,'Unapproved change to '+name);
});
test('Groups uses warm cream canvas and header, a light 4-tab dock and real member photo rail',()=>{
 assert.match(css,/\.premium-alive\.is-groups-v07 main\{background:var\(--gu-paper\)/);
 assert.match(css,/--gu-paper:#FDF7F1/);
 assert.match(css,/--gu-red:#E3002B/);
 assert.match(css,/\.premium-alive\.is-groups-v07 \.bottom\{/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/\.pa-people-rail--group/);
 assert.match(css,/\.group-discovery/);
 assert.match(css,/\.group-pulse-route:nth-child\(3\)/);
 assert.match(css,/\.is-leader-hybrid \.group-community-hero/);
});
test('The approved app still owns four real destinations and fake state, not new API/auth wiring',()=>{
 const js=source('rallypoint.js');
 assert.match(js,/\['today','Today','home'\]/);
 assert.match(js,/\['group','Groups','group'\]/);
 assert.match(js,/\['team','Team','team'\]/);
 assert.match(js,/\['read','Read','read'\]/);
 assert.match(js,/is-f09-board',f09Board&&s\.view==='today'/);
 assert.match(js,/is-groups-v07',s\.view==='group'/);
 assert.ok(!/planningcenteronline\.com|api\/member\/next-gathering/.test(html));
});
test('Action touch targets, focused state and reduced-motion coverage survive the visual pass',()=>{
 assert.match(css,/min-height:44px/);
 assert.match(css,/min-height:48px/);
 assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/\.group-pulse-route/);
});
