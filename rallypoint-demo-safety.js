/* F-11: staff demo safety. No remote account, messaging or integration exists.
 * This is not a data-loss-prevention system: fictional text only, and real data
 * must NEVER be used in the demo. Independent of the Rally Point UI state.
 */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root&&typeof root==='object')root.RallyDemoSafety=api;
})(typeof window==='object'?window:globalThis,function(root){
  'use strict';
  const owned=key=>typeof key==='string'&&/^(rallypoint[-:]|rally-point[-:])/i.test(key);
  const samples=Object.freeze({
    group:'Sample: Looking forward to seeing everyone Wednesday!',
    team:'Sample: Thanks for serving with the Welcome Team this Sunday!',
    prayer:'Sample: Praying for wisdom and encouragement this week.',
    direct:'Sample: Hope your week is going well. See you Wednesday!'
  });
  const unsafePatterns=[
    {name:'email address',pattern:/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i},
    {name:'web link',pattern:/\b(?:https?:\/\/|www\.)[^\s]+/i},
    {name:'telephone number',pattern:/(?:\+?\d[\s().-]*){10,}/},
    {name:'social security number',pattern:/\b\d{3}-\d{2}-\d{4}\b/},
    {name:'payment card number',pattern:/\b(?:\d[\s-]?){13,19}\b/}
  ];
  function checkText(value){
    const text=String(value||'').trim();
    if(!text)return {ok:false,reason:'Add a fictional example before posting.'};
    const match=unsafePatterns.find(item=>item.pattern.test(text));
    if(match)return {ok:false,reason:'This demo blocks '+match.name+'s. Please use fictional sample content instead.'};
    return {ok:true,reason:''};
  }
  function ownedKeys(storage){
    const keys=[];
    // Never call storage.clear(): the user may have other unrelated web-app state.
    for(let i=0;i<storage.length;i++){const key=storage.key(i);if(owned(key))keys.push(key);}
    return keys;
  }
  function resetAll({navigate=true}={}){
    let localKeys=[],sessionKeys=[];
    try{
      localKeys=ownedKeys(root.localStorage);
      sessionKeys=ownedKeys(root.sessionStorage);
      for(const key of localKeys)root.localStorage.removeItem(key);
      for(const key of sessionKeys)root.sessionStorage.removeItem(key);
    }catch(error){
      return {ok:false,reason:'Browser storage could not be fully cleared. Review browser storage settings and try again.',removedLocal:0,removedSession:0};
    }
    if(navigate){
      // Reload the app to discard any in-memory draft, game or leader demo state.
      const url=new URL(root.location.href);
      url.searchParams.delete('skipWelcome');
      url.searchParams.set('welcome','1');
      root.location.replace(url.pathname+url.search+url.hash);
    }
    return {ok:true,removedLocal:localKeys.length,removedSession:sessionKeys.length};
  }
  return Object.freeze({owned,ownedKeys,samples,checkText,resetAll});
});
