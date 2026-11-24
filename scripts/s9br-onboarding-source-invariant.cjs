'use strict';
// Exact, reversible onboarding persistence-only exception to the original
// immutable visual-source gate. All other bytes and protected files stay fixed.
const assert=require('node:assert/strict');
const pairs=[
  [
    "  function savePreview(campusOnly=false){\n    try{\n      // Parse without fallback here: never replace an unreadable existing record silently.\n      const ui=JSON.parse(localStorage.getItem(UI_KEY)||'null')||{};\n      ui.campus=campus;\n      if(!campusOnly){ui.name=name.trim()||ui.name||'Friend';ui.memberships={...ui.memberships,group:kind==='guest'?false:membership.group,team:kind==='guest'?false:membership.team};ui.seenGroupSignature='';ui.onboarding={version:2,connection:kind,completed:true};}\n      const app=JSON.parse(localStorage.getItem(APP_KEY)||'null')||{};\n      if(!campusOnly){app.role='member';app.view='today';app.groupPane=rallyOne?'overview':'chat';app.teamPane='schedule';}\n      localStorage.setItem(UI_KEY,JSON.stringify(ui));if(!campusOnly)localStorage.setItem(APP_KEY,JSON.stringify(app));\n    }catch{error='This browser could not save your preferences. Existing demo data has not been reset. Try again, or enter without saving.';render();return;}\n    returnToApp();\n  }\n",
    "  // Use the existing two-record journal guard for all onboarding mutations.\n  function persistPreferences(campusOnly=false){\n    const guard=window.RallyStorageGuard.create(localStorage);\n    if(!guard.status().ok)return false;\n    const {primaryRaw,todayRaw}=guard.readOriginals();\n    const ui=JSON.parse(todayRaw??'null')||{};\n    ui.campus=campus;\n    let nextPrimary=primaryRaw;\n    if(!campusOnly){\n      ui.name=name.trim()||ui.name||'Friend';ui.memberships={...ui.memberships,group:kind==='guest'?false:membership.group,team:kind==='guest'?false:membership.team};ui.seenGroupSignature='';ui.onboarding={version:2,connection:kind,completed:true};\n      const app=JSON.parse(primaryRaw??'null')||{};\n      app.role='member';app.view='today';app.groupPane=rallyOne?'overview':'chat';app.teamPane='schedule';\n      nextPrimary=JSON.stringify(app);\n    }\n    return guard.save({primaryRaw:nextPrimary,todayRaw:JSON.stringify(ui)}).ok;\n  }\n  function savePreview(campusOnly=false){\n    try{\n      if(!persistPreferences(campusOnly))throw Error('Guarded preference save refused');\n    }catch{error='This browser could not save your preferences. Existing demo data has not been reset. Try again, or enter without saving.';render();return;}\n    returnToApp();\n  }\n"
  ],
  [
    "if(!rallyOne)try{const ui=JSON.parse(localStorage.getItem(UI_KEY)||'null')||{};ui.campus=campus;localStorage.setItem(UI_KEY,JSON.stringify(ui));}catch",
    "if(!rallyOne)try{if(!persistPreferences(true))throw Error('Guarded campus save refused');}catch"
  ]
];
function assertWelcomeSource(before,after){
 let restored=after.toString('utf8');
 for(const [oldText,newText] of pairs){
  assert.equal(restored.split(newText).length,2,'Expected one exact approved onboarding replacement');
  restored=restored.replace(newText,oldText);
 }
 assert.ok(Buffer.from(restored).equals(before),'Unapproved onboarding source mutation');
}
module.exports={assertWelcomeSource};
