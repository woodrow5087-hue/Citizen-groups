/* Rally One M5B · Unified Companion Focus
 * A PURE, explainable presentation policy over EXISTING fictional sources.
 * One primary action + at most one secondary action in the approved Today
 * Priority Board. No extra task store, messages, inferred care risk, network or
 * automatic side effects. Never treat viewing content as completion.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RallyUnifiedFocus=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const score=Object.freeze({
 'group-rsvp':88,
 'serve-response':84,
 'group-unavailable':80,
 'group-unread':76,
 'leader-checkins':74,
 'care-check-in':68,
 'care-prayer':64,
 'scripture-step':56
});
const groupIds=new Set(['group-rsvp','group-unavailable','group-unread','leader-checkins']);
function activeScore(id,model,now){
 if(id==='leader-checkins'&&model.requestedCheckIn)return 106;
 if(model.twoCommitmentDemo&&id==='group-rsvp')return 104;
 if(model.twoCommitmentDemo&&id==='serve-response')return 103;
 const date=id==='group-rsvp'?model.groupDate:id==='serve-response'?model.serveDate:null;
 if(!(date instanceof Date)||!Number.isFinite(date.getTime()))return score[id]||0;
 const delta=date.getTime()-now.getTime();
 if(id==='group-rsvp')return delta>=0&&delta<=24*3600000?100:70;
 if(id==='serve-response')return delta>=0&&delta<=48*3600000?95:65;
 return score[id]||0;
}
const sourceLabels=Object.freeze({
 'group-rsvp':'Your saved fictional Wednesday Group RSVP is unanswered.',
 'serve-response':'Your fictional Welcome Team serving response is pending.',
 'group-unavailable':'Your existing local conversation could not be read; no unread count was assumed.',
 'group-unread':'Your authorized modern conversation has unread messages.',
 'leader-checkins':'You opted into the group leader fixture; unreviewed sample follow-ups remain.',
 'scripture-step':'A Scripture action you saved on this device is due.'
});
function permitted(id,model){
 if(groupIds.has(id)&&!model?.member)return false;
 if(id==='leader-checkins'&&model?.audience!=='leader')return false;
 if(id==='serve-response'&&!model?.team)return false;
 if(id==='group-unread'&&(!Number.isFinite(model?.unread)||model.unread<=0))return false;
 if(id==='serve-response'&&model?.serveStatus!=='pending')return false;
 if(id==='group-rsvp'&&model?.rsvp)return false;
 if(id==='scripture-step'&&!model?.rhythmDue)return false;
 return Object.hasOwn(score,id);
}
function fromHero(h,model,now){
 if(!h||!permitted(h.id,model)||!h.primary)return null;
 return Object.freeze({
  id:h.id,score:activeScore(h.id,model,now),family:h.id.startsWith('group-')?
     h.id==='group-rsvp'?'gather':'messages':h.id==='serve-response'?'serve':h.id==='scripture-step'?'reading':'leader',
  tone:'rose',icon:h.heroType||'people',
  title:h.title,detail:h.subtitle,
  action:h.primary,label:h.heroLabel,
  why:h.why||sourceLabels[h.id],hasPeople:!!h.hasPeople
 });
}
function fromRow(r,model,now){
 if(!r||!r.requiresResponse||r.deferred||!permitted(r.id,model)||!r.action)return null;
 return Object.freeze({
  id:r.id,score:activeScore(r.id,model,now),family:r.family||r.id,
  tone:r.tone||'rose',icon:r.icon||'people',title:r.title,detail:r.detail,
  action:r.action,label:r.label,
  why:r.why||sourceLabels[r.id],hasPeople:!!model.member&&groupIds.has(r.id)
 });
}
function fromCare(care,model){
 if(!model?.member||!care||!['ready','prayed'].includes(care.stage))return null;
 const prayed=care.stage==='prayed';
 return Object.freeze({
  id:prayed?'care-check-in':'care-prayer',
  score:score[prayed?'care-check-in':'care-prayer'],
  family:'care',tone:'rose',icon:'people',
  title:prayed?'Continue a thoughtful check-in.':'A moment to care.',
  detail:prayed?'You marked that you prayed for a sample group request. A message is optional.':
    'There is a named fictional prayer request in your Wednesday Group.',
  action:Object.freeze({kind:'action',id:prayed?'companion-encourage':'care-open-prayer',pane:''}),
  label:prayed?'Write a check-in':'Read prayer',
  why:'A named fictional prayer request from your authorized group is saved on this device. There is no inferred risk or automated outreach.',
  hasPeople:true
 });
}
function focus({board,model,care,now=new Date()}={}){
 const b=board&&typeof board==='object'?board:{};
 const d=model&&typeof model==='object'?model:{};
 const candidates=[fromHero(b.hero,d,now),...(Array.isArray(b.rows)?b.rows:[]).map(r=>fromRow(r,d,now)),fromCare(care,d)]
  .filter(Boolean).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 const selected=[],families=new Set();
 for(const candidate of candidates){
  if(families.has(candidate.family))continue;
  families.add(candidate.family);selected.push(candidate);
  if(selected.length===2)break;
 }
 if(!selected.length){
  // The existing board owns the truthful "caught up" and visitor states.
  // Optional invitations are not counted or labeled as required tasks.
  return Object.freeze({audience:d.audience||'newcomer',
   hero:b.hero||null,rows:Object.freeze((b.rows||[]).filter(r=>!r.requiresResponse&&
    !(b.hero?.id==='welcome-community'&&['find-people','community'].includes(r.id))).slice(0,1)),
   selectedIds:Object.freeze([]),actionCount:0,
   explanation:'No response-needed sample action remains.'});
 }
 const [first,second]=selected;
 const hero=Object.freeze({
  id:first.id,title:first.id==='leader-checkins'&&d.requestedCheckIn?'Taylor asked for a check-in.':first.title,
  subtitle:first.id==='leader-checkins'&&d.requestedCheckIn?'Wednesday Group · a fictional member request':first.detail,
  primary:first.action,heroType:first.icon,heroLabel:first.label,
  eyebrow:first.score>=84?'NEXT UP':first.family==='care'?'CARE · YOUR PEOPLE':
   first.family==='leader'?'LEADER FOLLOW-UP':'RALLY · YOUR NEXT STEP',
  why:first.why,hasPeople:first.hasPeople,calm:false
 });
 const rows=second?[Object.freeze({
  id:second.id,family:second.family,
  tone:second.tone,icon:second.icon,title:second.title,detail:second.detail,
  action:second.action,label:second.label,requiresResponse:true,
  why:second.why
 })]:[];
 return Object.freeze({
  audience:d.audience||'newcomer',
  hero,rows:Object.freeze(rows),selectedIds:Object.freeze(selected.map(s=>s.id)),
  actionCount:selected.length,
  explanation:'One or two source-backed actions, chosen from existing commitments; nothing is inferred from attendance or browsing.'
 });
}
return Object.freeze({focus,permitted});
});
