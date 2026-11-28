// Matched review captures, not approved pixel baselines.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const [before,after]=process.argv.slice(2);assert.ok(before&&after,'Pass accepted and candidate preview origins');
const out='test-results/experience-e3b/review';await mkdir(out,{recursive:true});
const browser=await chromium.launch();const captures=[];
const scenes=[['member-read','connected','read'],['leader-read','leader','read'],['visitor-read','visitor','read'],['reflection','connected','read'],['large-text','leader','read'],['member-today','connected','today'],['leader-groups','leader','groups'],['volunteer-team','team','team']];
try{
 for(const [side,base] of [['before',before],['after',after]]){
  for(const [name,role,route] of scenes){
   const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'America/Denver',reducedMotion:'reduce'});
   const page=await ctx.newPage();await page.clock.setFixedTime(new Date('2026-11-26T12:00:00Z'));
   await page.goto(new URL('/foundation2/',base).href);await page.locator('.greeting').waitFor();
   await page.locator('#preview-tools>summary').click();await page.locator('#scenario').selectOption(role);
   await page.locator('#primary-nav [data-route='+route+']').click();
   if(name==='reflection'){await page.locator('#read-reflection-input').fill('A small act of kindness for a friend.');await page.locator('#read-reflection-form button').click();}
   if(name==='large-text'){await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.locator('.read-leader>summary').click();}
   await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:out+'/'+side+'-'+name+'.png',fullPage:true,animations:'disabled'});
   const measure=await page.locator('#today').evaluate(e=>({height:e.scrollHeight,gamesTop:e.querySelector('.read-games')?.offsetTop??null}));
   captures.push({side,name,role,route,viewport:'390x844',clock:'2026-11-26T12:00:00Z',...measure});await ctx.close();
  }
 }
 const html='<!doctype html><html lang="en"><meta charset="utf-8"><title>E3B visual review</title><style>body{font:16px system-ui;background:#181a1b;color:#f4eee3;margin:24px}h1{font-size:32px}section{break-before:page;margin:32px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0}img{width:100%;height:auto}figcaption{padding:12px 0;font-weight:700}p{line-height:1.5}@media print{body{background:white;color:#181a1b}img{max-height:245mm;object-fit:contain;object-position:top}section{margin:0}}</style><h1>EXPERIENCE E3B · visual review</h1><p>Accepted E2B/E3A bb34cb0 → E3B candidate. Matched fictional scenarios and clock; 390×844. Candidates are not new approved baselines. Read, focus, motion and scrolling changes still require targeted owner review. Unchanged Today/Groups/Team compositions are shown to bound the refinement.</p>'+scenes.map(([name])=>'<section><h2>'+name+'</h2><div class="pair">'+['before','after'].map(side=>'<figure><figcaption>'+side+'</figcaption><img src="'+side+'-'+name+'.png" alt="'+side+' '+name+'"></figure>').join('')+'</div></section>').join('')+'</html>';
 await writeFile(out+'/visual-review.html',html);await writeFile(out+'/capture-manifest.json',JSON.stringify(captures,null,2));
 const page=await browser.newPage();await page.goto('file://'+process.cwd()+'/'+out+'/visual-review.html');await page.pdf({path:out+'/visual-review.pdf',format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'10mm',right:'10mm'}});
}finally{await browser.close();}
