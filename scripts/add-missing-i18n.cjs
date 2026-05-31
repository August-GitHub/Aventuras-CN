const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const zh = JSON.parse(fs.readFileSync('src/locales/zh-CN.json', 'utf8'));

// Define all 105 missing keys with EN and ZH translations
// Based on context from source code
const translations = {
  // === actionChoices (new section) ===
  'actionChoices.generating':  ['Generating choices...', '正在生成选项...'],
  'actionChoices.title':       ['Suggested Actions', '建议操作'],

  // === actionInput (new section) ===
  'actionInput.actionTypes.do':    ['Do', '行动'],
  'actionInput.actionTypes.free':  ['Free', '自由'],
  'actionInput.actionTypes.say':   ['Say', '说'],
  'actionInput.actionTypes.story': ['Story', '叙述'],
  'actionInput.actionTypes.think': ['Think', '思考'],
  'actionInput.error.configIncomplete':    ['Configuration incomplete. Please check your API settings.', '配置不完整，请检查你的 API 设置。'],
  'actionInput.error.emptyResponse':       ['Received empty response from AI. Please try again.', '收到 AI 空响应，请重试。'],
  'actionInput.error.generationFailed':    ['Generation failed. Please check your connection and try again.', '生成失败，请检查连接后重试。'],
  'actionInput.notification.generationComplete': ['Generation complete', '生成完成'],
  'actionInput.notification.generationFailed':   ['Generation failed', '生成失败'],
  'actionInput.notification.tapToRetry':         ['Tap to retry', '点击重试'],
  'actionInput.notification.tapToReturn':        ['Tap to return', '点击返回'],
  'actionInput.placeholders.do':    ['What action do you take?', '你采取什么行动？'],
  'actionInput.placeholders.free':  ['Write anything...', '输入任何内容...'],
  'actionInput.placeholders.say':   ['What do you say?', '你要说什么？'],
  'actionInput.placeholders.story': ['Describe what happens next...', '描述接下来发生的事...'],
  'actionInput.placeholders.think': ['What are you thinking?', '你在想什么？'],

  // === character (add to existing section) ===
  'character.active':               ['Active', '活跃'],
  'character.addCharacter':         ['Add Character', '添加角色'],
  'character.addFirst':             ['Add your first character', '添加你的第一个角色'],
  'character.appearance':           ['Appearance', '外貌'],
  'character.appearancePlaceholder':['Describe appearance...', '描述外貌...'],
  'character.deceased':             ['Deceased', '已死亡'],
  'character.generate':             ['Generate', '生成'],
  'character.generating':           ['Generating...', '正在生成...'],
  'character.hideDetails':          ['Hide Details', '收起详情'],
  'character.inactive':             ['Inactive', '非活跃'],
  'character.makeProtagonist':      ['Make Protagonist', '设为主角'],
  'character.noCharacters':         ['No characters yet', '暂无角色'],
  'character.panelTitle':           ['Characters', '角色'],
  'character.protagonistSwapError': ['Failed to swap protagonist', '切换主角失败'],
  'character.relationship':         ['Relationship', '关系'],
  'character.remove':               ['Remove', '移除'],
  'character.saveToVault':          ['Save to Vault', '保存到素材库'],
  'character.showDetails':          ['Show Details', '显示详情'],
  'character.status':               ['Status', '状态'],
  'character.swap':                 ['Swap', '切换'],
  'character.traitsAppearance':     ['Traits & Appearance', '特征与外貌'],
  'character.traitsPlaceholder':    ['Describe personality and traits...', '描述性格特征...'],
  'character.upload':               ['Upload Image', '上传图片'],
  'character.uploading':            ['Uploading...', '正在上传...'],
  'character.you':                  ['You', '你'],

  // === common (add to existing section) ===
  'common.add':         ['Add', '添加'],
  'common.checking':    ['Checking...', '检查中...'],
  'common.clearAll':    ['Clear All', '全部清除'],
  'common.description': ['Description', '描述'],
  'common.name':        ['Name', '名称'],
  'common.select':      ['Select', '选择'],

  // === gallery.toast ===
  'gallery.toast.loadFailed':    ['Failed to load image', '加载图片失败'],
  'gallery.toast.savedOneImage': ['1 image saved', '已保存 1 张图片'],

  // === lorebook ===
  'lorebook.saveFailed': ['Failed to save entry', '保存条目失败'],

  // === reasoning ===
  'reasoning.hideThinking': ['Hide thinking', '隐藏思考'],
  'reasoning.showThinking': ['Show thinking', '显示思考'],

  // === settings ===
  'settings.allLorebookEntriesExported': ['All lorebook entries exported', '所有设定集条目已导出'],
  'settings.cfg':                        ['CFG Scale', 'CFG 缩放'],
  'settings.exportFormat':               ['Export Format', '导出格式'],
  'settings.runRawSql':                  ['Run Raw SQL', '执行原始 SQL'],
  'settings.tags':                       ['Tags', '标签'],
  'settings.whatToExport':               ['What to Export', '导出内容'],
  'settings.writeQueries':               ['Write Queries', '编写查询'],

  // === story.entries ===
  'story.entries.goToBottom': ['Go to bottom', '滚动到底部'],
  'story.entries.goToTop':    ['Go to top', '滚动到顶部'],

  // === storyCard (new section) ===
  'storyCard.noDescription': ['No description', '无描述'],

  // === tts (new section) ===
  'tts.selectLanguage': ['Select language', '选择语言'],

  // === vault.promptPacks ===
  'vault.promptPacks.characters':               ['Characters', '角色'],
  'vault.promptPacks.clearIcon':                ['Clear icon', '清除图标'],
  'vault.promptPacks.defaultValue':             ['Default value', '默认值'],
  'vault.promptPacks.insertVariable':           ['Insert variable', '插入变量'],
  'vault.promptPacks.items':                    ['Items', '物品'],
  'vault.promptPacks.loadingTemplate':          ['Loading template...', '正在加载模板...'],
  'vault.promptPacks.locations':                ['Locations', '地点'],
  'vault.promptPacks.noIcon':                   ['No icon', '无图标'],
  'vault.promptPacks.noIconsFound':             ['No icons found', '未找到图标'],
  'vault.promptPacks.noRuntimeVariables':       ['No runtime variables', '无运行时变量'],
  'vault.promptPacks.noVariableFound':          ['No variable found', '未找到变量'],
  'vault.promptPacks.runtime':                  ['Runtime', '运行时'],
  'vault.promptPacks.runtimeVariables':         ['Runtime Variables', '运行时变量'],
  'vault.promptPacks.runtimeVariablesHelp':     ['Variables that are resolved at runtime when the prompt is used.', '使用提示词时在运行时解析的变量。'],
  'vault.promptPacks.searchIcons':              ['Search icons...', '搜索图标...'],
  'vault.promptPacks.searchVariables':          ['Search variables...', '搜索变量...'],
  'vault.promptPacks.storyBeats':               ['Story Beats', '故事节拍'],
  'vault.promptPacks.structuralErrors':         ['Structural Errors', '结构错误'],
  'vault.promptPacks.templateValid':            ['Template is valid', '模板有效'],

  // === wizard ===
  'wizard.accessModels':              ['Access models', '访问模型'],
  'wizard.affordableAccess':          ['Affordable access to powerful language models', '以实惠的价格使用强大的语言模型'],
  'wizard.apiKey':                    ['API Key', 'API 密钥'],
  'wizard.backToCustomization':       ['Back to Customization', '返回自定义设置'],
  'wizard.chooseProvider':            ['Choose a Provider', '选择服务商'],
  'wizard.configureEndpointLater':    ['Or configure your own endpoint later in Settings', '或稍后在设置中配置你自己的接口地址'],
  'wizard.configureOwnEndpoint':      ['Configure your own endpoint', '配置你自己的接口地址'],
  'wizard.customizeEnvironment':      ['Customize your environment', '自定义你的环境'],
  'wizard.enterApiKey':               ['Enter API Key', '输入 API 密钥'],
  'wizard.failedToInitialize':        ['Failed to initialize', '初始化失败'],
  'wizard.getAKey':                   ['Get a key', '获取密钥'],
  'wizard.getStarted':                ['Get Started', '开始使用'],
  'wizard.nextStep':                  ['Next Step', '下一步'],
  'wizard.pleaseEnterApiKey':         ['Please enter your API key', '请输入你的 API 密钥'],
  'wizard.reasoningModelsAutoDetected':['Reasoning models auto-detected', '已自动检测推理模型'],
  'wizard.settingUp':                 ['Setting up...', '正在设置...'],
  'wizard.targetLanguage':            ['Target Language', '目标语言'],
  'wizard.translateMyInput':          ['Translate my input', '翻译我的输入'],
  'wizard.translateWorldState':       ['Translate world state', '翻译游戏状态'],
  'wizard.welcomeTitle':              ['Welcome to Aventuras', '欢迎来到 Aventuras'],
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

function getNested(obj, keyPath) {
  return keyPath.split('.').reduce((c, p) => c && typeof c === 'object' ? c[p] : undefined, obj);
}

// Add all translations
let addedCount = 0;
for (const [key, [enVal, zhVal]] of Object.entries(translations)) {
  if (getNested(en, key) === undefined) {
    setNested(en, key, enVal);
    addedCount++;
  }
  if (getNested(zh, key) === undefined) {
    setNested(zh, key, zhVal);
  }
}

fs.writeFileSync('src/locales/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/locales/zh-CN.json', JSON.stringify(zh, null, 2) + '\n');

console.log(`Added ${addedCount} keys to en.json and zh-CN.json`);
