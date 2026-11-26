// Published-source communication journeys. Reuses the real premium iframe and
// existing domain owners; no screenshot masks, replacement references or sends.
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2];assert.ok(base,'Pass a built/deployed preview origin');
const engine=process.env.CONVERGENCE_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch({headless:true,...(engine===webkit&&process.env.RALLY_WEBKIT_EXECUTABLE?{executablePath:process.env.RALLY_WEBKIT_EXECUTABLE}:{})});
const out='test-results/convergence2c';await mkdir(out,{recursive:true});const results=[];
const primary='rally-one-foundation2-v1:connected:primary',conversation='rally-one-foundation2-v1:connected:conversation';
try{
 for(const width of [320,375,390,430]){
  const ctx=await browser.newContext({viewport:{width,height:width===390?500:680},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'America/Denver'});
  const page=await ctx.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00Z'));await page.goto(new URL('/foundation2/',base).href);await page.locator('#today h1').waitFor();
  const original=()=>page.evaluate(()=>Object.fromEntries(['rallypoint-phase1-2026','rallypoint-today-ui-v1','rallypoint-wednesday-chat-lab-v1'].map(k=>[k,localStorage.getItem(k)])));
  const originalBefore=await original();
  const frame=()=>page.frameLocator('#premium-connect');
  async function ready(){await frame().locator('body.connect-member').waitFor();}
  async function inbox(){await frame().locator('.screen:not([hidden]) [data-open=inbox]').click();await frame().locator('#screen-inbox:not([hidden])').waitFor();}
  async function scenario(value){await page.locator('#preview-tools>summary').click();if(await page.locator('#scenario').inputValue()!==value)await page.locator('#scenario').selectOption(value);else await page.locator('#preview-tools>summary').click();}
  async function capture(name){await page.screenshot({path:out+'/'+engine.name()+'-'+width+'-'+name+'.png',fullPage:true,animations:'disabled'});}
  const before=await page.evaluate(k=>localStorage.getItem(k),conversation);
  await page.getByRole('button',{name:'Ask Rally',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.evaluate(k=>localStorage.getItem(k),conversation),before,'Ask must not mark a conversation read');
  await page.locator('.header-connect').click();await ready();
  assert.equal(await frame().locator('.conversation-row:visible').count(),4,'Combined membership inbox');
  assert.equal(await frame().locator('.people-rail .person:visible').count(),4);
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),conversation),before,'Inbox must not mark group read');
  await frame().getByRole('button',{name:'Search conversations'}).focus();await page.keyboard.press('Enter');await frame().locator('#conversation-search').fill('not-present-fixture');assert.equal(await frame().locator('.conversation-row:visible').count(),0);assert.equal(await frame().locator('#no-results').isVisible(),true);await frame().locator('#conversation-search').press('Escape');assert.equal(await frame().locator('#search-toggle').evaluate(e=>e===document.activeElement),true,'Search Escape must restore focus');
  await capture('inbox');
  await frame().locator('.conversation-row[data-open=thread]').click();await frame().locator('#thread-new-messages .message').first().waitFor();
  assert.equal(await frame().locator('#thread-new-messages .message').count(),4);assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).snapshot.readCursors.length,conversation),1);
  await frame().locator('#thread-new-messages .reaction').first().click();assert.equal(await frame().locator('#thread-new-messages .reaction').first().getAttribute('aria-pressed'),'true');
  await frame().locator('#thread-new-messages .message-reply-action').first().click();await frame().locator('#thread-input').fill('Group draft survives the exact source reload');await page.reload();await ready();assert.equal(await frame().locator('#thread-input').inputValue(),'Group draft survives the exact source reload');assert.equal(await frame().locator('#reply-context').isVisible(),true);
  await frame().locator('#thread-form .send-btn').click();assert.equal(await frame().locator('#thread-input').inputValue(),'');assert.equal(await frame().locator('#thread-new-messages .message').count(),5);assert.match(await frame().locator('.message-reply').last().innerText(),/Jess W/);await capture('group');
  await inbox();assert.equal(await frame().locator('.conversation-row[data-open=thread] .unread:visible').count(),0);
  await frame().locator('.people-rail [data-person=Jess]').click();assert.equal(await frame().locator('#direct-name').innerText(),'Jess');await frame().locator('#direct-input').fill('Jess private local draft');await frame().locator('#direct-input').press('Enter');assert.equal(await frame().locator('#direct-input').inputValue(),'Jess private local draft\n','Mobile Return must insert a newline rather than send');await frame().locator('#direct-input').fill('Jess private local draft');await inbox();
  await frame().locator('.people-rail [data-person=Anna]').click();assert.equal(await frame().locator('#direct-input').inputValue(),'','Draft leaked to another recipient');await frame().locator('#direct-input').fill('Anna separate local draft');await inbox();
  await frame().locator('.people-rail [data-person=Jess]').click();assert.equal(await frame().locator('#direct-input').inputValue(),'Jess private local draft');await page.reload();await ready();assert.equal(await frame().locator('#direct-name').innerText(),'Jess');assert.equal(await frame().locator('#direct-input').inputValue(),'Jess private local draft');
  await frame().locator('#direct-form .send-btn').click();assert.equal(await frame().locator('#direct-input').inputValue(),'');assert.match(await frame().locator('#direct-new-messages').innerText(),/Jess private local draft/);await capture('direct');await inbox();
  await frame().locator('.people-rail [data-person=Anna]').click();assert.equal(await frame().locator('#direct-input').inputValue(),'Anna separate local draft');await inbox();
  const servingBefore=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).eventResponses||null,primary);
  await frame().locator('.conversation-row[data-open=room]').click();await frame().getByRole('tab',{name:'Plans',exact:true}).click();await frame().locator('[data-rsvp-mirror]').click();assert.equal(await frame().locator('[data-rsvp-mirror]').getAttribute('aria-pressed'),'true');await capture('room-plans');
  await frame().getByRole('tab',{name:'Plans',exact:true}).focus();await page.keyboard.press('ArrowRight');assert.equal(await frame().getByRole('tab',{name:'People',exact:true}).getAttribute('aria-selected'),'true','Room tabs must support arrow keys');assert.equal(await frame().locator('#room-panel-people .member').count(),3);await capture('room-people');
  await frame().getByRole('tab',{name:'Chat',exact:true}).click();assert.equal(await frame().locator('#rsvp-action').getAttribute('aria-pressed'),'true');assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).eventResponses||null,primary),servingBefore,'Room RSVP changed serving availability');
  await frame().locator('#room-input').fill('Room local draft');await page.reload();await ready();assert.equal(await frame().locator('#room-input').inputValue(),'Room local draft');assert.equal(await frame().locator('#rsvp-action').getAttribute('aria-pressed'),'true');await frame().locator('#room-form .send-btn').click();await frame().locator('#room-new-messages').getByText('Room local draft',{exact:true}).waitFor();assert.match(await frame().locator('#room-new-messages').innerText(),/Room local draft/);assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).connectRoom.messages.at(-1),primary),'Room local draft','Visible Room message must be persisted atomically');assert.equal(await frame().locator('#room-input').inputValue(),'');await capture('room-chat');
  if(width===320){await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.waitForFunction(()=>getComputedStyle(document.querySelector('#premium-connect').contentDocument.documentElement).fontSize==='32px');assert.ok(await frame().locator('#room-scroll').evaluate(e=>e.clientHeight>100),'Enlarged Room needs a readable conversation viewport');assert.match(await frame().locator('#room-new-messages').innerText(),/Room local draft/);assert.ok(await frame().locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1));await capture('room-enlarged');await page.evaluate(()=>document.documentElement.style.fontSize='');}
  await page.locator('.connect-return').click();await page.locator('.greeting').waitFor();
  for(const role of ['group','team','leader','visitor']){
   await scenario(role);await page.locator('.header-connect').click();await ready();
   assert.equal(await frame().locator('.conversation-row:visible').count(),role==='visitor'?0:role==='group'?3:role==='team'?1:4,role+' authorized inbox');
   if(role==='visitor'){assert.equal(await frame().locator('.people-rail .person:visible').count(),0);assert.equal(await frame().locator('#compose-toggle').isVisible(),false);}
   if(role==='team'){assert.equal(await frame().locator('.conversation-row[data-open=thread]:visible').count(),0);assert.equal(await frame().locator('#compose-toggle').isVisible(),false);}
   await page.locator('.connect-return').click();
  }
  // Distinct origin/return and enlarged text; four primary tabs stay authoritative.
  await scenario('connected');
  for(const origin of ['groups','team','read']){
   await page.locator('#primary-nav [data-route='+origin+']').click();
   if(origin==='groups')await page.locator('[data-return-focus=groups-conversation]').click();else if(origin==='team')await page.locator('[data-return-focus=team-connect]').click();else await page.locator('.header-connect').click();
   await ready();assert.equal(await page.locator('#primary-nav a').count(),4);
   if(width===320&&origin==='read'){
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Enlarged parent overflow');
    assert.ok(await frame().locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1),'Enlarged premium iframe overflow');
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations,[]);await capture('enlarged');await page.evaluate(()=>document.documentElement.style.fontSize='');
   }
   await page.locator('.connect-return').click();await page.locator('#primary-nav [data-route='+origin+'][aria-current=page]').waitFor();
   if(origin!=='read')assert.equal(await page.evaluate(()=>document.activeElement?.dataset.returnFocus),(origin==='team'?'team-connect':'groups-conversation'),'Origin focus restoration');else assert.equal(await page.locator('.header-connect').evaluate(e=>e===document.activeElement),true,'Read header Connect focus restoration');
  }
  for(const value of ['unavailable','group-ready']){await scenario(value);await page.locator('.header-connect').click();assert.equal(await page.locator('#premium-connect').count(),0,value+' must not expose local messaging');await page.locator('#primary-nav [data-route=today]').click();}
  await scenario('connected');await page.locator('.header-connect').click();await ready();await frame().locator('.people-rail [data-person=Jess]').click();
  await frame().locator('#direct-input').fill('Saved before quota failure');const safeBefore=await page.evaluate(k=>localStorage.getItem(k),primary);
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Quota full','QuotaExceededError');};});await frame().locator('#direct-input').fill('Unsaved text remains visible');await frame().locator('#direct-form .send-btn').click();
  assert.equal(await frame().locator('#direct-input').inputValue(),'Unsaved text remains visible');assert.equal(await page.evaluate(k=>localStorage.getItem(k),primary),safeBefore,'Failure overwrote authoritative message/draft state');assert.doesNotMatch(await frame().locator('#direct-new-messages').innerText(),/Unsaved text remains visible/);assert.ok(await page.locator('#today [role=alert]').count()>0,'Storage failure must be announced');
  await page.reload();await ready();assert.equal(await frame().locator('#direct-input').inputValue(),'Saved before quota failure');
  const malformed='{"version":99,"unknown":"preserve"}';await page.evaluate(([k,v])=>{const s=JSON.parse(localStorage.getItem(k));s.connectDrafts=JSON.parse(v);localStorage.setItem(k,JSON.stringify(s));},[primary,malformed]);const badRaw=await page.evaluate(k=>localStorage.getItem(k),primary);await page.reload();await page.locator('#today h1').waitFor();assert.equal(await page.locator('#premium-connect').count(),0,'Malformed communication metadata must fail closed');assert.equal(await page.evaluate(k=>localStorage.getItem(k),primary),badRaw);
  assert.deepEqual(await original(),originalBefore,'Original Rally One persistence changed');assert.deepEqual(errors,[]);assert.deepEqual(external,[],'Communication fixtures must stay local');
  results.push({engine:engine.name(),width,inbox:'passed',group:'passed',direct:'passed',room:'passed',roles:'passed',storage:'passed',navigation:'passed'});console.log('CONVERGENCE 2C passed '+engine.name()+' '+width);await ctx.close();
 }
}finally{await writeFile(out+'/results-'+engine.name()+'.json',JSON.stringify(results,null,2));await browser.close();}
