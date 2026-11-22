import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.argv[2];
const out='test-results/preview-today';
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
try{
  for(const [width,height] of [[320,568],[390,844],[430,932]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    await page.goto(base);
    await page.locator('#rp-entry [data-welcome="login"]').click();
    await page.locator('#rp-onboard [data-welcome="demo"]').click();
    await page.locator('.f09-board').waitFor({state:'visible'});
    for(const tab of ['group','team','read','today']){
      await page.locator('#nav [data-go="'+tab+'"]').click();
      assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),tab);
    }
    for(const [query,selector] of [
      ['','.f09-board'],['?f09=legacy','.pa-companion'],['?f09=1','.f09-stack-controls'],
      ['?f10=1','.f10-entry'],['?f103=1','.f10-entry']
    ]){
      await page.goto(new URL('/'+query,base).href);
      await page.locator(selector).waitFor();
      assert.equal(await page.locator('.f10-panel').count(),0);
      assert.equal(await page.locator('.f10-entry').count(),Number(query.startsWith('?f10')));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(width===390 && (query==='' || query==='?f09=legacy')){
        await page.evaluate(()=>document.fonts.ready);
        await page.screenshot({path:out+'/'+(query?'earlier-today':'priority-board')+'-390.png'});
      }
    }
    await page.close();
  }
}finally{await browser.close();}
