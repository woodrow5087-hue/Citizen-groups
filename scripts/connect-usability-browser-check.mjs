import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/connect-usability-browser-check.mjs <preview-url>');
const out='test-results/connect-usability';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
try{
 for(const [width,height] of [[320,640],[390,844],[430,932]]){
  const context=await browser.newContext({
    viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  // Monday noon: neither Wednesday RSVP nor Sunday serving is urgent.
  // This test specifically exercises unread messages as the Today hero.
  // Separate fixed-date journey tests cover urgent commitments and ordering.
  await page.clock.setFixedTime(new Date('2026-11-23T12:00:00'));
  await page.goto(base);
  await page.locator('[data-welcome="login"]:visible').click();
  await page.locator('[data-welcome="demo"]:visible').click();
  await page.locator('#rp-gateway').waitFor({state:'hidden'});
  const frame=page.frameLocator('.connect-overlay iframe');
  const entry=page.getByRole('button',{name:'Connect messaging inbox'});
  const exit=async()=>{
    await page.locator('.connect-overlay > button').click();
    await page.locator('.connect-overlay').waitFor({state:'detached'});
  };

  // Today -> actual shared Wednesday Group, not a disconnected facsimile.
  await page.locator('[data-priority="group-unread"] button[data-go="group"]').click();
  await frame.locator('#screen-thread:not([hidden])').waitFor();
  assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),'today');
  const scroll=frame.locator('#thread-scroll');
  assert.ok(await scroll.evaluate(el=>el.scrollHeight-el.scrollTop-el.clientHeight<100),
    'the first conversation view should open at the latest messages');

  // Reply quotes and reaction state use the existing versioned conversation.
  await frame.locator('#thread-new-messages .message-reply-action').first().click();
  await frame.locator('#reply-context:not([hidden])').waitFor();
  assert.ok((await frame.locator('#reply-context-text').textContent()).length>5);
  await frame.locator('#thread-input').fill('Connect usability reply');
  await frame.locator('#thread-form .send-btn').click();
  await frame.getByText('Connect usability reply',{exact:true}).waitFor();
  const reply=frame.locator('#thread-new-messages .message').filter({hasText:'Connect usability reply'});
  assert.ok((await reply.locator('.message-reply').textContent()).length>5);
  assert.equal(await frame.locator('#reply-context').isVisible(),false);
  const reaction=frame.locator('#thread-new-messages .message .reaction').first();
  await reaction.click();
  assert.equal(await reaction.getAttribute('aria-pressed'),'true');

  // The simulated touch/soft keyboard must never submit just by Return.
  const composer=frame.locator('#thread-input');
  await composer.fill('Unsent mobile draft');
  await composer.press('Enter');
  assert.ok((await composer.inputValue()).includes('Unsent mobile draft'));
  assert.equal(await frame.locator('#thread-new-messages .message').filter({hasText:'Unsent mobile draft'}).count(),0);
  await exit();
  assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),'today');

  // Reopening through the persistent inbox restores the existing draft.
  await entry.click();
  await frame.locator('.conversation-row[data-open="thread"]').click();
  assert.ok((await frame.locator('#thread-input').inputValue()).includes('Unsent mobile draft'));
  await frame.locator('#screen-thread [data-open="inbox"]').click();

  // Different DMs have different unsent drafts within the active session.
  await frame.locator('.people-rail [data-person="Jess"]').click();
  await frame.locator('#direct-input').fill('Jess draft — not sent');
  await frame.locator('#screen-direct [data-open="inbox"]').click();
  await frame.locator('.people-rail [data-person="Alex Morgan"]').click();
  assert.equal(await frame.locator('#direct-input').inputValue(),'');
  await frame.locator('#screen-direct [data-open="inbox"]').click();
  await frame.locator('.people-rail [data-person="Jess"]').click();
  assert.equal(await frame.locator('#direct-input').inputValue(),'Jess draft — not sent');

  // A smaller viewport approximates reduced visual space while composing.
  // This is NOT a physical iPhone Safari software-keyboard acceptance test.
  await page.setViewportSize({width,height:500});
  await page.waitForTimeout(100);
  const composerBox=await frame.locator('#direct-form').boundingBox();
  assert.ok(composerBox && composerBox.height>40);
  assert.ok(composerBox.y+composerBox.height<=504,'composer must remain inside the visible viewport');
  await page.setViewportSize({width,height});
  await exit();
  await page.locator('#nav [data-go="group"]').click();
  await page.locator('#nav [data-go="today"]').click();

  // Check that the embedded active chat retains meaningful focus/semantics.
  await entry.click();
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(audit.violations.map(v=>v.id),[],'Connect inbox accessibility '+width);
  if(width===390){
    await page.screenshot({path:out+'/inbox-390.png',animations:'disabled'});
    await frame.locator('.conversation-row[data-open="thread"]').click();
    await page.screenshot({path:out+'/thread-390.png',animations:'disabled'});
  }
  assert.deepEqual(errors,[],'No JavaScript runtime errors');
  await context.close();
  console.log('Connect usability: Today roundtrip, replies, drafts, touch Return, viewport and accessibility passed at '+width+'px');
 }
}finally{await browser.close();}
