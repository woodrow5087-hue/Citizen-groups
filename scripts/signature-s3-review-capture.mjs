// S3 creative review media, never approved pixel references. S1/S2 review905
// remains unaccepted. Actual states use existing UI; pre-selection studies
// retain their original working-tree attribution and verified exploration SHA.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile,readdir,readFile,copyFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,extname,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const origins=process.argv.slice(2).filter(value=>!value.startsWith('--'));
const before=origins[0]||'http://127.0.0.1:8053';
const after=origins[1]||'http://127.0.0.1:8052';
const out=resolve(process.env.SIGNATURE_REVIEW_OUT||'test-results/signature-s3-review');
const source=process.env.SIGNATURE_SOURCE||'working S3 candidate; not yet pinned';
const baseline='905f7da15d8039c53ce47f42f2d2392125c41334';
const exploration='0fd5ca6d7ee06e6e24ab0c2f05ed5908d0b52c19';
const studiesDir=resolve(process.env.SIGNATURE_S3_STUDIES_DIR||'engineering/reference-evidence/signature-s3-studies');
const clock='2026-11-26T12:00:00Z',timezone='America/Denver';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
await mkdir(out,{recursive:true});await mkdir(out+'/motion',{recursive:true});
const manifest={status:'S3_CANDIDATE_CREATIVE_REVIEW_NOT_AN_APPROVED_BASELINE',before:{source:baseline,pr:160,origin:before,creativeAcceptance:'not granted',physicalAcceptance:'pending'},after:{source,origin:after,creativeAcceptance:'pending',sourceClaim:/^[a-f0-9]{40}$/i.test(source)?'Declared exact candidate SHA; deployment metadata and served-byte equivalence require independent verification.':'Working candidate, not a final exact-head capture.'},selection:{study:'B · The Connected Day',explorationCommit:exploration,authority:'implementation selection after both studies were rendered; owner creative approval remains pending',rationale:'Unified cover, prominent people and an interlocking day sheet address repeated vertical sections while retaining two required responses and compact dates.'},clock,timezone,personalization:{name:'Jordan',campus:'north',source:'actual local profile dialog, no permission handoff'},captures:[],recordings:[],motionStates:[],studies:[],references:[]};
try{manifest.gitHeadAtCapture=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();manifest.sourceStatus=execFileSync('git',['status','--porcelain'],{encoding:'utf8'});}catch{/* Standalone review packaging does not require Git. */}
manifest.localFilesAtCapture=[];
for(const file of ['foundation2/today-view.js','foundation2/signature-today.css','foundation2/signature-compositions.css','foundation2/signature-gallery.js','foundation2/signature-gallery.css','foundation2/motion.js','foundation2/app.js', 'scripts/signature-s3-review-capture.mjs']){
 try{const bytes=await readFile(file);manifest.localFilesAtCapture.push({file,sha256:digest(bytes),bytes:bytes.length,meaning:'Local checkout metadata; not proof of the remote deployed bytes.'});}catch{/* Packaging can run without a complete source checkout. */}
}
// Preserve original capture provenance rather than relabel screenshots as if
// captured at the later exploration commit. Source hashes prove correspondence.
async function preserveStudies(){
 const original=JSON.parse(await readFile(studiesDir+'/study-provenance.json','utf8'));
 const checksums=new Map((await readFile(studiesDir+'/STUDY-SHA256SUMS.txt','utf8')).trim().split('\n').map(line=>{const split=line.indexOf('  ');return [line.slice(split+2),line.slice(0,split)];}));
 const matches=[];
 for(const [file,expected] of Object.entries(original.sourceHashes)){
  const bytes=execFileSync('git',['show',exploration+':'+file]);assert.equal(digest(bytes),expected,'Pre-selection '+file+' must match the recorded exploration commit');matches.push({file,sha256:expected});
 }
 await mkdir(out+'/preselection',{recursive:true});
 for(const name of ['study-provenance.json','STUDY-SHA256SUMS.txt','native-extra-checks.json','study-comparison.html']){
  const bytes=await readFile(studiesDir+'/'+name);if(checksums.has(name))assert.equal(digest(bytes),checksums.get(name),name+' preserved hash');await writeFile(out+'/preselection/'+name,bytes);
 }
 for(const mode of ['a','b'])for(const state of ['390-pending','390-one-response','390-all-set','320-200-pending']){
  const name='study-'+mode+'-'+state+'.png',bytes=await readFile(studiesDir+'/'+name);assert.equal(digest(bytes),checksums.get(name),'Original pre-selection image hash '+name);await writeFile(out+'/preselection/'+name,bytes);
  manifest.studies.push({study:mode.toUpperCase(),state,file:'preselection/'+name,sha256:digest(bytes),kind:'preserved pre-selection capture',capturedAtHead:original.gitHeadAtCapture,workingSourceAtCapture:original.workingSource,verifiedSourceCommit:exploration,warning:'Captured from the then-working gallery before selection; source-file hashes match exploration commit. This is not a capture made at the final S3 runtime.'});
 }
 manifest.preselection={originalProvenance:'preselection/study-provenance.json',originalHashInventory:'preselection/STUDY-SHA256SUMS.txt',sourceFileMatches:matches,referenceAvailability:original.reference};
}

const boardMap=[
 {title:'Rally Signature · Concept 07',mapping:'Angled and split-color actions; focused Smart Stack layering; editorial Today composition and consistent Ask Rally access.'},
 {title:'Human Connection',mapping:'Overlapping portrait circles; photographic/editorial seams; human-led community controls and explicit RSVP states. Presence/attendance illustrations do not become app data.'},
 {title:'Component Library',mapping:'Sculptural layers; integrated date/agenda anatomy; circular utilities, completion geometry and a distinctive navigation language. Completion consumes actual responses only.'},
 {title:'Design System',mapping:'Ivory/charcoal/Rally-red tokens; expressive serif with functional sans; angled actions, compact calendars, selectors, portrait controls and four-destination navigation.'}
];
if(process.env.SIGNATURE_REFERENCE_DIR){
 const dir=resolve(process.env.SIGNATURE_REFERENCE_DIR);await mkdir(out+'/references',{recursive:true});
 const names=(await readdir(dir)).filter(n=>/\.(png|jpe?g|webp)$/i.test(n)).sort();
 for(const [index,name] of names.entries()){
  const bytes=await readFile(resolve(dir,name));const target='references/board-'+String(index+1).padStart(2,'0')+extname(name).toLowerCase();
  await copyFile(resolve(dir,name),resolve(out,target));
  manifest.references.push({file:target,originalFileName:basename(name),sha256:digest(bytes),bytes:bytes.length,status:'Owner-supplied original copied byte-for-byte; no generation, redraw or approximation'});
 }
}
manifest.referenceAvailability=manifest.references.length?'Original supplied files retained unchanged; textual board mapping is descriptive, not a replacement image.':'The four original board PNGs are owner-deferred on the owner’s iPhone and will be supplied separately. Exact reference-image embedding remains deferred; visible conversation boards guide the work. No image is generated, redrawn or approximated.';

if(process.argv.includes('--verify-studies')){
 await preserveStudies();await writeFile(out+'/study-source-verification.json',JSON.stringify(manifest,null,2));
 console.log('Verified8 preserved study screenshots and3 source hashes against exploration '+exploration+'. This is source verification only, not a new Today capture.');process.exit(0);
}
const browser=await chromium.launch({headless:true});
const framePause=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function settle(page){
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode().catch(()=>null)));});await framePause(page);
}
async function scenario(page,role){
 const tools=page.locator('#preview-tools');if(await tools.getAttribute('open')===null)await tools.locator(':scope > summary').click();
 if(await page.locator('#scenario').inputValue()!==role)await page.locator('#scenario').selectOption(role);
 else await tools.locator(':scope > summary').click();
 await page.locator('.greeting h1').waitFor();
}
async function personalize(page){
 await page.locator('[data-profile-entry]').click();await page.locator('#member-profile').waitFor();
 await page.locator('#member-profile input[name=name]').fill('Jordan');
 await page.locator('#member-profile select[name=campus]').selectOption('north');
 await page.getByRole('button',{name:'Save local profile',exact:true}).click();
 await page.locator('#member-dialog').waitFor({state:'hidden'});await page.locator('.member-context').waitFor();
 assert.match(await page.locator('.member-context').innerText(),/Jordan/,'Matched personalization must use the actual profile owner');
}
async function openToday(page,base,role){
 await page.clock.setFixedTime(new Date(clock));await page.goto(new URL('/foundation2/',base).href);
 await page.locator('.greeting h1').waitFor();await scenario(page,role);await personalize(page);await settle(page);
}
async function actualAllSet(page){
 for(const command of ['serve','rsvp']){
  const control=page.locator('[data-command='+command+']');if(await control.count())await control.click();
 }
 await framePause(page);assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.','All Set must follow actual saved responses');
}
async function capture(page,file,details){
 await settle(page);await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:out+'/'+file+'.png',fullPage:false,animations:'disabled'});
 await page.screenshot({path:out+'/'+file+'-full.png',fullPage:true,animations:'disabled'});
 const geometry=await page.locator('#today').evaluate(e=>({contentHeight:e.scrollHeight,priorityCount:e.querySelectorAll('article.priority').length,responseControls:e.querySelectorAll('[data-command]').length,heading:e.querySelector('.greeting h1')?.textContent||''}));
 manifest.captures.push({...details,file:file+'.png',fullFile:file+'-full.png',geometry});
}
const scenes=[
 {name:'member',role:'connected',width:390,height:844},
 {name:'group',role:'group',width:390,height:844},
 {name:'volunteer',role:'team',width:390,height:844},
 {name:'leader',role:'leader',width:390,height:844},
 {name:'visitor',role:'visitor',width:390,height:844},
 {name:'real-all-set',role:'connected',width:390,height:844,complete:true},
 {name:'member-320',role:'connected',width:320,height:700},
 {name:'member-430',role:'connected',width:430,height:844},
 {name:'member-320-enlarged',role:'connected',width:320,height:700,enlarged:true}
];
try{
 if(!process.argv.includes('--references-only')){
  await preserveStudies();
  for(const [side,base] of [['before',before],['after',after]]){
   for(const scene of scenes){
    const context=await browser.newContext({viewport:{width:scene.width,height:scene.height},isMobile:true,hasTouch:true,timezoneId:timezone,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    try{
     await openToday(page,base,scene.role);if(scene.complete)await actualAllSet(page);
     if(scene.enlarged)await page.evaluate(()=>document.documentElement.style.fontSize='200%');
     await capture(page,side+'-'+scene.name,{side,...scene,source:side==='before'?baseline:source});
     assert.deepEqual(errors,[],side+' '+scene.name+' page errors');console.log('Signature review captured '+side+' '+scene.name);
    }finally{await context.close();}
   }
  }
  // Standalone gallery captures never initialize an application controller.
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:844},timezoneId:timezone,reducedMotion:'reduce'});
   const page=await context.newPage();await page.goto(new URL('/foundation2/signature-gallery.html',after).href);await page.locator('#completion-output').waitFor();await settle(page);
   await page.screenshot({path:out+'/gallery-'+width+'.png',fullPage:true,animations:'disabled'});await context.close();
  }
  // Observe the native effects without replacing their keyframes/timing or
  // bypassing the existing classifier. Real buttons/receipts own transitions.
  {
   const recordDir=out+'/motion/raw-today';await mkdir(recordDir,{recursive:true});
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:timezone,reducedMotion:'no-preference',recordVideo:{dir:recordDir,size:{width:390,height:844}}});
   await context.addInitScript(()=>{
    window.__signatureReviewAnimations=[];const native=Element.prototype.animate;
    Element.prototype.animate=function(frames,options){window.__signatureReviewAnimations.push({at:performance.now(),taskId:this.getAttribute('data-motion-task'),className:String(this.className),frames,options});return native.apply(this,arguments);};
   });
   const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await openToday(page,after,'connected');await page.waitForTimeout(450);
   const people=page.locator('[data-return-focus=signature-people]');
   if(await people.count()){
    await people.click();await page.locator('.relational-dialog[open]').waitFor();await page.waitForTimeout(500);await page.keyboard.press('Escape');
    assert.equal(await people.evaluate(e=>e===document.activeElement),true,'People specimen returns to its real opener');
   }
   const portrait=page.locator('.faces .rel-circle').first();
   if(await portrait.count()){await portrait.click();await page.locator('.relational-dialog[open]').waitFor();await page.waitForTimeout(450);await page.keyboard.press('Escape');}
   const signatureAsk=page.locator('[data-ask-entry]').first(),ask=(await signatureAsk.count())?signatureAsk:page.locator('#ask-rally');
   await ask.click();await page.locator('#member-dialog[open]').waitFor();await page.waitForTimeout(500);await page.keyboard.press('Escape');
   assert.equal(await ask.evaluate(e=>e===document.activeElement),true,'Ask returns to its actual existing-owner entry control');
   await page.evaluate(()=>scrollTo(0,0));await framePause(page);
   const states=[];
   async function motionState(name){
    const observed=await page.locator('#today').evaluate(root=>({heading:root.querySelector('.greeting h1')?.textContent,taskIds:[...root.querySelectorAll('.priority[data-motion-task],.responsibility[data-motion-task]')].map(e=>e.getAttribute('data-motion-task')),primaryId:root.querySelector('.priority[data-motion-task]')?.getAttribute('data-motion-task')||null,receipt:root.querySelector('.receipt')?.textContent||'',optionalUnread:root.querySelector('.sig-comp-unread,.utility')?.textContent||''}));
    const file='motion-state-'+name+'.png';await page.screenshot({path:out+'/'+file,fullPage:false});states.push({name,file,...observed});manifest.motionStates.push({name,file,source,...observed});return observed;
   }
   const pending=await motionState('two-responses');assert.equal(pending.taskIds.length,2,'S3 normal recording begins with two canonical keyed tasks');
   const animationStart=await page.evaluate(()=>window.__signatureReviewAnimations.length);
   await page.locator('[data-command=serve]').click();await page.waitForTimeout(550);
   const one=await motionState('one-response');assert.equal(one.taskIds.length,1,'A real saved response removes only its canonical task');assert.notEqual(one.primaryId,pending.primaryId,'The actual remaining task is promoted');
   await page.locator('[data-command=rsvp]').click();await page.waitForTimeout(550);
   const complete=await motionState('all-set');assert.equal(complete.taskIds.length,0);assert.equal(complete.heading,'You’re all set.');
   assert.equal(one.optionalUnread,pending.optionalUnread,'A required response cannot consume optional unread');assert.equal(complete.optionalUnread,pending.optionalUnread,'All Set cannot consume optional unread');
   await actualAllSet(page);await page.locator('.greeting').scrollIntoViewIfNeeded();await page.waitForTimeout(800);
   const animations=(await page.evaluate(()=>window.__signatureReviewAnimations)).slice(animationStart);
   assert.ok(animations.some(effect=>effect.taskId===one.primaryId&&Number(effect.options?.duration)<=220&&JSON.stringify(effect.frames).includes('transform')),'Normal recording must observe the native keyed promotion');
   await writeFile(out+'/native-motion-audit.json',JSON.stringify({source,observation:'Native Element.animate is observed and delegates unchanged to the original implementation; real save receipts and canonical task IDs own motion.',states,animations},null,2));
   assert.deepEqual(errors,[]);const video=page.video(),raw=await video.path();await context.close();const file='motion/today-real-actions.webm';await video.saveAs(out+'/'+file);await unlink(raw);
   manifest.recordings.push({file,source,clock,timezone,viewport:'390x844',motion:'normal',nativeAudit:'native-motion-audit.json',actions:'Actual profile personalization, People/portrait/Ask and return; native canonical keyed2→1→All Set through real saved serving+RSVP commands. Setup included; no fake progress or external delivery.'});
  }
  {
   const recordDir=out+'/motion/raw-gallery';await mkdir(recordDir,{recursive:true});
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:timezone,reducedMotion:'no-preference',recordVideo:{dir:recordDir,size:{width:390,height:844}}});
   await context.addInitScript(()=>{window.__galleryStorageIO=[];const proto=Storage.prototype;for(const method of ['getItem','setItem','removeItem','clear','key']){const original=proto[method];proto[method]=function(...args){window.__galleryStorageIO.push(method);return original.apply(this,args);};}const length=Object.getOwnPropertyDescriptor(proto,'length');if(length?.get)Object.defineProperty(proto,'length',{...length,get(){window.__galleryStorageIO.push('length');return length.get.call(this);}});});
   const page=await context.newPage();await page.goto(new URL('/foundation2/signature-gallery.html',after).href);await page.locator('#completion-output').waitFor();await settle(page);
   for(const [study,mode] of [['a','brief'],['b','connected']]){
    await page.locator('[data-sig-action=composition-view][data-sig-value='+mode+']').click();
    const root=page.locator('[data-s3-study='+study+']');await root.evaluate(e=>e.scrollIntoView({block:'start'}));await page.waitForTimeout(600);
    assert.equal(await root.locator('[data-sig-action=composition-response]').count(),2);
    for(const [state,command] of [['one-response','serve'],['all-set','rsvp']]){
     await root.locator('[data-sig-action=composition-response][data-sig-value='+command+']').click();await page.waitForTimeout(600);
     assert.equal(await root.locator('.sig-comp-unread').innerText(),'3 new messages','Optional unread cannot become a completion obligation');
     if(state==='one-response')assert.equal(await root.locator('[data-sig-action=composition-response]').count(),1);else assert.equal(await root.locator('.sig-comp-allset').count(),1);
     const file='current-study-'+study+'-'+state+'.png';await root.screenshot({path:out+'/'+file});manifest.studies.push({study:study.toUpperCase(),state,file,source,kind:'current candidate gallery capture; distinct from preserved pre-selection evidence'});
    }
   }
   await page.locator('[data-sig-action=composition-view][data-sig-value=compare]').click();
   assert.deepEqual(await page.evaluate(()=>window.__galleryStorageIO),[],'Gallery recordings must not read/write application storage');
   await page.screenshot({path:out+'/gallery-interactive-state.png',fullPage:true,animations:'disabled'});
   const video=page.video(),raw=await video.path();await context.close();const file='motion/gallery-studies.webm';await video.saveAs(out+'/'+file);await unlink(raw);
   manifest.recordings.push({file,source,viewport:'390x844',motion:'normal',storageIO:[],actions:'Both distinct A/B gallery compositions, native explicit2→1→All Set sample response selections. Optional3unread unchanged. No app router/store or external communication.'});
  }
 }else{
  const previous=JSON.parse(await readFile(out+'/capture-manifest.json','utf8')),references=manifest.references,referenceAvailability=manifest.referenceAvailability;
  assert.equal(previous.before.source,baseline,'Reference-only packaging requires an existing S3 capture against exact S1/S2 review905');
  Object.assign(manifest,previous);manifest.references=references;manifest.referenceAvailability=referenceAvailability;
  manifest.referenceOnlyRepackage='Original capture source identities retained; this pass regenerates review documents and embeds original reference files only if supplied. No product recapture occurred.';
  manifest.reportRegeneration={mode:'references-only; report generation without product capture',localHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),localStatus:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}),scriptSha256:digest(await readFile('scripts/signature-s3-review-capture.mjs'))};
 }

 const referenceFor=scene=>{
  const reference=manifest.references[0];
  return reference?'<figure class="reference"><figcaption>Owner-supplied original · '+esc(reference.originalFileName)+'</figcaption><img src="'+reference.file+'" alt="Unmodified owner-supplied Rally Signature reference board"><p>Original bytes retained unchanged. Scaled to fit this comparison column. Files are sorted by original filename; the complete set is retained below.</p></figure>':'<aside class="reference-missing"><strong>Reference image unavailable for embedding</strong><p>'+esc(manifest.referenceAvailability)+'</p><p>'+esc(boardMap[0].mapping)+'</p><small>This text is a mapping note, not a recreated board.</small></aside>';
 };
 function reviewDocument(){
  const style=`body{margin:32px;background:#f4eee3;color:#222321;font:16px/1.55 system-ui,sans-serif}h1,h2{line-height:1.15;letter-spacing:-.035em}h1{font-family:Georgia,serif;font-size:38px;font-weight:500}h2{font-size:23px}a{color:#ae172b;text-underline-offset:3px}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:750}.notice{border-left:4px solid #df272b;padding:10px 16px;background:#fff9f0;max-width:1100px}.overview,.triptych,.study-pair,.full-pair{display:grid;gap:20px;align-items:start}.overview{grid-template-columns:repeat(4,minmax(0,1fr))}.triptych{grid-template-columns:repeat(3,minmax(0,1fr))}.study-pair,.full-pair{grid-template-columns:repeat(2,minmax(0,1fr))}figure{margin:0;min-width:0}figcaption{font-size:13px;font-weight:750;margin:0 0 10px}img{width:100%;height:auto;display:block}section{margin:42px 0;padding-top:24px;border-top:1px solid #bbaa98}figure p,.reference-missing,.study-note{font-size:13px;line-height:1.65}.reference-missing{padding:20px;background:#eee1d0;border:1px solid #d2bfa9}.reference-missing strong{font-size:18px;display:block}.full-comparison{margin-top:24px}.full-comparison summary{cursor:pointer;min-height:44px;padding:10px 0;font-weight:700}.board-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.sources{font-size:12px;overflow-wrap:anywhere}.motion-links{display:flex;flex-wrap:wrap;gap:18px}.mapping{padding:0;list-style:none;display:grid;gap:16px}.mapping li{border-left:3px solid #df272b;padding-left:16px}.mapping strong{display:block}.reference-deferred{font-size:12px;color:#62594f}.gallery-links{display:flex;gap:18px;flex-wrap:wrap}@media(max-width:800px){body{margin:18px}.overview,.triptych,.study-pair,.full-pair,.board-grid{grid-template-columns:1fr}}@media print{body{margin:0;background:white;color:#222321;font-size:12px}h1{font-size:28px;margin:8px 0}h2{font-size:21px;margin:0 0 8px}section{break-before:page;break-inside:avoid;margin:0;padding:0;border:0}.overview{gap:10px}.overview img{max-height:183mm;object-fit:contain;object-position:top}.overview figcaption{font-size:10px;line-height:1.4;min-height:11mm}.overview figure p{font-size:9px;line-height:1.4}.sources,.reference-deferred{font-size:10px;line-height:1.4;margin:6px 0}.notice{padding:7px 12px;margin:8px 0}.triptych,.study-pair{gap:12px}.triptych img,.study-pair img{max-height:224mm;object-fit:contain;object-position:top}.gallery-current-section .study-pair img{max-height:190mm}.triptych figcaption,.study-pair figcaption{font-size:11px}.reference-missing{padding:12px}.full-comparison{display:none}.motion-links{display:block}.board-grid img{max-height:112mm;object-fit:contain;object-position:top}}`;
  const figure=(file,title,alt)=>'<figure><figcaption>'+title+'</figcaption><img src="'+file+'" alt="'+esc(alt)+'"></figure>';
  const overview='<p class="eyebrow">Rally Signature · S3 composition candidate</p><h1>One day. A more connected composition.</h1><p class="notice">Candidate creative review only. S1/S2 and S3 creative approval, targeted physical acceptance and existing promotion blockers remain open.</p><p class="sources">S1/S2 review: '+baseline+' / PR160 · Integrated S3: '+esc(manifest.after.source)+'<br>Fixed '+clock+' / '+timezone+' · Fictional Jordan / North Campus · A/B source files verified to exploration '+exploration+'</p><div class="overview">'+figure('before-member.png','S1/S2 review905<br>Actual connected member','Actual S1/S2 connected Today')+figure('preselection/study-a-390-pending.png','A · The Folded Brief<br>Preserved pre-selection study','Preserved pre-selection Folded Brief study')+figure('preselection/study-b-390-pending.png','B · The Connected Day<br>Selected for implementation','Preserved pre-selection Connected Day study')+figure('after-member.png','Integrated S3 candidate<br>Actual shared member context','Actual integrated S3 connected Today')+'</div><p class="reference-deferred">'+esc(manifest.referenceAvailability)+'</p><p class="study-note">A/B are explicitly fictional, ephemeral studies captured before selection from a then-working gallery. Their source hashes match exploration0fd5ca6; they are not final-runtime screenshots. Integrated Today retains actual app state/permissions and authentic campus photography.</p>';
  const paired=scenes.map(scene=>'<section><h2>'+esc(scene.name.replaceAll('-',' '))+'</h2><p>'+scene.width+' × '+scene.height+(scene.enlarged?' ·200% text':'')+' · '+esc(scene.role)+(scene.complete?' · real saved serving and RSVP responses':'')+'</p><div class="triptych">'+figure('before-'+scene.name+'.png','S1/S2 review905 / PR160<br>Creative/physical acceptance pending','Actual S1/S2 '+scene.name+' Today')+referenceFor(scene)+figure('after-'+scene.name+'.png','Integrated S3 candidate<br>Owner creative review pending','Integrated S3 '+scene.name+' Today')+'</div><details class="full-comparison"><summary>Inspect full-height S1/S2 / S3 captures</summary><div class="full-pair"><img src="before-'+scene.name+'-full.png" alt="Full S1/S2 '+esc(scene.name)+'"><img src="after-'+scene.name+'-full.png" alt="Full S3 '+esc(scene.name)+'"></div></details></section>').join('');
  const studyPages=[['390-pending','Two required responses'],['390-one-response','One required response'],['390-all-set','All Set from both explicit choices'],['320-200-pending','320px /200% text reflow']].map(([state,label])=>'<section><h2>Before selection · '+label+'</h2><p class="study-note">Matched fictional facts: Jordan / North; Welcome Team Sunday Nov29; Wednesday Group Dec2; Anna, Jess and Marcus;3 optional messages. Original capture attribution is preserved in preselection/study-provenance.json. Neither study is owner-approved.</p><div class="study-pair">'+figure('preselection/study-a-'+state+'.png','A · The Folded Brief<br>Ivory editorial page / task-first folio','Pre-selection study A '+label)+figure('preselection/study-b-'+state+'.png','B · The Connected Day<br>Charcoal photo cover / people-first day sheet','Pre-selection study B '+label)+'</div></section>').join('');
  const gallery='<section class="gallery-current-section"><h2>Actual interactions and the working gallery</h2><p class="study-note">Native Today commands and canonical keyed task identities drive the actual2→1→All Set recording. Both gallery studies use only local explicit sample choices, with3 optional unread unchanged and zero Storage IO. Videos show automation on Chromium; they do not grant physical Safari/VoiceOver acceptance.</p><div class="motion-links"><a href="motion/today-real-actions.webm">Today · actual keyed motion and existing People/profile/Ask</a><a href="motion/gallery-studies.webm">Both A/B interactive studies</a><a href="native-motion-audit.json">Native motion audit</a></div><p class="gallery-links"><a href="'+esc(new URL('/foundation2/signature-gallery.html#composition-studies',manifest.after.origin).href)+'">Open interactive A/B comparison</a><a href="gallery-390.png">Current full phone gallery capture</a><a href="gallery-1280.png">Current desktop gallery capture</a></p><div class="study-pair">'+figure('current-study-a-all-set.png','Current candidate gallery A<br>Explicit choices → sample All Set','Current candidate Folded Brief All Set')+figure('current-study-b-all-set.png','Current candidate gallery B<br>Explicit choices → sample All Set','Current candidate Connected Day All Set')+'</div></section>';
  const references='<section><h2>Primary references and selection provenance</h2><p>'+esc(manifest.referenceAvailability)+'</p><p><strong>Selected: B · The Connected Day.</strong> '+esc(manifest.selection.rationale)+' This is an implementation selection following two rendered studies, not owner creative acceptance.</p><ul class="mapping">'+boardMap.map(board=>'<li><strong>'+esc(board.title)+'</strong>'+esc(board.mapping)+'</li>').join('')+'</ul>'+(manifest.references.length?'<div class="board-grid">'+manifest.references.map((ref,index)=>'<figure><figcaption>Owner original '+(index+1)+' · '+esc(ref.originalFileName)+'</figcaption><img src="'+ref.file+'" alt="Original owner-supplied reference board '+(index+1)+'"></figure>').join('')+'</div>':'<p>No reference image was generated, redrawn or approximated. Owner-supplied original PNGs can populate the deferred reference column without changing runtime or repeating CI.</p>')+'<p class="sources">Exact candidate declarations, local HEAD/status/file hashes, original study provenance and every capture source are in capture-manifest.json. SHA256SUMS.txt inventories this private review package. Local checkout hashes are not served-byte verification.</p></section>';
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rally Signature S3 · composition comparison</title><style>'+style+'</style>'+overview+paired+studyPages+gallery+references+'</html>';
 }
 const html=reviewDocument();
 await writeFile(out+'/visual-review.html',html);
 await writeFile(out+'/capture-manifest.json',JSON.stringify(manifest,null,2));
 const pdf=await browser.newPage();await pdf.goto(pathToFileURL(out+'/visual-review.html').href);await pdf.evaluate(async()=>{await Promise.all([...document.images].map(image=>image.decode().catch(()=>null)));});
 await pdf.pdf({path:out+'/visual-review.pdf',format:'A3',landscape:true,printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});await pdf.close();
 const files=[];async function inventory(dir,prefix=''){for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.isDirectory()){if(entry.name.startsWith('raw-'))continue;await inventory(resolve(dir,entry.name),prefix+entry.name+'/');}else if(entry.name!=='SHA256SUMS.txt'){const bytes=await readFile(resolve(dir,entry.name));files.push({file:prefix+entry.name,sha256:digest(bytes)});}}}await inventory(out);
 await writeFile(out+'/SHA256SUMS.txt',files.sort((a,b)=>a.file.localeCompare(b.file)).map(item=>item.sha256+'  '+item.file+'\n').join(''));
 console.log('Signature review package ready: '+out+'; original reference files embedded: '+manifest.references.length);
}finally{await browser.close();}
