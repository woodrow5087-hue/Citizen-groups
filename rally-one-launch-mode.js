/* Rally One launch-mode policy. Pure: no DOM, storage or navigation effects. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.RallyLaunchMode=api;
})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 function resolve(params,{defaultExperience,defaultToday}={}){
  const rallyOne=params.has('rallyOne')?params.get('rallyOne')==='1':
   defaultExperience==='rally-one'&&!['f09','f10','f103'].some(flag=>params.has(flag));
  const f103Preview=params.get('f103')==='1';
  const f10Preview=rallyOne||f103Preview||params.get('f10')==='1';
  const f09Mode=f10Preview?'board':(params.get('f09')??defaultToday);
  const f09Board=f09Mode==='board';
  const f09Preview=f09Mode==='1'||f09Board;
  return {rallyOne,f103Preview,f10Preview,f09Board,f09Preview};
 }
 return Object.freeze({resolve});
});
