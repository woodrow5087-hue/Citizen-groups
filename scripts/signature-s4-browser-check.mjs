// Bounded S4 presentation/rehearsal checks; all prior gates remain unchanged.
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const base=process.argv[2];assert.ok(base,'Pass preview origin');
const engine=process.env.CONVERGENCE_BROWSER==='webkit'?webkit:chromium;
const browser=await engine.launch();const out='test-results/signature-s4/'+(engine===webkit?'webkit':'chromium');await mkdir(out,{recursive:true});
const results=[],source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const roles=['group','team','leader','visitor'];let failure=null;
try{
 for(const [i,role] of roles.entries())for(const pose of ['normal','large','reduced']){
  const width=pose==='normal'?[320,375,390,430][i]:pose==='large'?320:390;
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:pose==='reduced'?'reduce':'no-preference',timezoneId:'America/Denver'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-12-02T12:00:00Z'));
  await page.goto(new URL('/foundation2/',base).href);await page.locator('.greeting').waitFor();
  await page.locator('#preview-tools>summary').click();await page.locator('#scenario').selectOption(role);
  if(pose==='large')await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  for(const route of ['today','groups','team','read','connect']){
   if(route==='connect')await page.locator('.header-connect').click();
   else {const link=page.locator('#primary-nav [data-route='+route+']');await link.focus();await page.keyboard.press('Enter');}
   await page.locator('#today').waitFor();
   if(route==='connect')await page.locator('#premium-connect, .connect-page').first().waitFor();
   await page.evaluate(()=>document.fonts.ready);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),role+'/'+pose+'/'+route+' overflow');
   assert.equal(await page.locator('.signature-destinations').count(),route==='today'?0:1);
   const a=await new AxeBuilder({page}).analyze();assert.deepEqual(a.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],role+'/'+pose+'/'+route+' axe');
   for(const link of await page.locator('#primary-nav a').all()){
    const hit=await link.evaluate(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,hit:el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};});
    assert.ok(hit.w>=44&&hit.h>=44&&hit.hit,role+'/'+pose+'/'+route+' native navigation target '+JSON.stringify(hit));
   }
   const footer=page.locator('.preview-footer a');await footer.focus();await footer.scrollIntoViewIfNeeded();
   assert.ok(await footer.evaluate(el=>el.getBoundingClientRect().bottom<=document.querySelector('#primary-nav').getBoundingClientRect().top),role+'/'+pose+'/'+route+' final link reachable');
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:out+'/'+role+'-'+pose+'-'+route+'.png',fullPage:true,animations:'disabled'});
   results.push({role,pose,width,route,axe:'passed',overflow:'passed',nativeNavigation:'passed',finalContent:'reachable'});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
}catch(e){failure=String(e.stack||e);throw e;}finally{await browser.close();await writeFile(out+'/results.json',JSON.stringify({source,sourceStatus:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),base,results,failure},null,2));}
console.log('S4 '+results.length+' destination/role/size/motion scenes passed');
