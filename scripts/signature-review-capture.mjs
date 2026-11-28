// Creative review media, never approved pixel references. All app states are
// reached through the existing UI in fresh fictional browser contexts.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile,readdir,readFile,copyFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,extname,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const before=process.argv[2]||'http://127.0.0.1:8043';
const after=process.argv[3]||'http://127.0.0.1:8042';
const out=resolve(process.env.SIGNATURE_REVIEW_OUT||'test-results/signature-review');
const source=process.env.SIGNATURE_SOURCE||'working S1/S2 candidate; not yet pinned';
const e3b='7756470c5d4a056ec311614a55f22b1d56bfe1db';
const clock='2026-11-26T12:00:00Z',timezone='America/Denver';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
await mkdir(out,{recursive:true});await mkdir(out+'/motion',{recursive:true});
const manifest={status:'CANDIDATE_CREATIVE_REVIEW_NOT_AN_APPROVED_BASELINE',before:{source:e3b,origin:before,physicalAcceptance:'pending'},after:{source,origin:after,creativeAcceptance:'pending'},clock,timezone,personalization:{name:'Jordan',campus:'north',source:'actual local profile dialog, no permission handoff'},captures:[],recordings:[],references:[]};
try{manifest.gitHeadAtCapture=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();manifest.sourceStatus=execFileSync('git',['status','--porcelain'],{encoding:'utf8'});}catch{/* Standalone review packaging does not require Git. */}

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
manifest.referenceAvailability=manifest.references.length?'Original supplied files retained unchanged; textual board mapping is descriptive, not a replacement image.':'Owner-supplied boards remain in conversation; original image files not available for embedding.';

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
  for(const [side,base] of [['before',before],['after',after]]){
   for(const scene of scenes){
    const context=await browser.newContext({viewport:{width:scene.width,height:scene.height},isMobile:true,hasTouch:true,timezoneId:timezone,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    try{
     await openToday(page,base,scene.role);if(scene.complete)await actualAllSet(page);
     if(scene.enlarged)await page.evaluate(()=>document.documentElement.style.fontSize='200%');
     await capture(page,side+'-'+scene.name,{side,...scene,source:side==='before'?e3b:source});
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
  // Normal-motion recording: real local commands, optional people/profile/Ask
  // and their actual focus/return behavior. No scripted completion flag.
  {
   const recordDir=out+'/motion/raw-today';await mkdir(recordDir,{recursive:true});
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:timezone,reducedMotion:'no-preference',recordVideo:{dir:recordDir,size:{width:390,height:844}}});
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
   for(const command of ['serve','rsvp']){const button=page.locator('[data-command='+command+']');if(await button.count()){await button.click();await page.waitForTimeout(500);}}
   await actualAllSet(page);await page.locator('.greeting').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
   assert.deepEqual(errors,[]);const video=page.video(),raw=await video.path();await context.close();const file='motion/today-real-actions.webm';await video.saveAs(out+'/'+file);await unlink(raw);
   manifest.recordings.push({file,source,clock,timezone,viewport:'390x844',motion:'normal',actions:'Actual profile personalization, People/portrait/Ask and return, serving+RSVP saved commands to real All Set. Setup included; no fake progress or external delivery.'});
  }
  {
   const recordDir=out+'/motion/raw-gallery';await mkdir(recordDir,{recursive:true});
   const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:timezone,reducedMotion:'no-preference',recordVideo:{dir:recordDir,size:{width:390,height:844}}});
   await context.addInitScript(()=>{window.__galleryStorageIO=[];for(const method of ['getItem','setItem','removeItem','clear']){const original=Storage.prototype[method];Storage.prototype[method]=function(...args){window.__galleryStorageIO.push(method);return original.apply(this,args);};}});
   const page=await context.newPage();await page.goto(new URL('/foundation2/signature-gallery.html',after).href);await page.locator('#completion-output').waitFor();await settle(page);
   await page.locator('[data-sig-action=stack-next]').click();await page.waitForTimeout(500);
   await page.locator('[data-sig-action=community]').click();await page.waitForTimeout(400);
   await page.locator('[data-sig-action=segment][data-sig-value=serving]').click();await page.waitForTimeout(400);
   await page.locator('[data-sig-action=rsvp][data-sig-value=going]').click();await page.locator('[data-sig-action=commitment]').click();await page.locator('#completion-output').scrollIntoViewIfNeeded();await page.waitForTimeout(700);
   assert.match(await page.locator('#completion-output').innerText(),/All Set!/);
   await page.locator('[data-sig-action=week-next]').click();await page.waitForTimeout(450);await page.locator('[data-sig-action=week-prev]').click();await page.waitForTimeout(450);
   assert.deepEqual(await page.evaluate(()=>window.__galleryStorageIO),[],'Gallery recordings must not read/write application storage');
   await page.screenshot({path:out+'/gallery-interactive-state.png',fullPage:true,animations:'disabled'});
   const video=page.video(),raw=await video.path();await context.close();const file='motion/gallery-components.webm';await video.saveAs(out+'/'+file);await unlink(raw);
   manifest.recordings.push({file,source,viewport:'390x844',motion:'normal',storageIO:[],actions:'Ephemeral stack, community expansion, segment selection, explicit sample RSVP+commitment to derived specimen All Set, calendar week and truthful empty state. No app router/store or external communication.'});
  }
 }else{
  const previous=JSON.parse(await readFile(out+'/capture-manifest.json','utf8'));manifest.captures=previous.captures;manifest.recordings=previous.recordings;
  manifest.before=previous.before;manifest.after=previous.after;manifest.gitHeadAtCapture=previous.gitHeadAtCapture;manifest.sourceStatus=previous.sourceStatus;
  manifest.referenceOnlyRepackage='Original capture source identities retained; this pass only embeds supplied reference files and regenerates review documents.';
 }

 const referenceFor=scene=>{
  const reference=manifest.references[0];
  return reference?'<figure class="reference"><figcaption>Owner-supplied original · '+esc(reference.originalFileName)+'</figcaption><img src="'+reference.file+'" alt="Unmodified owner-supplied Rally Signature reference board"><p>Original bytes retained unchanged. Scaled to fit this comparison column. Files are sorted by original filename; the complete set is retained below.</p></figure>':'<aside class="reference-missing"><strong>Reference image unavailable for embedding</strong><p>'+esc(manifest.referenceAvailability)+'</p><p>'+esc(boardMap[0].mapping)+'</p><small>This text is a mapping note, not a recreated board.</small></aside>';
 };
 const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rally Signature S1/S2 · creative comparison</title><style>'+`
 body{margin:32px;background:#f4eee3;color:#222321;font:16px/1.55 system-ui,sans-serif}h1,h2{line-height:1.15;letter-spacing:-.035em}h1{font-family:Georgia,serif;font-size:40px;font-weight:500}h2{font-size:23px}a{color:#ae172b;text-underline-offset:3px}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:750}.notice{border-left:4px solid #df272b;padding:12px 18px;background:#fff9f0;max-width:1000px}.triptych{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;align-items:start}figure{margin:0;min-width:0}figcaption{font-size:14px;font-weight:750;margin:0 0 12px}img{width:100%;height:auto;display:block}section{margin:42px 0;padding-top:24px;border-top:1px solid #bbaa98}figure p,.reference-missing{font-size:13px;line-height:1.65}.reference-missing{padding:22px;background:#eee1d0;border:1px solid #d2bfa9}.reference-missing strong{font-size:18px;display:block}.full-comparison{margin-top:24px}.full-comparison summary{cursor:pointer;min-height:44px;padding:10px 0;font-weight:700}.full-pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}.board-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.gallery-preview{max-width:600px}.sources{font-size:13px;overflow-wrap:anywhere}.motion-links{display:flex;flex-wrap:wrap;gap:18px}.mapping{padding:0;list-style:none;display:grid;gap:18px}.mapping li{border-left:3px solid #df272b;padding-left:16px}.mapping strong{display:block}@media(max-width:700px){body{margin:18px}.triptych{grid-template-columns:1fr}.full-pair,.board-grid{grid-template-columns:1fr}}@media print{body{margin:0;background:white;color:#222321;font-size:12px}h1{font-size:34px}section{break-before:page;break-inside:avoid;margin:0;padding:0;border:0}.triptych{gap:12px}.triptych img{max-height:228mm;object-fit:contain;object-position:top}.triptych figcaption{font-size:11px}.reference-missing{padding:12px}.full-comparison{display:none}.gallery-preview img{max-height:230mm;object-fit:contain;object-position:top}.motion-links{display:block}.board-grid img{max-height:115mm;object-fit:contain;object-position:top}}
 `+'</style><p class="eyebrow">Rally Signature · S1/S2 candidate</p><h1>A distinctive shape for Today.</h1><p class="notice">Creative review evidence, not approved pixel baselines. E3B physical acceptance remains outstanding. Current runtime, selected creative references and implementation remain distinct. No promotion/default cutover/production approval is implied.</p><p class="sources">Before: '+e3b+' · After: '+esc(manifest.after.source)+'<br>Fixed '+clock+' / '+timezone+' · Jordan / North · matched real local scenarios</p><div class="motion-links"><a href="motion/today-real-actions.webm">Today · actual responses, People, profile, Ask and return</a><a href="motion/gallery-components.webm">Gallery · interactive component states</a></div>'+scenes.map(scene=>'<section><h2>'+esc(scene.name.replaceAll('-',' '))+'</h2><p>'+scene.width+' × '+scene.height+(scene.enlarged?' · 200% text':'')+' · '+esc(scene.role)+(scene.complete?' · real saved serving and RSVP responses':'')+'</p><div class="triptych"><figure><figcaption>Current E3B candidate<br>Physical acceptance pending</figcaption><img src="before-'+scene.name+'.png" alt="Current E3B '+esc(scene.name)+' Today"></figure>'+referenceFor(scene)+'<figure><figcaption>Implemented Rally Signature<br>S1/S2 creative review pending</figcaption><img src="after-'+scene.name+'.png" alt="Rally Signature '+esc(scene.name)+' Today"></figure></div><details class="full-comparison"><summary>Inspect full-height before / implementation captures</summary><div class="full-pair"><img src="before-'+scene.name+'-full.png" alt="Full current E3B '+esc(scene.name)+'"><img src="after-'+scene.name+'-full.png" alt="Full Signature '+esc(scene.name)+'"></div></details></section>').join('')+'<section><h2>Interactive living component gallery</h2><p><a href="'+esc(new URL('/foundation2/signature-gallery.html',after).href)+'">Open working gallery</a> · Explicit specimens with ephemeral selections; no app storage/router.</p><figure class="gallery-preview"><img src="gallery-390.png" alt="Signature interactive component gallery on phone"></figure></section><section><h2>Primary reference mapping</h2><p>'+esc(manifest.referenceAvailability)+'</p><ul class="mapping">'+boardMap.map(board=>'<li><strong>'+esc(board.title)+'</strong>'+esc(board.mapping)+'</li>').join('')+'</ul>'+(manifest.references.length?'<div class="board-grid">'+manifest.references.map((ref,index)=>'<figure><figcaption>Owner original '+(index+1)+' · '+esc(ref.originalFileName)+'</figcaption><img src="'+ref.file+'" alt="Original owner-supplied reference board '+(index+1)+'"></figure>').join('')+'</div>':'<p>No reference images were generated, redrawn or approximated. Provide original downloadable board files to populate the middle comparison column.</p>')+'</section></html>';
 await writeFile(out+'/visual-review.html',html);
 await writeFile(out+'/capture-manifest.json',JSON.stringify(manifest,null,2));
 const pdf=await browser.newPage();await pdf.goto(pathToFileURL(out+'/visual-review.html').href);await pdf.evaluate(async()=>{await Promise.all([...document.images].map(image=>image.decode().catch(()=>null)));});
 await pdf.pdf({path:out+'/visual-review.pdf',format:'A3',landscape:true,printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'}});await pdf.close();
 const files=[];async function inventory(dir,prefix=''){for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.isDirectory()){if(entry.name.startsWith('raw-'))continue;await inventory(resolve(dir,entry.name),prefix+entry.name+'/');}else if(entry.name!=='SHA256SUMS.txt'){const bytes=await readFile(resolve(dir,entry.name));files.push({file:prefix+entry.name,sha256:digest(bytes)});}}}await inventory(out);
 await writeFile(out+'/SHA256SUMS.txt',files.sort((a,b)=>a.file.localeCompare(b.file)).map(item=>item.sha256+'  '+item.file+'\n').join(''));
 console.log('Signature review package ready: '+out+'; original reference files embedded: '+manifest.references.length);
}finally{await browser.close();}
