import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://qa.local').pathname);
 const file=path.resolve(root,'dist','.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}
 catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/?skipWelcome=1';
const launch={};
if(process.env.BROWSER_PATH)launch.executablePath=process.env.BROWSER_PATH;
else if(fs.existsSync('/usr/bin/chromium'))launch.executablePath='/usr/bin/chromium';
const browser=await chromium.launch(launch);
const P='rallypoint-phase1-2026',U='rallypoint-today-ui-v1',J='rallypoint-write-journal-v1';
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage();
 const initial={groupMessages:[
     {name:'Jess W.',time:'Yesterday',text:'Archived original'},
     {name:'Anna L.',time:'Today',text:'Do not discard my conversation'}],
   memoryGames:{'sermon:solo':{slots:[2,1],solved:false}},customPreference:{key:'untouched'},
   directMessages:{marcus:[{name:'You',time:'Today',text:'Keep the DM'}]},prayers:[],
   role:'member',view:'group',groupPane:'chat'};
 const ui={name:'Fictional QA',memberships:{group:true,team:true},seenGroupSignature:''};
 await page.addInitScript(([p,u,raw,rawUi])=>{
   if(sessionStorage.getItem('__qa_loaded')===null){
     localStorage.setItem(p,raw);localStorage.setItem(u,rawUi);sessionStorage.setItem('__qa_loaded','1');
   }
 },[P,U,JSON.stringify(initial),JSON.stringify(ui)]);
 await page.goto(base);
 await page.locator('#nav [data-go="group"]').click();
 assert.ok((await page.locator('.group-conversation').textContent()).includes('Archived original'));
 assert.ok((await page.locator('.group-conversation').textContent()).includes('Do not discard my conversation'));
 await page.locator('#group-input').fill('Protected next message');
 await page.locator('[data-action="send"][data-value="group"]').click();
 const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),P);
 assert.equal(saved.groupMessages.length,3);
 assert.equal(saved.groupMessages[0].text,'Archived original');
 assert.equal(saved.groupMessages.at(-1).text,'Protected next message');
 assert.equal(saved.customPreference.key,'untouched');
 assert.equal(saved.directMessages.marcus[0].text,'Keep the DM');
 assert.equal(await page.evaluate(k=>localStorage.getItem(k),J),null,'no hanging journal after save');
 await page.reload();
 assert.ok((await page.locator('#view').textContent()).includes('Protected next message'));
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),P);
 assert.equal(after.groupMessages.length,3);
 await context.close();

 // Malformed existing JSON: the app may display defaults, but must never erase the original bytes.
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const corrupt=await c.newPage();
 const broken='{"groupMessages":[oops]';
 await corrupt.addInitScript(([key,raw])=>localStorage.setItem(key,raw),[P,broken]);
 await corrupt.goto(base);
 assert.ok((await corrupt.locator('#view').textContent()).includes('Saved data needs recovery'));
 assert.equal(await corrupt.evaluate(key=>localStorage.getItem(key),P),broken);
 await corrupt.locator('#nav [data-go="group"]').click();
 assert.equal(await corrupt.evaluate(key=>localStorage.getItem(key),P),broken,'navigation did not overwrite damaged state');
 await c.close();

 // Interrupted journal: require explicit recovery and never silently overwrite.
 const pending=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const pendingPage=await pending.newPage();
 const older=JSON.stringify({groupMessages:[{name:'Saved',time:'Yesterday',text:'Keep me'}]});
 const newer=JSON.stringify({groupMessages:[{name:'New',time:'Today',text:'Incomplete write'}]});
 await pendingPage.addInitScript(([p,u,j,oldRaw,newRaw])=>{
   localStorage.setItem(p,newRaw);
   localStorage.setItem(j,JSON.stringify({version:1,
     before:{primaryRaw:oldRaw,todayRaw:null},after:{primaryRaw:newRaw,todayRaw:'{}'}}));
 },[P,U,J,older,newer]);
 await pendingPage.goto(base);
 assert.ok((await pendingPage.locator('#view').textContent()).includes('interrupted save'));
 assert.equal(await pendingPage.evaluate(k=>localStorage.getItem(k),P),newer);
 assert.ok(await pendingPage.evaluate(k=>localStorage.getItem(k)!==null,J));
 await pending.close();
 console.log('F-08 live browser safety passed: persisted legacy messages, protected corrupt JSON, interrupted-write gate.');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
