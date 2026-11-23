const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const addon=fs.readFileSync('rally-one-verse-circuit-entry.js','utf8');
test('Verse Circuit link appears once on Read and never changes other tabs',()=>{
  const dom=new JSDOM('<div id="view"><section class="today">Today</section></div>',{url:'https://preview.example/',runScripts:'outside-only'});
  dom.window.eval(addon);
  const view=dom.window.document.getElementById('view');
  assert.equal(dom.window.document.querySelector('[data-verse-circuit-entry]'),null);
  view.innerHTML='<section class="read-screen-v09"><div class="rp-game-entry">Blank Battle</div><div class="rp-game-classic-label">Classic</div></section>';
  // Trigger the same idempotent observer mechanism as a navigation rerender.
  return new Promise(resolve=>dom.window.setTimeout(()=>{
    const entry=dom.window.document.querySelector('[data-verse-circuit-entry]');
    assert.ok(entry);
    assert.equal(entry.querySelector('a').getAttribute('href'),'verse-circuit-playground.html');
    assert.match(view.textContent,/Blank Battle/);
    assert.equal(view.querySelectorAll('[data-verse-circuit-entry]').length,1);
    view.innerHTML='<section class="team">Team</section>';
    dom.window.setTimeout(()=>{
      assert.equal(view.querySelector('[data-verse-circuit-entry]'),null);
      view.innerHTML='<section class="read-screen-v09"><div class="rp-game-classic-label">Classic</div></section>';
      dom.window.setTimeout(()=>{
        assert.equal(view.querySelectorAll('[data-verse-circuit-entry]').length,1);
        dom.window.close(); resolve();
      },0);
    },0);
  },0));
});
