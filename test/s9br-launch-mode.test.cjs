'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {resolve}=require('../rally-one-launch-mode.js');
const cases=[
  [
    "standard",
    "",
    {},
    [
      false,
      false,
      false,
      false,
      false
    ]
  ],
  [
    "branch",
    "",
    {
      "defaultToday": "board"
    },
    [
      false,
      false,
      false,
      true,
      true
    ]
  ],
  [
    "PR",
    "",
    {
      "defaultToday": "board",
      "defaultExperience": "rally-one"
    },
    [
      true,
      false,
      true,
      true,
      true
    ]
  ],
  [
    "branch override",
    "?rallyOne=1",
    {
      "defaultToday": "board"
    },
    [
      true,
      false,
      true,
      true,
      true
    ]
  ],
  [
    "explicit opt-out",
    "?rallyOne=0",
    {
      "defaultToday": "board",
      "defaultExperience": "rally-one"
    },
    [
      false,
      false,
      false,
      true,
      true
    ]
  ],
  [
    "stack override",
    "?f09=1",
    {
      "defaultToday": "board",
      "defaultExperience": "rally-one"
    },
    [
      false,
      false,
      false,
      false,
      true
    ]
  ],
  [
    "f10",
    "?f10=1",
    {
      "defaultExperience": "rally-one"
    },
    [
      false,
      false,
      true,
      true,
      true
    ]
  ],
  [
    "f103",
    "?f103=1",
    {
      "defaultExperience": "rally-one"
    },
    [
      false,
      true,
      true,
      true,
      true
    ]
  ],
  [
    "explicit Rally One wins",
    "?rallyOne=1&f09=1",
    {
      "defaultToday": "board"
    },
    [
      true,
      false,
      true,
      true,
      true
    ]
  ],
  [
    "disabled legacy flag still overrides",
    "?f10=0",
    {
      "defaultToday": "board",
      "defaultExperience": "rally-one"
    },
    [
      false,
      false,
      false,
      true,
      true
    ]
  ],
  [
    "empty explicit override",
    "?rallyOne=",
    {
      "defaultExperience": "rally-one"
    },
    [
      false,
      false,
      false,
      false,
      false
    ]
  ],
  [
    "explicit legacy board",
    "?f09=board",
    {
      "defaultExperience": "rally-one"
    },
    [
      false,
      false,
      false,
      true,
      true
    ]
  ],
  [
    "empty f09 is not default",
    "?f09=",
    {
      "defaultToday": "board",
      "defaultExperience": "rally-one"
    },
    [
      false,
      false,
      false,
      false,
      false
    ]
  ],
  [
    "first duplicate wins",
    "?rallyOne=0&rallyOne=1",
    {
      "defaultExperience": "rally-one"
    },
    [
      false,
      false,
      false,
      false,
      false
    ]
  ]
];
for(const [name,search,defaults,expected] of cases){
 test('launch mode: '+name,()=>{
  const params=new URLSearchParams(search);
  const before=params.toString();
  const result=resolve(params,Object.freeze(defaults));
  assert.deepEqual([result.rallyOne,result.f103Preview,result.f10Preview,result.f09Board,result.f09Preview],expected);
  assert.equal(params.toString(),before);
 });
}

test('controller is byte-identical to accepted Sprint 8 outside the exact launch extraction',()=>{
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
 const app=require('./helpers/s9br-state-source.cjs').restoreStateSource();
 const inserted="const {rallyOne,f103Preview,f10Preview,f09Board,f09Preview}=window.RallyLaunchMode.resolve(\n new URLSearchParams(window.location.search),document.documentElement.dataset);\n";
 const originalFirst="const previewParams=new URLSearchParams(window.location.search);\nconst rallyOne=previewParams.has('rallyOne')?previewParams.get('rallyOne')==='1':\n document.documentElement.dataset.defaultExperience==='rally-one'&&\n !['f09','f10','f103'].some(flag=>previewParams.has(flag));\n";
 const originalSecond="const f103Preview=previewParams.get('f103')==='1';\nconst f10Preview=rallyOne||f103Preview||previewParams.get('f10')==='1';\nconst defaultToday=document.documentElement.dataset.defaultToday;\nconst f09Mode=f10Preview?'board':(previewParams.get('f09')??defaultToday);\nconst f09Board=f09Mode==='board';\nconst f09Preview=f09Mode==='1'||f09Board;\n";
 assert.equal(app.split(inserted).length,2);
 assert.equal(app.split('let f09Index=').length,2);
 const restored=Buffer.from(app.replace(inserted,originalFirst).replace('let f09Index=',originalSecond+'let f09Index='));
 const sha=crypto.createHash('sha1').update('blob '+restored.length+'\0').update(restored).digest('hex');
 assert.equal(sha,'6482cc523de36cbac6ae1097556d6bc1d0c0519b');
});
