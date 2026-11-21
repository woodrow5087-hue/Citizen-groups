/* F-11 end-to-end: actual browser confirms demo badge, sample posting,
 * no outbound data writes, complete scoped reset and fresh welcome.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
    const file=path.resolve(dist,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(dist+path.sep)){res.writeHead(403).end();return;}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();
try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.addInitScript(()=>{
    localStorage.setItem('citizen-premium-hybrid-demo-v1','{"save":"untouched"}');
    localStorage.setItem('another-project','stay');
  });
  const requests=[];
  const page=await context.newPage();
  page.on('request',request=>requests.push({url:request.url(),method:request.method()}));
  await page.goto(url+'/?skipWelcome=1',{waitUntil:'networkidle'});
  assert.ok(await page.locator('.rp-demo-chip').isVisible(),'persistent STAFF DEMO label');
  assert.match(await page.locator('.rp-demo-chip').textContent(),/STAFF DEMO/);
  await page.locator('#nav [data-go="group"]').click();
  await page.locator('[data-action="fill-demo-example"][data-value="group"]').click();
  const sample=await page.locator('#group-input').inputValue();
  assert.match(sample,/Sample:/);
  await page.locator('[data-action="send"][data-value="group"]').click();
  assert.ok((await page.locator('#view').textContent()).includes(sample),'only intentional sample message appears');

  await page.locator('#group-input').fill('My contact is private.person@example.com');
  await page.locator('[data-action="send"][data-value="group"]').click();
  const blocked=await page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')).groupMessages.some(m=>m.text.includes('private.person@example.com')));
  assert.equal(blocked,false,'obvious contact information is not persisted');
  await page.locator('#nav [data-go="read"]').click();
  await page.locator('[data-action="read"]').click();
  await page.locator('.profile-avatar').click();
  await page.locator('#role').click();
  await page.locator('[data-action="close-dialog"]').click();
  // Simulate future achievement and separate puzzle persistence to test reset.
  await page.evaluate(()=>{
    localStorage.setItem('rallypoint-achievements-v2','{"streak":17}');
    localStorage.setItem('rallypoint-blank-battle-v1','{"draft":"game"}');
    sessionStorage.setItem('rallypoint-welcome-preview-session','entered');
  });
  await page.locator('.profile-avatar').click();
  await page.locator('[data-action="reset-demo"]').click();
  assert.match(await page.locator('#dialog-root').textContent(),/This cannot be undone/);
  await page.locator('[data-action="demo-controls"]').click();
  assert.ok(await page.locator('[data-action="reset-demo"]').isVisible(),'cancel retains demo');
  await page.locator('[data-action="reset-demo"]').click();
  await page.locator('[data-action="confirm-demo-reset"]').click();
  await page.waitForURL(/\?welcome=1/);
  await page.waitForFunction(()=>document.querySelector('#rp-gateway')?.dataset.screen==='welcome');
  const result=await page.evaluate(()=>{
    const state=JSON.parse(localStorage.getItem('rallypoint-phase1-2026')||'null');
    return {
      values:Object.fromEntries(['rallypoint-phase1-2026','rallypoint-today-ui-v1','rallypoint-blank-battle-v1','rallypoint-achievements-v2','rallypoint-welcome-preview-session'].map(k=>[k,localStorage.getItem(k)||sessionStorage.getItem(k)])),
      thirdParty:localStorage.getItem('citizen-premium-hybrid-demo-v1'),
      other:localStorage.getItem('another-project'),
      profile:state?.role, read:state?.read, groupTexts:state?.groupMessages?.map(m=>m.text)||[]
    };
  });
  assert.equal(result.values['rallypoint-blank-battle-v1'],null,'puzzle storage erased');
  assert.equal(result.values['rallypoint-achievements-v2'],null,'future achievements erased');
  assert.equal(result.values['rallypoint-welcome-preview-session'],null,'session is cleared');
  assert.equal(result.profile,'member','leader fixture reset');
  assert.equal(result.read,false,'read flag reset');
  assert.ok(!result.groupTexts.some(text=>text===sample),'posted fictional message erased');
  assert.equal(result.thirdParty,'{"save":"untouched"}');
  assert.equal(result.other,'stay');
  assert.equal(requests.filter(req=>!['GET','HEAD'].includes(req.method)).length,0,'zero outgoing writes of demo content');
  assert.equal(requests.filter(req=>!req.url.startsWith(url)).length,0,'no third-party network requests during demo interactions');
  const out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
  await page.screenshot({path:path.join(out,'f11-reset-welcome-390.png'),animations:'disabled'});
  console.log('F-11 PASS: visible demo label, guided fictional posting, blocked contact details, confirm/cancel reset, all owned data reset, unrelated state preserved, no third-party/network writes.');
  await context.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
