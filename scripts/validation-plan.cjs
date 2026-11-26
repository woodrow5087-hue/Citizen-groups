'use strict';
const {execFileSync}=require('node:child_process');
function classify(files){
 const scoped=new Set(['connect-usability.css','connect-graphite-parity.css','connect-alive.css']);
 const tier=files.length&&files.every(f=>scoped.has(f))?1:3;
 return {tier,reason:tier===1?'Connect-scoped presentation; embedded and standalone consumers both required':'Shared, sensitive, infrastructure, mixed or unknown dependency impact; fail conservative',local:tier===1?['units','build','Connect browser/profile accessibility','Connect visual','historical integrity']:['full applicable suite'],ci:'full Tier 3; advisory classification never skips required CI',manualReviewRequired:true};
}
module.exports={classify};
if(require.main===module){
 const [base,head='HEAD']=process.argv.slice(2);if(!base)throw Error('Usage: node scripts/validation-plan.cjs <verified-base> [head]');
 const git=(args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
 const baseSha=git(['rev-parse','--verify',base+'^{commit}']),headSha=git(['rev-parse','--verify',head+'^{commit}']);
 const files=execFileSync('git',['diff','--name-only','-z',baseSha,headSha],{encoding:'utf8'}).split('\0').filter(Boolean);
 const dirty=!!git(['status','--porcelain']);
 const plan=dirty?{...classify([]),reason:'Uncommitted work is outside the committed dependency inventory; Tier3 until reviewed'}:classify(files);
 console.log(JSON.stringify({base:baseSha,head:headSha,dirty,files,...plan},null,2));
}
