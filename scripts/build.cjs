const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const files=['index.html','rallypoint.js','rallypoint-today.js','rallypoint-ui.js','rallypoint-group-view.js','rallypoint-group-experience.js','rallypoint-storage-guard.js','rallypoint-conversation-read-model.js','wednesday-chat-lab.js','wednesday-chat-lab.css','wednesday-chat-lab.html','rallypoint-wednesday-integrated.css','rallypoint.css','rallypoint-phase1.css','rallypoint-welcome.css','rallypoint-today-fluid.css','rallypoint-dashboard-v06.css','rallypoint-groups-v07.css','rallypoint-team-v08.css','rallypoint-read-v09.css','rallypoint-memorize.js','rallypoint-verseplay-ui.js','rallypoint-verseplay.css','rallypoint-studio-finish-v07.css','rallypoint-unified-v08.css','rallypoint-premium-alive.css','rallypoint-companion-decision.js','rallypoint-premium-alive.js','rallypoint-smart-dashboard.js','rallypoint-smart-dashboard.css','rallypoint-priority-board.js','rallypoint-priority-board.css','rallypoint-personal-companion.js','rallypoint-personal-companion.css','rallypoint-visual-unification.css','rallypoint-team-unification.css','rallypoint-read-unification.css','rally-one.css','rallypoint-welcome.js','premium-hybrid-archive.html','blank-battle.html','blank-battle.css','blank-battle.js','connect-design-lab.html','connect-design-lab.css','connect-design-lab.js','connect-member.js'];
for(const file of files){const source=fs.readFileSync(path.join(root,file),'utf8');if(file.endsWith('.js'))new vm.Script(source,{filename:file});}
for(const asset of ['assets/citizen-flag.svg','assets/rally-one/title-card.jpg','assets/rally-one/community.webp','assets/rally-one/anna.webp','assets/rally-one/jess.webp','assets/rally-one/marcus.webp','assets/rally-one/taylor.webp','assets/spotify.svg','assets/welcome-flow.svg','assets/campuses/central.jpg','assets/campuses/north.jpg','assets/campuses/maui.jpg','assets/campuses/online.jpg','assets/f09-mountain.svg','assets/paper-grain.svg','assets/fonts/Manrope.ttf','assets/fonts/OFL-Manrope.txt','docs/assets/visual_reference_warm_editorial_v1.png','docs/assets/citizen_church_logo_reference.png'])if(!fs.existsSync(path.join(root,asset)))throw Error('Missing approved/runtime asset: '+asset);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(out,file));
// Only Netlify PR and branch previews receive the new default.
if(['deploy-preview','branch-deploy'].includes(process.env.CONTEXT)){
 const entry=path.join(out,'index.html');
 const experience=process.env.CONTEXT==='deploy-preview'?' data-default-experience="rally-one"':'';
 const html=fs.readFileSync(entry,'utf8').replace('<html lang="en">', '<html lang="en" data-default-today="board"'+experience+'>');
 fs.writeFileSync(entry,html);
}
for(const folder of ['assets','docs'])fs.cpSync(path.join(root,folder),path.join(out,folder),{recursive:true});
require('./build-chat-lab.cjs').buildChatDomainBundle(out);
console.log('Built the Rally Point preview in dist, including approved references and the unchanged Citizen Connect archive.');
