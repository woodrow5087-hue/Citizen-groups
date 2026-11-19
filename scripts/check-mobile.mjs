import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.SCREENSHOT_DIR || '.browser-artifacts');
const url = process.env.BASE_URL || 'http://127.0.0.1:4195';
const server = process.env.BASE_URL ? null : spawn('python3', ['-m','http.server','4195','--bind','127.0.0.1'], {cwd:root, stdio:'ignore'});
const engine = process.env.BROWSER || 'chromium';
assert.ok(['chromium','webkit'].includes(engine));
let browser;
const metrics = [];
try {
  await mkdir(output, {recursive:true});
  for (let attempt=0; attempt<50; attempt++) {
    try { assert.equal((await fetch(url)).status, 200); break; }
    catch(error) { if(attempt===49) throw error; await new Promise(r=>setTimeout(r,100)); }
  }
  browser = await ({chromium,webkit}[engine]).launch(engine==='chromium' && process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {});
  // env() resolves to zero on a desktop runner. Reapply the real stylesheet with
  // 47px (59px at 430w) top / 34px bottom stand-ins to exercise the safe-area layout budget.
  // This is a layout simulation, not a claim of testing physical iOS Safari.
  const css = await (await fetch(new URL('/styles.css',url))).text();
  const cases = [[320,568,false],[375,635,false],[375,667,false],[390,664,false],[375,812,false],[375,812,true],[390,844,false],[390,844,true],[430,932,false],[430,932,true],[1280,900,false]];
  for (const theme of ['light','dark']) for (const [width,height,safe] of cases) {
    const context = await browser.newContext({viewport:{width,height},isMobile:width<701,hasTouch:width<701,deviceScaleFactor:1});
    const page = await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
    await page.goto(url);
    if(theme==='dark') {
      await page.locator('nav [data-tab="you"]').click();
      await page.getByRole('switch',{name:'Dark appearance'}).click();
      await page.locator('nav [data-tab="today"]').click();
    }
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    async function safeArea() {
      if(safe) await page.addStyleTag({content:css.replaceAll('env(safe-area-inset-top)',width===430?'59px':'47px').replaceAll('env(safe-area-inset-bottom)','34px')});
    }
    await safeArea();
    await page.locator('.habit-tile.featured[data-grow="read"]').waitFor();
    const id=`${engine}-${theme}-${width}x${height}${safe?'-safe':''}`;
    async function measure(step) {
      const ring = await page.locator('.today-hero .daily-ring').evaluate(e=>{
        const center=e.querySelector('.ring-center'), count=center.querySelector('strong').getBoundingClientRect(), label=center.querySelector('.ring-label').getBoundingClientRect(), bounds=e.getBoundingClientRect();
        return {display:getComputedStyle(center).display,gap:label.top-count.bottom,offset:Math.abs((count.top+label.bottom)/2-(bounds.top+bounds.bottom)/2),horizontal:Math.abs((label.left+label.right)/2-(bounds.left+bounds.right)/2)};
      });
      assert.equal(ring.display,'flex',`${id} centered ring layout`);
      assert.ok(Math.abs(ring.gap-2)<=1 && ring.offset<=1 && ring.horizontal<=1,`${id} ring text alignment ${JSON.stringify(ring)}`);
      const result = await page.evaluate(()=>{
        const main=document.querySelector('#content'), nav=document.querySelector('nav'), bounds=nav.getBoundingClientRect();
        const frame=document.querySelector('.app-frame').getBoundingClientRect();
        const offscreen=[...main.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.left<frame.left-1||r.right>frame.right+1;}).map(e=>e.textContent.trim());
        return {contentHeight:main.clientHeight,contentScroll:main.scrollHeight,contentWidth:main.clientWidth,scrollWidth:main.scrollWidth,documentWidth:document.documentElement.scrollWidth,navBottom:bounds.bottom,navButtons:[...nav.querySelectorAll('button')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})),offscreen};
      });
      assert.ok(result.documentWidth<=width,`${id} document horizontal overflow`);
      assert.ok(result.scrollWidth<=result.contentWidth,`${id} content horizontal overflow`);
      assert.deepEqual(result.offscreen,[],`${id} offscreen controls`);
      assert.ok(result.navBottom<=height+1,`${id} cut-off navigation`);
      for(const button of result.navButtons) assert.ok(button.w>=44&&button.h>=44,`${id} nav target`);
      if(width>=375 && width<701 && (height>=812 || (!safe && height>=664))) assert.ok(result.contentScroll<=result.contentHeight+1,`${id} step ${step}: Today scrolls ${result.contentScroll-result.contentHeight}px`);
      metrics.push({id,step,...result});
    }
    await measure(0);
    await page.screenshot({path:resolve(output,`${id}.png`)});
    // 44px minimum for all Today actions, including See all and encouragement.
    for(const box of await page.locator('.today-view button').evaluateAll(es=>es.map(e=>({label:e.textContent,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})))) assert.ok(box.w>=44&&box.h>=44,`${id} touch target ${box.label}`);
    const violations=(await new AxeBuilder({page}).include('.app-frame').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
    assert.deepEqual(violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[],`${id} accessibility`);
    // Exercise actual controls and every recommended state at every viewport.
    for(const [index,key] of ['read','share','memorize','pray'].entries()) {
      await page.locator(`.rhythm-nudge[data-grow="${key}"]`).click();
      if(key==='read') await page.locator('[data-action="finish"]').click();
      if(key==='share') {await page.locator('#reflection').fill('A fictional browser test reflection.');await page.locator('[data-action="save-share"]').click();}
      if(key==='memorize') {for(const word of ['know','good','love','called','purpose']) await page.locator(`[data-word="${word}"]`).click();await page.locator('[data-action="check-memory"]').click();}
      if(key==='pray') {await page.locator('[data-action="prayed"]').first().click();await page.locator('#prayer-request').fill('Fictional test request');await page.locator('[data-action="finish-pray"]').click();await page.locator('.celebrate').waitFor({state:'detached'});}
      await page.locator('nav [data-tab="today"]').click();
      await measure(index+1);
    }
    await page.reload(); await safeArea();
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    assert.equal(await page.locator('.daily-ring').getAttribute('aria-label'),'4 of 4 today');
    await page.locator('[data-action="encourage"]').click();
    assert.equal(await page.locator('[data-action="encourage"]').getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#toast').textContent(),/No message was sent/);
    await page.locator('[data-action="serve"]').click();
    await page.getByRole('dialog',{name:'Serve Together'}).waitFor();
    await page.locator('[data-action="close-sheet"]').click();
    await page.locator('[data-action="gathering"]').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'group-gathering');
    await page.locator('[data-action="rsvp"][data-value="going"]').click();
    await page.reload(); await safeArea();
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    await page.locator('nav [data-tab="groups"]').click();
    assert.match(await page.locator('[data-action="rsvp"][data-value="going"]').textContent(),/Going/);
    for(const tab of ['grow','groups','you','today']) {
      await page.locator(`nav [data-tab="${tab}"]`).click();
      assert.equal(await page.locator('nav [aria-current="page"]').getAttribute('data-tab'),tab);
      if(theme==='dark' && width===390 && safe) {
        const results=await new AxeBuilder({page}).include('.app-frame').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        assert.deepEqual(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],`${id} ${tab} accessibility`);
      }
      assert.ok(await page.locator('#content').evaluate(e=>e.scrollWidth<=e.clientWidth),`${id} ${tab} overflow`);
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.ok(await page.locator('.nav-item').first().evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration)<.001));
    await page.locator('nav [data-tab="grow"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('nav [aria-current="page"]').getAttribute('data-tab'),'grow');
    assert.deepEqual(errors,[],`${id} browser/network errors`);
    await context.close();
  }
  console.log(`Passed ${cases.length*2} light/dark ${engine} viewport cases, all five progress states, real activity flows, persistence, previews, navigation, reduced motion, and WCAG A/AA axe checks.`);
} finally {
  await writeFile(resolve(output,`metrics-${engine}.json`),JSON.stringify(metrics,null,2)+'\n');
  await browser?.close(); server?.kill();
}
