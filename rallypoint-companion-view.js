/* Presentation for the Rally Companion 1.0 fixture preview. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RallyCompanionView=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';

  const escape=value=>String(value??'').replace(/[&<>"']/g,character=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const destinationPanes={
    group:['','gather','chat','leader'],
    team:['','schedule'],
    read:['','scripture']
  };

  function entryPrompt(snapshot){
    const {group,serving,leadership,board}=snapshot||{};
    if(!group&&!serving)return {id:'start',hint:'Explore groups, serving or Scripture.'};
    const needsGroup=group?.nextDate&&group.rsvp==='none';
    const needsServing=serving?.nextDate&&serving.response==='pending';
    if(needsGroup&&(!needsServing||group.nextDate<=serving.nextDate)){
      return {id:'group',hint:'Get ready for Wednesday Group.'};
    }
    if(needsServing)return {id:'serve',hint:'Get ready for your serving shift.'};
    if(leadership?.groupCheckIns>0)return {id:'leader',hint:'See what needs a leader’s attention.'};
    if(group?.unreadCount>0)return {id:'group',hint:'Catch up with your group.'};
    return board?.taskCount===0?
      {id:'check',hint:'Check your sample commitments.'}:
      {id:'check',hint:'See what needs your attention.'};
  }

  // Restore the approved F-08 Premium ALIVE assistant card; the RC1 engine
  // supplies current, authorized content and opens the new conversational sheet.
  function entryStory(snapshot,id){
    const {group,serving,leadership,sources,board}=snapshot||{};
    if(id==='start')return {
      title:'Your people. Your next step.',
      detail:'Find a place to connect, explore serving, or open Scripture. You choose where to begin.',
      why:'Your current sample profile has no linked group or serving team.',
      action:'Help me get connected'
    };
    if(id==='group'){
      if(group?.nextDate&&group.rsvp==='none')return {
        title:'Wednesday is coming up.',
        detail:'Your sample group gathering is scheduled. Your RSVP is still open.',
        why:'Your current group membership and the dated sample gathering are available.',
        action:'Help me prepare for Wednesday'
      };
      return {
        title:'Your group has something new.',
        detail:group?.unreadCount>0?
          group.unreadCount+' unread sample '+(group.unreadCount===1?'message':'messages')+' to review.':
          'Check what matters to your Wednesday Group.',
        why:'This comes from your currently authorized group and modern conversation status.',
        action:'Check in with my group'
      };
    }
    if(id==='serve')return {
      title:'Your serving team needs a reply.',
      detail:'You have a sample shift coming up. You can review it before deciding.',
      why:'Your current team membership and an upcoming pending shift are verified in the fixture.',
      action:'Help me get ready to serve'
    };
    if(id==='leader')return {
      title:'People first. Always.',
      detail:leadership?.groupCheckIns+' sample group '+(leadership?.groupCheckIns===1?'check-in':'check-ins')+' to review.',
      why:'Only an authorized group leader can see this aggregate sample count.',
      action:'Show my leader check-ins'
    };
    if(sources?.conversation==='unavailable'&&group)return {
      title:'Let’s check what’s current.',
      detail:'Your sample group conversation is unavailable. Other details may still be available.',
      why:'Unknown message status is not treated as zero unread.',
      action:'Help me find my next step'
    };
    if(board?.taskCount===0)return {
      title:'You’re caught up. What’s next?',
      detail:'Nothing requires a response right now. Explore what matters at your own pace.',
      why:'No required response is currently identified in your authorized sample activity.',
      action:'Talk through my week'
    };
    return {
      title:'What matters today?',
      detail:'I can help you review your group, serving, or next meaningful step.',
      why:'Rally uses only the current authorized fictional profile; unavailable facts stay unknown.',
      action:'Ask Rally'
    };
  }

  function entry(snapshot,{sampleWeek=false}={}){
    const {id}=entryPrompt(snapshot),story=entryStory(snapshot,id);
    return '<section class="pa-companion rc1-assistant-card" aria-label="Personalized companion suggestion" data-suggestion="'+escape(id)+'">'+
      '<div class="pa-companion-top"><span class="pa-pulse" aria-hidden="true"></span>'+
      'YOUR RALLY COMPANION'+(sampleWeek?' · SAMPLE WEEK':' · LOCAL DEMO')+
      '<button type="button" class="pa-companion-more" data-action="quick-actions" title="More ways to connect" aria-label="Open companion quick actions">✳</button></div>'+
      '<h2>'+escape(story.title)+'</h2><p>'+escape(story.detail)+'</p>'+
      '<button type="button" class="pa-companion-link" data-action="rc1-open" data-value="'+escape(id)+'" aria-haspopup="dialog">'+
      escape(story.action)+' <span aria-hidden="true">↗</span></button>'+
      '<p class="pa-companion-why"><strong>WHY THIS?</strong> '+escape(story.why)+'</p>'+
      '</section>';
  }

  function route(action){
    if(!action||action.source!=='local-fixture'||action.requiresExplicitClick!==true)return '';
    const {kind,id,pane='',label}=action;
    let attributes='';
    if(kind==='confirm'&&['rsvp','serve'].includes(id)){
      attributes='data-action="rc1-confirm" data-value="'+id+'"';
    }else if(kind==='go'&&Object.hasOwn(destinationPanes,id)&&destinationPanes[id].includes(pane)){
      attributes='data-go="'+id+'"';
      if(pane)attributes+=id==='read'?' data-reading="'+pane+'"':' data-pane="'+pane+'"';
    }
    if(!attributes||!label)return '';
    return '<button type="button" class="rc1-route" '+attributes+'>'+escape(label)+'</button>';
  }

  function resultRow(item){
    const control=route(item.action);
    return '<li class="rc1-result'+(control?' rc1-result-action':'')+'">'+
      '<div><h4>'+escape(item.title)+'</h4><p>'+escape(item.detail)+'</p></div>'+control+'</li>';
  }

  function render({response,asked='',history=[],suggestions=[],notice='',sampleWeek=false}={}){
    const rows=(response?.items||[]).map(resultRow).join('');
    const followups=suggestions.slice(0,3).map(question=>
      '<button type="button" class="rc1-suggestion" data-action="rc1-ask" data-value="'+escape(question.id)+'">'+
      escape(question.label)+'</button>').join('');
    const earlier=history.slice(-3).map(turn=>
      '<li><p>'+escape(String(turn.asked||'').slice(0,160))+'</p>'+
      '<p>'+escape(String(turn.heading||'').slice(0,100))+'</p></li>').join('');
    const note=response?.note||'Fictional sample activity on this device.';
    return '<div class="rc1-panel">'+
      (sampleWeek?'<p class="rc1-sample">Fictional sample week · Nov 23–29, 2026</p>':'')+
      '<form class="rc1-query-form" data-form="rc1-query">'+
      '<label for="rc1-query">What’s on your mind?</label>'+
      '<div class="rc1-query-line"><input id="rc1-query" name="question" type="text" maxlength="160" '+
      'autocomplete="off" placeholder="Ask about your week"><button type="submit">Ask</button></div></form>'+
      (notice?'<p class="rc1-notice" role="status">'+escape(notice.slice(0,180))+'</p>':'')+
      (asked?'<p class="rc1-question"><strong>You asked</strong> '+escape(asked.slice(0,160))+'</p>':'')+
      '<section class="rc1-response" aria-labelledby="rc1-answer">'+
      '<h3 id="rc1-answer" tabindex="-1">'+escape(response?.heading||'Let’s get started.')+'</h3>'+
      (response?.intro?'<p>'+escape(response.intro)+'</p>':'')+
      (rows?'<ul class="rc1-results" role="list">'+rows+'</ul>':'')+'</section>'+
      (followups?'<div class="rc1-suggestions" role="group" aria-label="Questions to ask next">'+followups+'</div>':'')+
      (earlier?'<details class="rc1-history"><summary>Earlier in this conversation</summary><ol>'+earlier+'</ol></details>':'')+
      '<p class="rc1-disclosure">'+escape(note)+'</p></div>';
  }

  return Object.freeze({entry,render});
});
