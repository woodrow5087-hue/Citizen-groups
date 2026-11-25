// Immutable owner-approved Connect source. No masks, tolerances or image baselines.
// Reuse every existing standalone/profile behavioral assertion on both builds.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {readFile,readdir,stat,mkdir,rm,writeFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import visual from '../test/helpers/ux03-visual.cjs';
import {compareScreenshots} from '../verseplay/tests/visual-comparison.mjs';
const approved=process.argv[2];assert.ok(approved,'Usage: node scripts/ux03-visual-regression.mjs <owner-approved-connect-dist> [candidate-dist]');
const candidate=process.argv[3]||'dist',out=resolve('test-results/ux03-visual');
const report={reference:visual.reference.source,engine:visual.reference.engine,protectedFiles:0,comparisons:[],errors:[]};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.jpg':'image/jpeg'};
async function serve(directory){
 const root=resolve(directory),server=createServer(async(req,res)=>{
  try{const name=decodeURIComponent(new URL(req.url,'http://local').pathname);let file=resolve(root,'.'+name);assert.ok(file===root||file.startsWith(root+sep));if((await stat(file)).isDirectory())file=resolve(file,'index.html');res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));return {server,url:'http://127.0.0.1:'+server.address().port+'/'};
}
async function run(script,url,directory){
 // Clear generated evidence only: stale frames must never satisfy the inventory gate.
 await rm(directory,{recursive:true,force:true});await mkdir(directory,{recursive:true});
 const env={...process.env,UX03_OUTPUT_DIR:directory,UX03_VISUAL_CAPTURE:'1'};delete env.UX03_HISTORICAL;delete env.BROWSER_PATH;
 await new Promise((resolveRun,reject)=>{const child=spawn(process.execPath,[script,url],{env,stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?resolveRun():reject(Error(script+' failed with exit '+code)));});
}
await mkdir(out,{recursive:true});const servers=[];
try{
 for(const file of Object.keys(visual.reference.files)){visual.protectSource(file,await readFile(resolve(approved,file)),await readFile(resolve(candidate,file)));report.protectedFiles++;}
 for(const [kind,root] of [['reference',approved],['candidate',candidate]]){
  const server=await serve(root);servers.push(server);
  for(const [scope,script] of [['standalone','scripts/ux03-browser-check.mjs'],['embedded','scripts/ux03-profile-review.mjs']]){
   const directory=resolve(out,kind,scope);await run(script,server.url,directory);
   const inventory=(await readdir(directory)).filter(f=>f.endsWith('.png')).sort();assert.deepEqual(inventory,visual.expectedCaptures(scope),'Missing or unexpected '+kind+' '+scope+' captures');
   if(kind==='candidate')for(const file of inventory){const result=compareScreenshots(await readFile(resolve(out,'reference',scope,file)),await readFile(resolve(directory,file)));report.comparisons.push({scope,file,...result});visual.assertPair(result,scope+'/'+file);}
  }
 }
 assert.equal(report.comparisons.length,86);console.log(JSON.stringify({reference:report.reference,engine:report.engine,protectedFiles:report.protectedFiles,pairs:report.comparisons.length,rawDifferentPixels:report.comparisons.reduce((n,c)=>n+c.rawDifferentPixels,0),errors:report.errors}));
}catch(error){report.errors.push(error.stack);throw error;}
finally{await writeFile(resolve(out,'results.json'),JSON.stringify(report,null,2));for(const {server} of servers)await new Promise(r=>server.close(r));}
