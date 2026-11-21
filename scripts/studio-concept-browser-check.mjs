import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'test-results');
fs.mkdirSync(out,{recursive:true});
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'dist','.'+pathname);
 if(!file.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return}
 try{res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
 catch{res.writeHead(404).end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/studio-concept.html';
const browser=await chromium.launch({headless:true});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1060},isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.phone-viewport').count(),4);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal overflow at '+width);
  if(width===390){
   assert.equal(await page.locator('.phone-slot:visible').count(),1);
   assert.equal(await page.locator('.phone').first().evaluate(e=>Math.abs(e.getBoundingClientRect().width-innerWidth)<2),true,'native full-width mobile canvas');
   assert.equal(await page.locator('.proposal-heading').isVisible(),false,'no marketing wrapper');
   assert.match(await page.locator('.phone-slot.is-mobile-active').innerText(),/Your people/);
   await page.screenshot({path:path.join(out,'studio-concept-today-mobile.png'),fullPage:true});
   await page.locator('.phone-slot.is-mobile-active .phone-bottom [data-view="people"]').click();
   assert.equal(await page.locator('.phone-slot.is-mobile-active .people-head').count(),1);
   await page.locator('.phone-slot.is-mobile-active [data-action="checkin"]').click();
   assert.match(await page.locator('.phone-slot.is-mobile-active').innerText(),/Checked in/);
   await page.screenshot({path:path.join(out,'studio-concept-people-mobile.png'),fullPage:true});
   const headChevron=await page.locator('.phone-slot.is-mobile-active .section-chevron svg').evaluate(e=>e.getBoundingClientRect().width);
   assert.ok(headChevron<=30,'group header arrow must not overwhelm card');
   await page.locator('.phone-slot.is-mobile-active .phone-bottom [data-view="team"]').click();
   await page.locator('.phone-slot.is-mobile-active [data-action="confirm"]').click();
   assert.match(await page.locator('.phone-slot.is-mobile-active').innerText(),/Response needed/);
   await page.locator('.phone-slot.is-mobile-active .phone-bottom [data-view="today"]').click();
   await page.locator('.phone-slot.is-mobile-active .top-avatar').click();
   await page.locator('.phone-slot.is-mobile-active [data-action="review"][data-id="jake"]').click();
   assert.match(await page.locator('.phone-slot.is-mobile-active').innerText(),/1 follow-up to review/);
   await page.screenshot({path:path.join(out,'studio-concept-care-mobile.png'),fullPage:true});
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.phone-slot.is-mobile-active .top-avatar').click();
   assert.match(await page.locator('.phone-slot.is-mobile-active').innerText(),/1 follow-up to review/);
   await page.locator('.phone-slot.is-mobile-active .phone-bottom [data-view="read"]').click();
   assert.ok(await page.locator('.phone-slot.is-mobile-active .reading-plan-hero').isVisible(),'approved Read plan hero');
   await page.screenshot({path:path.join(out,'studio-concept-read-mobile.png'),fullPage:true});
   await page.locator('.phone-slot.is-mobile-active [data-action="readpane"][data-pane="study"]').click();
   assert.ok(await page.locator('.phone-slot.is-mobile-active [data-action="game"]').isVisible(),'game linked from Study');
   await page.locator('.phone-slot.is-mobile-active [data-action="readpane"][data-pane="discuss"]').click();
   assert.match(await page.locator('.phone-slot.is-mobile-active').innerText(),/What does love look like/);
  }else{
   assert.equal(await page.locator('.phone-slot:visible').count(),4);
   assert.equal(await page.locator('.proposal-heading').isVisible(),false,'the approved four-phone board is the presentation');
   assert.equal(await page.locator('.studio-decisions').isVisible(),false,'no unrelated marketing panels');
   await page.screenshot({path:path.join(out,'studio-concept-four-screens-desktop.png'),fullPage:true});
  }
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
  const critical=accessibility.violations.filter(x=>['button-name','image-alt','document-title','html-has-lang'].includes(x.id));
  assert.deepEqual(critical.map(x=>x.id),[],'core accessibility at '+width);
  assert.deepEqual(errors,[],'no browser JS errors at '+width);
  console.log('Studio concept functional screen test passed at '+width+'px; accessibility findings '+accessibility.violations.length);
  await context.close();
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
