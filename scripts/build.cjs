const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const required=['index.html','experience/styles.css','experience/model.js','experience/data.js','experience/scripture.js','experience/app.js','assets/brand.png','assets/favicon.png','assets/apple-touch-icon.png','assets/serving.jpg','assets/member-reference.jpg'];
for(const file of required){if(!fs.existsSync(path.join(root,file)))throw Error('Missing required asset: '+file);if(file.endsWith('.js'))new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});}
for(const match of html.matchAll(/(?:src|href)="((?:assets|experience)\/[^"#]+)"/g))if(!fs.existsSync(path.join(root,match[1])))throw Error('Broken shell reference: '+match[1]);
const scripture={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'experience/scripture.js'),'utf8'),scripture);
if(scripture.window.CitizenScripture.length!==10||scripture.window.CitizenScripture.some(c=>!c.verses.length))throw Error('The offline Scripture library is incomplete.');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const file of required){const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
console.log(`Built ${required.length} static files in dist. No backend, credentials or runtime downloads required.`);
