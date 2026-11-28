/* Additive Signature S1/S2 gate. Existing engines and protected suites remain
 * authoritative; these are candidate captures, never replacement baselines. */
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

const base=process.argv[2];assert.ok(base,'Pass an independently built/deployed preview origin');
const engine=process.env.CONVERGENCE_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch({headless:true,...(engine===webkit&&process.env.RALLY_WEBKIT_EXECUTABLE?{executablePath:process.env.RALLY_WEBKIT_EXECUTABLE}:{})});
const out='test-results/signature',results=[];await mkdir(out,{recursive:true});
const source=process.env.SIGNATURE_SOURCE||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const sourceStatus=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
const originalKeys=['rallypoint-phase1-2026','rallypoint-today-ui-v1','rallypoint-wednesday-chat-lab-v1','rallypoint-blank-battle-v1'];
const nextFrames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const raw=(page,key)=>page.evaluate(key=>localStorage.getItem(key),key);
async function overflow(page,label){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' horizontal overflow');}
async function axe(page,label){
 const report=await new AxeBuilder({page}).analyze();
 assert.deepEqual(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],label+' accessibility');
}
async function capture(page,name){await page.screenshot({path:out+'/'+engine.name()+'-'+name+'.png',fullPage:true,animations:'disabled'});}
async function scenario(page,name){
 if(await page.locator('#preview-tools').getAttribute('open')===null)await page.locator('#preview-tools>summary').click();
 if(await page.locator('#scenario').inputValue()!==name)await page.locator('#scenario').selectOption(name);
 else await page.locator('#preview-tools>summary').click();
 await page.locator('.signature-today .greeting h1').waitFor();
}
async function today(page){await page.locator('#primary-nav [data-route=today]').click();await page.locator('.signature-today').waitFor();}
async function currentOriginals(page){return page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),originalKeys);}
async function closeMemberDialog(page){
 await page.evaluate(()=>{window.__signatureMemberClosed=false;document.getElementById('member-dialog').addEventListener('close',()=>{window.__signatureMemberClosed=true;},{once:true});});
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>window.__signatureMemberClosed===true);
}

// Instrument every native Storage method/length for the gallery only. Sentinels
// are written before instrumentation, then inspected through the original API.
function auditGalleryStorage(){
 const proto=Storage.prototype,methods={};
 for(const name of ['getItem','setItem','removeItem','clear','key'])methods[name]=proto[name];
 const length=Object.getOwnPropertyDescriptor(proto,'length');
 methods.setItem.call(localStorage,'rally-one-foundation2-v1:connected:primary','unchanged-gallery-sentinel');
 methods.setItem.call(sessionStorage,'rally-one-foundation2-v1:selected-scenario','unchanged-gallery-scenario');
 window.__signatureStorageCalls=[];
 for(const name of Object.keys(methods))proto[name]=function(...args){window.__signatureStorageCalls.push({method:name,key:args[0]??null});return methods[name].apply(this,args);};
 if(length?.get)Object.defineProperty(proto,'length',{...length,get(){window.__signatureStorageCalls.push({method:'length'});return length.get.call(this);}});
 window.__signatureStorageSentinels=()=>[methods.getItem.call(localStorage,'rally-one-foundation2-v1:connected:primary'),methods.getItem.call(sessionStorage,'rally-one-foundation2-v1:selected-scenario')];
}

try{
 for(const width of [320,375,390,430]){
  const context=await browser.newContext({viewport:{width,height:width===390?500:760},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'America/Denver'});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00Z'));
  await page.goto(new URL('/foundation2/',base).href);await page.locator('.signature-today').waitFor();
  const originals=await currentOriginals(page),cursorBefore=await raw(page,'rally-one-foundation2-v1:connected:conversation');
  assert.equal(await page.locator('#primary-nav a').count(),4);
  assert.equal(await page.locator('.header-connect').count(),1);
  assert.equal(await page.locator('body.signature-mode .shell.signature-shell').count(),1);
  assert.ok(await page.locator('.sig-stack-layer').count()>=2);
  assert.ok(await page.locator('.sig-stack-layer').evaluateAll(layers=>layers.every(e=>e.getAttribute('aria-hidden')==='true')));
  await overflow(page,'Today '+width);await axe(page,'Today '+width);await capture(page,width+'-today-pending');
  // Canonical responses must be acknowledged and event-bound. Optional unread
  // data is deliberately left untouched through the real Today actions.
  for(const command of ['serve','rsvp'])await page.locator('[data-command='+command+']').click();
  assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.');
  assert.equal(await page.locator('.sig-completion--complete').count(),1);
  assert.equal(await page.locator('[data-command]').count(),0);
  assert.match(await page.locator('a.utility[href="?screen=connect"]').innerText(),/3 new group messages/);
  assert.equal(await raw(page,'rally-one-foundation2-v1:connected:conversation'),cursorBefore,'Responding must not mark messages read');
  const saved=JSON.parse(await raw(page,'rally-one-foundation2-v1:connected:primary'));
  assert.equal(Object.keys(saved.eventResponses.records).length,2,'Both responses require explicit dated records');
  assert.ok(Object.values(saved.eventResponses.records).every(r=>r.kind==='group'?r.value==='going':r.value==='confirmed'));
  await page.reload();await page.locator('.sig-completion--complete').waitFor();
  await capture(page,width+'-today-all-set');
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');await nextFrames(page);
  await overflow(page,'Today 200% '+width);await axe(page,'Today 200% '+width);
  const labels=await page.locator('#primary-nav a>span').evaluateAll(nodes=>nodes.map(node=>{const range=document.createRange();range.selectNodeContents(node);return {text:node.textContent,lines:range.getClientRects().length,overflow:node.scrollWidth>node.clientWidth+1};}));
  assert.ok(labels.every(label=>label.lines===1&&!label.overflow),'Enlarged navigation keeps each destination name whole: '+JSON.stringify(labels));
  assert.equal(await page.locator('#ask-rally').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'Enlarged Ask label fits its utility control');
  assert.equal(await page.locator('.sig-today-cover>div').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(36, 37, 37)','Editorial title must retain an ink backing over the photograph');
  await capture(page,width+'-today-enlarged');
  await page.evaluate(()=>document.documentElement.style.fontSize='');
  // Ask/profile keep their existing owner and return target after a redraw.
  await page.locator('[data-ask-entry]').focus();await page.keyboard.press('Enter');
  await page.locator('#member-dialog[open]').waitFor();await closeMemberDialog(page);
  await page.waitForFunction(()=>document.activeElement?.dataset.returnFocus==='today-ask');
  await page.locator('[data-profile-entry]').focus();await page.keyboard.press('Enter');
  await page.locator('#member-profile').waitFor();await closeMemberDialog(page);
  await page.waitForFunction(()=>document.activeElement?.dataset.returnFocus==='today-profile');
  const controls=page.locator('.sig-community-tools details>summary');
  if(await controls.count()){
   await controls.focus();await page.keyboard.press('Enter');await page.keyboard.press('Enter');
   assert.equal(await controls.evaluate(e=>e===document.activeElement),true);
  }
  // The Signature shell is Today-only; other destinations keep existing UI,
  // app engines and nav ownership. Native Back restores the named agenda origin.
  const priorPrimary=await raw(page,'rally-one-foundation2-v1:connected:primary');
  for(const [route,selector] of [['groups','.group-page'],['team','.team-page'],['read','.read-page']]){
   await page.locator('#primary-nav [data-route='+route+']').click();await page.locator(selector).waitFor();
   assert.equal(await page.locator('body.signature-mode,.shell.signature-shell,.signature-today').count(),0,route+' must not inherit the Today visual rollout');
   assert.equal(await page.locator('#primary-nav a').count(),4);assert.equal(await page.locator('.header-connect').count(),1);
   if(route==='read')assert.equal(await page.locator('.read-game-link').count(),3,'Existing game entry owners remain reachable');
   await today(page);
  }
  await page.locator('.header-connect').click();await page.frameLocator('#premium-connect').locator('body.connect-member').waitFor();
  assert.equal(await page.locator('body.signature-mode,.shell.signature-shell').count(),0);
  await page.locator('.connect-return').click();await page.locator('.signature-today').waitFor();
  assert.equal(await page.locator('.header-connect').evaluate(e=>e===document.activeElement),true);
  assert.equal(await raw(page,'rally-one-foundation2-v1:connected:primary'),priorPrimary,'Navigation must not save another member action');
  for(const role of ['visitor','leader','unavailable','group-denied','serving-outage']){
   await scenario(page,role);await overflow(page,role+' Today '+width);
   if(role==='leader'){
    assert.equal(await page.locator('[data-command=leader]').count(),2);
    assert.equal(await page.locator('[data-rel-entry=leader]').count(),1);
   }else{
    assert.equal(await page.locator('.sig-completion--complete').count(),0,role+' is not a completed member');
    if(role==='visitor'){
     assert.equal(await page.locator('[data-command],[data-rel-contact],[data-rel-entry=leader],[data-rel-entry=prayer]').count(),0);
     await axe(page,'Visitor Today '+width);
    }
    if(role==='unavailable')assert.match(await page.locator('.utility[role=status]').innerText(),/Conversation unavailable/);
    if(['group-denied','serving-outage'].includes(role))assert.equal(await page.locator('[data-command]').count(),0,'Provider sample remains read-only');
   }
  }
  await scenario(page,'team');
  const malformed=await page.evaluate(()=>{const s=RallyAppState.initialize(()=>null,true);s.eventResponses={version:1,records:{bad:{kind:'team'}}};const raw=JSON.stringify(s);localStorage.setItem('rally-one-foundation2-v1:team:primary',raw);return raw;});
  await page.reload();await page.locator('.signature-today').waitFor();
  assert.equal(await page.locator('.sig-completion--complete').count(),0);
  assert.equal(await raw(page,'rally-one-foundation2-v1:team:primary'),malformed);
  assert.match(await page.locator('.signature-today').innerText(),/unavailable|review/i);
  await nextFrames(page);
  assert.deepEqual(await page.evaluate(()=>document.getAnimations().filter(a=>['running','pending'].includes(a.playState)).map(a=>a.effect?.target?.className)),[],'Reduced motion must suppress current native effects');
  assert.deepEqual(await currentOriginals(page),originals);assert.deepEqual(errors,[]);
  results.push({source,engine:engine.name(),width,surface:'today',responses:'passed',focus:'passed',roles:'passed',unknown:'passed',reducedMotion:true,pageErrors:errors});
  await context.close();

  const galleryContext=await browser.newContext({viewport:{width,height:width===390?500:760},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'America/Denver'});
  await galleryContext.addInitScript(auditGalleryStorage);
  const gallery=await galleryContext.newPage(),galleryErrors=[];gallery.on('pageerror',error=>galleryErrors.push(error.message));
  await gallery.goto(new URL('/foundation2/signature-gallery.html',base).href);await gallery.locator('[data-sig-action=stack-next]').waitFor();
  await overflow(gallery,'Gallery '+width);await axe(gallery,'Gallery '+width);await capture(gallery,width+'-gallery');
  await gallery.locator('[data-sig-action=stack-next]').focus();await gallery.keyboard.press('Enter');
  assert.match(await gallery.locator('#stack-caption').innerText(),/Specimen 2 of 3/);
  assert.equal(await gallery.locator('[data-sig-action=stack-next]').evaluate(e=>e===document.activeElement),true);
  await gallery.locator('[data-sig-action=segment][data-sig-value=serving]').focus();await gallery.keyboard.press('Space');
  assert.equal(await gallery.locator('[data-sig-action=segment][aria-pressed=true]').count(),1);
  assert.match(await gallery.locator('#segment-detail').innerText(),/Serving/);
  await gallery.locator('[data-sig-action=community]').click();
  assert.equal(await gallery.locator('#community-controls').isVisible(),true);
  await gallery.locator('[data-sig-action=person]').first().click();await gallery.locator('#gallery-dialog[open]').waitFor();
  await gallery.keyboard.press('Escape');
  assert.equal(await gallery.locator('[data-sig-action=person]').first().evaluate(e=>e===document.activeElement),true);
  await gallery.locator('[data-sig-action=week-next]').click();
  assert.equal(await gallery.locator('.gallery-empty-agenda').count(),1);
  await gallery.locator('[data-sig-action=week-prev]').click();
  assert.equal(await gallery.locator('.gallery-agenda article').count(),2);
  await gallery.locator('[data-sig-action=date]').first().click();assert.equal(await gallery.locator('[data-sig-action=date][aria-pressed=true]').count(),1);
  assert.equal(await gallery.locator('#completion-output .sig-completion--complete').count(),0);
  await gallery.locator('[data-sig-action=rsvp][data-sig-value=going]').click();await gallery.locator('[data-sig-action=commitment]').click();
  assert.equal(await gallery.locator('#completion-output .sig-completion--complete').count(),1);
  await gallery.locator('[data-sig-action=reset-choices]').click();assert.equal(await gallery.locator('#completion-output .sig-completion--complete').count(),0);
  await gallery.locator('[data-sig-action=nav][data-sig-value=read]').click();
  assert.equal(await gallery.locator('.gallery-nav [aria-current=page]').count(),1);
  assert.equal(await gallery.locator('.gallery-nav button').count(),4);
  await gallery.evaluate(()=>document.documentElement.style.fontSize='200%');await nextFrames(gallery);
  await overflow(gallery,'Gallery 200% '+width);await axe(gallery,'Gallery 200% '+width);
  assert.equal(await gallery.locator('.sig-action').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s','Gallery reduced-motion press state');
  await capture(gallery,width+'-gallery-enlarged');
  assert.deepEqual(await gallery.evaluate(()=>window.__signatureStorageCalls),[],'Gallery must not read/write or enumerate any application storage');
  assert.deepEqual(await gallery.evaluate(()=>window.__signatureStorageSentinels()),['unchanged-gallery-sentinel','unchanged-gallery-scenario']);
  assert.deepEqual(galleryErrors,[]);
  results.push({source,engine:engine.name(),width,surface:'gallery',storage:'zero native reads/writes/enumeration',interactions:'passed',enlarged:true,axe:'passed',pageErrors:galleryErrors});
  await galleryContext.close();
  console.log('SIGNATURE S1/S2 passed '+engine.name()+' '+width);
 }
}finally{await browser.close();await writeFile(out+'/results-'+engine.name()+'.json',JSON.stringify({source,sourceStatus,attribution:sourceStatus?'Working-tree candidate based on source SHA':'Clean exact source SHA',base,engine:engine.name(),results},null,2));}
