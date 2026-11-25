'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const Studio=require('../rally-one-studio-today.js');
const fixture=markup=>new JSDOM('<body class="rally-one"><div class="phone-inner premium-alive"><header><div class="header-controls"><button class="header-button" data-action="notifications">Activity<i id="activity-dot" hidden></i></button><button class="profile-avatar" data-action="demo-controls">Profile</button><a class="spotify-link" href="https://open.spotify.com/playlist/test" target="_blank" rel="noopener noreferrer">Music</a></div></header><button id="connect-entry" data-action="connect-inbox">Connect</button><main id="view">'+markup+'</main></div></body>').window.document;
const keys=root=>Array.from(root.querySelectorAll('[data-action],[data-go],[data-verse-circuit-entry]')).map(n=>[n.dataset.action,n.dataset.go,n.dataset.area,n.dataset.value,n.dataset.pane,n.dataset.verseCircuitEntry,n.getAttribute('href')].join('|')).sort();
test('Studio shared shell moves the original Connect button, retains profile/Activity, and restores legacy shell',()=>{
 const d=fixture('<section class="group-screen-v07"></section>'),v=d.querySelector('#view'),connect=d.querySelector('#connect-entry'),actions=keys(d);
 Studio.shell(v,()=>'<svg></svg>');
 assert.equal(connect.parentElement.className,'header-controls');assert.equal(d.querySelectorAll('#connect-entry').length,1);
 assert.equal(d.querySelector('.phone-inner').classList.contains('s13-shell'),true);
 assert.equal(d.querySelector('.s13-music-link').href,d.querySelector('.spotify-link').href);
 assert.equal(d.querySelector('[data-action=notifications]').hidden,true);
 assert.equal(d.querySelector('#activity-dot').parentElement,connect.querySelector('.s13-connect-icon'));
 assert.equal(d.querySelectorAll('#activity-dot').length,1);
 assert.equal(connect.getAttribute('aria-label'),'Connect messages and activity');
 assert.deepEqual(keys(d),actions);
 v.innerHTML='<section class="rp-play-screen"></section>';d.querySelector('.phone-inner').classList.add('is-play-v08');Studio.shell(v,()=>'<svg></svg>');
 assert.equal(connect.parentElement.className.includes('phone-inner'),true);assert.equal(d.querySelector('.phone-inner').classList.contains('s13-shell'),false);assert.equal(d.querySelector('[data-action=notifications]').hidden,false);assert.equal(d.querySelector('#activity-dot').parentElement,d.querySelector('[data-action=notifications]'));assert.deepEqual(keys(d),actions);
});
test('Groups uses the Citizen small-group photo and moves the existing shortcuts and people rail intact',()=>{
 const d=fixture('<section class="group-screen-v07 gv2-home"><div class="gv2-heading"><div class="gv2-heading-row"><h1>Your people</h1><small>Wednesday Group</small></div></div><nav class="gv2-rail-wrap"><button data-action="gv2-profile" data-person="demo">Person</button></nav><button class="gv2-group-hero" data-action="pane" data-area="group" data-value="people"><span class="gv2-hero-brand">Your group</span><strong>Wednesday Group</strong></button><div class="gv2-widgets"><button class="gv2-widget-chat" data-go="group" data-pane="chat"><strong>Conversation</strong></button><button class="gv2-widget-gather" data-action="pane" data-area="group" data-value="gather"><strong>This week</strong></button></div><button class="gv2-care" data-action="pane" data-area="group" data-value="prayer">Care</button></section>'),v=d.querySelector('#view'),a=keys(v);
 const rail=v.querySelector('.gv2-rail-wrap');Studio.unify(v);
 assert.equal(v.querySelector('.s13-group-cover img').getAttribute('src'),'assets/rally-one/citizen-group-circle.jpg');assert.equal(v.querySelector('.gv2-widgets').firstElementChild.className,'gv2-widget-gather');
 assert.equal(v.querySelector('.gv2-rail-wrap'),rail);assert.deepEqual(keys(v),a);
});
test('Team moves canonical huddle content without altering confirmation and coverage commands',()=>{
 const d=fixture('<section class="team-screen-v08"><div class="team-v08-hero"><div class="team-v08-kicker"></div><h1>Serve together</h1></div><div class="team-schedule-card"><div class="team-card-overline"><span>My schedule</span></div><h2>Next serve</h2><div class="team-shift-info">Welcome Team</div><button data-action="shift" data-value="confirmed">Confirm</button><button data-action="cover">Request coverage</button></div><div class="team-huddle"><button data-action="pane" data-area="team" data-value="chat">Coordinate</button></div></section>'),v=d.querySelector('#view'),a=keys(v),huddle=v.querySelector('.team-huddle');
 Studio.unify(v);assert.equal(v.querySelector('.s13-assignment-detail .team-huddle'),huddle);assert.deepEqual(keys(v),a);
});
test('Read surfaces real Scripture and preserves all game, reflection and prayer actions',()=>{
 const d=fixture('<section class="read-screen-v09 ux-read-premium"><header class="ux-read-heading"><h1>READ.</h1><p>Read</p></header><section class="ux-reading-feature"><span class="ux-eyebrow">Reading</span><h2>Read</h2><button data-go="read" data-reading="scripture">Open Scripture</button></section><section class="ux-arcade"><a data-verse-circuit-entry href="verse-circuit-playground.html">Circuit</a><button data-go="play">Blank Battle</button><details data-ux-read-panel="classic"><summary>Classic</summary></details></section><details class="ux-disclosure" data-ux-read-panel="scripture"><summary>Read</summary><section id="reading-scripture"><blockquote>Canonical BSB text</blockquote><button data-action="read">Read</button></section><button data-action="pray">Pray</button></details></section>'),v=d.querySelector('#view'),a=keys(v),scripture=v.querySelector('#reading-scripture');
 Studio.unify(v);assert.equal(v.querySelector('.ux-read-heading').nextElementSibling,scripture);
 assert.equal(v.querySelector('.ux-reading-feature'),null);assert.equal(scripture.querySelector('blockquote').textContent,'Canonical BSB text');assert.equal(v.querySelector('.ux-arcade').previousElementSibling.textContent,'VersePlay');assert.deepEqual(keys(v),a);
});

test('Ask Rally uses the original action in the Today header once and disappears on other destinations',()=>{
 const markup='<section class="s13-today"><header class="f09-greeting"><button class="s13-ask-trigger" data-action="f10-open">Ask</button></header></section>',d=fixture(markup),v=d.querySelector('#view');
 Studio.shell(v,()=>'<svg></svg>');const ask=d.querySelector('.header-controls [data-action=f10-open]');assert.ok(ask);assert.equal(d.querySelectorAll('[data-action=f10-open]').length,1);assert.equal(v.querySelector('.s13-music-link'),null);
 v.innerHTML=markup;Studio.shell(v,()=>'<svg></svg>');assert.equal(d.querySelector('.header-controls [data-action=f10-open]'),ask);assert.equal(d.querySelectorAll('[data-action=f10-open]').length,1);
 v.innerHTML='<section class="group-screen-v07"></section>';Studio.shell(v,()=>'<svg></svg>');assert.equal(d.querySelector('[data-action=f10-open]'),null);
});

test('Shared header renders the standard chat glyph once and preserves notification badge ownership',()=>{
 const d=fixture('<section class="s13-today"></section>'),v=d.querySelector('#view');
 Studio.shell(v,()=>'<svg></svg>');Studio.shell(v,()=>'<svg></svg>');
 const connect=d.querySelector('#connect-entry'),glyph=connect.querySelector('.s13-message-glyph');
 assert.ok(glyph);assert.equal(glyph.querySelectorAll('circle').length,3);assert.equal(connect.querySelectorAll('.s13-message-glyph').length,1);
 assert.equal(d.querySelector('#activity-dot').parentElement,connect.querySelector('.s13-connect-icon'));assert.equal(connect.dataset.action,'connect-inbox');
});

test('Activity indicator stays attached to the chat glyph when visible and hidden, with no duplicate or altered command',()=>{
 const d=fixture('<section class="s13-today"></section>'),v=d.querySelector('#view');
 const dot=d.querySelector('#activity-dot'),connect=d.querySelector('#connect-entry');
 Studio.shell(v,()=>'<svg></svg>');
 const mark=connect.querySelector('.s13-connect-icon');assert.equal(dot.parentElement,mark);
 dot.hidden=false;Studio.shell(v,()=>'<svg></svg>');assert.equal(dot.parentElement,mark);assert.equal(dot.hidden,false);
 dot.hidden=true;Studio.shell(v,()=>'<svg></svg>');assert.equal(dot.parentElement,mark);assert.equal(dot.hidden,true);
 assert.equal(d.querySelectorAll('#activity-dot').length,1);assert.equal(connect.dataset.action,'connect-inbox');
});

test('ALIVE craftsmanship assigns reusable presentation roles without adding or losing actions',()=>{
 const d=fixture('<section class="team-screen-v08"><div class="team-v08-hero"><h1>Your team.</h1></div><div class="team-schedule-card"><div class="team-shift-actions"><button class="btn" data-action="shift" data-value="confirmed">Confirm</button></div></div><button class="team-message-preview" data-action="pane" data-area="team" data-value="chat"><span class="team-message-preview-top"><svg></svg><span>Conversation</span><svg></svg></span></button></section>'),v=d.querySelector('#view'),before=keys(v);
 Studio.applyCraft(v);Studio.applyCraft(v);
 assert.ok(v.querySelector('.team-schedule-card.s13-component-feature'));
 assert.ok(v.querySelector('.team-shift-actions .s13-component-action'));
 assert.ok(v.querySelector('.team-v08-hero .s13-component-title'));
 assert.equal(v.querySelectorAll('.team-message-preview-top .s13-message-glyph').length,1);
 assert.deepEqual(keys(v),before);
});
