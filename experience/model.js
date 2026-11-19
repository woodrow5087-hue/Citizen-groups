/* Local-only model. Kept independent of the DOM for meaningful regression tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CitizenModel = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const LEGACY = 'citizen-premium-hybrid-demo-v1';
  const EXTRA = 'citizen-connect-experience-vnext-v1';
  const practices = ['read', 'share', 'memorize', 'pray'];
  const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const emptyDone = () => Object.fromEntries(practices.map(k => [k, false]));
  const initial = (now = new Date()) => ({day:dayKey(now),done:emptyDone(),reflection:'',prayerNote:'',prayed:[],encouraged:[],reactions:[],rsvp:'',joined:[],memoryWords:[],memoryFeedback:'',emailReminders:false});
  const extension = () => ({version:1,profile:{name:'Alex'},history:{},reflections:[],bookmarks:[],highlights:[],comments:{},prayers:[],encouragements:[],readItems:[],savedContent:[],reader:{book:'Romans',chapter:8,font:20},notificationReads:[],commitmentDates:{},rsvpDate:'',rsvpHistory:{}});
  const array = value => Array.isArray(value) ? value : [];
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  function nextOccurrence(weekday, hour, minute = 0, now = new Date()) {
    const result = new Date(now); result.setHours(hour,minute,0,0);
    result.setDate(result.getDate() + (weekday-result.getDay()+7)%7);
    if (result <= now) result.setDate(result.getDate()+7);
    return result;
  }
  function eventDate(id, now = new Date()) {
    if (id === 'gathering') return nextOccurrence(3,18,30,now);
    if (id === 'food') return nextOccurrence(6,9,0,now);
    if (id === 'meals') { const d=nextOccurrence(6,10,0,now);d.setDate(d.getDate()+7);return d; }
    return nextOccurrence(0,14,0,now);
  }
  function when(date, now = new Date()) {
    const tomorrow = new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
    const label=dayKey(date)===dayKey(now)?'Today':dayKey(date)===dayKey(tomorrow)?'Tomorrow':date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    return `${label} · ${date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`;
  }
  function createStore(storage, clock = () => new Date()) {
    let warning = '', sequence = 0;
    function parse(key) {try{return object(JSON.parse(storage.getItem(key)));}catch{warning='Saved data is unavailable. You can still explore; changes may last only for this visit.';return {};}}
    const old=parse(LEGACY), loaded=parse(EXTRA), defaults=initial(clock()), fresh=extension();
    let state={...defaults,...old,done:{...defaults.done,...object(old.done)}};
    for(const key of ['prayed','encouraged','reactions','joined','memoryWords']) state[key]=array(state[key]);
    for(const key of ['reflection','prayerNote','rsvp','memoryFeedback']) state[key]=typeof state[key]==='string'?state[key]:'';
    let extra={...fresh,...loaded,profile:{...fresh.profile,...object(loaded.profile)},reader:{...fresh.reader,...object(loaded.reader)},history:object(loaded.history),comments:object(loaded.comments),commitmentDates:object(loaded.commitmentDates),rsvpHistory:object(loaded.rsvpHistory)};
    for(const key of ['reflections','bookmarks','highlights','prayers','encouragements','readItems','savedContent','notificationReads']) extra[key]=array(extra[key]);
    extra.reader.font=[18,20,23,26].includes(extra.reader.font)?extra.reader.font:20;
    // Bind responses to an actual occurrence, rather than carrying them into every future week.
    if(!extra.rsvpDate)extra.rsvpDate=dayKey(eventDate('gathering',clock()));
    for(const joined of state.joined)if(!extra.commitmentDates[joined])extra.commitmentDates[joined]=eventDate(joined,clock()).toISOString();
    // Legacy notes are preserved as private. They never become a shared feed item implicitly.
    if(state.reflection && !extra.reflections.some(r=>r.text===state.reflection)) extra.reflections.unshift({id:'legacy-reflection',text:state.reflection,reference:'Romans 8:26–28',book:'Romans',chapter:8,verses:[26,27,28],createdAt:`${state.day}T12:00:00`,shared:false});
    if(state.prayerNote && !extra.prayers.some(p=>p.text===state.prayerNote)) extra.prayers.unshift({id:'legacy-prayer',text:state.prayerNote,createdAt:`${state.day}T12:00:00`,shared:false});
    function persist() {
      try {storage.setItem(LEGACY,JSON.stringify(state));storage.setItem(EXTRA,JSON.stringify(extra));warning='';return true;}
      catch {warning='This browser could not save your changes. Keep this tab open; changes may be lost on refresh.';return false;}
    }
    function rollover() {
      const day=dayKey(clock());
      const gathering=dayKey(eventDate('gathering',clock()));
      const eventChanged=extra.rsvpDate!==gathering;
      if(eventChanged){if(state.rsvp)extra.rsvpHistory[extra.rsvpDate]=state.rsvp;state.rsvp='';extra.rsvpDate=gathering;}
      if(state.day===day) return eventChanged;
      extra.history[state.day]={...emptyDone(),...state.done};
      state.day=day;state.done=emptyDone();state.prayed=[];state.encouraged=[];state.memoryWords=[];state.memoryFeedback='';
      return true;
    }
    rollover();
    const id = prefix => `${prefix}-${clock().getTime()}-${++sequence}`;
    const change = fn => {rollover();const result=fn();extra.history[state.day]={...state.done};persist();return result;};
    const toggle=(key,value)=>change(()=>{state[key]=state[key].includes(value)?state[key].filter(v=>v!==value):[...state[key],value];if(key==='joined'){if(state[key].includes(value))extra.commitmentDates[value]=eventDate(value,clock()).toISOString();else delete extra.commitmentDates[value];}return state[key].includes(value);});
    const toggleExtra=(key,value)=>change(()=>{extra[key]=extra[key].includes(value)?extra[key].filter(v=>v!==value):[...extra[key],value];return extra[key].includes(value);});
    return {
      get state(){return state;},get extra(){return extra;},get warning(){return warning;},clock,rollover,
      save:()=>change(()=>{}),toggle,toggleExtra,
      count:()=>practices.filter(k=>state.done[k]).length,
      next:()=>practices.find(k=>!state.done[k]),
      complete:key=>change(()=>{if(practices.includes(key))state.done[key]=true;}),
      rsvp:value=>change(()=>{state.rsvp=state.rsvp===value?'':value;}),
      reflect:(text,context,shared=false)=>change(()=>{
        const clean=String(text).trim().slice(0,2000);if(!clean)throw Error('Write a reflection first.');
        const entry={id:id('reflection'),text:clean,...context,createdAt:clock().toISOString(),shared:shared===true};
        extra.reflections.unshift(entry);state.reflection=clean;state.done.share=true;return entry;
      }),
      shareReflection:(refId,shared)=>change(()=>{const r=extra.reflections.find(r=>r.id===refId);if(r)r.shared=shared===true;}),
      removeReflection:refId=>change(()=>{extra.reflections=extra.reflections.filter(r=>r.id!==refId);state.reflection=extra.reflections[0]?.text||'';delete extra.comments[refId];}),
      comment:(refId,text)=>change(()=>{const clean=String(text).trim().slice(0,600);if(!clean)throw Error('Write a comment first.');const entry={id:id('comment'),text:clean,createdAt:clock().toISOString()};extra.comments[refId]=[...array(extra.comments[refId]),entry];return entry;}),
      removeComment:(refId,commentId)=>change(()=>{extra.comments[refId]=array(extra.comments[refId]).filter(c=>c.id!==commentId);}),
      pray:(text,shared=false)=>change(()=>{const clean=String(text).trim().slice(0,1000);if(!clean)throw Error('Add a prayer intention first.');state.prayerNote=clean;const entry={id:id('prayer'),text:clean,shared:shared===true,createdAt:clock().toISOString()};extra.prayers.unshift(entry);return entry;}),
      removePrayer:prayerId=>change(()=>{extra.prayers=extra.prayers.filter(p=>p.id!==prayerId);state.prayerNote=extra.prayers[0]?.text||'';}),
      encourage:(member,text)=>change(()=>{const clean=String(text).trim().slice(0,600);if(!clean)throw Error('Write a short encouragement first.');extra.encouragements.unshift({id:id('encouragement'),member,text:clean,createdAt:clock().toISOString()});if(!state.encouraged.includes(member))state.encouraged.push(member);state.done.share=true;}),
      bookmark:context=>change(()=>{const key=`${context.book}:${context.chapter}:${context.verses.join(',')}`;const exists=extra.bookmarks.some(b=>b.key===key);extra.bookmarks=exists?extra.bookmarks.filter(b=>b.key!==key):[{...context,key,createdAt:clock().toISOString()},...extra.bookmarks];return !exists;}),
      highlight:context=>change(()=>{for(const n of context.verses){const key=`${context.book}:${context.chapter}:${n}`;extra.highlights=extra.highlights.includes(key)?extra.highlights.filter(k=>k!==key):[...extra.highlights,key];}}),
      read:context=>change(()=>{state.done.read=true;const key=`${state.day}:${context.book}:${context.chapter}`;if(!extra.readItems.some(r=>r.key===key))extra.readItems.push({...context,key,day:state.day});}),
      weekly:()=>{
        const now=clock(),week=[];const start=new Date(now);start.setDate(start.getDate()-((start.getDay()+6)%7));
        for(let i=0;i<7;i++){const d=new Date(start);d.setDate(d.getDate()+i);const day=dayKey(d);week.push({day,label:d.toLocaleDateString('en-US',{weekday:'short'}),future:day>dayKey(now),done:day===state.day?{...state.done}:{...emptyDone(),...object(extra.history[day])}});}return week;
      },
      reset:()=>{state=initial(clock());extra=extension();persist();}
    };
  }
  return {LEGACY,EXTRA,practices,dayKey,initial,extension,nextOccurrence,eventDate,when,createStore};
});
