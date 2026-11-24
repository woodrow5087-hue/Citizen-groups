'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createLocalPilot}=require('../pilot/s11e-local-review.cjs');
const fs=require('node:fs');
async function lab(t,opts={}){
 const app=createLocalPilot(opts);const url=await app.start();t.after(()=>app.close());
 async function get(cookie){const r=await fetch(url+'/',{headers:cookie?{cookie}:{}});const html=await r.text();return {r,html,cookie:cookie||r.headers.get('set-cookie')?.split(';')[0],csrf:html.match(/name="csrf" value="([^"]+)"/)?.[1]};}
 async function post(page,action,extra={}){return fetch(url+'/action',{method:'POST',redirect:'manual',headers:{cookie:page.cookie,origin:url,'content-type':'application/x-www-form-urlencoded',...extra},body:new URLSearchParams({csrf:page.csrf,action})});}
 return {url,get,post};
}
test('11E.2 loopback lab uses no-store and restrictive headers; no live auth or protected content before consent',async t=>{
 const h=await lab(t),p=await h.get();assert.match(h.url,/^http:\/\/127\.0\.0\.1:/);
 assert.equal(p.r.status,200);assert.match(p.r.headers.get('cache-control'),/no-store/);
 assert.match(p.r.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
 assert.match(p.r.headers.get('content-security-policy'),/default-src 'none'/);
 assert.match(p.html,/FICTIONAL REVIEW/);assert.doesNotMatch(p.html,/Wednesday Group|Sunday Group|sessionToken/);
 assert.ok(p.csrf);assert.equal((await fetch(h.url+'/pilot/s11a-synthetic-auth.cjs')).status,404);
});
test('11E.3 explicit opt-in executes existing chain, outage/empty distinguished, switch clears old view',async t=>{
 const h=await lab(t);let p=await h.get();assert.equal((await h.post(p,'consent-alpha')).status,303);
 p=await h.get(p.cookie);assert.match(p.html,/Wednesday Group/);assert.doesNotMatch(p.html,/Sunday Group|sessionToken|person-alpha/);
 await h.post(p,'outage');p=await h.get(p.cookie);assert.match(p.html,/Information temporarily unavailable/);assert.doesNotMatch(p.html,/Wednesday Group|No upcoming gathering/);
 await h.post(p,'empty');p=await h.get(p.cookie);assert.match(p.html,/No upcoming gathering in this verified sample/);
 await h.post(p,'normal');p=await h.get(p.cookie);assert.match(p.html,/Wednesday gathering/);
 await h.post(p,'consent-beta');p=await h.get(p.cookie);assert.match(p.html,/Sunday Group/);assert.doesNotMatch(p.html,/Wednesday Group/);
 await h.post(p,'withdraw');p=await h.get(p.cookie);assert.doesNotMatch(p.html,/Sunday Group|Wednesday Group/);assert.match(p.html,/Choose to participate/);
});
test('11E.4 shutdown and reset require fresh opt-in, browser lab instances isolated',async t=>{
 const h=await lab(t);let a=await h.get(),b=await h.get();
 await h.post(a,'consent-alpha');await h.post(b,'consent-beta');a=await h.get(a.cookie);b=await h.get(b.cookie);
 assert.match(a.html,/Wednesday Group/);assert.match(b.html,/Sunday Group/);
 await h.post(a,'shutdown');a=await h.get(a.cookie);assert.match(a.html,/Review paused/);assert.doesNotMatch(a.html,/Wednesday Group/);
 assert.equal((await h.post(a,'consent-alpha')).status,409);
 await h.post(a,'restart');a=await h.get(a.cookie);assert.match(a.html,/Choose to participate/);assert.doesNotMatch(a.html,/Wednesday Group/);
 assert.match((await h.get(b.cookie)).html,/Sunday Group/);
});
test('11E.4 rejects wrong origin/CSRF/cookie, unknown action and remote host',async t=>{
 const h=await lab(t),p=await h.get(),b=await h.get();
 assert.equal((await h.post(p,'consent-alpha',{origin:'https://evil.invalid'})).status,403);
 assert.equal((await h.post({...p,csrf:b.csrf},'consent-alpha')).status,403);
 assert.equal((await h.post({...p,cookie:'rally_lab=bogus'},'consent-alpha')).status,403);
 assert.equal((await h.post(p,'arbitrary')).status,409);
 assert.equal((await fetch(h.url+'/',{headers:{'x-forwarded-for':'192.0.2.1'}})).status,403);
 assert.doesNotMatch((await h.get(p.cookie)).html,/Wednesday Group/);
});
test('11E.4 bounded capacity and expiry remove local lab state',async t=>{
 let n=Date.parse('2026-11-25T12:00:00Z');const h=await lab(t,{now:()=>n,maxLabs:1}),p=await h.get();
 await h.post(p,'consent-alpha');assert.match((await h.get(p.cookie)).html,/Wednesday Group/);
 assert.equal((await h.get()).r.status,503);n+=30*60*1000;
 const q=await h.get();assert.equal(q.r.status,200);assert.doesNotMatch(q.html,/Wednesday Group/);
});
test('11E.6 no pilot files copied by static build or imported from app entry',()=>{
 const build=fs.readFileSync(require.resolve('../scripts/build.cjs'),'utf8'),index=fs.readFileSync(require.resolve('../index.html'),'utf8');
 assert.doesNotMatch(build,/s11e-local-review|s11e-pilot-view|['"]pilot['"]/);
 assert.doesNotMatch(index,/s11e-local-review|s11e-pilot-view/);
});
