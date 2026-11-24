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
