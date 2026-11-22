import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.argv[2];
const out='test-results/preview-today';
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
try{
  for(const [width,height] of [[320,568],[390,844],[430,932]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    await page.clock.setFixedTime(new Date('2026-11-25T12:00:00'));
    await page.goto(base);
    await page.locator('#rp-entry [data-welcome="login"]').click();
    await page.locator('#rp-onboard [data-welcome="demo"]').click();
    await page.locator('.f09-board').waitFor({state:'visible'});
    const openTab=async tab=>{
      await page.locator('#nav [data-go="'+tab+'"]').click();
      assert.equal(await page.locator('#nav [aria-current="page"]').getAttribute('data-go'),tab);
    };
    const agendaStatus=id=>page.locator('.f09b-agenda-row[data-agenda="'+id+'"] .f09b-status').textContent();
    const priority=id=>page.locator('.f09b-hero[data-priority="'+id+'"], .f09b-row[data-row="'+id+'"]');
    const chatState=()=>page.evaluate(()=>localStorage.getItem('rallypoint-wednesday-chat-lab-v1'));
    const initialChatState=await chatState();
    assert.equal(await agendaStatus('group'),'RSVP open');
    assert.equal(await agendaStatus('serve'),'Needs reply');
    assert.equal(await agendaStatus('scripture'),'To read');
    assert.equal(await priority('group-unread').count(),1);
    for(const [query,selector] of [
      ['','.f09-board'],['?f09=legacy','.pa-companion'],['?f09=1','.f09-stack-controls'],
      ['?f10=1','.f10-entry'],['?f103=1','.f10-entry']
    ]){
      await page.goto(new URL('/'+query,base).href);
      await page.locator(selector).waitFor();
      assert.equal(await page.locator('.f10-panel').count(),0);
      assert.equal(await page.locator('.f10-entry').count(),Number(query.startsWith('?f10')));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(width===390 && (query==='' || query==='?f09=legacy')){
        await page.evaluate(()=>document.fonts.ready);
        await page.screenshot({path:out+'/'+(query?'earlier-today':'priority-board')+'-390.png'});
      }
    }
    await page.locator('.f10-entry').click();
    await page.locator('.f10-panel').waitFor({state:'visible'});
    await page.goto(base);
    assert.equal(await page.locator('.f10-entry').count(),0);
    assert.equal(await chatState(),initialChatState,'visiting Today never acknowledges the thread');

    await openTab('group');
    await page.locator('#rpx-chat').waitFor({state:'visible'});
    assert.notEqual(await chatState(),initialChatState,'opening the thread saves its read cursor');
    await page.locator('.tabs [data-area="group"][data-value="gather"]').click();
    await page.locator('[data-action="rsvp"][data-value="going"]').click();
    await openTab('today');
    assert.equal(await agendaStatus('group'),'Going');
    assert.equal(await priority('group-rsvp').count(),0);
    assert.equal(await priority('group-unread').count(),0);

    await openTab('team');
    await page.locator('[data-action="shift"][data-value="confirmed"]').click();
    await openTab('today');
    assert.equal(await agendaStatus('serve'),'Confirmed');
    assert.equal(await priority('serve-response').count(),0);
    assert.equal(await priority('caught-up').count(),1);

    await openTab('read');
    await page.locator('[data-action="read"]').click();
    await page.locator('.rp-game-entry-play').click();
    await page.locator('.rp-play-screen').waitFor({state:'visible'});
    await page.locator('.rp-play-back').click();
    await page.locator('.rp-game-entry-play').waitFor({state:'visible'});
    await openTab('today');
    assert.equal(await agendaStatus('scripture'),'Read');
    assert.equal(await priority('scripture-read').count(),0);

    await page.reload();
    assert.equal(await agendaStatus('group'),'Going');
    assert.equal(await agendaStatus('serve'),'Confirmed');
    assert.equal(await agendaStatus('scripture'),'Read');
    await page.close();
  }
}finally{await browser.close();}
