import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist'),out=path.join(root,'test-results','alive-lab');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target=path.resolve(dist,'.'+(pathname==='/'?'/index.html':pathname));
    if(!target.startsWith(dist+path.sep)){res.writeHead(403).end();return;}
    res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.end(fs.readFileSync(target));
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/alive-lab.html';
const browser=await chromium.launch({headless:true});
const report=[];
try{
  for(const [width,height] of [[390,844],[320,568],[430,932],[1280,900]]){
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('.feature-photo-card').waitFor({state:'visible'});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(650);
    const dimensions=await page.evaluate(()=>({
      width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      heroWidth:document.querySelector('.feature-photo-card').getBoundingClientRect().width,
      groupVisible:!document.querySelector('#view-groups').hidden,
      nav:document.querySelector('.dock').getBoundingClientRect().width,
      imgs:[...document.images].filter(x=>x.complete&&x.naturalWidth>0).length,
      totalImages:document.images.length
    }));
    assert.equal(dimensions.groupVisible,false,'Today is first view');
    assert.ok(dimensions.heroWidth>220,'Hero is visible and sizeable');
    assert.ok(dimensions.nav<=width+1,'Navigation fits the screen');
    assert.ok(dimensions.scrollWidth<=width+2,'No horizontal overflow');
    if(width===390||width===1280){
      await page.screenshot({path:path.join(out,'alive-today-'+width+'.png'),animations:'disabled'});
      const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(accessibility.violations.map(v=>({rule:v.id,nodes:v.nodes.map(n=>n.target)})),[],'A11y Today '+width);
    }
    await page.locator('.feature-photo-card').click();
    await page.locator('#view-groups').waitFor({state:'visible'});
    await page.locator('.rsvp-button').click();
    assert.ok((await page.locator('#rsvp-label').textContent()).includes('on the list'),'RSVP updates');
    await page.locator('[data-action="group-tab"][data-value="explore"]').click();
    assert.ok(await page.locator('#group-explore').isVisible(),'Explore is interactive');
    await page.locator('[data-action="group-tab"][data-value="mine"]').click();
    await page.locator('.rsvp-button').scrollIntoViewIfNeeded();
    if(width===390){
      await page.screenshot({path:path.join(out,'alive-groups-390.png'),animations:'disabled'});
      const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(accessibility.violations.map(v=>({rule:v.id,nodes:v.nodes.map(n=>n.target)})),[],'A11y Groups');
      await page.locator('[data-action="open-chat"]').click();
      assert.ok(await page.locator('#sheet-layer').isVisible());
      await page.screenshot({path:path.join(out,'alive-group-chat-390.png'),animations:'disabled'});
    }
    assert.deepEqual(errors,[],'No JavaScript errors');
    report.push({viewport:width+'x'+height,passed:true,loadedImages:dimensions.imgs,totalImages:dimensions.totalImages});
    console.log('ALIVE lab '+width+'x'+height+' passed; images '+dimensions.imgs+'/'+dimensions.totalImages);
    await context.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,report},null,2)+'\n');
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
