// Exercises the real published bytes; historical Foundation clocks/captures stay unchanged.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.argv[2];
assert.ok(base,'Pass the deployed or local build origin');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL('/foundation2/',base).href);
 await page.locator('#today h1').waitFor();
 await page.getByLabel('Open demo profile and scenario controls').click();
 assert.match(await page.locator('.preview-tools-panel small').innerText(),/Fictional demonstration.*December 2, 2026.*No live Planning Center/);
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:568});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Disclosure horizontally overflows at '+width);
 }
 await page.setViewportSize({width:390,height:844});
 for(const [scenario,expected] of [['group-ready','2026-12-05T18:00:00.000Z'],['serving-ready','2026-12-06T16:00:00.000Z']]){
  await page.locator('#scenario').selectOption(scenario);
  const value=await page.evaluate(s=>s==='group-ready'?window.FoundationGroupFixtures.ready.nextGathering.startsAt:window.FoundationServingFixtures.ready.assignment.startsAt,scenario);
  assert.equal(value,expected);
  assert.ok(Date.parse(value)>Date.parse('2026-12-02T12:00:00.000Z'));
  await page.getByLabel('Open demo profile and scenario controls').click();
 }
 await page.getByLabel('Open demo profile and scenario controls').click();
 const fallback=page.getByRole('link',{name:/Open the existing Rally One application/});
 const destination=new URL(await fallback.getAttribute('href'),page.url());
 assert.equal(destination.origin,new URL(base).origin);
 assert.ok(['/','/index.html'].includes(destination.pathname),'Return must target the legacy root');
 assert.equal(destination.searchParams.get('rallyOne'),'1');
 await fallback.click();
 await page.waitForURL(/rallyOne=1/);
 assert.ok(await page.locator('body').evaluate(el=>el.classList.contains('rally-one')));
 assert.deepEqual(errors,[]);
 console.log('PASS: published Foundation route, fictional Dec 2 as-of, Dec 5/6 events and explicit legacy Rally One return.');
}finally{await browser.close();}
