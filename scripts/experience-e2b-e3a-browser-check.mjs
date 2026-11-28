/* Candidate-only Groups/Team and earned-motion journeys. This observer checks
 * real DOM, native animations and existing state owners; it creates no baseline. */
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.argv[2];assert.ok(base,'Pass a built/deployed preview origin');
const engine=process.env.CONVERGENCE_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch({headless:true,...(engine===webkit&&process.env.RALLY_WEBKIT_EXECUTABLE?{executablePath:process.env.RALLY_WEBKIT_EXECUTABLE}:{})});
const out='test-results/experience-e2b-e3a',results=[];
await mkdir(out,{recursive:true});
const originalKeys=['rallypoint-phase1-2026','rallypoint-today-ui-v1','rallypoint-wednesday-chat-lab-v1','rallypoint-blank-battle-v1'];
const roles={visitor:{group:false,team:false,leader:false},group:{group:true,team:false,leader:false},team:{group:false,team:true,leader:false},leader:{group:true,team:true,leader:true}};
const primary=role=>'rally-one-foundation2-v1:'+role+':primary';
const conversation=role=>'rally-one-foundation2-v1:'+role+':conversation';

// A passive frame observer catches short animations without pausing their real
// clock, injecting styles or relying on a private motion classifier/engine API.
function installMotionObserver(){
 window.__experienceMotion=[];
 function sample(){
  for(const animation of document.getAnimations()){
   const target=animation.effect?.target;
   if(!(target instanceof Element))continue;
   const timing=animation.effect.getTiming();
   window.__experienceMotion.push({target:[...target.classList].join(' ')||target.id||target.tagName,duration:Number(timing.duration),delay:Number(timing.delay)||0,playState:animation.playState,currentTime:animation.currentTime});
  }
  requestAnimationFrame(sample);
 }
 requestAnimationFrame(sample);
}
async function scenario(page,role){
 const tools=page.locator('#preview-tools');if(await tools.getAttribute('open')===null)await tools.locator(':scope > summary').click();
 if(await page.locator('#scenario').inputValue()!==role)await page.locator('#scenario').selectOption(role);
 else await tools.locator(':scope > summary').click();
}
async function route(page,name){
 if((new URL(page.url()).searchParams.get('screen')||'today')!==name)await page.locator('#primary-nav [data-route='+name+']').click();
 await page.locator('#today h1').waitFor();
}
async function overflow(page,label){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' horizontal overflow');}
async function noReducedMotion(page,label){
 await frames(page);
 assert.deepEqual(await page.evaluate(()=>window.__experienceMotion),[],label+' must not start native animation under reduced motion');
}
async function axe(page,label){
 const report=await new AxeBuilder({page}).analyze();
 assert.deepEqual(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],label+' axe');
}
async function frames(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
const raw=(page,key)=>page.evaluate(key=>localStorage.getItem(key),key);
const state=async(page,role)=>JSON.parse(await raw(page,primary(role))||'null');
function eventRecord(saved,role,kind){
 const prefix='fixture:'+role+':'+kind+':north:';
 const records=Object.entries(saved.eventResponses?.records||{}).filter(([id,r])=>id.startsWith(prefix)&&r.kind===kind);
 assert.equal(records.length,1,'Response must belong to one dated '+kind+' fixture');
 return {id:records[0][0],value:records[0][1],date:records[0][0].slice(prefix.length)};
}
async function dateVisible(page,scope,iso){
 const parts=await page.evaluate(iso=>{const d=new Date(iso);return {month:d.toLocaleString('en-US',{month:'short'}),day:String(d.getDate()),time:d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})};},iso);
 const text=(await scope.innerText()).toLowerCase();
 assert.ok(text.includes(parts.month.toLowerCase()),'Visible event month must match dated identity');
 assert.ok(new RegExp('\\b'+parts.day+'\\b').test(text),'Visible event day must match dated identity');
 assert.ok(text.replace(/\s/g,'').includes(parts.time.toLowerCase().replace(/\s/g,'')),'Visible event time must match dated identity');
}
async function unchangedAttendance(page,role,before){
 assert.deepEqual((await state(page,role)).attendance,before,'Availability/RSVP/prayer/review must not infer attendance');
}
async function original(page){return page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),originalKeys);}

try{
 for(const width of [320,375,390,430]){
  const context=await browser.newContext({viewport:{width,height:width===390?500:700},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'America/Denver'});
  await context.addInitScript(installMotionObserver);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00Z'));
  await page.goto(new URL('/foundation2/',base).href);await page.locator('.greeting h1').waitFor();
  const originals=await original(page);
  for(const [role,permission] of Object.entries(roles)){
   await scenario(page,role);await route(page,'groups');
   const cursorBefore=await raw(page,conversation(role));
   assert.equal(await page.locator('[data-rel-contact]').count(),permission.group?4:0,role+' known contact permission');
   assert.equal(await page.locator('.group-leader [data-group-action=group-leader]').count(),permission.leader?2:0,role+' leader review permission');
   assert.equal(await raw(page,conversation(role)),cursorBefore,'Rendering Groups must not mark messages read');
   if(permission.group){
    const contact=page.locator('[data-rel-contact=anna]');await contact.click();
    await page.locator('.relational-dialog[open]').getByRole('heading',{name:'Anna L.',exact:true}).waitFor();
    await noReducedMotion(page,'Contact panel entry');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.activeElement?.dataset.returnFocus==='groups-contact-anna');
    assert.equal(await raw(page,conversation(role)),cursorBefore,'Profile view must not mark group messages read');
    const attendance=await page.evaluate(()=>RallyAppState.initialize(()=>null,true).attendance);
    let id;
    for(const [choice,expected] of [['maybe','maybe'],['going','going'],['clear',''],['maybe','maybe']]){
     await page.locator('[data-group-action=group-rsvp][data-value="'+choice+'"]').click();
     const saved=await state(page,role),record=eventRecord(saved,role,'group');
     if(id)assert.equal(record.id,id,'RSVP changes must retain dated gathering identity');id=record.id;
     assert.equal(record.value.value,expected);await dateVisible(page,page.locator('.group-gathering'),record.date);
     await unchangedAttendance(page,role,attendance);
    }
    await noReducedMotion(page,'Group RSVP changes');
    await page.reload();await page.locator('.group-gathering').waitFor();
    assert.equal(await page.locator('[data-group-action=group-rsvp][data-value=maybe]').getAttribute('aria-pressed'),'true','RSVP survives reload');
    const responseBefore=structuredClone((await state(page,role)).eventResponses);
    await page.locator('[data-group-action=group-care-prayed]').click();
    assert.ok((await state(page,role)).companionCare.marcus.prayedAt,'Explicit prayer uses accepted care owner');
    assert.equal((await state(page,role)).companionCare.marcus.completedAt,undefined,'Prayer is not a delivered check-in');
    assert.deepEqual((await state(page,role)).eventResponses,responseBefore,'Prayer must not alter event responses');
    await unchangedAttendance(page,role,attendance);
    if(permission.leader){
     await page.locator('[data-group-action=group-leader][data-value=marcus]').click();
     assert.ok((await state(page,role)).reached.includes('marcus'),'Explicit review must use existing reviewed owner');
     await unchangedAttendance(page,role,attendance);
    }
    await noReducedMotion(page,'Group prayer/review');
    assert.equal(await raw(page,conversation(role)),cursorBefore,'RSVP/care/leader review must not mark group read');
    await page.locator('[data-return-focus=groups-conversation]').click();
    await page.frameLocator('#premium-connect').locator('#thread-input').waitFor();
    const opened=JSON.parse(await raw(page,conversation(role)));assert.equal(opened.snapshot.readCursors.length,1,'Only actual thread entry marks read');
    await page.locator('.connect-return').click();
    await page.waitForFunction(()=>document.activeElement?.dataset.returnFocus==='groups-conversation');
   }else{
    assert.equal(await page.locator('[data-group-action]').count(),0,'Nonmember Groups cannot offer private writes');
    assert.equal(await page.locator('.group-gathering').count(),0,'Nonmember Groups cannot fabricate a gathering');
   }
   await overflow(page,role+' Groups');await axe(page,role+' Groups');
   if(width===320&&role==='group'){
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');await overflow(page,'Doubled Groups');await axe(page,'Doubled Groups');
    await page.screenshot({path:out+'/'+engine.name()+'-320-groups-enlarged.png',fullPage:true,animations:'disabled'});
    await page.evaluate(()=>document.documentElement.style.fontSize='');
   }
   await page.screenshot({path:out+'/'+engine.name()+'-'+width+'-'+role+'-groups.png',fullPage:true,animations:'disabled'});
   await route(page,'team');
   if(permission.team){
    const attendance=(await state(page,role))?.attendance||await page.evaluate(()=>RallyAppState.initialize(()=>null,true).attendance);
    await page.locator('[data-team-action=serving-response][data-value=declined]').click();
    let record=eventRecord(await state(page,role),role,'team');const teamId=record.id;
    assert.equal(record.value.value,'declined');await dateVisible(page,page.locator('.team-assignment'),record.date);
    await page.locator('[data-team-action=serving-coverage][data-value=request]').click();
    record=eventRecord(await state(page,role),role,'team');assert.equal(record.id,teamId);assert.equal(record.value.coverage,true);
    await noReducedMotion(page,'Team decline/coverage');
    await page.reload();await page.locator('.team-assignment').waitFor();
    assert.equal(await page.locator('[data-team-action=serving-coverage]').getAttribute('data-value'),'withdraw','Coverage survives reload');
    const primaryBefore=await raw(page,primary(role)),cursorBeforeRoom=await raw(page,conversation(role));
    await page.locator('[data-return-focus=team-connect]').click();
    await page.frameLocator('#premium-connect').locator('#room-scroll').waitFor();
    assert.equal(await raw(page,primary(role)),primaryBefore,'Viewing Room must not change availability/coverage');
    assert.equal(await raw(page,conversation(role)),cursorBeforeRoom,'Viewing Room must not read a group conversation');
    await page.locator('.connect-return').click();
    await page.waitForFunction(()=>document.activeElement?.dataset.returnFocus==='team-connect');
    await page.locator('[data-team-action=serving-coverage][data-value=withdraw]').click();
    record=eventRecord(await state(page,role),role,'team');assert.equal(record.value.coverage,false);assert.equal(record.value.value,'declined');
    await page.locator('[data-team-action=serving-response][data-value=confirmed]').click();
    record=eventRecord(await state(page,role),role,'team');assert.equal(record.id,teamId);assert.equal(record.value.value,'confirmed');assert.equal(record.value.coverage,false);
    await dateVisible(page,page.locator('.team-assignment'),record.date);await unchangedAttendance(page,role,attendance);
   }else assert.equal(await page.locator('[data-team-action]').count(),0,'Nonmember Team cannot offer assignment writes');
   await noReducedMotion(page,role+' final Team state');
   await overflow(page,role+' Team');await axe(page,role+' Team');
   if(width===320&&role==='team'){
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');await overflow(page,'Doubled Team');await axe(page,'Doubled Team');
    await page.screenshot({path:out+'/'+engine.name()+'-320-team-enlarged.png',fullPage:true,animations:'disabled'});
    await page.evaluate(()=>document.documentElement.style.fontSize='');
   }
   await page.screenshot({path:out+'/'+engine.name()+'-'+width+'-'+role+'-team.png',fullPage:true,animations:'disabled'});
   await frames(page);
   assert.deepEqual(await page.evaluate(()=>document.getAnimations().filter(a=>['running','pending'].includes(a.playState)).map(a=>a.effect?.target?.className)),[],'Reduced motion must disable active animation');
  }
  // Current provider rehearsals remain read-only across their refined surfaces.
  for(const role of ['group-ready','group-denied','group-outage','serving-ready','serving-denied','serving-outage']){
   await scenario(page,role);const before=await page.evaluate(()=>JSON.stringify(localStorage));
   await route(page,role.startsWith('group-')?'groups':'team');
   assert.equal(await page.locator('[data-group-action],[data-team-action],[data-rel-contact]').count(),0,'Provider sample cannot expose fictional local write controls');
   assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),before,'Provider rendering must not write local state');
   await overflow(page,role+' provider');
  }
  // Unknown dated responses stay unknown and preserve the exact saved bytes.
  await scenario(page,'team');
  const malformed=await page.evaluate(()=>{const s=RallyAppState.initialize(()=>null,true);s.eventResponses={version:1,records:{bad:{kind:'team'}}};const raw=JSON.stringify(s);localStorage.setItem('rally-one-foundation2-v1:team:primary',raw);return raw;});
  await page.reload();await route(page,'team');
  assert.equal(await page.locator('[data-team-action]').count(),0,'Unknown response cannot be confirmed through stale controls');
  assert.match(await page.locator('.team-page').innerText(),/unavailable|cannot be changed|review/i);
  assert.equal(await raw(page,primary('team')),malformed,'Unknown dated state must remain preserved');
  await route(page,'today');assert.notEqual(await page.locator('.greeting h1').innerText(),'You’re all set.');
  assert.deepEqual(await original(page),originals,'Original application/game keys remain untouched');
  assert.deepEqual(errors,[],'No page errors');
  results.push({engine:engine.name(),mode:'reduced',width,roles:Object.keys(roles),rsvpDates:'passed',servingCoverage:'passed',contactThreadReturn:'passed',scopeAndRead:'passed',providerUnknown:'passed',axe:'passed',errors});
  console.log('EXPERIENCE E2B/E3A reduced passed '+engine.name()+' '+width);
  await context.close();
 }

 // Normal motion is earned by actual accepted commands, never a fake fixture
 // flag. Native hit testing/focus prove controls remain usable during the fade.
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference',timezoneId:'America/Denver'});
 await context.addInitScript(installMotionObserver);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime(new Date('2026-11-26T12:00:00Z'));
 await page.goto(new URL('/foundation2/',base).href);await page.locator('.greeting h1').waitFor();
 await page.evaluate(()=>document.fonts.ready);await frames(page);
 const motion=await page.evaluate(async()=>{
  window.__experienceMotion=[];
  const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  const serve=document.querySelector('[data-command=serve]');if(!serve)throw Error('Expected pending serving command');serve.focus();serve.click();
  let active=[];
  for(let i=0;i<8&&!active.length;i++){await nextFrame();active=document.getAnimations().filter(a=>a.effect?.target?.matches?.('.priority,.responsibilities')&&['running','pending'].includes(a.playState));}
  if(!active.length)throw Error('Actual serve-to-RSVP change produced no native priority animation');
  const rsvp=document.querySelector('[data-command=rsvp]');if(!rsvp)throw Error('Next canonical RSVP control missing');
  const box=rsvp.getBoundingClientRect(),hit=document.elementFromPoint(box.x+box.width/2,box.y+box.height/2);
  const hitTest=!!hit&&(hit===rsvp||rsvp.contains(hit));
  rsvp.focus();const focused=document.activeElement===rsvp;
  const blocked=rsvp.disabled||rsvp.closest('[inert]')||getComputedStyle(rsvp).pointerEvents==='none';
  const activeAtClick=document.getAnimations().some(a=>a.effect?.target?.matches?.('.priority,.responsibilities')&&['running','pending'].includes(a.playState));
  rsvp.click();
  for(let i=0;i<8;i++){await nextFrame();if(document.getAnimations().some(a=>a.effect?.target?.matches?.('.settled,.greeting')))break;}
  const target=document.querySelector('.settled')||document.querySelector('.greeting');
  const layout=el=>({top:el.offsetTop,left:el.offsetLeft,width:el.offsetWidth,height:el.offsetHeight});
  const before=layout(target);
  await Promise.all(document.getAnimations().filter(a=>a.effect?.target?.matches?.('.settled,.greeting')).map(a=>a.finished.catch(()=>{})));
  await nextFrame();
  return {hitTest,focused,blocked:!!blocked,activeAtClick,layoutBefore:before,layoutAfter:layout(target),samples:window.__experienceMotion};
 });
 assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.','Actual final commitment must reach All Set');
 assert.ok(motion.hitTest&&motion.focused&&!motion.blocked&&motion.activeAtClick,'Control must remain hit-testable/focusable/activatable during native priority motion');
 assert.ok(motion.samples.some(s=>/priority|responsibilities/.test(s.target)),'Native priority movement evidence');
 assert.ok(motion.samples.some(s=>/settled|greeting|^H1$/.test(s.target)),'Actual completion must produce a native All Set animation');
 assert.ok(motion.samples.every(s=>Number.isFinite(s.duration)&&s.duration+s.delay<=220),'Restrained native motion duration');
 assert.deepEqual(motion.layoutAfter,motion.layoutBefore,'Finish must not shift settled layout');
 const completed=await state(page,'connected');assert.equal(eventRecord(completed,'connected','group').value.value,'going');assert.equal(eventRecord(completed,'connected','team').value.value,'confirmed');
 await page.reload();await page.locator('.greeting h1').waitFor();await frames(page);
 assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.');
 assert.deepEqual(await page.evaluate(()=>window.__experienceMotion.filter(s=>/settled|greeting|^H1$/.test(s.target))),[],'Initial calm load must not fake an earned celebration');
 for(const role of ['visitor','unavailable']){
  await page.evaluate(()=>{window.__experienceMotion=[];});await scenario(page,role);await frames(page);
  assert.deepEqual(await page.evaluate(()=>window.__experienceMotion.filter(s=>/priority|settled|greeting|^H1$/.test(s.target))),[],'Persona/unavailable transition must not fake completion');
 }
 await overflow(page,'Normal motion finish');assert.deepEqual(errors,[]);
 results.push({engine:engine.name(),mode:'normal',actualCommands:'passed',midAnimationControl:'passed',earnedCompletion:'passed',noFakeCelebration:'passed',stableFinish:'passed',motion,errors});
 await writeFile(out+'/'+engine.name()+'-motion.json',JSON.stringify(motion,null,2));
 console.log('EXPERIENCE E2B/E3A normal motion passed '+engine.name());
 await context.close();
}finally{
 await writeFile(out+'/'+engine.name()+'.json',JSON.stringify(results,null,2));
 await browser.close();
}
