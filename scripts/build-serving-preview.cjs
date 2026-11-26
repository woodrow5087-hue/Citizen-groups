'use strict';

const {createServingRehearsal}=require('../pilot/f2-synthetic-serving.cjs');

async function makeServingPreviewBundle(now){
 const outcomes=await createServingRehearsal(now);
 return 'window.FoundationServingFixtures = '+JSON.stringify(outcomes)+';\n';
}

module.exports={makeServingPreviewBundle};
