'use strict';
/**
 * Builds a standalone browser adapter from the EXACT CommonJS F-02 contracts.
 * No external bundler or duplicate message state machine. The main app never
 * imports this bundle; it is used only by /wednesday-chat-lab.html.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function makeChatDomainBundle() {
  const contracts = fs.readFileSync(path.join(root,'lib/conversation-contracts.cjs'),'utf8');
  const repository = fs.readFileSync(path.join(root,'lib/mock-conversation-repository.cjs'),'utf8');
  // Functions are concatenated rather than serialized or eval'd at runtime.
  const source = `(function(root){'use strict';
  const modules = {
    './conversation-contracts.cjs': function(module,require){\n${contracts}\n},
    './mock-conversation-repository.cjs': function(module,require){\n${repository}\n}
  };
  const cache = Object.create(null);
  function localRequire(id){
    if (!Object.prototype.hasOwnProperty.call(modules,id)) throw Error('Unknown bundled F-02 module');
    if (!Object.prototype.hasOwnProperty.call(cache,id)){
      const module = {exports:{}};
      cache[id] = module;
      modules[id](module,localRequire);
    }
    return cache[id].exports;
  }
  root.RallyChatDomain = Object.freeze({
    ...localRequire('./conversation-contracts.cjs'),
    ...localRequire('./mock-conversation-repository.cjs')
  });
})(window);
`;
  new vm.Script(source,{filename:'rallypoint-chat-domain.browser.js'});
  return source;
}

function buildChatDomainBundle(outDir=path.join(root,'dist')) {
  const source=makeChatDomainBundle();
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'rallypoint-chat-domain.browser.js'),source,'utf8');
  return source.length;
}

module.exports={makeChatDomainBundle,buildChatDomainBundle};
if (require.main === module) {
  const bytes=buildChatDomainBundle();
  console.log('Built standalone F-02 browser conversation adapter ('+bytes+' bytes).');
}
