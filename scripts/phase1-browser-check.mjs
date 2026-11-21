import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.md':'text/plain'};
let server;if(!process.env.PREVIEW_URL){server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);const file=path.resolve(root,'dist','.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const base=process.env.PREVIEW_URL||`http://127.0.0.1:${server.address().port}`;
// Existing Today regression checks bypass the new first-run welcome; welcome gets its own tests.
const todayUrl=(()=>{const u=new URL(base);u.searchParams.set('skipWelcome','1');return u.toString();})();
const launch={};if(process.env.BROWSER_PATH)launch.executablePath=process.env.BROWSER_PATH;else if(fs.existsSync('/usr/bin/chromium'))launch.executablePath='/usr/bin/chromium';
if(process.env.PREVIEW_URL&&process.env.HTTPS_PROXY){const p=new URL(process.env.HTTPS_PROXY);launch.proxy={server:p.origin,username:decodeURIComponent(p.username)||undefined,password:decodeURIComponent(p.password)||undefined};}
const browser=await chromium.launch(launch),results=[];
const cases=process.env.PREVIEW_URL?[[390,844,0,0],[320,568,0,0]]:[[320,568,0,0],[375,667,0,0],[375,812,0,0],[390,844,0,0],[430,932,0,0],[390,844,47,34],[430,932,59,34],[1280,1020,0,0]];
const settle=p=>p.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'));
async function audit(page,label){await settle(page);const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[],label);}
async function geometry(page,label){const g=await page.evaluate(()=>{const main=document.getElementById('view'),nav=document.getElementById('nav'),m=main.getBoundingClientRect(),n=nav.getBoundingClientRect();const sizes=[...nav.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,w:r.width,h:r.height,right:r.right,bottom:r.bottom};});return {overflow:document.documentElement.scrollWidth>innerWidth+1||main.scrollWidth>main.clientWidth+1,mb:m.bottom,nt:n.top,nb:n.bottom,w:innerWidth,h:innerHeight,sizes,count:sizes.length,red:getComputedStyle(document.documentElement).getPropertyValue('--red').trim()};});assert.equal(g.overflow,false,label+' horizontal overflow');assert.equal(g.count,4);assert.equal(g.red,'#E3002B');assert.ok(g.mb<=g.nt+1,label+' content behind nav');assert.ok(g.nb<=g.h+1,label+' navigation cut off');assert.ok(g.sizes.every(b=>b.w>=44&&b.h>=44&&b.x>=0&&b.right<=g.w+1&&b.bottom<=g.h+1),label+' navigation targets');}
async function demo(page,scenario){await page.locator('.profile-avatar').click();await page.locator(`[data-action="scenario"][data-value="${scenario}"]`).click();}
async function journey(page){
 const nav=id=>page.locator(`#nav [data-go="${id}"]`).click(),main=page.locator('#view');
 await demo(page,'connected');
 assert.ok((await page.locator('.pa-companion').textContent()).includes('Marcus shared a fictional prayer request'));
 await page.locator('.pa-companion [data-action="companion-encourage"]').click();
 assert.ok(await page.locator('.pa-care-context').isVisible());
 await page.locator('[data-action="companion-starter"]').click();
 assert.ok((await page.locator('#direct-input').inputValue()).includes('Hey Marcus'));
 const beforeCare=await page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')));
 assert.ok(!beforeCare.companionCare?.marcus?.completedAt,'draft alone is not a completed check-in');
 await page.locator('[data-action="send"][data-value="direct"]').click();
 await nav('today');
 assert.ok(await page.locator('.pa-care-memory').isVisible());
 assert.equal(await page.locator('[data-action="companion-encourage"]').count(),0);
 if(page.viewportSize().width===390)await page.screenshot({path:path.join(out,'companion-cared-390.png')});
 // The conversation was already visited in the tab audit; it should be read, but still openable.
 await page.locator('.today-people-message[data-go="group"]').click();assert.ok(await page.locator('#group-input').isVisible());await page.locator('#group-input').fill('A fictional note for the local group.');await page.locator('[data-action="send"][data-value="group"]').click();assert.equal(await page.locator('#group-input').inputValue(),'');
 await page.locator('[data-area="group"][data-value="prayer"]').click();await page.locator('#prayer-input').fill('A fictional prayer for patience.');await page.locator('[data-action="send"][data-value="prayer"]').click();await page.locator('[data-area="group"][data-value="gather"]').click();await page.locator('[data-action="rsvp"][data-value="going"]').click();
 await nav('today');await page.locator('.availability-action').click();assert.ok((await main.textContent()).includes('Awaiting response'));await page.locator('[data-action="shift"][data-value="confirmed"]').click();await nav('today');assert.ok((await main.textContent()).includes('You’re all caught up'));await audit(page,'Caught-up Today');
 await page.locator('.read-play-cta').click();assert.ok(await page.locator('.rp-play-screen').isVisible(),'Today Memorize opens integrated Blank Battle');assert.equal(await page.locator('.bb-slot').count(),5);await audit(page,'Integrated Blank Battle');await nav('today');
 await page.locator('[data-reading="questions"]').click();assert.equal(await page.locator('#reading-questions').evaluate(el=>document.activeElement===el),true);await nav('today');await page.locator('[data-reading="scripture"]').click();await page.locator('[data-action="read"]').click();await page.locator('[data-action="pray"]').click();await nav('today');assert.ok((await page.locator('.read-primary').textContent()).includes('Read today'));
 await page.locator('.profile-avatar').click();await audit(page,'Demo controls');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#dialog-root [role="dialog"]').evaluate(el=>el.contains(document.activeElement)),true);await page.locator('#role').click();await page.locator('[data-action="close-dialog"]').click();await page.locator('.leader-entry').click();
 await page.locator('[data-action="attendance"][data-person="marcus"][data-value="here"]').click();for(const id of ['marcus','taylor'])await page.locator(`[data-action="reached"][data-person="${id}"]`).click();await nav('read');await page.locator('[data-action="plan"][data-value="study"]').click();await page.locator('#question').fill('A fictional leader-selected discussion question.');await page.locator('[data-action="question"]').click();await nav('today');assert.equal(await page.locator('.leader-entry').count(),0);
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')));await page.reload();const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')));assert.deepEqual(after,before);assert.equal(after.rsvp,'going');assert.equal(after.teamStatus,'confirmed');assert.equal(after.read,true);assert.equal(after.prayed,true);assert.equal(after.attendance.marcus,'here');assert.equal(after.plan,'study');assert.ok(after.groupMessages.some(m=>m.text==='A fictional note for the local group.'));
 await nav('read');
 await page.locator('.rp-game-entry-play').click();
 assert.equal(await page.locator('.bb-slot').count(),5,'five genuine Blank Battle slots in app');
 await page.locator('[data-action="tile"][data-value="a0"]').click();
 assert.equal(await page.locator('.bb-slot.is-filled').count(),1,'word placement works in app');
 await page.locator('.rp-play-back').click();
 assert.ok(await page.locator('.read-screen-v09').isVisible(),'back to Read without leaving app');
 await page.locator('.rp-game-entry-play').click();
 assert.equal(await page.locator('.bb-slot.is-filled').count(),1,'Blank Battle progress survives in-app navigation');
 await page.locator('#nav [data-go="read"]').click();
 assert.equal(await page.locator('.rp-game-entry-play').count(),1,'Read nav returns to Read view');
 await page.locator('[data-action="memory-mode"][data-value="solo"]').click();
 for(let i=0;i<5;i++)await page.locator('[data-action="memory-pick"][data-value="a'+i+'"]').click();
 await page.locator('[data-action="memory-check"]').click();
 assert.ok(await page.locator('.vp-victory').isVisible(),'five correct word tiles complete a real game');
 await page.locator('[data-action="memory-mode"][data-value="pass"]').click();
 assert.ok((await page.locator('.vp-turn').textContent()).includes('PLAYER 1'));
 await page.locator('[data-action="memory-challenge"][data-value="romans"]').click();
 assert.ok((await page.locator('.vp-board-title h3').textContent()).includes('Romans 8:28'));
 await nav('today');
 await page.locator('.read-play-cta').click();
 assert.equal(await page.locator('.rp-play-screen').count(),1,'Today Memorize opens latest Blank Battle');await page.locator('.rp-play-back').click();assert.equal(await page.locator('.rp-game-entry-play').count(),1,'Back returns to Read');
  await demo(page,'no-memberships');assert.ok((await main.textContent()).includes('There’s room'));assert.equal(await page.locator('.leader-entry').count(),0);await audit(page,'No-membership Today');
 await nav('group');assert.ok((await main.textContent()).includes('sample group options'));assert.equal(await page.locator('.group-discovery-hero').count(),1);assert.equal(await page.locator('.group-discovery-card').count(),3);await geometry(page,'group discovery');await audit(page,'Redesigned group discovery');
 if(page.viewportSize().width===390)await page.screenshot({path:path.join(out,'groups-discovery-390.png')});
 await page.locator('.group-discovery-interest').first().click();assert.equal(await page.locator('.group-discovery-interest.is-selected').count(),1);
 await nav('team');assert.equal(await page.locator('.team-empty-hero').count(),1);assert.equal(await page.locator('.team-empty-discover').count(),1);await geometry(page,'team discovery');await audit(page,'Redesigned team discovery');
 if(page.viewportSize().width===390)await page.screenshot({path:path.join(out,'team-discovery-390.png')});
 await page.locator('[data-action="team-preview"]').click();await audit(page,'Honest Team discovery preview');await page.locator('[data-action="close-dialog"]').click();
}
try{
 for(const [width,height,top,bottom] of cases){const ctx=await browser.newContext({viewport:{width,height},isMobile:width<930,hasTouch:width<930,reducedMotion:width===320?'reduce':'no-preference'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===new URL(base).origin)errors.push(`${r.status()} ${r.url()}`);});await p.goto(todayUrl,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);if(top)await p.addStyleTag({content:`:root{--safe-top:${top}px;--safe-bottom:${bottom}px}`});
  await geometry(p,'Today '+width);await audit(p,'Today '+width);assert.equal(await p.locator('.today-people').count(),1,'Your People panel exists');assert.equal(await p.locator('.today-people-avatar').count(),4,'Sample roster is visible');assert.ok((await p.locator('.today-people-message-text').textContent()).includes('Looking forward to seeing everyone Wednesday'),'Latest fixture message is on Today');assert.ok((await p.locator('.today-screen').boundingBox()).y<height/3);const targets=await p.locator('.today-screen button').evaluateAll(nodes=>nodes.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height,name:n.textContent.trim()})));assert.ok(targets.every(t=>t.w>=44&&t.h>=44),'Today touch targets '+JSON.stringify(targets));
  if(width===390&&!top){await p.screenshot({path:path.join(out,'today-390.png')});await p.locator('.today-people').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'today-your-people-390.png')});await p.locator('#view').evaluate(el=>el.scrollTop=0);}
  for(const tab of ['group','team','read','today']){
    await p.locator(`#nav [data-go="${tab}"]`).click();
    await geometry(p,tab+' '+width);await audit(p,tab+' '+width);
    if(width===390&&!top&&(tab==='group'||tab==='team'))await p.screenshot({path:path.join(out,tab+'-connected-390.png')});
    if(tab==='read'){
      assert.equal(await p.locator('.rp-game-entry-play').count(),1,'Read exposes the new Blank Battle entry');assert.equal(await p.locator('.verseplay').count(),1,'Read preserves existing local Pass & Play game');
      assert.equal(await p.locator('.vp-blank').count(),5,'VersePlay has five fillable words');
      assert.equal(await p.locator('.vp-tile').count(),7,'VersePlay has seven tactile word tiles');
      if(width===390&&!top)await p.screenshot({path:path.join(out,'verseplay-read-390.png')});
    }
  }
  if((width===390&&!top)||width===320)await journey(p);
  assert.deepEqual(errors,[]);results.push({width,height,top,bottom,result:'passed'});console.log(`Passed ${width}×${height}, safe areas ${top}/${bottom}`);await ctx.close();
 }
 // Reference-aligned capture is a real app render with an explicitly frozen Monday fixture.
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await ctx.newPage();await p.clock.install({time:new Date('2026-11-23T12:00:00')});await p.goto(todayUrl);await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:path.join(out,'today-reference-aligned-390.png')});await p.locator('.profile-avatar').click();await p.locator('#role').click();await p.locator('[data-action="close-dialog"]').click();await p.screenshot({path:path.join(out,'today-leader-390.png')});await p.locator('#view').evaluate(el=>el.scrollTop=el.scrollHeight);await p.screenshot({path:path.join(out,'today-leader-entry-390.png')});await p.locator('.leader-entry').click();await p.screenshot({path:path.join(out,'leader-care-390.png')});await p.locator('#nav [data-go="today"]').click();await demo(p,'caught-up');await p.screenshot({path:path.join(out,'today-caught-up-390.png')});await demo(p,'no-memberships');await p.screenshot({path:path.join(out,'today-empty-390.png')});await ctx.close();
 // New companion contract: a saved Scripture intention resurfaces only on a later visit,
 // never auto-completes, and never sends anything to group or church systems.
 const rhythmContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const rhythmPage=await rhythmContext.newPage();
 await rhythmPage.clock.install({time:new Date('2026-11-23T12:00:00')});
 await rhythmPage.goto(todayUrl);
 await rhythmPage.locator('#nav [data-go="read"]').click();
 await rhythmPage.locator('#rhythm-input').fill('Encourage one person in my group.');
 await rhythmPage.locator('[data-action="rhythm-save"]').click();
 await rhythmPage.locator('#nav [data-go="today"]').click();
 assert.ok((await rhythmPage.locator('.pa-rhythm-followup').textContent()).includes('A SMALL STEP FOR TOMORROW'));
 assert.equal(await rhythmPage.locator('[data-action="rhythm-complete"]').count(),0);
 await rhythmPage.locator('.pa-rhythm-followup').scrollIntoViewIfNeeded();
 await rhythmPage.locator('#toast').evaluate(el=>el.hidden=true);
 await rhythmPage.screenshot({path:path.join(out,'companion-scripture-saved-390.png')});
 await rhythmPage.clock.setFixedTime(new Date('2026-11-25T12:00:00'));
 await rhythmPage.locator('#nav [data-go="read"]').click();
 await rhythmPage.locator('#nav [data-go="today"]').click();
 assert.ok((await rhythmPage.locator('.pa-rhythm-followup').textContent()).includes('YOUR STEP FOR TODAY'));
 await rhythmPage.locator('.pa-rhythm-followup').scrollIntoViewIfNeeded();
 await rhythmPage.screenshot({path:path.join(out,'companion-scripture-returned-390.png')});
 await rhythmPage.locator('[data-action="rhythm-complete"]').click();
 assert.ok((await rhythmPage.locator('.pa-rhythm-followup').textContent()).includes('YOU FOLLOWED THROUGH'));
 await rhythmPage.reload();
 assert.ok((await rhythmPage.locator('.pa-rhythm-followup').textContent()).includes('YOU FOLLOWED THROUGH'));
 assert.equal(await rhythmPage.locator('.pa-people-rail--today').count(),1,'Approved people rail remains');
 await audit(rhythmPage,'Scripture follow-through remembered');
 await rhythmContext.close();
 const fallback=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});await fallback.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('Blocked');}}));const fp=await fallback.newPage();await fp.goto(todayUrl);assert.ok((await fp.locator('#view').textContent()).includes('could not save'));await fp.locator('#nav [data-go="read"]').click();await fp.locator('[data-action="read"]').click();assert.ok((await fp.locator('#view').textContent()).includes('Read today'));await fallback.close();
 fs.writeFileSync(path.join(out,'phase1-browser-results.json'),JSON.stringify({cases:results,flows:'Source links, original messages/prayers, RSVP, serving, role/leader tools, reading/question, empty states, focus, persistence and storage fallback passed.',axe:'No detected WCAG A/AA violations on tested views/dialogs.'},null,2));console.log('All Phase 1 mobile, accessibility, persistence and source-flow checks passed.');
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
