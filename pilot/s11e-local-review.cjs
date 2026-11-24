'use strict';
// Loopback-only fictional review lab. Never deploy this fake sign-in flow.
// No network client, real accounts, personal inputs, external assets or storage.
const http=require('node:http');
const {randomBytes,timingSafeEqual}=require('node:crypto');
const {createSyntheticPrivacyPilot,POLICY}=require('./s11c-synthetic-privacy.cjs');
const {render}=require('./s11e-pilot-view.cjs');
const issuer='https://issuer.example.invalid/',organizationId='synthetic-org',audience='synthetic-review',redirectUri='https://rally.example.invalid/callback';
const token=()=>randomBytes(32).toString('base64url');
const opaque=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{43}$/.test(x);
const same=(a,b)=>opaque(a)&&opaque(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const identity=subject=>({issuer,subject,organizationId});
const profiles=Object.freeze({alpha:Object.freeze({name:'Sample A',group:'Wednesday Group',event:'Wednesday gathering'}),beta:Object.freeze({name:'Sample B',group:'Sunday Group',event:'Sunday gathering'})});
const owns=(obj,key)=>Object.hasOwn(obj,key);
const rel=(type,id)=>({data:{type,id}});
const empty=state=>({state,group:null,nextGathering:null,checkedAt:null,source:null});
const ttl=30*60*1000;
function createLab(now){
 const lab={binding:token(),csrf:token(),session:null,subject:null,mode:'normal',version:0,busy:false,last:now(),stopped:false};
 lab.pilot=createSyntheticPrivacyPilot({issuer,organizationId,audience,redirectUri,now,
  lookupApprovedMapping:i=>owns(profiles,i.subject)?({...i,active:true,adult:true,personId:'person-'+i.subject,groupId:'group-'+i.subject,version:'v1',scopes:['groups:read']}):null,
  verifySyntheticCode:async r=>owns(profiles,r.code)?{issuer,audience,organizationId,subject:r.code,nonce:r.nonce,expiresAt:now()+ttl}:null,
  transport:async req=>{
   if(req.signal?.aborted||lab.mode==='outage')return {status:503};
   const subject=req.subject.slice(7),profile=profiles[subject],groupId='group-'+subject,root='/groups/v2/groups/'+groupId;
   if(!owns(profiles,subject)||req.method!=='GET'||req.organizationId!==organizationId)return {status:403};
   let body;
   if(req.path===root+'/my_membership')body={data:{type:'Membership',id:'membership-'+subject,attributes:{role:'member',joined_at:'2020-01-01T00:00:00Z'},relationships:{person:rel('Person',req.subject),group:rel('Group',groupId)}}};
   else if(req.path===root)body={data:{type:'Group',id:groupId,attributes:{name:profile.group}}};
   else if(req.path===root+'/events?filter=not_canceled&per_page=25&offset=0')body={data:lab.mode==='empty'?[]:[{type:'Event',id:'event-'+subject,attributes:{name:profile.event,starts_at:new Date(now()+86400000).toISOString(),canceled:false,canceled_at:null},relationships:{group:rel('Group',groupId)}}],links:{next:null}};
   else return {status:403};
   return {status:200,organizationId,subject:req.subject,observedAt:new Date(now()).toISOString(),body};
  },resilienceOptions:{baseDelayMs:5}});
 return lab;
}
function revoke(lab){
 lab.version++;
 if(lab.subject)lab.pilot.administration.withdrawConsent(identity(lab.subject));
 lab.pilot.member.logout(lab.binding);lab.session=null;lab.subject=null;
}
function stop(lab){revoke(lab);lab.pilot.administration.setPilotEnabled(false);lab.stopped=true;}
async function act(lab,action){
 if(lab.busy)return false;
 lab.busy=true;lab.version++;
 try{
  if(action==='shutdown'){stop(lab);return true;}
  if(action==='restart'){stop(lab);lab.pilot.administration.setPilotEnabled(true);lab.stopped=false;lab.mode='normal';return true;}
  if(lab.stopped)return false;
  if(action==='logout'||action==='withdraw'){revoke(lab);return true;}
  if(['outage','empty','normal'].includes(action)){lab.mode=action;return true;}
  if(!['consent-alpha','consent-beta'].includes(action))return false;
  revoke(lab);lab.mode='normal';
  const subject=action.slice(8);
  const accepted=lab.pilot.administration.grantConsent({identity:identity(subject),purpose:POLICY.purpose,noticeVersion:POLICY.noticeVersion,decision:'explicit-opt-in'});
  if(accepted.state!=='accepted')return false;
  const challenge=lab.pilot.member.beginLogin(lab.binding);
  if(challenge.state!=='challenge')return false;
  const session=await lab.pilot.member.completeLogin({browserBinding:lab.binding,loginState:challenge.loginState,code:subject,redirectUri});
  if(session.state!=='authenticated'){lab.pilot.administration.withdrawConsent(identity(subject));return false;}
  lab.subject=subject;lab.session=session;return true;
 }finally{lab.busy=false;}
}
async function readForm(req){
 if(req.headers['content-type']!=='application/x-www-form-urlencoded')return null;
 if(Number(req.headers['content-length'])>1024)return null;
 let n=0,body='';
 for await(const chunk of req){n+=chunk.length;if(n>1024)return null;body+=chunk.toString('utf8');}
 const form=new URLSearchParams(body);
 if([...form.keys()].length!==2||form.getAll('csrf').length!==1||form.getAll('action').length!==1)return null;
 return {csrf:form.get('csrf'),action:form.get('action')};
}
// Keep cross-origin referrers private while preserving the same-origin form
// Origin needed by the exact-origin CSRF check below. no-referrer makes it null.
const headers={'Cache-Control':'no-store, private, max-age=0','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; connect-src 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
function send(res,status,body='',extra={}){if(res.destroyed||res.writableEnded)return;res.writeHead(status,{...headers,'Content-Type':'text/html; charset=utf-8',...extra});res.end(body);}
function createLocalPilot({now=Date.now,maxLabs=8}={}){
 if(typeof now!=='function'||!Number.isSafeInteger(maxLabs)||maxLabs<1||maxLabs>8)throw TypeError('Invalid local lab settings');
 const labs=new Map();
 let origin=null;
 const server=http.createServer({maxHeaderSize:8192,requestTimeout:10000,headersTimeout:5000},async(req,res)=>{
  try{
   // No host aliases, forwarding, CORS, remote addresses or arbitrary paths.
   if(!origin||req.socket.remoteAddress!=='127.0.0.1'||req.headers.host!==new URL(origin).host||
     req.headers.forwarded||req.headers['x-forwarded-for']||req.headers['x-forwarded-host']||
     (req.headers['sec-fetch-site']&&!['same-origin','none'].includes(req.headers['sec-fetch-site'])))
    return send(res,403,'Local fictional review only.');
   const t=now();
   if(!Number.isSafeInteger(t))return send(res,503,'Review unavailable.');
   for(const [k,lab] of labs){if(t<lab.last||t-lab.last>=ttl){stop(lab);labs.delete(k);}}
   const cookies=(req.headers.cookie||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith('rally_lab='));
   const key=cookies.length===1?cookies[0].slice(10):null;
   let lab=opaque(key)?labs.get(key):null;
   if(req.method==='GET'&&req.url==='/'){
    let cookie={};
    if(!lab){
     if(labs.size>=maxLabs)return send(res,503,'Local lab capacity reached. Close the review process and restart.');
     const k=token();lab=createLab(now);labs.set(k,lab);
     cookie={'Set-Cookie':'rally_lab='+k+'; Path=/; HttpOnly; SameSite=Strict; Max-Age=1800'};
    }
    lab.last=t;
    const v=lab.version;
    let view=lab.session&&!lab.stopped&&!lab.busy?await lab.pilot.member.readMember({browserBinding:lab.binding,sessionToken:lab.session.sessionToken}):empty('restricted');
    if(v!==lab.version||lab.stopped||lab.busy)view=empty('restricted');
    return send(res,200,render({view,csrf:lab.csrf,subject:view.state==='ready'?profiles[lab.subject]?.name:null,mode:lab.mode,stopped:lab.stopped,signedIn:!!lab.session}),cookie);
   }
   if(req.method==='POST'&&req.url==='/action'){
    if(!lab||req.headers.origin!==origin)return send(res,403,'Action not permitted.');
    const form=await readForm(req);
    if(!form||!same(form.csrf,lab.csrf))return send(res,403,'Action not permitted.');
    lab.last=t;
    if(!await act(lab,form.action))return send(res,409,'Action not available. Return to the review page.');
    return send(res,303,'',{'Location':'/'});
   }
   return send(res,404,'Not found.');
  }catch{return send(res,503,'Fictional review unavailable.');}
 });
 server.maxConnections=16;
 server.keepAliveTimeout=2000;
 return Object.freeze({
  async start(port=0){if(origin||!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid local start');
   await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{server.removeListener('error',reject);resolve();});});
   origin='http://127.0.0.1:'+server.address().port;return origin;
  },
  async close(){for(const lab of labs.values())stop(lab);labs.clear();origin=null;await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});}
 });
}
if(require.main===module){
 const lab=createLocalPilot();
 lab.start(8615).then(url=>console.log('FICTIONAL LOCAL REVIEW ONLY: '+url)).catch(()=>{console.error('Unable to start loopback lab.');process.exitCode=1;});
 for(const sig of ['SIGINT','SIGTERM'])process.once(sig,()=>{lab.close().catch(()=>{process.exitCode=1;});});
}
module.exports={createLocalPilot};
