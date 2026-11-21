/* F-12: compare a proposed build against the immutable approved v0.8 screens.
 * Run after builds exist at dist/ and .release-baseline/dist/.
 * Results + before/after/diff screenshots are retained as review artifacts.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root=process.cwd(), output=path.join(root,'test-results','f12-visual');
const baseline=path.join(root,'.release-baseline','dist'),candidate=path.join(root,'dist');
const MAX_PERCENT=0.25;
const cases=[
  ['welcome-mobile',390,844,'welcome'],
  ['today-mobile',390,844,'today'],
  ['groups-mobile',390,844,'groups'],
  ['team-mobile',390,844,'team'],
  ['read-mobile',390,844,'read'],
  ['verseplay-mobile',390,844,'play'],
  ['leader-mobile',390,844,'leader'],
  ['today-desktop',1280,1020,'today']
];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};

function serve(folder){
  return http.createServer((req,res)=>{
    try{
      const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
      const file=path.resolve(folder,'.'+(pathname==='/'?'/index.html':pathname));
      if(!file.startsWith(folder+path.sep)){res.writeHead(403).end();return;}
      if(!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
      res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
      res.setHeader('Cache-Control','no-store');
      res.end(fs.readFileSync(file));
    }catch{res.writeHead(404).end();}
  });
}
async function listen(server){
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return 'http://127.0.0.1:'+server.address().port;
}
async function capture(browser,base,spec){
  const [id,width,height,view]=spec;
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce',locale:'en-US',timezoneId:'America/Denver'});
  try{
    await context.addInitScript(()=>{
      const RealDate=Date,when=new RealDate('2026-11-20T18:00:00-07:00').getTime();
      class FixedDate extends RealDate{
        constructor(...args){super(...(args.length?args:[when]));}
        static now(){return when;}
      }
      window.Date=FixedDate;
    });
    const page=await context.newPage();
    await page.goto(base+(view==='welcome'?'/?welcome=1':'/?skipWelcome=1'),{waitUntil:'networkidle'});
    if(view==='welcome'){
      await page.waitForFunction(()=>document.querySelector('#rp-gateway')?.dataset.screen==='welcome');
    }else{
      await page.locator('#view').waitFor({state:'visible'});
      if(!['today'].includes(view)){
        const section=(view==='groups'||view==='leader')?'group':view==='play'?'read':view;
        await page.locator('#nav [data-go="'+section+'"]').click();
      }
      if(view==='play')await page.locator('.rp-game-entry-play').click();
      if(view==='leader'){
        await page.locator('.profile-avatar').click();
        await page.locator('#role').click();
        await page.locator('[data-action="close-dialog"]').click();
        await page.locator('[data-area="group"][data-value="leader"]').click();
      }
    }
    await page.evaluate(()=>document.fonts.ready);
    return await page.screenshot({animations:'disabled',caret:'hide',fullPage:false});
  }finally{await context.close();}
}
async function compare(browser,one,two){
  const page=await browser.newPage();
  try{
    return await page.evaluate(async(values)=>{
      const image=s=>new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src='data:image/png;base64,'+s;});
      const [a,b]=await Promise.all(values.map(image));
      if(a.width!==b.width||a.height!==b.height)return {percent:100,pixels:-1,total:b.width*b.height,sameSize:false,diff:null};
      const canvas=document.createElement('canvas');canvas.width=a.width;canvas.height=a.height;
      const c=canvas.getContext('2d',{willReadFrequently:true});
      c.drawImage(a,0,0);const before=c.getImageData(0,0,a.width,a.height).data;
      c.clearRect(0,0,a.width,a.height);c.drawImage(b,0,0);const after=c.getImageData(0,0,a.width,a.height).data;
      const imageData=c.createImageData(a.width,a.height);
      let changed=0;
      for(let i=0;i<before.length;i+=4){
        const delta=Math.max(Math.abs(before[i]-after[i]),Math.abs(before[i+1]-after[i+1]),Math.abs(before[i+2]-after[i+2]));
        const diff=delta>24;if(diff)changed++;
        imageData.data[i]=diff?255:after[i]*0.65;
        imageData.data[i+1]=diff?0:after[i+1]*0.65;
        imageData.data[i+2]=diff?95:after[i+2]*0.65;
        imageData.data[i+3]=255;
      }
      c.putImageData(imageData,0,0);
      return {percent:100*changed/(a.width*a.height),pixels:changed,total:a.width*a.height,sameSize:true,diff:canvas.toDataURL('image/png').split(',')[1]};
    },[one.toString('base64'),two.toString('base64')]);
  }finally{await page.close();}
}
if(!fs.existsSync(path.join(baseline,'index.html'))||!fs.existsSync(path.join(candidate,'index.html')))throw Error('Missing baseline or candidate dist/index.html. Build both versions first.');
fs.mkdirSync(output,{recursive:true});
const baselineServer=serve(baseline),candidateServer=serve(candidate);
let browser;
try{
  const [beforeURL,afterURL]=await Promise.all([listen(baselineServer),listen(candidateServer)]);
  browser=await chromium.launch();
  const reports=[];
  for(const spec of cases){
    const [one,two]=await Promise.all([capture(browser,beforeURL,spec),capture(browser,afterURL,spec)]);
    fs.writeFileSync(path.join(output,spec[0]+'-approved.png'),one);
    fs.writeFileSync(path.join(output,spec[0]+'-candidate.png'),two);
    const result=await compare(browser,one,two);
    if(result.diff)fs.writeFileSync(path.join(output,spec[0]+'-diff.png'),Buffer.from(result.diff,'base64'));
    const ok=result.sameSize&&result.percent<=MAX_PERCENT;
    reports.push({screen:spec[0],percent:result.percent,pixels:result.pixels,total:result.total,passed:ok});
    console.log(spec[0]+': '+result.percent.toFixed(3)+'% changed — '+(ok?'PASS':'REVIEW REQUIRED'));
  }
  const failed=reports.filter(x=>!x.passed);
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({approvedCommit:'84e489b86851e853948a7d4246475e83b7ddd085',thresholdPercent:MAX_PERCENT,passed:!failed.length,reports},null,2)+'\n');
  fs.writeFileSync(path.join(output,'report.md'),'# Rally Point v0.8 visual regression\n\n| Screen | Changed pixels | Result |\n|---|---:|---|\n'+reports.map(x=>'| '+x.screen+' | '+x.percent.toFixed(3)+'% | '+(x.passed?'PASS':'REVIEW REQUIRED')+' |').join('\n')+'\n\nBaseline commit: 84e489b. See approved, candidate and highlighted diff PNGs in this artifact. These checks do not replace human sign-off or accessibility review.\n');
  if(failed.length){console.error('Visual regressions detected relative to the user-approved v0.8 design. Escalate any intentional differences for explicit review; do not silently weaken this check.');process.exitCode=1;}
}finally{
  if(browser)await browser.close();
  await Promise.all([new Promise(r=>baselineServer.close(r)),new Promise(r=>candidateServer.close(r))]);
}