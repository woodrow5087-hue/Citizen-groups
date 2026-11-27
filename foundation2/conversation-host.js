/* Foundation's host port for the accepted premium Connect presentation.
 * The guarded primary record owns DM/Room histories and their drafts. The
 * existing group repository owns group data; this module never migrates keys.
 * All messages and recipient IDs here are local demonstration fixtures.
 */
(function(root,factory){
 'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationConversationHost=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const ids=Object.freeze({Jess:'jess',Anna:'anna','Alex Morgan':'connect-alex','Marcus C.':'marcus','Taylor D.':'taylor'});
const knownIds=Object.freeze(Object.values(ids));
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.length<=700;
function validate(state){
 if(!object(state))throw Error('Saved messaging state unavailable');
 if(state.directMessages!==undefined&&(!object(state.directMessages)||Object.entries(state.directMessages).some(([id,rows])=>
  !knownIds.includes(id)||!Array.isArray(rows)||rows.some(row=>!object(row)||!text(row.text)||typeof row.name!=='string'||typeof row.time!=='string'))))throw Error('Saved direct messages need review');
 const room=state.connectRoom;
 if(room!==undefined&&(!object(room)||(room.messages!==undefined&&(!Array.isArray(room.messages)||room.messages.some(m=>!text(m))))||(room.rsvp!==undefined&&typeof room.rsvp!=='boolean')))throw Error('Saved Room state needs review');
 const drafts=state.connectDrafts;
 if(drafts!==undefined&&(!object(drafts)||drafts.version!==1||!object(drafts.direct)||!text(drafts.room)||Object.entries(drafts.direct).some(([id,value])=>!knownIds.includes(id)||!text(value))))throw Error('Saved messaging drafts need review');
 return state;
}
function create({getState,getSession,save,isCurrent,conversation,storage,Read,Domain,markPrayer}={}){
 if([getState,getSession,save,isCurrent].some(f=>typeof f!=='function'))throw new TypeError('Conversation host requires current state, session and guarded save owners');
 function current(){
  if(isCurrent()!==true)throw Error('Conversation context changed');
  return {state:validate(getState()),session:getSession()};
 }
 function status(){try{current();return {ok:true,reason:null};}catch(error){return {ok:false,reason:error.message};}}
 function access(){
  try{const p=current().session.snapshot.context.permissions;return {group:p.group===true,team:p.team===true};}
  catch{return {group:false,team:false};}
 }
 function allowed(screen,name){const p=access();return screen==='room'?p.team:screen==='direct'&&Object.hasOwn(ids,name)&&p.group;}
 function messages(name){
  if(!allowed('direct',name))return [];
  try{return (current().state.directMessages?.[ids[name]]||[]).map(row=>({...row}));}catch{return [];}
 }
 function room(){
  if(!access().team)return {};
  try{const value=current().state.connectRoom||{};return {...value,messages:[...(value.messages||[])]};}catch{return {};}
 }
 function draft(screen,name){
  if(!allowed(screen,name))return '';
  try{const d=current().state.connectDrafts;return screen==='room'?d?.room||'':d?.direct[ids[name]]||'';}catch{return '';}
 }
 function drafts(state){return state.connectDrafts?{...state.connectDrafts,direct:{...state.connectDrafts.direct}}:{version:1,direct:{},room:''};}
 function commit(next){try{validate(next);return save(next)?.ok===true;}catch{return false;}}
 function saveDraft(screen,name,value){
  if(!text(value)||!allowed(screen,name))return false;
  try{const {state}=current(),d=drafts(state);if(screen==='room')d.room=value;else d.direct[ids[name]]=value;
   return commit({...state,connectDrafts:d});
  }catch{return false;}
 }
 function praying(){try{return access().group&&current().session.snapshot.care?.prayed===true;}catch{return false;}}
 function write(kind,value,name){
  try{
   const {state,session}=current(),p=access();
   if(kind==='prayer'){
    if(!p.group||value!==true||!session.snapshot.care)return false;
    if(praying())return true;
    if(session.snapshot.care.stage!=='ready'||typeof markPrayer!=='function')return false;
    return markPrayer()?.ok===true;
   }
   if(kind==='rsvp'){
    if(!p.team||typeof value!=='boolean')return false;
    return commit({...state,connectRoom:{...(state.connectRoom||{}),rsvp:value}});
   }
   if(!text(value)||!value.trim()||!allowed(kind,name))return false;
   const d=drafts(state);
   if(kind==='room'){
    d.room='';return commit({...state,connectRoom:{...(state.connectRoom||{}),messages:[...(state.connectRoom?.messages||[]),value]},connectDrafts:d});
   }
   d.direct[ids[name]]='';return commit({...state,directMessages:{...(state.directMessages||{}),[ids[name]]:[...(state.directMessages?.[ids[name]]||[]),{name:'You',time:'Just now',text:value}]},connectDrafts:d});
  }catch{return false;}
 }
 function metadata(){
  try{const {session}=current(),p=access(),snapshot=session.snapshot;
   return {name:snapshot.context.identity.name||'Friend',groupName:p.group?'Wednesday Group':null,
    teamName:p.team?'Welcome Team':null,teamLocation:p.team?snapshot.model.serveLocation||'North Campus':null,
    care:p.group&&snapshot.care?{...snapshot.care}:null};
  }catch{return {name:'Friend',groupName:null,teamName:null,teamLocation:null,care:null};}
 }
 function followup(value){
  try{const {state,session}=current(),care=session.snapshot.care;if(!access().group||!care||care.paused||care.completed||!text(value)||!value.trim())return false;
   const d=drafts(state);d.direct.marcus='';const flags={...state.companionCare?.marcus,completedAt:new Date().toISOString()};delete flags.snoozedUntil;
   return commit({...state,directMessages:{...state.directMessages,marcus:[...(state.directMessages?.marcus||[]),{name:'You',time:'Just now',text:value}]},connectDrafts:d,companionCare:{...state.companionCare,marcus:flags}});
  }catch{return false;}
 }
 return Object.freeze({followup,access,messages,room,praying,write,draft,saveDraft,metadata,status,
  conversation:typeof conversation==='function'?conversation:()=>({status:'unavailable',unreadCount:null}),
  storage,readModel:Read,domain:Domain});
}
return Object.freeze({create,ids});
});
