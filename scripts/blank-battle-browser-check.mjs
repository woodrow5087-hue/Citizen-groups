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
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'dist','.'+pathname);
  if(!file.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
  catch{res.writeHead(404).end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/blank-battle.html';
const browser=await chromium.launch({headless:true});
try {
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:width===320?'reduce':'no-preference'});
  const p=await ctx.newPage(),errors=[];
  p.on('pageerror',error=>errors.push(error.message));
  p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await p.goto(base,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.locator('.bb-slot').count(),5);
  assert.equal(await p.locator('.bb-tile').count(),7);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal overflow at '+width);
  const controls=await p.locator('.bb-tile:not(:disabled),.bb-hint,.bb-check,.bb-reset').evaluateAll(nodes=>nodes.map(n=>({height:n.getBoundingClientRect().height,width:n.getBoundingClientRect().width})));
  assert.ok(controls.every(v=>v.height>=44&&v.width>=44),'touch target dimensions');
  const audit=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(audit.violations.map(v=>v.id),[],'no accessibility violations at '+width);
  if(width===390)await p.screenshot({path:path.join(out,'blank-battle-start-390.png'),fullPage:true});
  await p.locator('[data-action="tile"][data-value="a0"]').click();
  assert.equal(await p.locator('.bb-slot.is-filled').count(),1);
  if(width===390)await p.screenshot({path:path.join(out,'blank-battle-partial-390.png'),fullPage:true});
  await p.reload();
  assert.equal(await p.locator('.bb-slot.is-filled').count(),1,'resume after refresh');
  for(const token of ['a1','a2','a3','a4'])await p.locator('[data-action="tile"][data-value="'+token+'"]').click();
  await p.locator('.bb-check').click();
  assert.ok(await p.locator('.bb-results').isVisible());
  assert.ok((await p.locator('.bb-results').textContent()).includes('100'));
  if(width===390)await p.screenshot({path:path.join(out,'blank-battle-complete-390.png'),fullPage:true});
  await p.locator('.bb-again').click();
  await p.locator('[data-action="tile"][data-value="d0"]').click();
  for(const token of ['a1','a2','a3','a4'])await p.locator('[data-action="tile"][data-value="'+token+'"]').click();
  await p.locator('.bb-check').click();
  assert.equal(await p.locator('.bb-slot.is-filled').count(),4,'correct words remain after an error');
  assert.ok((await p.locator('.bb-message').textContent()).includes('second look'));
  if(width===390)await p.screenshot({path:path.join(out,'blank-battle-mistake-390.png'),fullPage:true});
  await p.locator('[data-action="tile"][data-value="a0"]').focus();
  await p.keyboard.press('Enter');
  await p.locator('.bb-check').click();
  assert.ok(await p.locator('.bb-results').isVisible(),'keyboard Enter can place missing tile');
  await p.locator('.bb-another').click();
  assert.match(await p.locator('.bb-ref').textContent(),/John/);
  assert.deepEqual(errors,[],'browser runtime and request errors');
  await ctx.close();
  console.log('Blank Battle browser and gameplay passed at '+width+'px');
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}