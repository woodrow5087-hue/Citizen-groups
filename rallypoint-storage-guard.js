/* F-08 non-destructive, browser-local write guard. No migration or network IO. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RallyStorageGuard=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const VERSION=1;
const PRIMARY_KEY='rallypoint-phase1-2026';
const TODAY_KEY='rallypoint-today-ui-v1';
const JOURNAL_KEY='rallypoint-write-journal-v1';
function object(x){return x!==null&&typeof x==='object'&&!Array.isArray(x);}
function parse(raw,kind){
  if(raw===null)return {ok:true,value:null};
  if(typeof raw!=='string')return {ok:false,reason:'Invalid stored value type'};
  try {
    const parsed=JSON.parse(raw);
    if(!object(parsed))return {ok:false,reason:kind+' must be an object'};
    if(kind==='primary'){
      if(parsed.groupMessages!==undefined&&!Array.isArray(parsed.groupMessages))
        return {ok:false,reason:'Saved group messages have an incompatible shape'};
      if(parsed.memoryGames!==undefined&&!object(parsed.memoryGames))
        return {ok:false,reason:'Saved VersePlay progress has an incompatible shape'};
      // Sprint 7B: do not silently overwrite malformed sample care/team data.
      for(const name of ['prayers','teamMessages','reached']){
        if(parsed[name]!==undefined&&!Array.isArray(parsed[name]))
          return {ok:false,reason:'Saved '+name+' has an incompatible shape'};
      }
      for(const name of ['directMessages','companionCare','attendance']){
        if(parsed[name]!==undefined&&!object(parsed[name]))
          return {ok:false,reason:'Saved '+name+' has an incompatible shape'};
      }
      for(const name of ['groupMessages','prayers','teamMessages']){
        if(Array.isArray(parsed[name])&&parsed[name].some(m=>
          !object(m)||typeof m.name!=='string'||typeof m.text!=='string'||
          (m.time!==undefined&&typeof m.time!=='string')))
          return {ok:false,reason:'Saved '+name+' contains an incompatible message'};
      }
      if(Array.isArray(parsed.reached)&&parsed.reached.some(id=>typeof id!=='string'))
        return {ok:false,reason:'Saved leader review has an incompatible identifier'};
      if(object(parsed.directMessages)&&Object.values(parsed.directMessages).some(messages=>!
        Array.isArray(messages)||messages.some(m=>!object(m)||typeof m.text!=='string')))
        return {ok:false,reason:'Saved direct conversation has an incompatible shape'};
    }
    if(kind==='today'&&parsed.memberships!==undefined&&!object(parsed.memberships))
      return {ok:false,reason:'Saved membership demo settings have an incompatible shape'};
    return {ok:true,value:parsed};
  }catch(_){return {ok:false,reason:kind+' contains invalid JSON'};}
}
const cloneRaw=x=>({primaryRaw:x.primaryRaw,todayRaw:x.todayRaw});
function create(storage){
  if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')
    throw new TypeError('Rally Storage Guard requires an injected synchronous storage adapter');
  let baseline,blocked='';
  const read=()=>({
    primaryRaw:storage.getItem(PRIMARY_KEY),
    todayRaw:storage.getItem(TODAY_KEY)
  });
  const equal=(a,b)=>a.primaryRaw===b.primaryRaw&&a.todayRaw===b.todayRaw;
  function inspect(){
    try {
      const journal=storage.getItem(JOURNAL_KEY);
      if(journal!==null)return {ok:false,reason:'An interrupted save is present. Existing data will not be overwritten.'};
      const current=read();
      const a=parse(current.primaryRaw,'primary'),b=parse(current.todayRaw,'today');
      if(!a.ok||!b.ok)return {ok:false,reason:'Saved data needs recovery: '+(!a.ok?a.reason:b.reason)+'. Nothing will be overwritten.'};
      return {ok:true,raw:current};
    }catch(_){return {ok:false,reason:'This browser could not save safely because storage could not be read. Nothing will be overwritten.'};}
  }
  const initial=inspect();
  if(initial.ok)baseline=cloneRaw(initial.raw);
  else blocked=initial.reason;
  function status(){return {ok:!blocked,reason:blocked||null};}
  function save({primaryRaw,todayRaw}={}){
    if(blocked)return {ok:false,reason:blocked};
    const candidate={primaryRaw,todayRaw};
    const a=parse(primaryRaw,'primary'),b=parse(todayRaw,'today');
    if(!a.ok||!b.ok)return {ok:false,reason:'Refusing to save incompatible data'};
    try {
      const check=inspect();
      if(!check.ok){blocked=check.reason;return status();}
      if(!equal(check.raw,baseline)){
        blocked='Saved data changed in another tab. Reload before saving; existing data is protected.';
        return status();
      }
      const before=cloneRaw(baseline);
      const record=JSON.stringify({version:VERSION,before,after:cloneRaw(candidate)});
      // Write-ahead journal first. If this fails, neither original key is touched.
      storage.setItem(JOURNAL_KEY,record);
      try {
        storage.setItem(PRIMARY_KEY,primaryRaw);
        storage.setItem(TODAY_KEY,todayRaw);
        storage.removeItem(JOURNAL_KEY);
        baseline=cloneRaw(candidate);
        return {ok:true,reason:null};
      }catch(_){
        let restored=false;
        try {
          restoreOne(PRIMARY_KEY,before.primaryRaw);
          restoreOne(TODAY_KEY,before.todayRaw);
          storage.removeItem(JOURNAL_KEY);
          restored=true;
        }catch(_rollback){}
        blocked=restored
          ?'Save failed; original values were restored. Reload before editing.'
          :'Save interrupted; recovery is required. Existing values will not be overwritten.';
        return {ok:false,reason:blocked};
      }
    }catch(_){
      blocked='Browser storage write could not start; existing values are protected.';
      return status();
    }
  }
  function restoreOne(key,raw){
    if(raw===null)storage.removeItem(key);
    else storage.setItem(key,raw);
  }
  function recoverInterruptedSave(){
    // Deliberately explicit: never auto-rollback after a page refresh.
    try{
      const text=storage.getItem(JOURNAL_KEY);
      if(text===null)return {ok:false,reason:'There is no interrupted save to recover'};
      const journal=JSON.parse(text);
      if(!journal||journal.version!==VERSION||!object(journal.before)||!object(journal.after))
        return {ok:false,reason:'Unrecognized journal; refusing to overwrite originals'};
      const before=journal.before,after=journal.after;
      if(!['primaryRaw','todayRaw'].every(k=>before[k]===null||typeof before[k]==='string'))
        return {ok:false,reason:'Malformed recovery record'};
      if(!['primaryRaw','todayRaw'].every(k=>typeof after[k]==='string'))
        return {ok:false,reason:'Malformed proposed values'};
      const now=read();
      if(!['primaryRaw','todayRaw'].every(k=>now[k]===before[k]||now[k]===after[k]))
        return {ok:false,reason:'Stored data has changed since the journal was written; manual review required'};
      restoreOne(PRIMARY_KEY,before.primaryRaw);
      restoreOne(TODAY_KEY,before.todayRaw);
      storage.removeItem(JOURNAL_KEY);
      baseline=cloneRaw(before);blocked='';
      return {ok:true,restored:true};
    }catch(_){return {ok:false,reason:'Recovery could not complete; original journal preserved if possible'};}
  }
  return Object.freeze({status,save,recoverInterruptedSave,readOriginals:()=>cloneRaw(read())});
}
return Object.freeze({VERSION,PRIMARY_KEY,TODAY_KEY,JOURNAL_KEY,create});
});
