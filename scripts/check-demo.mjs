import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=fileURLToPath(new URL('../',import.meta.url));
const server=process.env.BASE_URL?null:spawn('python3',['-m','http.server','4201','--bind','127.0.0.1'],{cwd:root+'dist',stdio:'ignore'});
const target=new URL(process.env.BASE_URL||'http://127.0.0.1:4201');
if(target.hostname.endsWith('.netlify.app'))target.searchParams.set('ntl-drawer-state','hidden');
const launch=process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{};
if(process.env.BASE_URL&&process.env.HTTPS_PROXY){const u=new URL(process.env.HTTPS_PROXY);launch.proxy={server:u.origin,username:decodeURIComponent(u.username)||undefined,password:decodeURIComponent(u.password)||undefined};}
let browser;const metrics=[];
try {
 await mkdir(root+'.browser-artifacts',{recursive:true});
 for(let i=0;i<50;i++){try{assert.equal((await fetch(target)).status,200);break;}catch(e){if(i===49)throw e;await new Promise(r=>setTimeout(r,100));}}
 browser=await chromium.launch(launch);
 const css=await(await fetch(new URL('/styles.css',target))).text();
 for(const [width,height,safe] of [[320,568,false],[375,667,false],[375,812,false],[375,812,true],[390,844,false],[390,844,true],[430,932,true],[1280,900,false]]) {
  const id=`${width}x${height}${safe?'-safe':''}`,errors=[];
  const context=await browser.newContext({viewport:{width,height},isMobile:width<701,hasTouch:width<701,reducedMotion:'reduce',deviceScaleFactor:1});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  async function insets(){if(safe)await page.addStyleTag({content:css.replaceAll('env(safe-area-inset-top)',width===430?'59px':'47px').replaceAll('env(safe-area-inset-bottom)','34px')});}
  await page.goto(target.href);await page.evaluate(()=>document.fonts.ready);await insets();
  async function audit(label,scope='.app-frame') {
   const violations=(await new AxeBuilder({page}).include(scope).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
   assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[],`${id} ${label} accessibility`);
  }
  async function layout(tab) {
   const m=await page.evaluate(()=>{const main=document.querySelector('#content'),f=document.querySelector('.app-frame').getBoundingClientRect(),nav=document.querySelector('nav').getBoundingClientRect();return {mainHeight:main.clientHeight,scrollHeight:main.scrollHeight,width:main.clientWidth,scrollWidth:main.scrollWidth,docWidth:document.documentElement.scrollWidth,navBottom:nav.bottom,frameBottom:f.bottom,offscreen:[...main.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left<f.left-1||r.right>f.right+1)}).map(e=>e.textContent.trim())};});
   assert.ok(m.docWidth<=width&&m.scrollWidth<=m.width,`${id} ${tab} horizontal overflow ${JSON.stringify(m)}`);
   assert.deepEqual(m.offscreen,[],`${id} ${tab} offscreen buttons`);
   assert.ok(m.navBottom<=m.frameBottom+1&&m.navBottom<=height+1,`${id} ${tab} clipped navigation`);
   for(const box of await page.locator('nav button').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))))assert.ok(box.w>=44&&box.h>=44);
   await page.locator('#content').evaluate(e=>e.scrollTop=e.scrollHeight);
   const end=page.locator('#content').locator(':scope > *').last();
   assert.ok(await end.evaluate(e=>{const main=document.querySelector('#content').getBoundingClientRect(),r=e.getBoundingClientRect();return r.bottom<=main.bottom+1;}),`${id} ${tab} end cut off`);
   await page.locator('#content').evaluate(e=>e.scrollTop=0);metrics.push({id,tab,...m});
  }
  for(const tab of ['today','groups','grow','serve','you']) {
   await page.locator(`nav [data-tab="${tab}"]`).click();assert.equal(await page.locator('nav [aria-current="page"]').count(),1);
   await layout(tab);await audit(tab);
   if(width===390&&!safe)await page.locator('.app-frame').screenshot({path:root+`docs/reference-review/${tab}.png`});
  }
  await page.locator('nav [data-tab="today"]').click();
  assert.equal(await page.locator('.daily-actions button.next').getAttribute('data-grow'),'read');
  await page.locator('[data-grow="read"]').first().click();await page.locator('[data-action="finish"]').click();
  await page.locator('[data-grow="share"]').first().click();await page.locator('#reflection').fill('A fictional reflection saved only on this device.');await page.locator('[data-action="save-share"]').click();
  await page.locator('[data-grow="memorize"]').first().click();
  for(const word of ['know','good','love','called','purpose'])await page.locator(`[data-word="${word}"]`).click();await page.locator('[data-action="check-memory"]').click();
  await page.locator('[data-grow="pray"]').first().click();await page.locator('[data-action="prayed"]').first().click();await page.locator('#prayer-request').fill('Fictional private request');await page.locator('[data-action="finish-pray"]').click();await page.locator('.celebrate').waitFor({state:'detached'});
  await page.locator('nav [data-tab="today"]').click();assert.match(await page.locator('.daily-count').textContent(),/4 of 4 today/);
  await page.locator('nav [data-tab="groups"]').click();assert.match(await page.locator('.circle-update').textContent(),/fictional reflection/);
  await page.locator('[data-action="open-group"]').click();await page.locator('[data-value="going"]').click();await layout('group-details');
  if(width===390&&!safe)await audit('group-details');
  await page.locator('nav [data-tab="serve"]').click();await page.locator('[data-action="join-serve"]').click();assert.match(await page.locator('#toast').textContent(),/No organiser was contacted/);
  await page.reload();await insets();await page.locator('nav [data-tab="today"]').click();assert.match(await page.locator('.daily-count').textContent(),/4 of 4 today/);
  await page.locator('nav [data-tab="serve"]').click();await page.locator('[data-action="manage-serve"]').click();
  assert.equal(await page.locator('.sheet-close').evaluate(e=>document.activeElement===e),true);
  await page.locator('[data-action="leave-serve"]').click();await page.locator('[data-action="join-serve"]').waitFor();
  await page.locator('nav [data-tab="groups"]').click();await page.locator('[data-action="open-group"]').click();assert.match(await page.locator('[data-value="going"]').textContent(),/Going/);
  await page.getByRole('button',{name:'Your profile',exact:true}).click();await page.getByRole('dialog').waitFor();
  if(width===390&&!safe)await audit('profile','.sheet-card');
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
  await page.getByRole('button',{name:'View activity',exact:true}).click();
  if(width===390&&!safe)await audit('activity','.sheet-card');
  await page.keyboard.press('Shift+Tab');assert.equal(await page.getByRole('dialog').locator('button').last().evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Tab');assert.equal(await page.locator('.sheet-close').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Escape');
  await page.locator('nav [data-tab="grow"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('nav [aria-current="page"]').getAttribute('data-tab'),'grow');
  for(const action of ['read','share','memorize','pray']){await page.locator(`[data-grow="${action}"]`).first().click();await layout(action);if(width===390&&!safe)await audit(action);}
  await page.emulateMedia({reducedMotion:'no-preference'});assert.ok(await page.locator('nav button').first().evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration)>0));
  await page.emulateMedia({reducedMotion:'reduce'});assert.ok(await page.locator('nav button').first().evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration)===0));
  assert.deepEqual(errors,[],`${id} browser/asset errors`);await context.close();
 }
 console.log('Passed 8 viewport/safe-area cases: 5 destinations, full activity flows, local join/leave, RSVP, persistence, keyboard dialogs, accessibility and overflow.');
} finally {await writeFile(root+'.browser-artifacts/metrics.json',JSON.stringify(metrics,null,2)+'\n');await browser?.close();server?.kill();}
