// Deterministic game rules. No DOM, storage, audio, or rendering dependencies.
(function(root){
'use strict';
const screens=['home','launch','trace','link','echo','win','afterglow'];
const defaults=()=>({screen:'home',trace:[],link:[],echo:[],mistakes:0,hints:0,completed:false,sound:false});
function normalize(raw,p){
 const s=defaults();
 if(!raw||typeof raw!=='object')return s;
 s.sound=raw.sound===true;
 s.trace=Array.isArray(raw.trace)?[...new Set(raw.trace.filter(x=>p.anchors.includes(x)))]:[];
 for(const [key,max] of [['link',p.segments.length],['echo',p.answers.length]]){
  if(Array.isArray(raw[key]))for(let i=0;i<Math.min(max,raw[key].length);i++){if(raw[key][i]!==i)break;s[key].push(i);}
 }
 for(const k of ['mistakes','hints'])if(Number.isSafeInteger(raw[k])&&raw[k]>=0)s[k]=raw[k];
 if(s.trace.length!==p.anchors.length){s.link=[];s.echo=[];}
 if(s.link.length!==p.segments.length)s.echo=[];
 s.completed=raw.completed===true&&s.echo.length===p.answers.length;
 s.screen=screens.includes(raw.screen)?raw.screen:'home';
 if(['link','echo','win','afterglow'].includes(s.screen)&&s.trace.length!==p.anchors.length)s.screen='trace';
 if(['echo','win','afterglow'].includes(s.screen)&&s.link.length!==p.segments.length)s.screen='link';
 if(['win','afterglow'].includes(s.screen)&&!s.completed)s.screen='echo';
 return s;
}
function transition(state,action,value,p){
 const s={...state,trace:[...state.trace],link:[...state.link],echo:[...state.echo]};
 const result=(kind='ignored',extra={})=>({state:s,kind,...extra});
 switch(action){
 case 'home':s.screen='home';return result('navigate');
 case 'launch':if(s.screen!=='home')return result();s.screen='launch';return result('navigate');
 case 'start':case 'restart':if(!['launch','win','afterglow'].includes(s.screen))return result();return {state:{...defaults(),sound:s.sound,screen:'trace'},kind:'start'};
 case 'next':
  if(s.screen==='trace'&&s.trace.length===p.anchors.length){s.screen='link';return result('advance');}
  if(s.screen==='link'&&s.link.length===p.segments.length){s.screen='echo';return result('advance');}
  if(s.screen==='echo'&&s.echo.length===p.answers.length){s.screen='win';s.completed=true;return result('advance');}return result();
 case 'trace':if(s.screen!=='trace'||!p.anchors.includes(value)||s.trace.includes(value))return result();s.trace.push(value);return result('correct');
 case 'link':{const i=Number(value);if(s.screen!=='link'||!Number.isInteger(i)||i<0||i>=p.segments.length||s.link.includes(i))return result();if(i!==s.link.length){s.mistakes++;return result('wrong');}s.link.push(i);return result('correct');}
 case 'echo':if(s.screen!=='echo'||s.echo.length>=p.answers.length||!p.echoBank.includes(value)||s.echo.some(i=>p.answers[i]===value))return result();if(value!==p.answers[s.echo.length]){s.mistakes++;return result('wrong');}s.echo.push(s.echo.length);return result('correct');
 case 'hint':{const hint=s.screen==='link'?p.segments[s.link.length]:s.screen==='echo'?p.answers[s.echo.length]:undefined;if(!hint)return result();s.hints++;return result('hint',{hint});}
 case 'resetlink':if(s.screen!=='link'||!s.link.length)return result();s.link.pop();return result('undo');
 case 'resetecho':if(s.screen!=='echo'||!s.echo.length)return result();s.echo.pop();return result('undo');
 case 'afterglow':if(s.screen!=='win'||!s.completed)return result();s.screen='afterglow';return result('navigate');
 case 'sound':s.sound=!s.sound;return result('sound');
 default:return result();
 }
}
root.VerseCircuitEngine=Object.freeze({defaults,normalize,transition});
})(globalThis);
