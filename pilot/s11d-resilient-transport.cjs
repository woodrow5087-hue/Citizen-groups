'use strict';
// Synthetic transport guard. No network client or persistent queue. Scope is
// per process/tenant composition. Count actual unsettled transport promises,
// including dependencies that ignore abort; never release capacity early.
const freeze=Object.freeze;
const transient=new Set([502,503,504,429]);
function createResilientTransport({transport,now=Date.now,maxConcurrent=8,maxPerWindow=120,
 windowMs=60000,maxAttempts=2,baseDelayMs=20,maxRetryAfterMs=250}={}){
 if(typeof transport!=='function'||typeof now!=='function'||
 ![maxConcurrent,maxPerWindow,windowMs,maxAttempts,baseDelayMs,maxRetryAfterMs].every(n=>Number.isSafeInteger(n)&&n>0)||
 maxConcurrent>64||maxPerWindow>10000||windowMs>60000||maxAttempts>3||baseDelayMs>1000||maxRetryAfterMs>5000)
 throw TypeError('Invalid resilience settings');
 let active=0,count=0,start=null;
 const fail=()=>freeze({status:503});
 function take(){
  const t=now();if(!Number.isSafeInteger(t)||t<0)return false;
  if(start===null||t-start>=windowMs){start=t;count=0;}
  if(t<start||active>=maxConcurrent||count>=maxPerWindow)return false;
  count++;active++;return true;
 }
 function delay(ms,signal){
  return new Promise(resolve=>{
   let timer;
   const finish=ok=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);resolve(ok);};
   const abort=()=>finish(false);
   if(signal?.aborted)return finish(false);
   signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>finish(true),ms);
  });
 }
 async function request(req){
  if(!req||req.method!=='GET'||req.signal?.aborted)return fail();
  for(let attempt=1;attempt<=maxAttempts;attempt++){
   if(req.signal?.aborted||!take())return fail();
   // Do not retry transport exceptions, timeouts or permission errors. Only
   // explicit transient statuses on an idempotent read can be retried.
   let response;
   try{response=await transport(req);}catch{return fail();}
   finally{active--;}
   if(req.signal?.aborted)return fail();
   if(!transient.has(response?.status)||attempt===maxAttempts)return response;
   const backoff=baseDelayMs*attempt;
   // A 429 without a valid bounded synthetic retry hint is not retried.
   // Live Retry-After HTTP parsing is not implemented.
   const hint=response.retryAfterMs;
   if(response.status===429&&(!Number.isSafeInteger(hint)||hint<0||hint>maxRetryAfterMs))return response;
   if(hint!==undefined&&(!Number.isSafeInteger(hint)||hint<0||hint>maxRetryAfterMs))return response;
   if(!await delay(Math.max(backoff,hint||0),req.signal))return fail();
  }
  return fail();
 }
 return freeze({request});
}
module.exports={createResilientTransport};
