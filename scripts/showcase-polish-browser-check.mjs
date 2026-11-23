import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

/* Safe, reversible showcase: visual motion only. The already validated
 * Sprint 7 interactions remain the owners of messages, RSVPs and care.
 */
const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/showcase-polish-browser-check.mjs <preview-url>');
await mkdir('test-results/showcase', {recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
try{
 for(const [width,height] of [[320,640],[390,844],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').click();
  await page.locator('[data-welcome="demo"]:visible').click();
  await page.locator('#rp-gateway').waitFor({state:'hidden'});
  await page.locator('.rally-one .premium-alive.is-f09-board .f09b-hero').waitFor();
  const hero=page.locator('.f09b-hero');
  const mobile=await page.evaluate(()=>{
    const box=(sel)=>document.querySelector(sel)?.getBoundingClientRect().width||0;
    return {w:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,
      hero:box('.f09b-hero'),row:box('.f09b-row'),people:document.querySelectorAll('.gv2-today-people .gv2-rail-button[data-person]').length,
      anim:getComputedStyle(document.querySelector('.f09b-hero')).animationName};
  });
  assert.equal(mobile.overflow,false,'no accidental horizontal overflow '+width);
  assert.ok(mobile.hero>=width-55,'premium hero must remain full-width at '+width);
  if(mobile.row)assert.ok(mobile.row>=mobile.hero-8,'secondary remains full width');
  assert.equal(mobile.people,6,'approved real photo roster unchanged');
  assert.match(mobile.anim,/ro-show-rise/,'hero enters once and then settles');
  const ring=page.locator('.gv2-today-people .gv2-ring').first();
  assert.match(await ring.evaluate(x=>getComputedStyle(x).animationName),/ro-show-ring/);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await hero.evaluate(x=>getComputedStyle(x).animationName),'none','reduced motion must disable showcase animation');
  assert.equal(await ring.evaluate(x=>getComputedStyle(x).animationName),'none');
  if(width===390){
    await page.screenshot({path:'test-results/showcase/today-390-no-motion.png',animations:'disabled',fullPage:true});
    await page.locator('.profile-avatar').click();
    await page.locator('.s7-scene-picker').waitFor();
    assert.equal(await page.locator('.s7-scene-picker .s7-scene').count(),5);
    assert.equal(await page.locator('.s7-scene-picker').evaluate(el=>el.compareDocumentPosition(el.parentNode.querySelector('.demo-section'))&Node.DOCUMENT_POSITION_FOLLOWING),4,
      'leadership scenes are first inside the profile controls');
    await page.locator('[data-action="s7-scenario"][data-value="group-serving"]').click();
    await page.locator('.f09b-hero').waitFor();
    const before=await page.locator('.f09b-hero').getAttribute('data-priority');
    assert.equal(before,'group-rsvp');
    await page.locator('.f09b-hero [data-action="f09-rsvp"]').click();
    await page.locator('.f09b-hero:not([data-priority="group-rsvp"])').waitFor();
    assert.notEqual(await page.locator('.f09b-hero').getAttribute('data-priority'),before,
      'a real RSVP changes the recommendation instead of creating a fake animation');
  }
  assert.deepEqual(errors,[],'no scripted errors at '+width);
  await context.close();
  console.log('Rally One evening-showcase motion, responsive and reduced-motion checks passed '+width+'px');
 }
}finally{await browser.close();}
