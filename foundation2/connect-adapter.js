/* Foundation 2 Connect adapter.
 * Reuses the canonical versioned RallyConversationRead fixture and F-02
 * conversation repository. This module owns only an isolated storage adapter:
 * no second message engine, original app keys, network, or live identities.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationConnect=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
function create({storage,scenario,Read,Domain,isMember}={}){
 if(!storage||!Read||!Domain||typeof isMember!=='function')throw new TypeError('Connect requires storage, canonical model, domain and membership');
 if(!/^(connected|leader|group|team|visitor|unavailable)$/.test(scenario))throw new RangeError('Unknown synthetic scenario');
 const key='rally-one-foundation2-v1:'+scenario+':conversation';
 const actor=Object.freeze({conversationId:Read.CONVERSATION,userId:Read.SELF});
 const adapter=Object.freeze({
  getItem(k){if(k!==Read.STORAGE_KEY)throw Error('Unexpected conversation key');return storage.getItem(key);},
  setItem(k,v){if(k!==Read.STORAGE_KEY)throw Error('Unexpected conversation key');storage.setItem(key,v);},
  removeItem(){throw Error('Conversation removal is not authorized');}
 });
 const permitted=()=>isMember()===true;
 const deny=(reason='no-access')=>({ok:false,reason});
 function open(){
  if(!permitted())throw Error('no-access');
  const raw=adapter.getItem(Read.STORAGE_KEY);
  // The canonical read-model validates schema, organization, membership,
  // reply references and cursor integrity before edits are allowed.
  const saved=Read.readSaved(adapter,Domain);
  const repository=Domain.createMockConversationRepository({seed:saved?.snapshot||Read.fixture(Domain)});
  return {raw,saved,repository};
 }
 function view(){
  if(!permitted())return {status:'no-access',unreadCount:0,messages:[],draft:'',replyTo:null};
  try{
   const {saved,repository}=open(),snapshot=repository.getSnapshot();
   const lookup=new Map(snapshot.users.map(person=>[person.id,person.displayName]));
   const messages=repository.listMessages(actor).map(msg=>({
    id:msg.id,author:lookup.get(msg.authorId)||'Fictional member',authorId:msg.authorId,
    body:msg.body,createdAt:msg.createdAt,status:msg.deliveryStatus,
    mine:msg.authorId===Read.SELF,replyTo:msg.replyToMessageId
   }));
   // ReadModel is authoritative for read counts: never invent "0 unread"
   // when the source is unavailable.
   const peek=Read.peek({storage:adapter,domain:Domain,member:true});
   if(peek.status!=='ok')throw Error('Conversation unavailable');
   return {status:'ok',unreadCount:peek.unreadCount,lastMessage:peek.lastMessage,messages,
    draft:saved?.draft||'',replyTo:saved?.replyTo||null};
  }catch(_){return {status:'unavailable',unreadCount:null,messages:[],draft:'',replyTo:null};}
 }
 function transaction(change){
  if(!permitted())return deny();
  try{
   const current=open(),fields={draft:current.saved?.draft||'',replyTo:current.saved?.replyTo||null};
   change(current.repository,fields);
   const candidate=JSON.stringify({schemaVersion:1,snapshot:current.repository.getSnapshot(),...fields});
   const previous=adapter.getItem(Read.STORAGE_KEY);
   if(previous!==current.raw)return deny('concurrent-change');
   if(candidate!==previous)adapter.setItem(Read.STORAGE_KEY,candidate);
   return {ok:true,reason:null};
  }catch(e){return deny(e?.message==='no-access'?'no-access':'unavailable-or-save-failed');}
 }
 function markRead(){
  return transaction(repo=>{
   const sent=repo.listMessages(actor).filter(msg=>msg.deliveryStatus==='sent');
   if(sent.length)repo.markRead({...actor,messageId:sent.at(-1).id});
  });
 }
 function saveDraft(value){
  if(typeof value!=='string'||value.length>700)return deny('invalid-draft');
  return transaction((_,fields)=>{fields.draft=value;});
 }
 function send(body){
  if(typeof body!=='string'||!body.trim()||body.length>700)return deny('invalid-message');
  return transaction((repo,fields)=>{
   const entry=repo.sendMessage({...actor,body,replyToMessageId:fields.replyTo});
   repo.setDeliveryStatus({...actor,messageId:entry.id,status:'sent'});
   fields.draft='';fields.replyTo=null;
  });
 }
 function reply(id){
  if(id!==null&&!(typeof id==='string'&&id.length>0))return deny('invalid-reply');
  return transaction((repo,fields)=>{
   if(id!==null){
    const row=repo.listMessages(actor).find(m=>m.id===id&&m.deliveryStatus==='sent');
    if(!row)throw Error('Unknown sent message');
   }
   fields.replyTo=id;
  });
 }
 // Give the unchanged premium UI a capability-limited storage port. Each
 // frame gets its own read-before-write baseline; foreign keys and removals
 // are never forwarded to browser storage. Parent views use the same owner.
 function presentationStorage(){
  let expected,read=false;
  function requireKey(k){if(k!==Read.STORAGE_KEY)throw Error('Unexpected conversation key');if(!permitted())throw Error('no-access');}
  function validateRaw(raw){
   const saved=Read.readSaved({getItem:k=>{if(k!==Read.STORAGE_KEY)throw Error('Unexpected conversation key');return raw;}},Domain);
   if(saved?.replyTo&&!saved.snapshot.messages.some(m=>m.id===saved.replyTo&&m.conversationId===Read.CONVERSATION&&m.deliveryStatus==='sent'))throw Error('Unknown saved reply');
   return saved;
  }
  return Object.freeze({
   getItem(k){requireKey(k);const raw=adapter.getItem(k);validateRaw(raw);expected=raw;read=true;return raw;},
   setItem(k,value){
    requireKey(k);if(!read||typeof value!=='string')throw Error('Conversation must be read before editing');
    validateRaw(value);
    const raw=adapter.getItem(k);validateRaw(raw);
    if(raw!==expected)throw Error('concurrent-change');
    if(value!==raw)adapter.setItem(k,value);
    expected=value;
   },
   removeItem(){throw Error('Conversation removal is not authorized');},
   clear(){throw Error('Conversation removal is not authorized');}
  });
 }
 return Object.freeze({view,markRead,saveDraft,send,reply,presentationStorage,namespace:key});
}
return Object.freeze({create});
});