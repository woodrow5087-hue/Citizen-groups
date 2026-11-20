/* VersePlay: a tactile, browser-local Scripture word game.
 * Passages use the modern Berean Standard Bible (BSB), dedicated to the public domain.
 * Pure logic is shared by the browser and Node tests. No network, real member identity,
 * spiritual engagement score, streak, or fabricated real-world competition.
 */
(function(root,factory){
  const game=factory();
  if(typeof module==='object'&&module.exports)module.exports=game;
  if(root)root.RallyMemory=game;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const translation='BSB';
 const textRevision='BSB-2026-1';
 const library=Object.freeze({
   sermon:{
     title:'Love one another',reference:'John 15:12',path:'sermon',
     text:'This is My commandment, that you love one another as I have loved you.',
     targets:['My','commandment','love','another','loved'],
     decoys:['always','honor']
   },
   study:{
     title:'Put it into practice',reference:'James 1:22',path:'study',
     text:'Be doers of the word, and not hearers only. Otherwise, you are deceiving yourselves.',
     targets:['doers','word','hearers','deceiving','yourselves'],
     decoys:['easy','listen']
   },
   year:{
     title:'My shepherd',reference:'Psalm 23:1–2',path:'year',
     text:'The LORD is my shepherd; I shall not want. He makes me lie down in green pastures; He leads me beside quiet waters.',
     targets:['LORD','shepherd','pastures','quiet','waters'],
     decoys:['alone','stray']
   },
   romans:{
     title:'All things together',reference:'Romans 8:28',path:'bonus',
     text:'And we know that God works all things together for the good of those who love Him, who are called according to His purpose.',
     targets:['know','works','good','love','purpose'],
     decoys:['faith','always']
   }
 });
 const clean=w=>String(w).replace(/^[^A-Za-z]+|[^A-Za-z]+$/g,'').toLowerCase();
 const split=w=>{const m=String(w).match(/^([^A-Za-z]*)([A-Za-z'-]+)([^A-Za-z]*)$/);return m?{prefix:m[1],word:m[2],suffix:m[3]}:{prefix:'',word:String(w),suffix:''}};
 const hash=str=>{let h=2166136261;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
 function challenge(id){
   const c=library[id]||library.sermon,parts=c.text.split(/\s+/),indexes=[];
   for(const word of c.targets){const i=parts.findIndex((p,index)=>clean(p)===clean(word)&&!indexes.includes(index));if(i<0)throw Error('Invalid local verse target: '+word);indexes.push(i)}
   indexes.sort((a,b)=>a-b);
   const bank=indexes.map((wordIndex,i)=>({id:'a'+i,label:split(parts[wordIndex]).word,answerIndex:i}))
     .concat(c.decoys.map((label,i)=>({id:'d'+i,label,answerIndex:-1})));
   return {...c,id,parts,indexes,bank};
 }
 const initial=()=>({slots:[null,null,null,null,null],misses:0,hints:0,solved:false,best:null,round:0,feedback:''});
 function normalize(raw,id){
   const def=initial(),q=challenge(id),out={...def};
   if(!raw||typeof raw!=='object'||Array.isArray(raw))return def;
   const used=new Set();
   out.slots=q.indexes.map((_,i)=>{
     const token=Array.isArray(raw.slots)?raw.slots[i]:null;
     if(typeof token!=='string'||!q.bank.some(b=>b.id===token)||used.has(token))return null;
     used.add(token);return token;
   });
   out.misses=Number.isInteger(raw.misses)&&raw.misses>=0&&raw.misses<10000?raw.misses:0;
   out.hints=Number.isInteger(raw.hints)&&raw.hints>=0&&raw.hints<10000?raw.hints:0;
   out.round=Number.isInteger(raw.round)&&raw.round>=0&&raw.round<10000?raw.round:0;
   out.solved=raw.solved===true&&out.slots.every((v,i)=>v==='a'+i);
   out.best=Number.isInteger(raw.best)&&raw.best>=0&&raw.best<=100?raw.best:null;
   out.feedback=typeof raw.feedback==='string'?raw.feedback.slice(0,160):'';
   return out;
 }
 function score(state){return Math.max(20,100-state.misses*9-state.hints*12)}
 const filled=state=>state.slots.filter(Boolean).length;
 function bank(id,round=0){
   const c=challenge(id);
   return c.bank.slice().sort((a,b)=>hash(id+':'+String(round)+':'+a.id)-hash(id+':'+String(round)+':'+b.id));
 }
 function pick(raw,id,token,target){
   const g=normalize(raw,id),c=challenge(id);
   if(g.solved||!c.bank.some(b=>b.id===token)||g.slots.includes(token))return g;
   const slot=Number.isInteger(target)&&target>=0&&target<g.slots.length&&g.slots[target]===null?target:g.slots.indexOf(null);
   if(slot<0)return g;
   g.slots[slot]=token;g.feedback='';
   return g;
 }
 function clear(raw,id,slot){
   const g=normalize(raw,id);
   if(g.solved||!Number.isInteger(slot)||slot<0||slot>=g.slots.length)return g;
   g.slots[slot]=null;g.feedback='';return g;
 }
 function hint(raw,id){
   const g=normalize(raw,id);if(g.solved)return g;
   const slot=g.slots.indexOf(null);
   if(slot<0)return {...g,feedback:'Tap a placed word to free a space for a hint.'};
   const correct='a'+slot;
   const existing=g.slots.indexOf(correct);
   if(existing>=0)g.slots[existing]=null;
   g.slots[slot]=correct;g.hints++;g.feedback='A little nudge. Keep going!';
   return g;
 }
 function check(raw,id){
   const g=normalize(raw,id);
   if(g.solved)return {state:g,status:'complete',wrong:0};
   if(g.slots.some(x=>x===null))return {state:{...g,feedback:'Fill all five blanks, then check your verse.'},status:'incomplete',wrong:0};
   let wrong=0;
   for(let i=0;i<g.slots.length;i++)if(g.slots[i]!=='a'+i){wrong++;g.slots[i]=null}
   if(wrong){
     g.misses+=wrong;
     g.feedback=wrong===1?'One word needs a second look. You’ve got this!':wrong+' words need another try. Keep the ones you got right.';
     return {state:g,status:'try-again',wrong};
   }
   g.solved=true;g.feedback='Verse complete! You put every word in its place.';
   const points=score(g);
   g.best=g.best===null?points:Math.max(g.best,points);
   return {state:g,status:'complete',wrong:0};
 }
 function reset(raw,id){
   const g=normalize(raw,id);
   return {...initial(),best:g.best,round:g.round+1};
 }
 return {translation,textRevision,library,challenge,initial,normalize,bank,split,score,filled,pick,clear,hint,check,reset};
});
