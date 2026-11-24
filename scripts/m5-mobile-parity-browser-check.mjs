import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/m5-mobile-parity-browser-check.mjs <preview-url>');
const out='test-results/m5-mobile-parity';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
const people=['dustin','mandy','garrett','nick','aiden','dom'];
try{
 for(const [width,height] of [[320,640],[390,844],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').click();
  await page.locator('[data-welcome="demo"]:visible').click();
  await page.locator('#rp-gateway').waitFor({state:'hidden'});
  await page.locator('.rally-one .f09-board').waitFor();
  const rail=page.locator('.gv2-today-people');
  await rail.waitFor();
  assert.deepEqual(await rail.locator('.gv2-rail-button[data-person]').evaluateAll(els=>els.map(el=>el.dataset.person)),
    people,'Today must show the exact six Groups 2.0 profiles');
  assert.equal(await rail.locator('.gv2-rail-button').count(),7,'group + six profiles');
  const actualSprite=await page.request.get(new URL('assets/rally-one/groups-v2-people.webp',base).href);
  assert.equal(actualSprite.status(),200,'actual photo sprite loaded from same local file as Groups');
  assert.ok((await actualSprite.body()).length>5000);
  assert.match(await rail.locator('.gv2-photo-aiden').evaluate(el=>getComputedStyle(el).backgroundImage),
    /groups-v2-people\.webp/);
  assert.match(await page.locator('.f09b-faces .f09b-real-photo').first().evaluate(el=>getComputedStyle(el).backgroundImage),
    /groups-v2-people\.webp/,'hero people also use exact same real photos');
  const layout=await page.evaluate(()=>{
   const hero=document.querySelector('.f09b-hero');
   const row=document.querySelector('.f09b-row');
   const copy=row?.querySelector('.f09b-row-copy');
   const priorities=document.querySelector('.f09b-priorities');
   const rail=document.querySelector('.gv2-today-people .gv2-rail');
   const rect=e=>e.getBoundingClientRect();
   return {heroWidth:rect(hero).width,heroHeight:rect(hero).height,
      rowWidth:rect(row).width,copyWidth:rect(copy).width,
      rowBelowHero:rect(row).top>=rect(hero).bottom-3,
      rootOverflow:document.documentElement.scrollWidth>innerWidth+1,
      horizontalRail:rail.scrollWidth>rail.clientWidth,
      rowWrap:getComputedStyle(copy.querySelector('strong')).overflowWrap,
      columns:getComputedStyle(priorities).gridTemplateColumns};
  });
  assert.ok(layout.heroWidth>=width-55,'hero must occupy most of screen '+width+': '+JSON.stringify(layout));
  assert.ok(layout.rowWidth>=layout.heroWidth-8,'supporting action is a full-width row '+width+': '+JSON.stringify(layout));
  assert.ok(layout.copyWidth>=65,'no letter-by-letter text wrapping '+width+': '+JSON.stringify(layout));
  assert.ok(layout.rowBelowHero,'second action follows hero, never sits in narrow adjacent column '+width);
  assert.ok(layout.heroHeight<400,'no enormous empty red hero '+width);
  assert.equal(layout.rootOverflow,false,'no accidental horizontal overflow '+width);
  assert.equal(layout.horizontalRail,true,'only people circles intentionally scroll');
  if(width===390)await page.screenshot({path:out+'/today-fixed-390.png',animations:'disabled',fullPage:true});
  await rail.locator('.gv2-rail-button[data-person="aiden"]').click();
  await page.locator('.gv2-profile h1').getByText('Aiden').waitFor();
  assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),'group');
  assert.ok(await page.locator('.gv2-profile .gv2-photo-aiden').isVisible());
  await page.locator('.gv2-profile .gv2-back').click();
  // Portrait return restores its Today origin, including the selected tab.
  await page.locator('.gv2-today-people').waitFor();
  assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),'today');
  await page.locator('#nav [data-go="group"]').click();
  await page.locator('.gv2-home').waitFor();
  assert.deepEqual(await page.locator('.gv2-home .gv2-rail-button[data-person]').evaluateAll(els=>els.map(el=>el.dataset.person)),
    people,'Groups and Today must use the exact same roster');
  await page.locator('#nav [data-go="today"]').click();
  if(width===390){
   await page.locator('[data-action="demo-controls"]').click();
   await page.locator('[data-action="scenario"][data-value="no-memberships"]').click();
   await page.locator('.gv2-today-people').waitFor();
   assert.equal(await page.locator('.gv2-today-people .gv2-rail-button[data-person]').count(),6);
   assert.equal(await page.locator('.gv2-today-people [data-pane="people"]').count(),0);
   await page.locator('.gv2-today-people [data-person="dom"]').click();
   await page.locator('.gv2-profile h1').getByText('Dom').waitFor();
   assert.equal(await page.locator('.gv2-profile [data-go="group"][data-pane="chat"]').count(),0,
     'guest profile is only a photo preview');
  }
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(a11y.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],
    'Today photo parity a11y '+width);
  assert.deepEqual(errors,[],'Today profile/navigation JS errors '+width);
  await context.close();
  console.log('M5 Today mobile layout and shared real photo profiles passed at '+width+'px');
 }
}finally{await browser.close();}
