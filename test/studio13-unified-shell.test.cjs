'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const Studio=require('../rally-one-studio-today.js');
const fixture=markup=>new JSDOM('<body class="rally-one"><div class="phone-inner premium-alive"><header><div class="header-controls"><button class="header-button" data-action="notifications">Activity</button><button class="profile-avatar" data-action="demo-controls">Profile</button><a class="spotify-link" href="https://open.spotify.com/playlist/test" target="_blank" rel="noopener noreferrer">Music</a></div></header><button id="connect-entry" data-action="connect-inbox">Connect</button><main id="view">'+markup+'</main></div></body>').window.document;
const keys=root=>Array.from(root.querySelectorAll('[data-action],[data-go],[data-verse-circuit-entry]')).map(n=>[n.dataset.action,n.dataset.go,n.dataset.area,n.dataset.value,n.dataset.pane,n.dataset.verseCircuitEntry,n.getAttribute('href')].join('|')).sort();
test('Studio shared shell moves the original Connect button, retains profile/Activity, and restores legacy shell',()=>{
 const d=fixture('<section class="group-screen-v07"></section>'),v=d.querySelector('#view'),connect=d.querySelector('#connect-entry'),actions=keys(d);
 Studio.shell(v,()=>'<svg></svg>');
 assert.equal(connect.parentElement.className,'header-controls');assert.equal(d.querySelectorAll('#connect-entry').length,1);
 assert.equal(d.querySelector('.phone-inner').classList.contains('s13-shell'),true);
 assert.equal(d.querySelector('.s13-music-link').href,d.querySelector('.spotify-link').href);
 assert.deepEqual(keys(d),actions);
 v.innerHTML='<section class="rp-play-screen"></section>';d.querySelector('.phone-inner').classList.add('is-play-v08');Studio.shell(v,()=>'<svg></svg>');
 assert.equal(connect.parentElement.className.includes('phone-inner'),true);assert.equal(d.querySelector('.phone-inner').classList.contains('s13-shell'),false);assert.deepEqual(keys(d),actions);
});
test('Groups uses the deployed community photo and moves the existing shortcuts and people rail intact',()=>{
 const d=fixture('<section class="group-screen-v07 gv2-home"><div class="gv2-heading"><div class="gv2-heading-row"><h1>Your people</h1><small>Wednesday Group</small></div></div><nav class="gv2-rail-wrap"><button data-action="gv2-profile" data-person="demo">Person</button></nav><button class="gv2-group-hero" data-action="pane" data-area="group" data-value="people"><span class="gv2-hero-brand">Your group</span><strong>Wednesday Group</strong></button><div class="gv2-widgets"><button class="gv2-widget-chat" data-go="group" data-pane="chat"><strong>Conversation</strong></button><button class="gv2-widget-gather" data-action="pane" data-area="group" data-value="gather"><strong>This week</strong></button></div><button class="gv2-care" data-action="pane" data-area="group" data-value="prayer">Care</button></section>'),v=d.querySelector('#view'),a=keys(v);
 const rail=v.querySelector('.gv2-rail-wrap');Studio.unify(v);
 assert.equal(v.querySelector('.s13-group-cover img').getAttribute('src'),'assets/rally-one/community.webp');assert.equal(v.querySelector('.gv2-widgets').firstElementChild.className,'gv2-widget-gather');
 assert.equal(v.querySelector('.gv2-rail-wrap'),rail);assert.deepEqual(keys(v),a);
});
test('Team moves canonical huddle content without altering confirmation and coverage commands',()=>{
 const d=fixture('<section class="team-screen-v08"><div class="team-v08-hero"><div class="team-v08-kicker"></div><h1>Serve together</h1></div><div class="team-schedule-card"><div class="team-card-overline"><span>My schedule</span></div><h2>Next serve</h2><div class="team-shift-info">Welcome Team</div><button data-action="shift" data-value="confirmed">Confirm</button><button data-action="cover">Request coverage</button></div><div class="team-huddle"><button data-action="pane" data-area="team" data-value="chat">Coordinate</button></div></section>'),v=d.querySelector('#view'),a=keys(v),huddle=v.querySelector('.team-huddle');
 Studio.unify(v);assert.equal(v.querySelector('.s13-assignment-detail .team-huddle'),huddle);assert.deepEqual(keys(v),a);
});
test('Read surfaces real Scripture and preserves all game, reflection and prayer actions',()=>{
 const d=fixture('<section class="read-screen-v09 ux-read-premium"><header class="ux-read-heading"><h1>READ.</h1><p>Read</p></header><section class="ux-reading-feature"><span class="ux-eyebrow">Reading</span><h2>Read</h2><button data-go="read" data-reading="scripture">Open Scripture</button></section><section class="ux-arcade"><a data-verse-circuit-entry href="verse-circuit-playground.html">Circuit</a><button data-go="play">Blank Battle</button><details data-ux-read-panel="classic"><summary>Classic</summary></details></section><details class="ux-disclosure" data-ux-read-panel="scripture"><summary>Read</summary><section id="reading-scripture"><blockquote>Canonical BSB text</blockquote><button data-action="read">Read</button></section><button data-action="pray">Pray</button></details></section>'),v=d.querySelector('#view'),a=keys(v),scripture=v.querySelector('#reading-scripture');
 Studio.unify(v);assert.equal(v.querySelector('.ux-reading-feature').nextElementSibling,scripture);assert.equal(scripture.querySelector('blockquote').textContent,'Canonical BSB text');assert.equal(v.querySelector('.ux-disclosure').nextElementSibling.textContent,'VersePlay');assert.deepEqual(keys(v),a);
});
