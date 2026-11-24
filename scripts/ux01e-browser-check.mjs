import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.argv[2]||'http://127.0.0.1:8520/',out='test-results/ux01e';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH}),results=[];
try{for(const [width,height,large] of [[320,568,false],[375,667,false],[390,844,false],[430,932,false],[390,568,false],[390,844,true]]){
const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-11-23T12:00:00Z'));await page.goto(base);await page.locator('[data-welcome="login"]:visible').click();await page.locator('[data-welcome="demo"]:visible').click();await page.locator('#rp-gateway').waitFor({state:'hidden'});await page.locator('#nav [data-go="read"]').click();await page.locator('.ux-read-premium').waitFor();
if(large)await page.evaluate(()=>{const items=[...document.querySelectorAll('.ux-read-premium h1,.ux-read-premium h2,.ux-read-premium p,.ux-read-premium span,.ux-read-premium strong,.ux-read-premium summary')].map(el=>[el,parseFloat(getComputedStyle(el).fontSize)]);for(const [el,size] of items)el.style.fontSize=2*size+'px';});
const geometry=await page.evaluate(()=>{const row=document.querySelector('.ux-game-row').getBoundingClientRect(),nav=document.querySelector('#nav').getBoundingClientRect();return {rowBottom:row.bottom,navTop:nav.top,horizontal:document.documentElement.scrollWidth>innerWidth+1||document.querySelector('#view').scrollWidth>document.querySelector('#view').clientWidth+1};});assert.equal(geometry.horizontal,false);if(!large&&height>=667)assert.ok(geometry.rowBottom<=geometry.navTop,'Primary cards and secondary games fit '+width);
assert.equal(await page.locator('[data-ux-read-panel="classic"] summary').count(),1);assert.equal(await page.locator('[data-reading="memorize"]').count(),0);await page.screenshot({path:`${out}/${width}-${height}${large?'-large':''}.png`,fullPage:true});
await page.locator('[data-ux-read-panel="classic"] summary').click();await page.locator('#reading-memorize').waitFor();await page.locator('[data-ux-read-panel="classic"] summary').click();await page.locator('[data-reading="scripture"]').click();await page.locator('#reading-scripture').waitFor();assert.equal(await page.locator('[data-ux-read-panel="scripture"]').getAttribute('open'),'');
const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[]);if(width===390&&!large&&height===844){
 await page.locator('#nav [data-go="read"]').click();
 const summary=page.locator('.ux-classic>summary');
 for(const motion of ['no-preference','reduce']){await page.emulateMedia({reducedMotion:motion});const box=await summary.boundingBox();await page.mouse.move(box.x+20,box.y+20);await page.mouse.down();
 if(motion==='no-preference')await page.waitForFunction(()=>getComputedStyle(document.querySelector('.ux-classic>summary')).transform!=='none');
 else assert.equal(await summary.evaluate(el=>getComputedStyle(el).transform),'none');
 await page.mouse.up();await summary.click();}
 }
assert.deepEqual(errors,[]);results.push({width,height,large,...geometry,status:'passed'});await context.close();console.log('Premium Read passed',width,height,large);
}}finally{await writeFile(out+'/results.json',JSON.stringify(results,null,2));await browser.close();}
