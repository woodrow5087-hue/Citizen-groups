import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist'),out=path.join(root,'test-results','alive-citizen-v02');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const target=path.resolve(dist,'.'+(pathname==='/'?'/index.html':pathname));
    if(!target.startsWith(dist+path.sep)){response.writeHead(403).end();return;}
    response.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');
    response.setHeader('Cache-Control','no-store');
    response.end(fs.readFileSync(target));
  }catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/alive-lab.html';
const browser=await chromium.launch({headless:true});
const results=[];
try{
  for(const [width,height] of [[320,568],[390,844],[430,932],[1280,900]]){
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce',locale:'en-US'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#citizen-campus-button').waitFor({state:'visible'});
    await page.evaluate(()=>document.fonts.ready);
    // Give external campus photography and lazy-loaded cards a paint cycle.
    await page.waitForTimeout(1300);
    const metrics=await page.evaluate(()=>({
      viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      rings:document.querySelectorAll('.story-item').length,
      officialImages:[...document.querySelectorAll('.citizen-week img,.citizen-campus-cards img,.citizen-outreach-row img')].map(x=>({src:x.currentSrc,loaded:x.complete&&x.naturalWidth>0})),
      groupLinks:document.querySelectorAll('a[href*="churchcenter.com"]').length
    }));
    assert.ok(metrics.rings>=9,'Includes both community stories and official Citizen campus stories');
    assert.ok(metrics.groupLinks>=2,'Official Church Center links visible in app');
    assert.ok(metrics.scrollWidth<=width+2,'No page horizontal overflow');
    assert.deepEqual(errors,[],'No page errors');
    if(width===390){
      await page.screenshot({path:path.join(out,'citizen-today-390.png'),animations:'disabled'});
      await page.locator('.citizen-week').scrollIntoViewIfNeeded();
      await page.waitForTimeout(750);
      await page.screenshot({path:path.join(out,'citizen-sunday-recap-390.png'),animations:'disabled'});
      await page.locator('.citizen-local').scrollIntoViewIfNeeded();
      await page.waitForTimeout(750);
      await page.screenshot({path:path.join(out,'citizen-campuses-390.png'),animations:'disabled'});
      await page.locator('.citizen-upcoming').scrollIntoViewIfNeeded();
      await page.waitForTimeout(750);
      await page.screenshot({path:path.join(out,'citizen-upcoming-390.png'),animations:'disabled'});
      const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(a11y.violations.map(v=>({rule:v.id,nodes:v.nodes.map(n=>n.target)})),[],'Today accessibility');
      await page.locator('[data-citizen-story="recap"]').click();
      assert.ok(await page.locator('.citizen-story-overlay').isVisible(),'Citizen recap story modal');
      assert.match(await page.locator('#citizen-story-title').textContent(),/House of Generosity/);
      await page.screenshot({path:path.join(out,'citizen-story-recap-390.png'),animations:'disabled'});
      await page.locator('.citizen-story-close').click();
      await page.locator('#citizen-campus-button').click();
      assert.match(await page.locator('#citizen-campus-name').textContent(),/NORTH/);
      const active=await page.locator('[data-citizen-campus-card="North"]').evaluate(x=>x.classList.contains('is-campus-active'));
      assert.equal(active,true,'Campus selector updates visual preference');
    }
    await page.locator('[data-nav="groups"]').click();
    await page.locator('[data-action="group-tab"][data-value="explore"]').click();
    const link=page.locator('.citizen-churchcenter-link a');
    assert.ok(await link.isVisible(),'Real Church Center handoff');
    assert.ok((await link.getAttribute('href')).includes('citizenchurch.churchcenter.com/groups/albuquerque'));
    if(width===390){
      await link.scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(out,'citizen-groups-discovery-390.png'),animations:'disabled'});
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(axe.violations.map(v=>({rule:v.id,nodes:v.nodes.map(n=>n.target)})),[],'Groups accessibility');
    }
    results.push({viewport:width+'x'+height,passed:true,metrics});
    const photoStatus=await page.evaluate(()=>[...document.querySelectorAll('.citizen-week img,.citizen-campus-cards img,.citizen-outreach-row img')].map(x=>({loaded:x.complete&&x.naturalWidth>0,src:x.currentSrc.slice(0,90)})));
    results[results.length-1].photoStatus=photoStatus;
    console.log('ALIVE × Citizen '+width+'x'+height+' PASS, public images after scroll '+photoStatus.filter(x=>x.loaded).length+'/'+photoStatus.length);
    await context.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,results},null,2)+'\n');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
