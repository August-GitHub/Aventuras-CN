# Aventuras

## 概述

Aventuras 是一款桌面和移动端互动小说应用，提供多种故事模式（冒险模式、创意写作模式），通过主要提供商实现深度 AI 集成，拥有先进的记忆系统、动态知识书和自主知识管理代理。该应用提供一套强大的写作工具和世界追踪功能，确保 AI 生成的叙事具有上下文丰富性和连贯性。

## 功能

### 故事模式

- **冒险模式** - 带有多选项行动和世界追踪的互动小说
- **创意写作模式** - 带有 AI 生成建议的自由形式协作写作
- **视角选项** - 第一、第二或第三人称视角
- **时态控制** - 过去或现在时态叙事风格

### AI 集成

- 使用任何 OpenAI 兼容的网关或提供商，如 OpenRouter、NanoGPT、llama.cpp、LM Studio 等
- 实时文本生成的流式响应
- 可配置的模型、温度和令牌限制
- 支持可配置努力级别的扩展思考/推理
- 用于保存多个配置的 API 配置文件

### 记忆系统

- 自动章节摘要以管理上下文窗口
- 可配置的令牌阈值和章节缓冲区
- 手动章节创建和重新摘要
- AI 驱动的记忆检索，用于相关过去事件
- 章节元数据追踪（关键词、角色、地点、情节线索）
- 每章的故事内时间追踪

### 知识书

- 用于角色、地点、物品、派系、概念和事件的统一条目系统
- 动态状态追踪（关系、库存、发现）
- 基于关键词和相关性的上下文注入
- 隐藏信息和秘密系统
- 灵活条目引用的别名
- 导入/导出支持（JSON、YAML、SillyTavern 格式）
- SillyTavern 角色卡导入（V1/V2 JSON 和 PNG）
- AI 辅助的自主知识管理代理

### 写作工具

- 由 Harper.js（WebAssembly）驱动的本地语法检查
- AI 驱动的风格分析，用于检测重复的单词和短语
- 与玩家写作风格匹配的行动建议
- 会话间的持久行动建议

### 世界追踪

- 带有肖像支持的角色关系和 disposition
- 自动发现的地点访问和变化
- 带有装备追踪的库存管理
- 任务/故事节拍进展（里程碑、启示、情节点）
- 故事内时间追踪（年、日、时、分）
- 所有世界元素的可折叠 UI 卡片

### 模板

- 内置类型模板（奇幻、科幻、悬疑、恐怖、日常生活）
- 带有系统提示的自定义模板创建
- 初始状态配置（主角、地点、物品）
- 开场场景文本支持

### 图像生成

- 在故事条目中嵌入图像生成
- AI 驱动的可成像场景检测
- NanoGPT 提供商集成
- 角色肖像支持以保持视觉一致性
- 可配置的图像大小（512x512 或 1024x1024）

### 保存和恢复

- 带有完整状态快照的命名检查点
- 撤销操作和生成替代方案的重试系统
- 重试时保留角色和时间状态

### 网络同步

- 设备之间的本地网络同步
- 二维码连接便于配对
- 设备之间的推拉故事
- 用于共享故事的服务器模式

### UI 定制

- 多种主题（深色、浅色、浅色日光、复古控制台、falling down）
- 自定义字体选择（系统或 Google 字体）
- 可调整的文本大小（小、中、大）
- 字数统计显示切换

### 跨平台

- 桌面端（Windows、macOS、Linux）
- Android（APK）
- iOS（计划中）

## 安装

### 下载预构建的二进制文件

预编译的二进制文件可在 [Releases](https://github.com/AventurasTeam/Aventuras/releases) 页面获取：

| 平台 | 下载 |
| ---- | ---- |
| Windows | `aventuras_x.x.x_x64-setup.exe` |
| macOS | `aventuras_x.x.x_x64.dmg` |
| Linux | `aventuras_x.x.x_amd64.deb` / `.AppImage` |
| Android | `aventuras-release.apk` |

## 技术栈

- **语言**: TypeScript（严格模式）
- **前端框架**: SvelteKit 2
- **状态管理**: Svelte 5 runes (`$state`, `$derived`, `$props`)
- **后端框架**: Tauri 2（通过 Rust 实现桌面/Android）
- **样式**: Tailwind CSS, shadcn-svelte
- **数据库**: SQLite（通过 `@tauri-apps/plugin-sql`）
- **AI**: OpenAI 兼容 API（OpenRouter, AI SDK），通过 Harper.js（WASM）实现本地 NLP
- **包管理器**: npm

## 开发

### 要求

- Node.js 18+
- Rust（最新稳定版）
-（可选）Android SDK、NDK、Java 17+ 用于 Android 构建

### 设置和运行命令

```bash
# 克隆仓库
git clone https://github.com/AventurasTeam/Aventuras.git
cd aventuras

# 安装依赖
npm install

# 启动 Tauri 开发窗口（桌面）
# 所有 Svelte/TypeScript 代码更改都支持热重载
npx tauri dev
```

### 脚本

可用的 `npm run` 脚本：

- `build`: 生产构建
- `check`: 运行 `svelte-check`（类型检查）
- `check:watch`: 监视模式类型检查
- `tauri`: Tauri CLI 命令
- `release`: 运行发布脚本（`node scripts/release.js`）
- `lint`: 运行 ESLint
- `lint:fix`: 修复 ESLint 问题
- `format`: 使用 Prettier 格式化代码

### 测试

**当前状态**: 目前没有配置测试套件。

- TODO: 添加测试框架（例如 Vitest/Playwright）并配置测试。

### 环境变量

- TODO: 记录任何必需或可选的环境变量（例如特定的构建或部署变量）。
- **API 密钥**: 主要通过 UI 配置（设置 -> API 设置）。

### 项目结构

```text
aventuras/
├── src/                  # SvelteKit 前端源代码
│   ├── routes/           # SvelteKit 页面 (+page.svelte, +layout.svelte)
│   ├── lib/              # 共享应用逻辑和组件
│   │   ├── components/   # UI 组件 (PascalCase.svelte)
│   │   ├── services/     # 业务逻辑类/模块（AI、DB 等）
│   │   ├── stores/       # Svelte 存储 (*.svelte.ts for runes)
│   │   ├── types/        # TypeScript 类型
│   │   └── utils/        # 实用函数
├── src-tauri/            # Rust 后端
│   ├── gen/android/      # Android 脚手架文件（请勿覆盖）
│   ├── src/              # Rust 源代码
│   ├── Cargo.toml        # Rust 依赖
│   └── tauri.conf.json   # Tauri 配置
├── static/               # 静态 Web 资产
├── scripts/              # 构建和实用脚本
├── package.json          # Node 依赖和脚本
```

### 构建发布二进制文件

<details>
<summary>点击展开构建说明</summary>

#### 构建桌面端

```bash
npx tauri build
```

#### 构建 Android

**重要**: Android 项目脚手架（`src-tauri/gen/android/`）已在 git 中追踪。
**请勿运行 `npx tauri android init`**，因为它会覆盖自定义设置。

```bash
# 开发构建 + 部署到设备/模拟器
npx tauri android dev

# 发布构建（未签名 APK）
npx tauri android build
```

未签名的 APK 将位于：

```text
src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk
```

#### 签名 APK

```bash
# 创建密钥库（仅第一次）
keytool -genkey -v -keystore release.keystore -alias myalias -keyalg RSA -keysize 2048 -validity 10000

# 对齐 APK
zipalign -v 4 app-universal-release-unsigned.apk app-aligned.apk

# 签名 APK
apksigner sign --ks release.keystore --ks-key-alias myalias --out app-release.apk app-aligned.apk
```

</details>

## 鸣谢

- [Tauri](https://tauri.app/) - 桌面/移动应用框架
- [SvelteKit](https://kit.svelte.dev/) - 前端框架
- [OpenRouter](https://openrouter.ai/) - LLM API 聚合器
- [Harper](https://writewithharper.com/) - 语法检查
- [Lucide](https://lucide.dev/) - 图标库

## 许可证

AGPL-3.0

---

[English](README-en.md) | **简体中文**
