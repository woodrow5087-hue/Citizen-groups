const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const files=['index.html','rallypoint.js','rallypoint-today.js','rallypoint-ui.js','rallypoint.css','rallypoint-phase1.css','rallypoint-welcome.css','rallypoint-today-fluid.css','rallypoint-dashboard-v06.css','rallypoint-groups-v07.css','rallypoint-team-v08.css','rallypoint-read-v09.css','rallypoint-memorize.js','rallypoint-verseplay-ui.js','rallypoint-verseplay.css','rallypoint-studio-finish-v07.css','rallypoint-unified-v08.css','rallypoint-welcome.js','premium-hybrid-archive.html','blank-battle.html','blank-battle.css','blank-battle.js'];
for(const file of files){const source=fs.readFileSync(path.join(root,file),'utf8');if(file.endsWith('.js'))new vm.Script(source,{filename:file});}
for(const asset of ['assets/citizen-flag.svg','assets/spotify.svg','assets/welcome-flow.svg','assets/campuses/central.jpg','assets/campuses/north.jpg','assets/campuses/maui.jpg','assets/campuses/online.jpg','assets/paper-grain.svg','assets/fonts/Manrope.ttf','assets/fonts/OFL-Manrope.txt','docs/assets/visual_reference_warm_editorial_v1.png','docs/assets/citizen_church_logo_reference.png'])if(!fs.existsSync(path.join(root,asset)))throw Error('Missing approved/runtime asset: '+asset);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(out,file));
for(const folder of ['assets','docs'])fs.cpSync(path.join(root,folder),path.join(out,folder),{recursive:true});
console.log('Built the Rally Point preview in dist, including approved references and the unchanged Citizen Connect archive.');
