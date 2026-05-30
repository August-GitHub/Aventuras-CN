# Tasks

- [ ] Task 1: 创建 beta 分支并初始化 i18n 基础设施
  - [ ] SubTask 1.1: 从 master 创建 beta 分支并切换
  - [ ] SubTask 1.2: 安装 svelte-i18n 依赖
  - [ ] SubTask 1.3: 创建 `src/locales/zh-CN.json` 和 `src/locales/en.json` 翻译文件骨架
  - [ ] SubTask 1.4: 创建 `src/lib/i18n.ts` 初始化文件，配置 svelte-i18n（默认语言 zh-CN，回退语言 en）
  - [ ] SubTask 1.5: 在应用入口引入 i18n 初始化（修改 `+layout.svelte` 或 `+layout.ts`）
  - [ ] SubTask 1.6: 修改 `app.html` 的 `lang` 属性为 `zh-CN`

- [ ] Task 2: 汉化核心布局组件
  - [ ] SubTask 2.1: 汉化 `Header.svelte`（标题、按钮、导出选项等）
  - [ ] SubTask 2.2: 汉化 `Sidebar.svelte`（菜单项：故事、知识库、记忆、保险库等）
  - [ ] SubTask 2.3: 汉化 `AppShell.svelte`（如有硬编码文本）
  - [ ] SubTask 2.4: 汉化 `ProfileWarningBanner.svelte`

- [ ] Task 3: 汉化欢迎与引导组件
  - [ ] SubTask 3.1: 汉化 `WelcomeScreen.svelte`（欢迎标题、描述、按钮）
  - [ ] SubTask 3.2: 汉化 `SetupWizard.svelte` 及其步骤组件（Step1-Step8、StepPackSelection）
  - [ ] SubTask 3.3: 汉化 `STImportWizard.svelte` 及其步骤组件

- [ ] Task 4: 汉化设置组件
  - [ ] SubTask 4.1: 汉化 `SettingsModal.svelte`（标签页名称）
  - [ ] SubTask 4.2: 汉化 `tabs/interface.svelte`（主题、字体、翻译、更新等所有标签和描述）
  - [ ] SubTask 4.3: 汉化 `tabs/api-connection.svelte`
  - [ ] SubTask 4.4: 汉化 `tabs/generation.svelte`
  - [ ] SubTask 4.5: 汉化 `tabs/images.svelte`
  - [ ] SubTask 4.6: 汉化 `tabs/story-settings.svelte`
  - [ ] SubTask 4.7: 汉化 `AdvancedSettings.svelte`、`ExperimentalSettings.svelte`
  - [ ] SubTask 4.8: 汉化 `AgentProfiles.svelte`、`ProfileForm.svelte`
  - [ ] SubTask 4.9: 汉化 `GenerationParamsForm.svelte`、`ModelSelector.svelte`、`ProviderTypeSelector.svelte`
  - [ ] SubTask 4.10: 汉化 `FontSelector.svelte`、`HealthIndicator.svelte`、`ImageModelSelect.svelte`
  - [ ] SubTask 4.11: 汉化 `MainNarrative.svelte`、`TTSSettings.svelte`

- [ ] Task 5: 汉化故事相关组件
  - [ ] SubTask 5.1: 汉化 `StoryView.svelte`、`StoryEntry.svelte`、`StreamingEntry.svelte`
  - [ ] SubTask 5.2: 汉化 `ActionInput.svelte`、`ActionChoices.svelte`、`Suggestions.svelte`
  - [ ] SubTask 5.3: 汉化 `StoryCard.svelte`、`LibraryView.svelte`
  - [ ] SubTask 5.4: 汉化 `GrammarCheck.svelte`、`ReasoningBlock.svelte`
  - [ ] SubTask 5.5: 汉化 `GalleryTab.svelte`

- [ ] Task 6: 汉化知识库与记忆组件
  - [ ] SubTask 6.1: 汉化 `LorebookView.svelte`、`LorebookList.svelte`、`LorebookDetail.svelte`
  - [ ] SubTask 6.2: 汉化 `LorebookEntryCard.svelte`、`LorebookEntryForm.svelte`
  - [ ] SubTask 6.3: 汉化 `LorebookExportModal.svelte`、`LorebookImportModal.svelte`、`LorebookVaultImportModal.svelte`
  - [ ] SubTask 6.4: 汉化 `MemoryView.svelte`、`MemoryHeader.svelte`、`MemorySettings.svelte`
  - [ ] SubTask 6.5: 汉化 `ChapterCard.svelte`、`ChapterEntryList.svelte`、`ManualChapterModal.svelte`、`ResummarizeModal.svelte`

- [ ] Task 7: 汉化保险库与发现组件
  - [ ] SubTask 7.1: 汉化 `VaultPanel.svelte`、`VaultBrowser.svelte`、`VaultCard.svelte` 等 vault 组件
  - [ ] SubTask 7.2: 汉化 `VaultEntityEditPanel.svelte`、`VaultCharacterForm.svelte`、`VaultScenarioEditor.svelte`
  - [ ] SubTask 7.3: 汉化 `VaultLorebookEditor.svelte`、`VaultExportModal.svelte`、`VaultDiffView.svelte`
  - [ ] SubTask 7.4: 汉化 `VaultAssistantInput.svelte`、`InteractiveVaultAssistant.svelte`
  - [ ] SubTask 7.5: 汉化 prompts 子目录下的组件（PromptPackEditor、TemplateEditor 等）
  - [ ] SubTask 7.6: 汉化 `DiscoveryModal.svelte`、`DiscoveryCard.svelte`、`DiscoveryCardDetails.svelte`

- [ ] Task 8: 汉化其余组件
  - [ ] SubTask 8.1: 汉化 `BranchPanel.svelte`
  - [ ] SubTask 8.2: 汉化 `SyncModal.svelte`
  - [ ] SubTask 8.3: 汉化 `STChatImportModal.svelte`
  - [ ] SubTask 8.4: 汉化 debug 组件（`DebugLogModal.svelte`、`DebugLogView.svelte`、`LorebookDebugPanel.svelte`）
  - [ ] SubTask 8.5: 汉化 tags 组件（`TagBadge.svelte`、`TagInput.svelte`、`TagManager.svelte`）
  - [ ] SubTask 8.6: 汉化 world 组件（`CharacterPanel.svelte`、`InventoryPanel.svelte`）
  - [ ] SubTask 8.7: 汉化 `Toast.svelte`、`WritingStyleFields.svelte`
  - [ ] SubTask 8.8: 汉化 `empty-state.svelte` 等共享 UI 组件中的硬编码文本

- [ ] Task 9: 汉化服务层中的用户可见字符串
  - [ ] SubTask 9.1: 搜索并汉化 `src/lib/services/` 和 `src/lib/stores/` 中的 Toast 消息、错误提示、确认对话框文本
  - [ ] SubTask 9.2: 汉化 `ui.svelte.ts` 中的默认 Toast 消息

- [ ] Task 10: 验证与收尾
  - [ ] SubTask 10.1: 运行 `npm run check` 确保无类型错误
  - [ ] SubTask 10.2: 运行 `npm run lint` 确保无 lint 错误
  - [ ] SubTask 10.3: 运行 `npm run build` 确保构建成功
  - [ ] SubTask 10.4: 全面检查所有组件，确认无遗漏的硬编码英文文本

# Task Dependencies
- [Task 2-9] 依赖 [Task 1]（i18n 基础设施必须先就绪）
- [Task 10] 依赖 [Task 2-9]（所有汉化完成后才能验证）
- [Task 2-9] 之间可并行执行
