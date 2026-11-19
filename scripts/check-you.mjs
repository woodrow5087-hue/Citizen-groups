import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const url=process.env.BASE_URL||'http://127.0.0.1:4196';
const server=process.env.BASE_URL?null:spawn('python3',['-m','http.server','4196','--bind','127.0.0.1'],{stdio:'ignore'});
try {
 await mkdir('.browser-artifacts',{recursive:true});
 for(let i=0;i<50;i++){try{assert.equal((await fetch(url)).status,200);break;}catch(e){if(i===49)throw e;await new Promise(r=>setTimeout(r,100));}}
 for(const width of [320,375,390,430]) for(const theme of ['light','dark']) {
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const page=await context.newPage();
  await page.goto(url);
  await page.locator('nav [data-tab="you"]').click();
  if(theme==='dark')await page.getByRole('switch').click();
  await page.locator('#content').evaluate(e=>e.scrollTop=0);
  for(const tab of ['awards','history','stats']) {
   await page.locator(`[data-profile="${tab}"]`).click();
   assert.equal(await page.locator('.demo-controls [role="switch"]').count(),1);
   assert.equal(await page.locator('.you-hero [role="switch"]').count(),0);
   assert.ok(await page.locator('#content').evaluate(e=>e.scrollWidth<=e.clientWidth));
   const results=await new AxeBuilder({page}).include('.app-frame').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   assert.deepEqual(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[],`${width} ${theme} ${tab}`);
  }
  await page.locator('[data-profile="awards"]').click();
  assert.equal(await page.locator('.award').count(),8);
  assert.equal(await page.locator('.award.locked').count(),4);
  await page.locator('#content').evaluate(e=>e.scrollTop=0);
  if(width===390) {
   await page.locator('.app-frame').screenshot({path:`.browser-artifacts/you-${theme}.png`});
   await page.locator('.award-grid').scrollIntoViewIfNeeded();
   await page.locator('.app-frame').screenshot({path:`.browser-artifacts/awards-${theme}.png`});
  }
  await page.getByRole('switch').focus();await page.keyboard.press('Space');
  assert.equal(await page.getByRole('switch').getAttribute('aria-checked'),String(theme==='light'));
  await context.close();
 }
 console.log('You: 8 width/appearance cases pass; all 3 sections, awards, bottom controls, keyboard toggle, overflow and axe checks.');
} finally {await browser.close();server?.kill();}
