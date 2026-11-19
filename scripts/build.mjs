import { cp, mkdir, rm, access } from 'node:fs/promises';
const root=new URL('../',import.meta.url), output=new URL('dist/',root);
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const path of ['index.html','styles.css','app.js','assets','docs']) {
  await access(new URL(path,root));
  await cp(new URL(path,root),new URL(path,output),{recursive:true});
}
console.log('Built self-contained static demo in dist/.');
