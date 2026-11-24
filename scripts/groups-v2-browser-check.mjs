import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/groups-v2-browser-check.mjs <preview-url>');
const folder='test-results/groups-v2';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
try{
 for(const [width,height] of [[320,640],[390,844],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').click();
  await page.locator('[data-welcome="demo"]:visible').click();
  await page.locator('#rp-gateway').waitFor({state:'hidden'});
  await page.locator('#nav [data-go="group"]').click();
  await page.locator('.gv2-home').waitFor();
  if(width===390){await page.locator('#view').evaluate(el=>el.scrollTop=0);await page.screenshot({path:folder+'/overview-first-open-390.png',animations:'disabled'});}
  assert.equal(await page.locator('.gv2-rail-button').count(),7,'group + six real photos');
  const rail=page.locator('.gv2-rail');
  assert.ok(await rail.evaluate(el=>el.scrollWidth>el.clientWidth),'profile rail should scroll, not shrink');
  const avatar=page.locator('.gv2-photo-aiden');
  assert.match(await avatar.evaluate(el=>getComputedStyle(el).backgroundImage),/groups-v2-people\.webp/);
  const asset=await page.request.get(new URL('assets/rally-one/groups-v2-people.webp',base).href);
  assert.equal(asset.status(),200,'local user-supplied avatar asset');
  assert.ok((await asset.body()).length>5000);

  await page.locator('.gv2-rail-button[data-person="aiden"]').click();
  await page.locator('.gv2-profile h1').getByText('Aiden').waitFor();
  assert.match(await page.locator('.gv2-profile-card p').textContent(),/not connected/);
  await page.locator('.gv2-profile .gv2-back').click();
  assert.equal(await page.locator('#view').evaluate(el=>el.scrollTop),0,'profile back restores rail top');
  await page.locator('.gv2-group-hero').click();
  await page.locator('.gv2-directory-list').waitFor();
  assert.equal(await page.locator('.gv2-directory-person').count(),6);
  await page.locator('.gv2-directory-person[data-person="dom"]').click();
  await page.locator('.gv2-profile h1').getByText('Dom').waitFor();
  await page.locator('.gv2-profile .gv2-back').click();
  // Leadership demo restores the exact portrait origin (directory, not overview).
  // Assert the restored route before explicitly returning to the Groups home.
  await page.locator('.gv2-directory-list').waitFor();
  await page.locator('.gv2-detail-heading .gv2-back').click();
  await page.locator('.gv2-home').waitFor();

  await page.locator('.gv2-widget-gather').click();
  await page.locator('.group-gather-rsvp').waitFor();
  await page.locator('[data-action="rsvp"][data-value="going"]').click();
  await page.locator('.gv2-detail-heading .gv2-back').click();
  await page.locator('.gv2-widget-gather').getByText('You are going').waitFor();
  await page.locator('.gv2-care').click();
  await page.getByText('Pray for one another.').waitFor();
  await page.locator('.gv2-detail-heading .gv2-back').click();

  // Existing Connect owns this conversation and restores the Groups tab.
  await page.locator('.gv2-widget-chat').click();
  const frame=page.frameLocator('.connect-overlay iframe');
  await frame.locator('#screen-thread:not([hidden])').waitFor();
  await page.locator('.connect-overlay > button').click();
  await page.locator('.gv2-home').waitFor();
  assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),'group');

  // Groups discovery remains a separate, guest-safe route.
  await page.locator('.gv2-more [data-action="browse"]').click();
  await page.locator('.group-discovery-v07').waitFor();
  await page.locator('.group-discovery-back').click();
  await page.locator('.gv2-home').waitFor();

  if(width===390){
   await page.screenshot({path:folder+'/overview-390.png',animations:'disabled'});
   await page.locator('.gv2-rail-button[data-person="dustin"]').click();
   await page.screenshot({path:folder+'/profile-390.png',animations:'disabled'});
   await page.locator('.gv2-profile .gv2-back').click();
   // Leader only sees a link after opting into the local leader fixture.
   await page.locator('[data-action="demo-controls"]').click();
   await page.locator('#role').click();
   await page.locator('[data-action="close-dialog"]').click();
   assert.equal(await page.locator('.gv2-more [data-value="leader"]').count(),1);
   await page.locator('.gv2-more [data-value="leader"]').click();
   await page.getByText('Record attendance').waitFor();
   await page.locator('.gv2-detail-heading .gv2-back').click();
   await page.locator('[data-action="demo-controls"]').click();
   await page.locator('#role').click();
   await page.locator('[data-action="close-dialog"]').click();
   assert.equal(await page.locator('.gv2-more [data-value="leader"]').count(),0);
  }
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(a11y.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'Groups v2 accessibility '+width);
  assert.deepEqual(errors,[],'No JS page errors '+width);
  await context.close();
  console.log('Groups v2: real avatars, member profiles, gathering, prayer, Connect, discovery and accessibility passed at '+width+'px');
 }

 // Guests can preview the publicly supplied demo portraits, but cannot access
 // My group, group messages, member care or leader tools.
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();
 await page.goto(base);
 await page.locator('[data-welcome="login"]:visible').click();
 await page.locator('[data-welcome="demo"]:visible').click();
 await page.locator('#rp-gateway').waitFor({state:'hidden'});
 await page.locator('[data-action="demo-controls"]').click();
 await page.locator('[data-action="scenario"][data-value="no-memberships"]').click();
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('.group-discovery-v07').waitFor();
 assert.equal(await page.locator('.gv2-public-rail .gv2-rail-button[data-person]').count(),6);
 assert.equal(await page.locator('.gv2-public-rail .gv2-rail-button[data-value="people"]').count(),0);
 assert.equal(await page.locator('.gv2-home').count(),0);
 assert.equal(await page.locator('.gv2-care').count(),0);
 await page.locator('.gv2-public-rail [data-person="dom"]').click();
 await page.locator('.gv2-profile h1').getByText('Dom').waitFor();
 assert.equal(await page.locator('.gv2-profile [data-go="group"]').count(),0);
 // Both guest-safe return controls remain: animated origin return and explicit discovery.
 assert.equal(await page.locator('.gv2-profile .gv2-back[data-action="portrait-return"]').count(),1);
 assert.equal(await page.locator('.gv2-profile [data-action="gv2-back-discovery"]').count(),1);
 await page.locator('.gv2-profile .gv2-back').click();
 await page.locator('.group-discovery-v07').waitFor();
 assert.equal(await page.locator('.ro-care').count(),0);
 await context.close();
 console.log('Groups v2: guest photo preview without private conversations, care or membership');
}finally{
 await browser.close();
}
