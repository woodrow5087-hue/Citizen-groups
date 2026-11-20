import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'test-results','onboarding-v2');fs.mkdirSync(out,{recursive:true});
let server;
if(!process.env.PREVIEW_URL){
  server=http.createServer((req,res)=>{
    const name=new URL(req.url,'http://local').pathname,file=path.resolve(root,'dist','.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return;}
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png'};
    try{res.setHeader('Content-Type',type[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
  });await new Promise(r=>server.listen(0,'127.0.0.1',r));
}
const base=process.env.PREVIEW_URL||`http://127.0.0.1:${server.address().port}`;
const welcomeUrl=new URL(base);welcomeUrl.searchParams.delete('skipWelcome');welcomeUrl.searchParams.set('welcome','1');
const launch={executablePath:process.env.BROWSER_PATH||'/usr/bin/chromium'};
if(process.env.PREVIEW_URL&&process.env.HTTPS_PROXY){const u=new URL(process.env.HTTPS_PROXY);launch.proxy={server:u.origin,username:decodeURIComponent(u.username)||undefined,password:decodeURIComponent(u.password)||undefined};}
const browser=await chromium.launch(launch),results=[];
async function settle(p){await p.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'));await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
const button=(p,action)=>p.locator(`#rp-onboard [data-welcome="${action}"]`);
async function audit(p,label){
  await settle(p);
  const a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))})),[],label);
}
async function geometry(p,label){
  const g=await p.evaluate(()=>{
    const e=document.querySelector('#rp-gateway'),r=e.getBoundingClientRect();
    const buttons=[...e.querySelectorAll('button:not(:disabled)')].filter(b=>!b.closest('[hidden],[inert]')&&getComputedStyle(b).visibility!=='hidden');
    return {horizontal:e.scrollWidth>e.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1,root:{x:r.x,w:r.width,h:r.height},buttons:buttons.map(b=>{const q=b.getBoundingClientRect();return {name:b.textContent||b.ariaLabel,w:q.width,h:q.height};})};
  });
  assert.equal(g.horizontal,false,label+' horizontal overflow');
  assert.ok(g.buttons.every(b=>b.w>=44&&b.h>=44),label+' touch targets '+JSON.stringify(g.buttons));
  // Each control can scroll fully into view above the bottom safe area on small screens.
  const last=p.locator('#rp-onboard:not([hidden]) button:not(:disabled),#rp-entry:not([hidden]) button:not(:disabled)').last();
  if(await last.count()){await last.scrollIntoViewIfNeeded();const b=await last.boundingBox();assert.ok(b.y>=0&&b.y+b.height<=p.viewportSize().height+1,label+' last action clipped');}
  await p.locator('#rp-gateway').evaluate(e=>{e.scrollTop=0;e.scrollLeft=0;});
}
async function enterCreate(p){await p.locator('#rp-entry [data-welcome="create"]').click();}
async function chooseCampus(p,id){await p.locator(`[data-welcome-campus="${id}"]`).click();}
const stored=(p,key)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
const APP='rallypoint-phase1-2026',UI='rallypoint-today-ui-v1';
try{
  // Real-time animation capture: no forced UI classes or clock override in these images.
  const motion=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await motion.newPage();
  await p.goto(welcomeUrl.toString());await p.evaluate(()=>document.fonts.ready);
  await p.waitForFunction(()=>getComputedStyle(document.querySelector('.rp-entry-brand')).opacity==='1');
  assert.equal(await p.locator('#rp-gateway').getAttribute('data-screen'),'splash');
  await p.screenshot({path:path.join(out,'01-splash-390.png')});
  await p.waitForFunction(()=>document.querySelector('#rp-gateway').classList.contains('rp-gateway--ready'));await settle(p);
  await p.screenshot({path:path.join(out,'02-welcome-390.png')});
  await p.locator('#rp-entry [data-welcome="login"]').click();await settle(p);await p.waitForTimeout(300);
  await p.screenshot({path:path.join(out,'03-login-390.png')});
  await button(p,'create').click();await settle(p);await p.waitForTimeout(300);
  await p.screenshot({path:path.join(out,'04-campus-390.png')});
  await motion.close();
  const cases=process.env.PREVIEW_URL?[[390,844,0,0],[320,568,0,0]]:[[320,568,0,0],[375,667,0,0],[390,844,0,0],[430,932,0,0],[390,844,47,34],[1280,1020,0,0]];
  for(const [width,height,top,bottom] of cases){
    const ctx=await browser.newContext({viewport:{width,height},isMobile:width<930,hasTouch:width<930,reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[],requests=[];
    p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(r));p.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===new URL(base).origin)errors.push(`${r.status()} ${r.url()}`);});
    await p.goto(welcomeUrl.toString(),{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
    if(top)await p.addStyleTag({content:`:root{--safe-top:${top}px;--safe-bottom:${bottom}px}`});
    assert.equal(await p.locator('#rp-gateway').getAttribute('data-screen'),'welcome');
    await geometry(p,'Welcome '+width);await audit(p,'Welcome '+width);
    await p.locator('#rp-entry [data-welcome="login"]').click();await geometry(p,'Login '+width);await audit(p,'Login '+width);
    assert.equal(await p.locator('#rp-login-email').evaluate(e=>e.readOnly),true);
    assert.equal(await p.locator('#rp-login-password').evaluate(e=>e.readOnly),true);
    await button(p,'show-password').click();assert.equal(await p.locator('#rp-login-password').getAttribute('type'),'text');
    await button(p,'show-password').click();await button(p,'forgot').click();assert.match(await p.locator('#rp-login-feedback').textContent(),/unavailable/);
    await button(p,'back').click();await enterCreate(p);await geometry(p,'Campus '+width);await audit(p,'Campus '+width);
    assert.equal(await button(p,'next').isDisabled(),true);
    const cards=()=>p.locator('.rp-campus-card').evaluateAll(ns=>ns.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
    const before=await cards();await chooseCampus(p,'central');assert.deepEqual(await cards(),before,'Selected geometry changed');
    assert.equal((await stored(p,UI)).campus,'central');
    await button(p,'next').click();await geometry(p,'Connection '+width);await audit(p,'Connection '+width);
    await p.locator('[data-welcome-role="leader"]').click();await button(p,'next').click();await geometry(p,'Preferences '+width);await audit(p,'Preferences '+width);
    await p.locator('[data-welcome-membership="team"]').click();await p.locator('#rp-onboard-name').fill('Alex');
    await button(p,'finish').click();await p.waitForFunction(()=>document.querySelector('#rp-gateway').hidden);await p.waitForLoadState('networkidle');
    const ui=await stored(p,UI),app=await stored(p,APP);assert.equal(ui.campus,'central');assert.deepEqual(ui.memberships,{group:true,team:true});assert.equal(ui.name,'Alex');assert.equal(app.role,'member');
    for(const tab of ['group','team','read','today']){await p.locator(`#nav [data-go="${tab}"]`).click();assert.equal(await p.locator('#nav [aria-current="page"]').getAttribute('data-go'),tab);}
    await p.reload();assert.equal((await stored(p,UI)).campus,'central');assert.equal(await p.locator('#rp-gateway').isVisible(),false);
    if(width===390&&!top){
      await p.locator('#nav [data-go="group"]').click();await p.locator('#group-input').fill('Preserve this fictional group message.');await p.locator('[data-action="send"][data-value="group"]').click();
      const saved=await stored(p,APP);
      await p.locator('.profile-avatar').click();await p.locator('[data-campus-settings]').click();await chooseCampus(p,'maui');await button(p,'next').click();
      await p.waitForFunction(()=>document.querySelector('#rp-gateway').hidden);await p.waitForLoadState('networkidle');
      assert.deepEqual((await stored(p,APP)).groupMessages,saved.groupMessages);assert.equal((await stored(p,UI)).campus,'maui');assert.deepEqual((await stored(p,UI)).memberships,{group:true,team:true});
      assert.match(await p.locator('.dashboard-campus-marker').textContent(),/YOUR CAMPUS · MAUI/);
      // The real app's profile link replays the original splash/welcome/login,
      // then returns to the newest dashboard without resetting stored fixtures.
      const fresh=await stored(p,APP);
      await p.locator('.profile-avatar').click();
      assert.equal(await p.locator('.rp-replay-welcome').getAttribute('href'),'?welcome=1');
      await p.locator('.rp-replay-welcome').click();
      await p.waitForFunction(()=>document.querySelector('#rp-gateway').dataset.screen==='welcome');
      assert.equal(await p.locator('#rp-gateway').isVisible(),true);
      assert.match(new URL(p.url()).search,/welcome=1/);
      await p.locator('#rp-entry [data-welcome="login"]').click();await button(p,'demo').click();
      await p.waitForFunction(()=>document.querySelector('#rp-gateway').hidden);
      assert.ok(await p.locator('.dashboard-v06').isVisible(),'Animated entry reaches the latest dashboard');
      assert.match(await p.locator('.dashboard-campus-marker').textContent(),/YOUR CAMPUS · MAUI/);
      assert.deepEqual(await stored(p,APP),{...fresh,view:'today'});
      await p.locator('.profile-avatar').click();await p.locator('[data-campus-settings]').click();assert.equal(await p.locator('#rp-gateway').isVisible(),true);await chooseCampus(p,'online');await button(p,'next').click();await p.waitForFunction(()=>document.querySelector('#rp-gateway').hidden);assert.equal((await stored(p,UI)).campus,'online');
      assert.equal(requests.filter(r=>!['GET','HEAD'].includes(r.method())).length,0,'Demo submitted credentials/data');
    }
    assert.deepEqual(errors,[]);results.push({width,height,safeTop:top,safeBottom:bottom,result:'passed'});console.log(`Onboarding passed ${width}×${height}, safe areas ${top}/${bottom}`);await ctx.close();
  }
  const blocked=await browser.newContext({viewport:{width:320,height:568},reducedMotion:'reduce'});
  await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('Blocked');}}));const bp=await blocked.newPage();
  await bp.goto(welcomeUrl.toString());await enterCreate(bp);await chooseCampus(bp,'online');assert.match(await bp.locator('[role="alert"]').textContent(),/could not save/);
  await button(bp,'unsaved').click();await bp.waitForFunction(()=>document.querySelector('#rp-gateway').hidden);await blocked.close();
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({cases:results,checks:['Real-time splash/reveal/brand lift screenshots','Reduced motion bypasses timed reveal','WCAG A/AA axe scans on welcome, login, campus, connection, preferences','44px touch targets and no horizontal overflow','Campus selection preserves card geometry','Leader selection remains member','Both memberships, name, campus survive reload','Campus editing preserves messages and memberships','Login sample values locked; no POST or credential storage','Existing four-tab navigation','Replay button opens animated entry and returns to current v0.9 dashboard','Selected campus appears in Today without losing group messages','Blocked-storage fallback'],screenshots:'390×844 actual browser captures. iPhone dimensions and safe areas emulated in Chromium; physical iOS device not tested.'},null,2));
  console.log('All onboarding browser checks passed.');
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
