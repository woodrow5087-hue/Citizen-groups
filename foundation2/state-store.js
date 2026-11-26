/* Foundation 2 — isolated transactional fixture state.
 * Deliberately reuses the canonical storage guard and app-state normalizer.
 * Never reads/writes the original application's storage keys on the same host.
 * Scenarios have separate namespaces so switching does not overwrite another.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationStateStore=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const scenarios=Object.freeze({
 connected:Object.freeze({group:true,team:true,role:'member'}),
 leader:Object.freeze({group:true,team:true,role:'leader'}),
 group:Object.freeze({group:true,team:false,role:'member'}),
 team:Object.freeze({group:false,team:true,role:'member'}),
 visitor:Object.freeze({group:false,team:false,role:'member'}),
 unavailable:Object.freeze({group:true,team:false,role:'member'})
});
function create({storage,scenario='connected',Guard,AppState}={}){
 if(!Object.hasOwn(scenarios,scenario))throw new RangeError('Unknown Foundation 2 scenario');
 if(!Guard||!AppState)throw new TypeError('Existing guard and app state modules are required');
 const fixture=scenarios[scenario],prefix='rally-one-foundation2-v1:'+scenario+':';
 const aliases=Object.freeze({
  [Guard.PRIMARY_KEY]:prefix+'primary',
  [Guard.TODAY_KEY]:prefix+'today',
  [Guard.JOURNAL_KEY]:prefix+'journal'
 });
 function mapped(key){
  if(!Object.hasOwn(aliases,key))throw new Error('Foundation 2 refuses an unrecognized storage key');
  return aliases[key];
 }
 const adapter=Object.freeze({
  getItem:key=>storage.getItem(mapped(key)),
  setItem:(key,value)=>storage.setItem(mapped(key),value),
  removeItem:key=>storage.removeItem(mapped(key))
 });
 const guard=Guard.create(adapter);
 const baseUI=()=>({name:'Friend',campus:'north',memberships:{group:fixture.group,team:fixture.team}});
 function defaults(){
  const state=AppState.initialize(()=>null,true);
  state.role=fixture.role;
  return {state,ui:baseUI()};
 }
 function status(){return guard.status();}
 function read(){
  const current=guard.status();
  if(!current.ok)return {ok:false,reason:current.reason,...defaults()};
  try{
   const saved=guard.readOriginals();
   const state=AppState.initialize(()=>saved.primaryRaw,true);
   // Permissions are chosen by the explicit synthetic scenario; never inherit a
   // membership/leader role from a different session's stored bytes.
   state.role=fixture.role;
   const parsed=saved.todayRaw?JSON.parse(saved.todayRaw):null;
   const ui=baseUI();
   if(parsed&&typeof parsed.name==='string')ui.name=parsed.name.slice(0,40);
   if(parsed&&['central','north','maui','online'].includes(parsed.campus))ui.campus=parsed.campus;
   return {ok:true,reason:null,state,ui};
  }catch(_){
   return {ok:false,reason:'Saved Foundation 2 fixture could not be loaded safely. No changes were made.',...defaults()};
  }
 }
 function save(nextState,ui){
  if(!guard.status().ok)return guard.status();
  const current=guard.readOriginals();
  // Preserve any saved UI metadata; the scenario controls permissions.
  let todayRaw=current.todayRaw;
  if(todayRaw===null)todayRaw=JSON.stringify({
   ...baseUI(),name:typeof ui?.name==='string'?ui.name.slice(0,40):'Friend',
   campus:['central','north','maui','online'].includes(ui?.campus)?ui.campus:'north'
  });
  return guard.save({primaryRaw:JSON.stringify(nextState),todayRaw});
 }
 function updateProfile(profile,{undo=false}={}){
  if(!guard.status().ok)return guard.status();
  const raw=guard.readOriginals(),before=read().ui;
  let metadata;try{metadata=raw.todayRaw?JSON.parse(raw.todayRaw):{};}catch{return {ok:false,reason:'Malformed profile preserved'};}
  if(metadata.name!==undefined&&typeof metadata.name!=='string'||metadata.campus!==undefined&&!['north','central','maui','online'].includes(metadata.campus))return {ok:false,reason:'Malformed saved profile preserved; manual review required'};
  const next=undo?metadata.previousProfile:profile;
  if(!next||typeof next.name!=='string'||next.name.trim().length>(undo?40:24)||!['north','central','maui','online'].includes(next.campus))return {ok:false,reason:'Invalid local profile'};
  const value={...metadata,name:next.name.trim()||'Friend',campus:next.campus,
   previousProfile:{name:before.name,campus:before.campus},onboarding:{version:2,completed:true,connection:'foundation-local-demo'}};
  return guard.save({primaryRaw:raw.primaryRaw,todayRaw:JSON.stringify(value)});
 }
 return Object.freeze({read,save,status,updateProfile,scenario,namespace:prefix});
}
return Object.freeze({create,scenarios});
});