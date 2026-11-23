import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.argv[2];
if(!base)throw Error('Usage: node scripts/m6-connected-browser-check.mjs <preview-url>');
const out='test-results/m6-connected';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
try{
 const context=await browser.newContext({
  viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime(new Date('2026-11-25T12:00:00'));
 await page.goto(new URL('/?rallyOne=1&welcome=1',base).href);
 await page.locator('[data-welcome="create"]:visible').click();
 await page.locator('[data-welcome-campus="central"]:visible').click();
 await page.locator('#rp-gateway [data-welcome="next"]').click();
 await page.locator('[data-welcome-role="connected"]:visible').click();
 await page.locator('#rp-gateway [data-welcome="next"]').click();
 await page.locator('[data-welcome-membership="team"]').click();
 await page.locator('#rp-onboard-name').fill('Alex');
 await page.locator('[data-welcome="finish"]:visible').click();
 await page.locator('#rp-gateway').waitFor({state:'hidden'});
 await page.locator('.f09b-hero[data-priority="group-rsvp"]').waitFor();
 const current=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rallypoint-phase1-2026')));
 const initial=await current();
 assert.equal(initial.rsvp,'');
 assert.equal(initial.teamStatus,'pending');

 // 1: Today RSVP is the SAME group RSVP that Groups displays.
 await page.locator('.f09b-hero [data-action="f09-rsvp"]').click();
 assert.equal((await current()).rsvp,'going');
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('.gv2-home').waitFor();
 await page.locator('.gv2-widget-gather').getByText('You are going').waitFor();
 await page.locator('.gv2-widget-gather').click();
 await page.locator('.gv2-detail-heading').waitFor();
 assert.match(await page.locator('#view').textContent(),/Going|going/);
 await page.locator('#nav [data-go="today"]').click();
 assert.equal(await page.locator('[data-priority="group-rsvp"]').count(),0);

 // 2: Serve on Today; saved Team schedule is updated in the same browser state.
 await page.locator('[data-row="serve-response"] [data-action="f09-serve"]').click();
 assert.equal((await current()).teamStatus,'confirmed');
 await page.locator('#nav [data-go="team"]').click();
 await page.locator('.team-screen-v08:not(.team-empty-v08)').waitFor();
 assert.match(await page.locator('.team-schedule-card').textContent(),/Confirmed|confirmed/);
 await page.locator('#nav [data-go="today"]').click();
 assert.equal(await page.locator('[data-row="serve-response"]').count(),0);
 assert.equal(await page.locator('[data-priority="serve-response"]').count(),0);

 // 3: Viewing Today does not acknowledge the actual modern conversation.
 await page.locator('.f09b-hero[data-priority="group-unread"]').waitFor();
 const modern=()=>page.evaluate(()=>localStorage.getItem('rallypoint-wednesday-chat-lab-v1'));
 const before=await modern();
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('.gv2-home').waitFor();
 await page.locator('#nav [data-go="today"]').click();
 assert.equal(await modern(),before,'viewing overview did not change the modern thread');
 await page.locator('.f09b-hero[data-priority="group-unread"] [data-go="group"][data-pane="chat"]').click();
 const thread=page.frameLocator('.connect-overlay iframe');
 await thread.locator('#screen-thread:not([hidden])').waitFor();
 await page.locator('.connect-overlay > button').click();
 await page.locator('.f09b-hero[data-priority="care-prayer"]').waitFor();
 assert.notEqual(await modern(),before,'actual Connect conversation owns its read receipt');

 // 4: Explicit sample prayer changes Today and Groups without sending anything.
 await page.locator('.f09b-hero [data-action="care-open-prayer"]').click();
 await page.locator('.ro-care--prayer').waitFor();
 const messagesBefore=(await current()).directMessages;
 await page.locator('.ro-care--prayer [data-action="care-mark-prayed"]').click();
 assert.ok((await current()).companionCare.marcus.prayedAt);
 assert.deepEqual((await current()).directMessages,messagesBefore,
   'praying cannot automatically message a person');
 await page.locator('#nav [data-go="today"]').click();
 await page.locator('.f09b-hero[data-priority="care-check-in"]').waitFor();
 await page.locator('#nav [data-go="group"]').click();
 await page.locator('.ro-care--group[data-care-stage="prayed"]').waitFor();
 await page.screenshot({path:out+'/unified-member-state-390.png',animations:'disabled'});

 // 5: The prototype's public portraits still do not provide account access.
 await page.locator('.gv2-rail-button[data-person="aiden"]').click();
 await page.locator('.gv2-profile h1').getByText('Aiden').waitFor();
 assert.match(await page.locator('.gv2-profile').textContent(),/not connected to an actual/);
 await page.locator('.gv2-profile .gv2-back').click();
 await page.locator('.gv2-home').waitFor();
 const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 assert.deepEqual(report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],
   'connected care and membership WCAG');
 assert.deepEqual(errors,[],'no JavaScript runtime errors in combined role');
 await context.close();
 console.log('M6 connected journey passed: Today RSVP → Groups → Today serving → Team → Connect unread → explicit prayer → Groups profile, with no automatic outreach');
}finally{await browser.close();}
