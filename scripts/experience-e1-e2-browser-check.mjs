/* Focused experience journeys over the accepted owners. Candidate captures are
 * review evidence, never approved references or replacements for protected QA. */
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.argv[2];
assert.ok(base,'Pass a built/deployed preview origin');
const engine=process.env.CONVERGENCE_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch({headless:true,...(engine===webkit&&process.env.RALLY_WEBKIT_EXECUTABLE?{executablePath:process.env.RALLY_WEBKIT_EXECUTABLE}:{})});
const out='test-results/experience-e1-e2',results=[];
await mkdir(out,{recursive:true});
const originalKeys=['rallypoint-phase1-2026','rallypoint-today-ui-v1','rallypoint-wednesday-chat-lab-v1','rallypoint-blank-battle-v1'];
const rolePermissions={visitor:{group:false,team:false,leader:false},group:{group:true,team:false,leader:false},team:{group:false,team:true,leader:false},leader:{group:true,team:true,leader:true}};

try{
 for(const width of [320,375,390,430]){
  const context=await browser.newContext({viewport:{width,height:width===390?500:680},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'America/Denver'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00Z'));
  await page.goto(new URL('/foundation2/',base).href);
  await page.locator('.greeting h1').waitFor();
  const original=()=>page.evaluate(keys=>Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),originalKeys);
  const before=await original();
  const primary=role=>'rally-one-foundation2-v1:'+role+':primary';
  const conversation=role=>'rally-one-foundation2-v1:'+role+':conversation';
  const saved=key=>page.evaluate(key=>localStorage.getItem(key),key);
  async function scenario(value){
   const tools=page.locator('#preview-tools');
   if(!(await tools.getAttribute('open')!==null))await tools.locator(':scope > summary').click();
   if(await page.locator('#scenario').inputValue()!==value)await page.locator('#scenario').selectOption(value);
   else await tools.locator(':scope > summary').click();
   await page.locator('.greeting h1').waitFor();
  }
  async function today(){
   if(new URL(page.url()).searchParams.get('screen'))await page.locator('#primary-nav [data-route=today]').click();
   await page.locator('.greeting h1').waitFor();
  }
  async function noOverflow(label){
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' caused horizontal overflow');
  }
  async function axe(label){
   const report=await new AxeBuilder({page}).analyze();
   assert.deepEqual(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],label+' accessibility');
  }
  async function askIsReadOnly(role){
   const state=await saved(primary(role)),cursor=await saved(conversation(role));
   await page.getByRole('button',{name:'Ask Rally',exact:true}).click();
   await page.locator('#member-dialog[open]').waitFor();
   if(role==='visitor'){
    assert.equal(await page.locator('#member-dialog [data-action=f10-confirm]').count(),0,'Visitor Ask cannot offer member confirmations');
    assert.doesNotMatch(await page.locator('#member-dialog').innerText(),/Marcus|Taylor/,'Visitor Ask cannot expose restricted care fixtures');
   }
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>document.activeElement?.id==='ask-rally');
   assert.equal(await saved(primary(role)),state,'Viewing Ask must not write a response');
   assert.equal(await saved(conversation(role)),cursor,'Viewing Ask must not mark messages read');
  }
  async function agendaRoundTrip(role,id,route,destination){
   const source=page.locator('a[data-return-focus="agenda-'+id+'"]');
   assert.equal(await source.count(),1,role+' needs one canonical agenda entry for '+id);
   const state=await saved(primary(role)),cursor=await saved(conversation(role));
   await source.click();await page.locator(destination).waitFor();
   assert.equal(new URL(page.url()).searchParams.get('screen'),route,'Agenda destination');
   assert.equal(await saved(primary(role)),state,'Agenda navigation must not confirm a commitment');
   assert.equal(await saved(conversation(role)),cursor,'Agenda navigation must not mark conversations read');
   await page.goBack();await page.locator('.greeting h1').waitFor();
   await page.waitForFunction(id=>document.activeElement?.dataset.returnFocus==='agenda-'+id,id);
   await noOverflow(role+' agenda return');
  }

  // Existing guarded profile, visible context and exact namespace preservation.
  const inlineProfile=page.locator('[data-profile-entry]');
  const hasInline=await inlineProfile.count()>0;
  if(hasInline)await inlineProfile.click();
  else{await page.locator('#preview-tools>summary').click();await page.locator('#member-profile-open').click();}
  await page.getByLabel('Name',{exact:true}).fill('Alex');
  await page.locator('#member-profile select[name=campus]').selectOption('central');
  await page.getByRole('button',{name:'Save local profile',exact:true}).click();
  if(hasInline)await page.waitForFunction(()=>document.activeElement?.matches('[data-profile-entry]'));
  await page.reload();await page.locator('.greeting h1').waitFor();
  assert.match(await page.locator('.member-context').innerText(),/Alex/,'Today must use the saved canonical identity');
  assert.match(await page.locator('.greeting').innerText(),/central/i,'Saved campus must be consistent');
  await agendaRoundTrip('connected','group','groups','.group-gathering');
  await agendaRoundTrip('connected','serve','team','.team-assignment');
  await askIsReadOnly('connected');

  for(const [role,permissions] of Object.entries(rolePermissions)){
   await today();await scenario(role);
   assert.ok((await page.locator('.member-context').innerText()).trim().length>0,'Member context must remain visible');
   assert.equal(await page.locator('#primary-nav a').count(),4,'Exactly four primary destinations');
   assert.equal(await page.locator('.header-connect').count(),1,'Consistent Connect access');
   assert.equal(await page.locator('[data-rel-entry=prayer]').count(),permissions.group?1:0,role+' care permission');
   assert.equal(await page.locator('[data-rel-entry=leader]').count(),permissions.leader?1:0,role+' leader permission');
   assert.equal(await page.locator('a[data-return-focus=agenda-group]').count(),permissions.group?1:0,role+' group agenda');
   assert.equal(await page.locator('a[data-return-focus=agenda-serve]').count(),permissions.team?1:0,role+' serving agenda');
   await askIsReadOnly(role);
   if(permissions.group)await agendaRoundTrip(role,'group','groups','.group-gathering');
   if(permissions.team)await agendaRoundTrip(role,'serve','team','.team-assignment');
   if(role==='visitor'){
    assert.notEqual(await page.locator('.greeting h1').innerText(),'You’re all set.','Visitor is not a completed member');
    await page.locator('[data-return-focus=today-groups]').click();
    const discover=page.locator('.group-page [data-rel-entry=discovery]');
    assert.equal(await discover.count(),1,'Visitor Groups needs one primary in-app discovery entry');
    await discover.click();const dialog=page.locator('.relational-dialog[open]');
    await dialog.getByRole('heading',{name:'Discover community',exact:true}).waitFor();
    const interest=dialog.locator('[data-rel=interest][data-id="0"]');
    await interest.click();assert.equal(await interest.getAttribute('aria-pressed'),'true');
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('rally-one-foundation2-v1:visitor:today')).memberships),{group:false,team:false},'Interest must never grant involvement');
    await interest.click();assert.equal(await interest.getAttribute('aria-pressed'),'false');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.activeElement?.matches('.group-page [data-rel-entry=discovery]'));
    await today();
   }
   await noOverflow(role+' Today');await axe(role+' Today');
   await page.screenshot({path:out+'/'+engine.name()+'-'+width+'-'+role+'.png',fullPage:true,animations:'disabled'});
  }

  // Completion is about commitments; optional unread and Scripture are retained.
  await scenario('group');await page.locator('[data-command=rsvp]').click();
  assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.');
  assert.equal(await page.locator('[data-command]').count(),0,'All Set must not invent response tasks');
  assert.match(await page.locator('a.utility[href="?screen=connect"]').innerText(),/3 new group messages/,'Unread is optional, not silently read');
  await page.reload();await page.locator('.greeting h1').waitFor();
  assert.equal(await page.locator('.greeting h1').innerText(),'You’re all set.','Completion must survive reload');
  await askIsReadOnly('group');
  if(width===320){
   await page.evaluate(()=>document.documentElement.style.fontSize='200%');
   await noOverflow('Doubled-text All Set');await axe('Doubled-text All Set');
   await page.getByRole('button',{name:'Ask Rally',exact:true}).click();
   assert.ok(await page.locator('#member-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Doubled-text Ask overflow');
   await axe('Doubled-text Ask');await page.keyboard.press('Escape');
   await page.screenshot({path:out+'/'+engine.name()+'-'+width+'-all-set-enlarged.png',fullPage:true,animations:'disabled'});
   await page.evaluate(()=>document.documentElement.style.fontSize='');
  }
  // Existing deferral fields remain a pause, never a completed commitment.
  await scenario('connected');
  await page.evaluate(()=>{
   const state=RallyAppState.initialize(()=>null,true),until='2026-12-03T12:00:00.000Z';
   state.companionChoices={snoozedUntil:{'group-rsvp':until,'serve-response':until}};
   localStorage.setItem('rally-one-foundation2-v1:connected:primary',JSON.stringify(state));
  });
  await page.reload();await page.locator('.greeting h1').waitFor();
  assert.notEqual(await page.locator('.greeting h1').innerText(),'You’re all set.','Deferred is not completed');
  assert.equal(await page.locator('article.priority').count(),0,'Deferred commitments should not invent an urgent priority');
  assert.equal(await page.locator('.deferred-panel [data-command]').count(),2,'Deferred responses remain recoverable');
  await askIsReadOnly('connected');
  await scenario('unavailable');
  assert.notEqual(await page.locator('.greeting h1').innerText(),'You’re all set.','Unavailable cannot masquerade as completion');
  assert.match(await page.locator('.utility[role=status]').innerText(),/Conversation unavailable/);
  await askIsReadOnly('unavailable');await noOverflow('Unavailable Today');
  assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  assert.deepEqual(await original(),before,'Experience presentation must not mutate original application/game keys');
  assert.deepEqual(errors,[],'No page errors');
  results.push({engine:engine.name(),width,roles:Object.keys(rolePermissions),profile:'passed',agendaReturn:'passed',visitorDiscovery:'passed',askReadOnly:'passed',completionDeferredUnavailable:'passed',enlarged:width===320,reducedMotion:true,pageErrors:errors});
  console.log('EXPERIENCE E1/E2 passed '+engine.name()+' '+width);
  await context.close();
 }
}finally{
 await writeFile(out+'/'+engine.name()+'.json',JSON.stringify(results,null,2));
 await browser.close();
}
