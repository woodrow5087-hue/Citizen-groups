const {test}=require('node:test');
const assert=require('node:assert/strict');
const X=require('../rallypoint-group-experience.js');

function state(overrides={}){
  return {role:'member',rsvp:'',prayers:[{name:'Fictional Friend',text:'An old request'}],
    reached:[],groupMessages:[{name:'Prior Friend',time:'Yesterday',text:'Original record'}],...overrides};
}
const chat={status:'ok',unreadCount:3,lastMessage:{body:'Hello',author:'Anna L.'}};

test('F-07 overview requires membership and never mutates source fixtures',()=>{
  const s=state(),c=structuredClone(chat),before=structuredClone(s);
  assert.deepEqual(X.snapshot(s,false,chat),{visible:false});
  assert.equal(X.snapshot(s,true,chat).unreadCount,3);
  assert.deepEqual(s,before);
  assert.deepEqual(chat,c);
});

test('Unread messages take precedence and use the canonical read projection only',()=>{
  const x=X.snapshot(state(),true,chat);
  assert.equal(x.messageLabel,'3 unread');
  assert.equal(x.focus.pane,'chat');
  assert.match(x.focus.title,/3 messages/);
  const withoutUnread=X.snapshot(state(),true,{...chat,unreadCount:0});
  assert.equal(withoutUnread.messageLabel,'Conversation caught up');
  assert.equal(withoutUnread.focus.pane,'gather');
  assert.match(withoutUnread.focus.title,/Wednesday/);
});

test('RSVP, prayer count and leader check-ins derive from existing saved state',()=>{
  const s=state({rsvp:'going',prayers:[{},{}]});
  const x=X.snapshot(s,true,{status:'ok',unreadCount:0});
  assert.equal(x.rsvpLabel,'Going · saved locally');
  assert.equal(x.prayerCount,2);
  assert.equal(x.focus.pane,'people');
  assert.equal(X.snapshot(state({rsvp:'maybe'}),true,{status:'ok',unreadCount:0}).rsvpLabel,
    'Maybe · saved locally');
  assert.equal(X.snapshot(state({role:'leader',rsvp:'going'}),true,{status:'ok',unreadCount:0}).focus.pane,'leader');
  assert.equal(X.snapshot(state({role:'leader',rsvp:'going',reached:['marcus','taylor']}),true,
    {status:'ok',unreadCount:0}).focus.pane,'people');
});

test('Corrupt or missing modern data is explicitly unavailable and never falsely all-read',()=>{
  for(const data of [null,undefined,{status:'unavailable',unreadCount:5},{status:'ok',unreadCount:'3'}]){
    const x=X.snapshot(state({rsvp:'going'}),true,data);
    if(data?.status==='ok'){
      assert.equal(x.unreadCount,0);
    }else{
      assert.equal(x.status,'unavailable');
      assert.equal(x.focus.pane,'chat');
      assert.equal(x.messageLabel,'Preview unavailable');
    }
  }
});

test('Unexpected or missing legacy arrays do not affect the modern thread count',()=>{
  const x=X.snapshot(state({groupMessages:null,prayers:null}),true,chat);
  assert.equal(x.prayerCount,0);
  assert.equal(x.messageLabel,'3 unread');
});
