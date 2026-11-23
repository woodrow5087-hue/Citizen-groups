import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'dist','.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const launch={};if(process.env.BROWSER_PATH)launch.executablePath=process.env.BROWSER_PATH;else if(fs.existsSync('/usr/bin/chromium'))launch.executablePath='/usr/bin/chromium';
let browser;
try{
 browser=await chromium.launch(launch);
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?skipWelcome=1');
  await page.locator('#nav [data-go="read"]').click();
  await page.locator('.read-reader').waitFor();
  assert.equal(await page.locator('.read-journey-nav button').count(),4);
  assert.ok((await page.locator('.read-reader blockquote').innerText()).includes('love one another'));
  await page.locator('[data-action="reader-size"]').click();
  assert.equal(await page.locator('.read-reader-page--large').count(),1);
  await page.locator('[data-action="reader-highlight"]').click();
  assert.equal(await page.locator('.read-reader-page--highlighted').count(),1);
  await page.locator('#reader-note').fill('A private Scripture note.');
  await page.locator('#reflection-response').fill('An act of care this week.');
  await page.locator('[data-action="reflect-prompt"][data-value="action"]').click();
  assert.equal(await page.locator('#reflection-response').inputValue(),'An act of care this week.');
  await page.locator('[data-action="read-practice-current"]').click();
  assert.ok((await page.locator('#reading-memorize').innerText()).includes('John 15:12'));
  await page.locator('[data-action="weekly-day"][data-value="2"]').click();
  assert.ok((await page.locator('.read-weekly-detail').innerText()).includes('Let the words stick'));
  await page.locator('.read-weekly-detail button').click();
  assert.equal(await page.locator('#reading-memorize').evaluate(el=>document.activeElement===el),true);
  await page.locator('#nav [data-go="today"]').click();
  await page.locator('#nav [data-go="read"]').click();
  assert.equal(await page.locator('#reader-note').inputValue(),'A private Scripture note.');
  assert.equal(await page.locator('#reflection-response').inputValue(),'An act of care this week.');
  assert.equal(await page.locator('.read-reader-page--highlighted').count(),1);
  assert.equal(await page.locator('[data-action="weekly-day"][data-value="2"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'horizontal overflow at '+width);
  assert.deepEqual(errors,[],'page errors at '+width);
  if(width===390)await page.screenshot({path:path.join(out,'read-journey-390.png'),fullPage:true});
  await page.close();
 }
 console.log('Read R-01 through R-05 browser journeys passed at 320, 390 and 430px.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
