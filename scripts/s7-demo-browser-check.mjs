import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/s7-demo-browser-check.mjs <preview-url>');
await mkdir('test-results/s7',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.locator('[data-welcome="login"]:visible').click();
 await page.locator('[data-welcome="demo"]:visible').click();
 await page.locator('#rp-gateway').waitFor({state:'hidden'});
 await page.locator('.f09-board').waitFor();
 const saved=()=>page.evaluate(()=>({
   ui:JSON.parse(localStorage.getItem('rallypoint-today-ui-v1')),
   app:JSON.parse(localStorage.getItem('rallypoint-phase1-2026')),
   chat:localStorage.getItem('rallypoint-wednesday-chat-lab-v1')
 }));
 const baseline=await saved();
 const open=async()=>{await page.locator('.profile-avatar').click();await page.locator('.s7-scene-picker').waitFor();};
 const run=async id=>{
   await open();
   await page.locator('[data-action="s7-scenario"][data-value="'+id+'"]').click();
   await page.locator('.f09-board').waitFor();
   const result=await saved();
   assert.equal(result.app.view,'today');
   assert.equal(result.chat,baseline.chat,'scenario cannot erase modern Connect history');
   return result;
 };
 let entry=await run('visitor');
 assert.deepEqual(entry.ui.memberships,{group:false,team:false});
 assert.equal(entry.app.role,'member');
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('.gv2-public-rail').waitFor();
 assert.equal(await page.locator('.gv2-home').count(),0);
 await page.locator('#nav [data-go="today"]').click();
 entry=await run('group-member');
 assert.deepEqual(entry.ui.memberships,{group:true,team:false});
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('.gv2-home').waitFor();
 assert.equal(await page.locator('.gv2-rail-button[data-person]').count(),6);
 await page.locator('#nav [data-go="today"]').click();
 entry=await run('serving');
 assert.deepEqual(entry.ui.memberships,{group:false,team:true});
 await page.locator('.f09b-hero[data-priority="serve-response"]').waitFor();
 await page.locator('.f09b-hero [data-action="f09-serve"]').click();
 assert.equal((await saved()).app.teamStatus,'confirmed');
 entry=await run('serving');
 assert.equal(entry.app.teamStatus,'pending','reloading a demo scene re-arms its fixture action');
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('.gv2-public-rail').waitFor();
 await page.locator('#nav [data-go="today"]').click();
 entry=await run('leader');
 assert.equal(entry.app.role,'leader');
 assert.deepEqual(entry.ui.memberships,{group:true,team:false});
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('.gv2-home').waitFor();
 assert.equal(await page.locator('.gv2-more [data-value="leader"]').count(),1);
 await page.locator('#nav [data-go="today"]').click();
 entry=await run('group-serving');
 assert.deepEqual(entry.ui.memberships,{group:true,team:true});
 assert.equal(entry.app.role,'member');
 await page.screenshot({path:'test-results/s7/combined-demo-390.png',animations:'disabled'});
 await open();
 await page.locator('[data-action="s7-restore"]').click();
 await page.locator('.f09-board').waitFor();
 const restored=await saved();
 assert.deepEqual(restored.ui,baseline.ui,'session restore must recover original membership');
 assert.deepEqual(restored.app,baseline.app,'session restore must recover original app state');
 assert.equal(restored.chat,baseline.chat);
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 assert.deepEqual(a11y.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],
   'leadership scenario picker WCAG');
 assert.deepEqual(errors,[],'leadership demo JS errors');
 await context.close();
 console.log('Sprint 7C: visitor, group, serving, leader and combined demo scenes plus safe session restore passed at 390px');
}finally{await browser.close();}
