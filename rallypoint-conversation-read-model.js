/* F-06 read model: Today and Groups inspect the SAME fictional v1 conversation.
 * This never reads, converts, deletes, or assigns timestamps to legacy groupMessages.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RallyConversationRead=api;
})(typeof window==='object'?window:globalThis,()=>{
'use strict';
const STORAGE_KEY='rallypoint-wednesday-chat-lab-v1';
const CONVERSATION='group_wednesday',SELF='u_you',ORGANIZATION='citizen_demo';
const users=[
  {id:'u_you',organizationId:ORGANIZATION,displayName:'You'},
  {id:'u_jess',organizationId:ORGANIZATION,displayName:'Jess W.'},
  {id:'u_anna',organizationId:ORGANIZATION,displayName:'Anna L.'},
  {id:'u_marcus',organizationId:ORGANIZATION,displayName:'Marcus C.'},
  {id:'u_taylor',organizationId:ORGANIZATION,displayName:'Taylor D.'}
];
function fixture(domain){
  const snapshot=domain.emptyConversationSnapshot();
  snapshot.users=structuredClone(users);
  snapshot.conversations=[{id:CONVERSATION,organizationId:ORGANIZATION,kind:'group',
    title:'Wednesday Group',createdAt:'2026-11-18T18:30:00.000Z'}];
  snapshot.memberships=users.map((person,index)=>({
    id:'member_'+person.id,conversationId:CONVERSATION,userId:person.id,
    role:index===1?'leader':'member',status:'active'
  }));
  snapshot.messages=[
    {id:'seed_jess',conversationId:CONVERSATION,authorId:'u_jess',
      body:'This week we’re reading John 15:12. What’s one practical way we can love one another?',
      createdAt:'2026-11-18T18:30:00.000Z',deliveryStatus:'sent',replyToMessageId:null},
    {id:'seed_anna',conversationId:CONVERSATION,authorId:'u_anna',
      body:'I keep thinking it can be as simple as checking in on someone who’s had a hard week.',
      createdAt:'2026-11-18T18:33:00.000Z',deliveryStatus:'sent',replyToMessageId:'seed_jess'},
    {id:'seed_marcus',conversationId:CONVERSATION,authorId:'u_marcus',
      body:'That means a lot. Really grateful for you all.',
      createdAt:'2026-11-20T15:12:00.000Z',deliveryStatus:'sent',replyToMessageId:null},
    {id:'seed_you',conversationId:CONVERSATION,authorId:SELF,
      body:'Love that. Looking forward to seeing everyone Wednesday!',
      createdAt:'2026-11-20T16:21:00.000Z',deliveryStatus:'sent',replyToMessageId:'seed_anna'}
  ];
  snapshot.reactions=[
    {id:'seed_react',messageId:'seed_marcus',userId:'u_jess',emoji:'❤️',
      createdAt:'2026-11-20T15:13:00.000Z'}
  ];
  return snapshot;
}
function readSaved(storage,domain){
  const raw=storage.getItem(STORAGE_KEY);
  if(raw===null)return null;
  const parsed=JSON.parse(raw);
  if(parsed?.schemaVersion!==1||!parsed.snapshot||typeof parsed.draft!=='string'||
    parsed.draft.length>700||
    !(parsed.replyTo===null||typeof parsed.replyTo==='string'))
    throw Error('Unsupported local conversation version');
  domain.assertConversationSnapshot(parsed.snapshot);
  if(!parsed.snapshot.conversations.some(c=>c.id===CONVERSATION&&c.organizationId===ORGANIZATION)||
    !parsed.snapshot.memberships.some(m=>m.userId===SELF&&m.conversationId===CONVERSATION&&m.status==='active'))
    throw Error('Missing local demo thread or active membership');
  return parsed;
}
function openRepository(storage,domain){
  if(!domain||typeof domain.createMockConversationRepository!=='function')
    throw Error('Conversation adapter unavailable');
  const saved=readSaved(storage,domain);
  return {saved,repository:domain.createMockConversationRepository({seed:saved?.snapshot||fixture(domain)})};
}
const unavailable=status=>({status,lastMessage:null,unreadCount:0});
function peek({storage,domain,member=true}={}){
  if(!member)return unavailable('no-access');
  try{
    const {repository}=openRepository(storage,domain);
    const sent=repository.listMessages({conversationId:CONVERSATION,userId:SELF})
      .filter(message=>message.deliveryStatus==='sent');
    const last=sent.at(-1)||null;
    const people=repository.getSnapshot().users;
    const author=last?people.find(person=>person.id===last.authorId)?.displayName||'Fictional member':null;
    return {status:'ok',
      lastMessage:last?{id:last.id,author,authorId:last.authorId,body:last.body,createdAt:last.createdAt}:null,
      unreadCount:repository.getUnreadCount({conversationId:CONVERSATION,userId:SELF})};
  }catch(_){
    // Malformed or blocked modern storage is not interpreted as an empty/read conversation.
    return unavailable('unavailable');
  }
}
function markRead({storage,domain,member=true}={}){
  if(!member)return false;
  try{
    const {saved,repository}=openRepository(storage,domain);
    const sent=repository.listMessages({conversationId:CONVERSATION,userId:SELF})
      .filter(message=>message.deliveryStatus==='sent');
    if(sent.length)repository.markRead({conversationId:CONVERSATION,userId:SELF,messageId:sent.at(-1).id});
    storage.setItem(STORAGE_KEY,JSON.stringify({
      schemaVersion:1,snapshot:repository.getSnapshot(),
      draft:saved?.draft||'',replyTo:saved?.replyTo||null
    }));
    return true;
  }catch(_){return false;}
}
// Application access boundary: evaluate the storage property INSIDE the guard,
// and resolve current membership on every call (scenario overlays can change it).
// The versioned conversation adapter remains the only owner of this cursor.
function createAccess({getStorage,domain,isMember}={}){
  const access=operation=>{
    try{
      if(isMember()!==true)return operation==='peek'?unavailable('no-access'):false;
      return (operation==='peek'?peek:markRead)({storage:getStorage(),domain,member:true});
    }catch(_){return operation==='peek'?unavailable('unavailable'):false;}
  };
  return Object.freeze({peek:()=>access('peek'),markRead:()=>access('markRead')});
}
return Object.freeze({STORAGE_KEY,CONVERSATION,SELF,fixture,readSaved,peek,markRead,createAccess});
});
