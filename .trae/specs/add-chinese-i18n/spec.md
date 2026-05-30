# Aventuras 中文国际化 (i18n) Spec

## Why
Aventuras 项目当前所有 UI 文本均为硬编码英文，需要引入国际化框架并完成中文汉化，使中文用户可以无障碍使用。第一阶段仅支持中文，但框架设计需为未来多语言扩展预留能力。

## 翻译原则
- 所有中文翻译由**大模型（LLM）直接完成**，不使用通用机器翻译 API，确保翻译质量和上下文准确性
- 专业术语统一翻译为标准中文
- 约定俗成的技术术语保留英文不翻译（如 Token、API、LLM、Prompt、Lorebook、Vault、Markdown、URL 等）
- **只改动 UI 文字**，不改变项目运行逻辑，汉化后项目行为与原项目一致

## What Changes
- 从 `master` 分支创建 `beta` 分支，所有改造在 `beta` 分支进行
- 引入 `svelte-i18n` 作为国际化框架，适配 SvelteKit + Svelte 5 项目
- 创建中文翻译文件（`zh-CN.json`），按 `svelte-i18n` 规范存放于 `src/locales/` 目录
- 将所有 UI 层面的硬编码英文文本替换为 i18n 翻译键调用
- 约定俗成的技术术语保留英文不翻译（如 Token、API、LLM、Prompt、Lorebook 等）
- 修改 `app.html` 的 `lang` 属性为 `zh-CN`

## 不做的事
- **不添加语言切换 UI** — 当前阶段仅支持中文，不需要在设置中添加语言选择器
- **不修改任何业务逻辑** — 只替换 UI 文本，不改变功能行为
- **不重构组件结构** — 仅将硬编码字符串替换为 i18n 调用，不改变组件架构

## Impact
- Affected specs: UI 显示层
- Affected code: `src/lib/components/` 下所有 Svelte 组件（约 40+ 个）、`src/app.html`、`src/lib/services/` 和 `src/lib/stores/` 中含用户可见字符串的文件

## ADDED Requirements

### Requirement: i18n 基础设施
系统 SHALL 引入 `svelte-i18n` 库并在应用启动时初始化，默认语言设为 `zh-CN`。

#### Scenario: 应用启动加载中文
- **WHEN** 用户启动应用
- **THEN** 界面默认以中文显示所有 UI 文本

#### Scenario: 翻译键缺失回退
- **WHEN** 某个翻译键在 `zh-CN.json` 中不存在
- **THEN** 回退显示英文原文，不显示空白或错误

### Requirement: 翻译文件组织
系统 SHALL 在 `src/locales/` 目录下按 `svelte-i18n` 框架规范存放翻译文件，每个语言一个 JSON 文件。

#### Scenario: 翻译文件结构
- **WHEN** 查看 `src/locales/` 目录
- **THEN** 存在 `zh-CN.json`（中文翻译）和 `en.json`（英文原文）文件
- **AND** 翻译键按功能模块分组（如 `settings.*`、`story.*`、`lorebook.*` 等）

### Requirement: UI 文本汉化
系统 SHALL 将所有用户可见的 UI 文本汉化为中文，包括但不限于：按钮标签、菜单项、标题、描述文本、占位符、提示信息、错误消息、确认对话框文本。所有翻译由大模型完成，不使用通用机器翻译。

#### Scenario: 按钮/菜单汉化
- **WHEN** 用户查看任意界面
- **THEN** 所有按钮、菜单项、标签均显示中文

#### Scenario: 技术术语保留
- **WHEN** 遇到约定俗成的技术术语
- **THEN** 保留英文原文不翻译，包括：Token、API、LLM、Prompt、Lorebook、Vault、Markdown、URL 等

#### Scenario: Toast 提示汉化
- **WHEN** 系统显示 Toast 提示消息
- **THEN** 提示文本以中文显示

### Requirement: 仅改文字不改逻辑
汉化改造 SHALL 仅替换 UI 显示文本，不修改任何业务逻辑、数据流、组件交互行为。汉化后项目的运行逻辑与原项目完全一致。

#### Scenario: 功能行为不变
- **WHEN** 用户在汉化后的应用中执行任意操作
- **THEN** 操作结果与原英文版完全一致，仅界面语言不同

### Requirement: beta 分支
系统 SHALL 在 `master` 分支基础上创建 `beta` 分支，所有国际化改造工作在 `beta` 分支上进行。

#### Scenario: 分支创建
- **WHEN** 开始国际化改造
- **THEN** 从 `master` 分支创建 `beta` 分支并切换到该分支

## MODIFIED Requirements

### Requirement: app.html 语言声明
`src/app.html` 中 `<html>` 标签的 `lang` 属性 SHALL 从 `en` 改为 `zh-CN`，以正确声明页面语言。

## REMOVED Requirements

### Requirement: 界面语言设置
**Reason**: 当前阶段仅支持中文，不需要语言切换 UI，保持改动最小化
**Migration**: 未来如需多语言支持，可在设置中添加语言选择器
