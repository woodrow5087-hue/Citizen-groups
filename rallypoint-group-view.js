/* F-04 Groups UI adapter: extract legacy rendering, preserve exact existing HTML. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RallyGroupView=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
function legacyMessages(messages,e){
  if(!Array.isArray(messages))throw new TypeError('Legacy group messages must be an array');
  if(typeof e!=='function')throw new TypeError('Group rendering requires an escape function');
  return messages.map(m=>`<div class="message"><div class="avatar">${e(m.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><div class="message-meta"><strong>${e(m.name)}</strong><small>${e(m.time)}</small></div><p>${e(m.text)}</p></div></div>`).join('');
}
function legacyComposer(type,title,placeholder){
  return `<div class="composer"><label for="${type}-input">${title}</label><textarea id="${type}-input" rows="2" maxlength="700" placeholder="${placeholder}"></textarea><button type="button" class="btn red" data-action="send" data-value="${type}">Post to sample ${type==='group'?'group':type==='team'?'team':type==='direct'?'private demo conversation':'prayer board'} <span>➤</span></button></div>`;
}
/**
 * This is a rendering seam, not a security decision.
 * A future adapter will supply F-03 access assertions and F-02 messages.
 */
function legacyGroupChat({messages,escape}){
  return `<div class="card group-conversation"><div class="kicker">GROUP CONVERSATION · SAMPLE</div>${legacyMessages(messages,escape)}${legacyComposer('group','Say something to your group','Share a thought or encouragement…')}</div>`;
}
/**
 * F-06 in-app review adapter. Keep original unknown-date records as a literal
 * historical archive. The new F-02 thread stores its own v1 snapshot; no
 * legacy sender IDs, UTC timestamps or unread markers are fabricated.
 */
function integratedGroupChat({messages,escape}){
  return `<section id="rpx-chat" class="rpx-chat" aria-label="New Wednesday Group conversation · fictional">
    <div class="rpx-chat-title">
      <span class="rpx-chat-eyebrow">WEDNESDAY GROUP <b>✳</b> NEW CONVERSATION · DEMO</span>
      <h2>Stay in the <em>conversation.</em></h2>
      <p>A place to share, respond, and encourage your people.</p>
      <div class="rpx-people" aria-label="Five fictional conversation members">
        <span aria-label="Anna L.">AL</span><span aria-label="Jess W.">JW</span><span aria-label="Marcus C.">MC</span><span aria-label="Taylor D.">TD</span><small>YOUR GROUP · SAMPLE PEOPLE</small>
      </div>
    </div>
    <div class="thread-context"><span class="rpx-context-symbol">15</span><div><small>THIS WEEK · JOHN 15:12</small><strong>Love one another.</strong></div></div>
    <div class="conversation-toolbar"><div><span class="thread-label">THE CONVERSATION</span><span id="message-count" class="thread-count">·</span></div>
      <span id="save-indicator" class="saved-note" role="status" aria-live="polite">Local-only demo</span></div>
    <div class="thread-scroll" id="thread-scroll" tabindex="0" role="region" aria-label="Fictional Wednesday conversation">
      <div id="conversation" class="conversation" aria-live="polite" aria-relevant="additions text"></div>
    </div>
    <div class="compose-dock">
      <div id="reply-preview" class="reply-preview" hidden><div><span>REPLYING TO <strong id="reply-name"></strong></span><p id="reply-snippet"></p></div><button id="cancel-reply" type="button" aria-label="Cancel reply">×</button></div>
      <div class="composer-inner"><label class="visually-hidden" for="message-input">Write a fictional Wednesday Group message</label><textarea id="message-input" rows="1" maxlength="700" placeholder="Say something encouraging…"></textarea><button id="send-message" class="send-btn" type="button" aria-label="Send message" disabled><span aria-hidden="true">↗</span></button></div>
      <div class="composer-foot"><span>● FICTIONAL MEMBERS · LOCAL ONLY</span><label class="failure-label"><input id="fail-next" type="checkbox"> Fail next send</label></div>
      <p id="lab-error" class="error-message" role="alert" hidden></p>
    </div>
    <div class="rpx-chat-foot">
      <span>No real messages are delivered.</span>
      <button id="reset-lab" type="button" aria-label="Reset only fictional modern conversation">Reset new demo ↺</button>
    </div>
  </section>
  <section class="rpx-legacy-records" aria-label="Earlier saved group messages">
    <div class="rpx-legacy-heading"><strong>YOUR EARLIER SAVED MESSAGES</strong><small>Preserved in their original format. Unknown historical dates were not guessed.</small></div>
    ${legacyGroupChat({messages,escape})}
  </section>`;
}
return Object.freeze({legacyMessages,legacyComposer,legacyGroupChat,integratedGroupChat});
});
