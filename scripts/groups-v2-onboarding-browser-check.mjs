import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/groups-v2-onboarding-browser-check.mjs <preview-url>');
const out='test-results/groups-v2-onboarding';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
const cases=[
 {id:'guest',role:'guest',group:false,team:false,private:false},
 {id:'group-member',role:'connected',group:true,team:false,private:true},
 {id:'serving-only',role:'connected',group:false,team:true,private:false},
 {id:'group-serving',role:'connected',group:true,team:true,private:true},
 {id:'leader-choice',role:'leader',group:true,team:false,private:true}
];
try{
 for(const setting of cases){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(base+'?welcome=1');
  await page.locator('[data-welcome="create"]:visible').click();
  await page.locator('[data-welcome-campus="central"]:visible').click();
  await page.locator('#rp-gateway [data-welcome="next"]').click();
  await page.locator('[data-welcome-role="'+setting.role+'"]:visible').click();
  await page.locator('#rp-gateway [data-welcome="next"]').click();
  if(setting.role!=='guest'){
   if(setting.group!==true)await page.locator('[data-welcome-membership="group"]').click();
   if(setting.team===true)await page.locator('[data-welcome-membership="team"]').click();
  }
  await page.locator('[data-welcome="finish"]:visible').click();
  await page.locator('#rp-gateway').waitFor({state:'hidden'});
  const values=await page.evaluate(()=>({
    ui:JSON.parse(localStorage.getItem('rallypoint-today-ui-v1')),
    app:JSON.parse(localStorage.getItem('rallypoint-phase1-2026'))
  }));
  assert.equal(values.ui.memberships.group,setting.group,setting.id+' group preference');
  assert.equal(values.ui.memberships.team,setting.team,setting.id+' team preference');
  assert.equal(values.app.groupPane,'overview',setting.id+' correct initial route');
  assert.equal(values.app.role,'member',setting.id+' no unverified leader privileges');
  await page.locator('#nav [data-go="group"]').click();
  if(setting.private){
    await page.locator('.gv2-home').waitFor();
    assert.equal(await page.locator('.gv2-home .gv2-rail-button').count(),7,setting.id);
    assert.equal(await page.locator('.gv2-home .gv2-rail-label').first().textContent(),'My group');
    assert.equal(await page.locator('.gv2-public-rail').count(),0);
    assert.equal(await page.locator('.gv2-more [data-value="leader"]').count(),0,
      'Onboarding never grants unverified leader tools');
  }else{
    await page.locator('.group-discovery-v07').waitFor();
    assert.equal(await page.locator('.gv2-public-rail .gv2-rail-button[data-person]').count(),6,setting.id);
    assert.equal(await page.locator('.gv2-home').count(),0);
    assert.equal(await page.locator('.gv2-public-rail [data-value="people"]').count(),0);
    await page.locator('.gv2-public-rail .gv2-rail-button[data-person="mandy"]').click();
    await page.locator('.gv2-profile h1').getByText('Mandy').waitFor();
    assert.equal(await page.locator('.gv2-profile [data-go="group"][data-pane="chat"]').count(),0);
    assert.equal(await page.locator('.ro-care').count(),0);
    await page.locator('.gv2-profile .gv2-back').click();
    await page.locator('.group-discovery-v07').waitFor();
  }
  if(setting.id==='serving-only'){
    await page.screenshot({path:out+'/serving-only-390.png',animations:'disabled'});
  }
  if(setting.id==='guest'){
    await page.screenshot({path:out+'/guest-390.png',animations:'disabled'});
  }
  assert.deepEqual(errors,[],setting.id+' runtime errors');
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(a11y.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],
    setting.id+' a11y');
  await context.close();
  console.log('Groups 2.0 onboarding profiles passed: '+setting.id);
 }
}finally{await browser.close();}
