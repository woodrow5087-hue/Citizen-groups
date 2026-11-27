/* Foundation 2 Gate 6 — Read source projection.
 * Passage and word-game content come from the unchanged RallyMemory (BSB)
 * engine. The existing MemberContext transitions and StorageGuard own writes.
 * No devotional engagement score, forced reminder, or duplicate game engine.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationRead=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths=Object.freeze(['sermon','study','year']);
function project(snapshot,state,Memory,now=new Date()){
 if(!Memory||!Memory.library)throw new TypeError('Canonical VersePlay memory library required');
 const path=paths.includes(state.plan)?state.plan:'sermon';
 const passage=Memory.library[path];
 if(!passage||!passage.reference||!passage.text)throw new Error('Unsupported Scripture source');
 const rhythm=state.rhythm&&typeof state.rhythm==='object'&&!Array.isArray(state.rhythm)?state.rhythm:{};
 const reflection=typeof rhythm.text==='string'?rhythm.text.slice(0,160):'';
 const due=!!reflection&&!rhythm.completedAt&&typeof rhythm.followUpAt==='string'&&
  Number.isFinite(Date.parse(rhythm.followUpAt))&&Date.parse(rhythm.followUpAt)<=now.getTime();
 const planQuestions=state.planQuestions&&typeof state.planQuestions==='object'&&!Array.isArray(state.planQuestions)?state.planQuestions:{};
 const question=typeof planQuestions[path]==='string'&&planQuestions[path].trim()?planQuestions[path]:
  typeof state.question==='string'?state.question:'How can we love one another in practice?';
 return Object.freeze({
  path,passage:Object.freeze({reference:passage.reference,title:passage.title,text:passage.text,translation:Memory.translation}),
  read:!!snapshot.context.reading.readToday,prayed:!!state.prayed,
  reflection,followUpAt:typeof rhythm.followUpAt==='string'?rhythm.followUpAt:null,
  due,completed:!!rhythm.completedAt,question,leader:!!snapshot.context.permissions.groupLeader,
  memoryMode:state.memoryMode==='pass'?'pass':'solo',memoryRevision:Memory.textRevision
 });
}
function commandFor(kind,value,vm){
 switch(kind){
  case 'read':return {type:'reading-mark',value:value==='true'};
  case 'pray':return {type:'prayer-mark',value:value==='true'};
  case 'reflection-clear':return {type:'reflection-clear'};
  case 'reflection-complete':return {type:'reflection-complete'};
  case 'reflection-defer':return {type:'reflection-defer'};
  case 'reading-plan':return paths.includes(value)?{type:'reading-plan-select',value}:null;
  default:return null;
 }
}
function render(vm,{feedback='',mode='home',gameHTML=''}={}){
 const head='<section class="read-page" aria-labelledby="route-title"><span class="eyebrow">READ · REFLECT · MEMORIZE</span>'+
  '<h1 id="route-title" tabindex="-1">'+(mode==='classic'?'Classic VersePlay':'Make space.')+'</h1>';
 const reply=feedback?'<p class="read-feedback" role="status">'+esc(feedback)+'</p>':'';
 const disclaimer='<p class="read-disclaimer">Berean Standard Bible · public-domain Scripture. Personal reading and prayer are optional and never counted as overdue commitments.</p>';
 if(mode==='classic'){
  return head+'<a href="?screen=read" data-read-view="home" class="chat-inbox-back">‹ Back to Read</a>'+
   '<p class="route-lead">Original Classic VersePlay engine · Solo or two-player Pass & Play.</p>'+
   reply+'<div class="read-game-host">'+gameHTML+'</div>'+disclaimer+'</section>';
 }
 const scripture='<article class="read-scripture" aria-labelledby="read-scripture-title">'+
  '<span class="group-overline">SCRIPTURE · '+esc(vm.passage.translation)+'</span>'+
  '<h2 id="read-scripture-title">'+esc(vm.passage.title)+'</h2>'+
  '<strong class="read-reference">'+esc(vm.passage.reference)+'</strong>'+
  '<blockquote>“'+esc(vm.passage.text)+'”</blockquote>'+
  '<button type="button" data-read-action="read" data-value="'+(vm.read?'false':'true')+'" aria-pressed="'+String(vm.read)+'">'+
  (vm.read?'✓ Reading marked · undo':'Mark reading complete')+'</button>'+
  '<p>Not an assigned reading calendar. A sample passage for reflection.</p></article>';
 const reflection='<section class="read-reflection" aria-labelledby="read-reflection-title">'+
  '<span class="group-overline">REFLECT</span><h2 id="read-reflection-title">Take it with you.</h2>'+
  '<p>'+esc(vm.question)+'</p>'+
  (vm.reflection?'<div class="read-saved-note"><strong>Your saved intention</strong><p>'+esc(vm.reflection)+'</p>'+
    (vm.completed?'<small>Marked complete on this device</small>':
    vm.due?'<div class="read-note-actions"><button type="button" data-read-action="reflection-complete">Mark complete</button>'+
      '<button type="button" data-read-action="reflection-defer">Tomorrow instead</button></div>':
    '<small>Your optional note can be revisited tomorrow.</small>')+
    '<button type="button" data-read-action="reflection-clear">Clear local note</button></div>':'')+
  '<form id="read-reflection-form" class="read-reflection-form"><label for="read-reflection-input">One small action (optional)</label>'+
  '<textarea id="read-reflection-input" name="reflection" rows="2" maxlength="160" placeholder="A small way I could put this verse into practice…"></textarea>'+
  '<button type="submit">Save for tomorrow</button></form></section>';
 const prayer='<section class="read-prayer" aria-label="Personal prayer"><div>'+
  '<span class="group-overline">PRAY</span><h2>A moment to pray.</h2>'+
  '<p>Make space for someone on your heart. Nothing is sent to anyone.</p></div>'+
  '<button type="button" data-read-action="pray" data-value="'+(vm.prayed?'false':'true')+'" aria-pressed="'+String(vm.prayed)+'">'+
  (vm.prayed?'✓ Prayed · undo':'I prayed')+'</button></section>';
 const leader=vm.leader?'<details class="read-leader"><summary>Leader reading pathway <span aria-hidden="true">›</span></summary>'+
  '<p>Only the fictional authorized leader can select a group reading pathway or save a sample discussion question.</p>'+
  '<div class="read-path-options" role="group" aria-label="Sample reading pathway">'+
   paths.map(p=>'<button type="button" data-read-action="reading-plan" data-value="'+p+'" aria-pressed="'+String(vm.path===p)+'">'+
   esc(p==='sermon'?'Sermon Series':p==='study'?'Book Study':'Bible in One Year')+'</button>').join('')+'</div>'+
  '<form id="read-leader-question"><label for="read-leader-question-text">Sample discussion question</label>'+
  '<textarea id="read-leader-question-text" name="question" rows="2" maxlength="400">'+esc(vm.question)+'</textarea>'+
  '<button type="submit">Save local discussion question</button></form>'+
  '<small>No publishing to live groups or church accounts.</small></details>':'';
 const games='<section class="read-games" aria-labelledby="read-games-title">'+
  '<span class="group-overline">VERSEPLAY · ORIGINAL GAMES</span><h2 id="read-games-title" tabindex="-1">Make it stick.</h2>'+
  '<p>Choose a Scripture memory game.</p>'+
  '<a class="read-game-link" href="../verse-circuit-playground.html" data-game="circuit" data-return-focus="circuit-launch"><strong>Verse Circuit</strong><span>Trace · Link · Echo</span><b>Play ↗</b></a>'+
  '<a class="read-game-link" href="../blank-battle.html" data-game="blank" data-return-focus="blank-launch"><strong>Blank Battle</strong><span>Full original Scripture puzzle</span><b>Play ↗</b></a>'+
  '<a class="read-game-link" href="?screen=read&game=classic" data-read-view="classic" data-return-focus="classic-launch"><strong>Classic VersePlay</strong><span>Solo · two-player Pass & Play</span><b>Play ›</b></a>'+
  '<small>Standalone games retain their own existing independent browser progress. Classic VersePlay uses the Foundation 2.0 guarded preview state.</small></section>';
 return head+'<p class="route-lead">Read. Reflect. Remember. At your own pace.</p><a class="read-games-jump" href="#read-games-title">Jump to VersePlay <span aria-hidden="true">↓</span></a>'+reply+
  scripture+reflection+prayer+leader+games+disclaimer+'</section>';
}
return Object.freeze({project,commandFor,render});
});