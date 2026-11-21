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
return Object.freeze({legacyMessages,legacyComposer,legacyGroupChat});
});
