import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.argv[2];assert.ok(base);const out='test-results/ux03-refinement';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH}),results=[];
try{
for(const [width,height,large] of [[320,568,false],[375,667,false],[390,844,false],[430,932,false],[390,500,false],[390,844,true]]){
for(const profile of (large||height===500?['group-serving']:['group-member','serving','group-serving'])){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime(new Date('2026-11-23T12:00:00Z'));await page.goto(base);
 await page.locator('[data-welcome=login]:visible').click();await page.locator('[data-welcome=demo]:visible').click();await page.locator('#rp-gateway').waitFor({state:'hidden'});
 await page.locator('.profile-avatar').click();await page.locator('[data-action=s7-scenario][data-value='+profile+']').click();await page.locator('#toast').waitFor({state:'hidden'});
 const entry=page.getByRole('button',{name:'Connect messaging inbox'});await entry.click();
 const f=page.frameLocator('.connect-overlay iframe');await f.locator('body.connect-member').waitFor();
 if(large)await f.locator('html').evaluate(e=>e.style.fontSize='200%');
 const key=width+'-'+height+(large?'-large':'')+'-'+profile;
 const capture=async state=>{
  await f.locator('#toast').waitFor({state:'hidden'});
  await f.locator('body').evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a.violations.map(v=>[v.id,v.nodes.map(n=>n.target)]),[],key+' '+state);
  assert.equal(await f.locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1),true,'document overflow');
  await page.screenshot({path:out+'/'+key+'-'+state+'.png',animations:'disabled'});
 };
 const rows=f.locator('.conversation-row:visible');assert.equal(await rows.count(),profile==='serving'?1:profile==='group-member'?3:4);
 assert.equal(await f.locator('.people-rail .person:visible').count(),profile==='serving'?1:profile==='group-member'?3:4);
 const sizes=await f.locator('.people-rail .person:visible').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));assert.ok(sizes.every(w=>w>=58&&w<=62),'portrait rail must not stretch sparse people');
 const back=page.locator('.connect-overlay > button'),box=await back.boundingBox();assert.ok(box.height>=44&&box.height<=45);assert.ok(box.width<width*.7,'return is compact');
 await capture('inbox');
 if(profile==='group-serving'){
  await f.locator('.conversation-row[data-open=thread]').click();await f.locator('#thread-scroll').evaluate(e=>e.scrollTop=0);await capture('thread');
  await f.locator('#thread-new-messages .message-reply-action').first().click();await f.locator('#thread-input').fill('Refinement review reply');await f.locator('#thread-form .send-btn').click();await f.getByText('Refinement review reply',{exact:true}).waitFor();
  assert.equal(await f.locator('#reply-context').isVisible(),false);
  await f.locator('#screen-thread [data-open=inbox]').click();await f.locator('.people-rail [data-person=Jess]').click();await capture('direct');await f.locator('#screen-direct [data-open=inbox]').click();
  await f.locator('.conversation-row[data-open=room]').click();
  if(!large){assert.ok((await f.locator('.room-hero').boundingBox()).height<135,'room header compact');assert.ok((await f.locator('.event-card').boundingBox()).height<190,'event card compact');}
  await f.locator('#room-scroll').evaluate(e=>e.scrollTop=0);await capture('room-chat');await f.locator('#rsvp-action').click();assert.equal(await f.locator('#rsvp-action').getAttribute('aria-pressed'),'true');
  await f.getByRole('tab',{name:'Plans',exact:true}).click();assert.equal(await f.locator('[data-rsvp-mirror]').getAttribute('aria-pressed'),'true');await capture('room-plans');
  await f.getByRole('tab',{name:'People',exact:true}).click();await capture('room-people');
 }
 await back.click();await page.locator('.connect-overlay').waitFor({state:'detached'});assert.equal(await entry.evaluate(e=>e===document.activeElement),true,'host focus returns');assert.equal(await page.locator('#nav button').count(),4);assert.deepEqual(errors,[]);
 results.push({width,height,large,profile,conversations:profile==='serving'?1:profile==='group-member'?3:4,status:'passed'});await ctx.close();console.log('UX03 profile passed',key);
}}
assert.equal(results.length,14);
await writeFile(out+'/results.json',JSON.stringify(results,null,2));
const panels=[['Group member · 3 conversations','group-member-inbox'],['Serving member · 1 conversation','serving-inbox'],['Combined · 4 conversations','group-serving-inbox'],['Wednesday Group','group-serving-thread'],['Direct conversation','group-serving-direct'],['Rally Room · Chat','group-serving-room-chat'],['Rally Room · Plans','group-serving-room-plans'],['Rally Room · People','group-serving-room-people']];
await writeFile(out+'/review.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>UX03 review candidate</title><style>body{background:#17181a;color:#f3e9d8;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}figure{margin:0}figcaption{margin-bottom:12px}img{max-width:100%;height:auto}</style><h1>Connect review candidate</h1><p>Controlled fictional fixtures · no approved visual reference</p><main>'+panels.map(([label,state])=>`<figure><figcaption>${label}</figcaption><a href="390-844-${state}.png"><img src="390-844-${state}.png" alt="${label}"></a></figure>`).join('')+'</main></html>');
}finally{await browser.close();}
