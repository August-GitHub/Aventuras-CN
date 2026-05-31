const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const zh = JSON.parse(fs.readFileSync('src/locales/zh-CN.json', 'utf8'));

// Fix machine-translation-sounding Chinese -> natural Chinese
const fixes = {
  // wizard
  'wizard.affordableAccess':        ['Affordable access to powerful language models', '亲民价格，体验强大语言模型'],
  'wizard.configureEndpointLater':  ['Or configure your own endpoint later in Settings', '也可稍后在设置中自行配置接口地址'],
  'wizard.configureOwnEndpoint':    ['Configure your own endpoint', '自行配置接口地址'],
  'wizard.customizeEnvironment':    ['Customize your environment', '自定义环境'],
  'wizard.welcomeTitle':            ['Welcome to Aventuras', '欢迎使用 Aventuras'],

  // actionInput
  'actionInput.error.configIncomplete':  ['Configuration incomplete. Please check your API settings.', '设置不完整，请检查 API 配置。'],
  'actionInput.error.emptyResponse':     ['Received empty response from AI. Please try again.', 'AI 未返回有效内容，请重试。'],
  'actionInput.error.generationFailed':  ['Generation failed. Please check your connection and try again.', '生成失败，请检查网络后重试。'],
  'actionInput.placeholders.do':    ['What action do you take?', '你打算怎么做？'],
  'actionInput.placeholders.say':   ['What do you say?', '你想说什么？'],
  'actionInput.placeholders.story': ['Describe what happens next...', '描述接下来的发展...'],

  // character
  'character.inactive':         ['Inactive', '已离场'],
  'character.traitsAppearance': ['Traits & Appearance', '性格特征与外貌'],

  // vault
  'vault.promptPacks.storyBeats': ['Story Beats', '故事节点'],

  // settings
  'settings.cfg': ['CFG Scale', 'CFG 强度'],
};

function setNested(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

let count = 0;
for (const [key, [enVal, zhVal]] of Object.entries(fixes)) {
  setNested(en, key, enVal);
  setNested(zh, key, zhVal);
  count++;
}

fs.writeFileSync('src/locales/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/locales/zh-CN.json', JSON.stringify(zh, null, 2) + '\n');

console.log(`Refined ${count} translations for natural language quality`);
