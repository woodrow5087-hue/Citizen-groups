import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import local from '../pilot/s11e-local-review.cjs';
const lab=local.createLocalPilot(),url=await lab.start(),browser=await chromium.launch();
const out='test-results/s11e-local-review';await mkdir(out,{recursive:true});
const results=[];
try{
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(url+'/'))external.push(r.url());});
  const click=async name=>{await page.getByRole('button',{name,exact:true}).click();await page.waitForLoadState('load');};
  const audit=async name=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(r.violations.map(v=>[v.id,v.nodes.map(n=>n.target)]),[],name);await page.screenshot({path:out+'/'+width+'-'+name+'.png',fullPage:true,animations:'disabled'});};
  await page.goto(url);await audit('consent');await click('Opt in as Sample A');await page.getByRole('heading',{name:'Wednesday Group'}).waitFor();await audit('member');
  await click('Simulate outage');await page.getByRole('heading',{name:'Information temporarily unavailable'}).waitFor();assert.equal(await page.getByText('Wednesday Group',{exact:true}).count(),0);await audit('unavailable');
  await click('Restore simulated service');await page.getByRole('heading',{name:'Wednesday Group'}).waitFor();
  await click('Opt in / switch to Sample B');await page.getByRole('heading',{name:'Sunday Group'}).waitFor();assert.equal(await page.getByText('Wednesday Group',{exact:true}).count(),0);
  await click('Withdraw sample consent');await page.getByRole('heading',{name:'Choose to participate'}).waitFor();await audit('withdrawn');
  await click('Stop lab and revoke all sample grants');await page.getByRole('heading',{name:'Review paused'}).waitFor();await click('Reset fictional lab (fresh opt-in required)');await page.getByRole('heading',{name:'Choose to participate'}).waitFor();
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);results.push({width,status:'passed',synthetic:true});
  await context.close();console.log('11E local synthetic browser passed '+width);
 }
}finally{await writeFile(out+'/results.json',JSON.stringify(results,null,2));await browser.close();await lab.close();}
