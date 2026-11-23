import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
const out='test-results/connect-member';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
try {
  for(const [width,height] of [[320,640],[390,844],[430,932],[1280,900]]){
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base);
    await page.locator('[data-welcome="login"]:visible').click();
    await page.locator('[data-welcome="demo"]:visible').click();
    await page.locator('#rp-gateway').waitFor({state:'hidden'});
    const entry=page.getByRole('button',{name:'Connect messaging inbox'});
    const frame=page.frameLocator('.connect-overlay iframe');
    const exit=()=>page.locator('.connect-overlay > button').click();
    const capture=async name=>{
      await page.screenshot({path:out+'/'+width+'-'+name+'.png',animations:'disabled'});
    };
    const audit=async screen=>{
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(result.violations.map(v=>[v.id,v.nodes.map(n=>n.target)]),[],screen);
    };
    await page.locator('[data-priority="group-unread"] button[data-go="group"]').click();
    await frame.locator('#screen-thread:not([hidden])').waitFor();
    await exit();
    assert.equal(await page.locator('[data-priority="group-unread"]').count(),0);
    for(const tab of ['group','team','read','today']){
      await page.locator('#nav [data-go="'+tab+'"]').click();
      assert.equal(await page.locator('#nav button').count(),4);
      await entry.click();
      await frame.getByRole('heading',{name:'Connect.'}).waitFor();
      await exit();
      assert.equal(await page.locator('#nav [aria-current]').getAttribute('data-go'),tab);
    }
    await capture('caught-up-entry');
    await entry.click();
    const row=frame.locator('.conversation-row[data-open="thread"]');
    assert.equal(await row.locator('.unread').isVisible(),false);
    await capture('inbox');
    await audit('Inbox '+width);
    await row.click();
    await frame.locator('#thread-input').fill('Fictional saved draft');
    await frame.locator('#thread-input').press('Tab');
    await capture('thread');
    await audit('Thread '+width);
    await exit();
    await page.reload();
    await entry.click();
    await row.click();
    assert.equal(await frame.locator('#thread-input').inputValue(),'Fictional saved draft');
    await frame.locator('#thread-form .send-btn').click();
    await frame.getByText('Fictional saved draft',{exact:true}).waitFor();
    await frame.locator('#screen-thread [data-open="inbox"]').click();
    await frame.locator('.people-rail [data-person="Jess"]').click();
    await frame.locator('#direct-input').fill('Fictional hello');
    await frame.locator('#direct-form .send-btn').click();
    await frame.locator('#screen-direct [data-open="inbox"]').click();
    await frame.locator('#compose-toggle').click();
    await frame.locator('#new-dialog [data-person="Jess"]').click();
    await frame.getByText('Fictional hello',{exact:true}).waitFor();
    await frame.locator('#screen-direct [data-open="inbox"]').click();
    await frame.locator('.people-rail [data-open="room"]').click();
    await frame.locator('#rsvp-action').click();
    await frame.getByRole('tab',{name:'Plans'}).click();
    assert.equal(await frame.locator('[data-rsvp-mirror]').getAttribute('aria-pressed'),'true');
    await frame.getByRole('tab',{name:'People'}).click();
    await frame.getByRole('tab',{name:'Chat'}).click();
    await capture('room');
    await audit('Room '+width);
    await exit();
    await page.locator('#nav [data-go="group"]').click();
    await page.locator('#rpx-chat').getByText('Fictional saved draft',{exact:true}).waitFor();
    await page.locator('#nav [data-go="team"]').click();
    await page.locator('.tabs [data-area="team"][data-value="chat"]').click();
    await page.getByRole('button',{name:/Open Citizen Serve Team Rally Room/}).click();
    await frame.locator('#screen-room:not([hidden])').waitFor();
    assert.equal(await frame.locator('#rsvp-action').getAttribute('aria-pressed'),'true');
    await exit();
    if(width===390){
      await page.locator('#nav [data-go="today"]').click();
      await page.evaluate(()=>localStorage.setItem('rallypoint-wednesday-chat-lab-v1','unreadable fixture'));
      await entry.click();
      await row.click();
      assert.equal(await frame.locator('#thread-input').isDisabled(),true);
      assert.equal(await page.evaluate(()=>localStorage.getItem('rallypoint-wednesday-chat-lab-v1')),'unreadable fixture');
      await exit();
      await page.locator('[data-action="demo-controls"]').click();
      await page.locator('[data-action="scenario"][data-value="no-memberships"]').click();
      await entry.click();
      await frame.getByText(/Your inbox is ready/).waitFor();
      assert.equal(await frame.locator('.conversation-row:visible').count(),0);
      assert.equal(await frame.locator('#compose-toggle').isVisible(),false);
      await audit('Guest inbox');
    }
    assert.deepEqual(errors,[]);
    await context.close();
    console.log('Connect entry, zero unread, shared history, draft, DM, room and axe passed at '+width);
  }
} finally {await browser.close();}
