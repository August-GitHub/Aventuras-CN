# 项目规则 (Project Rules)

> **本文件供 AI 助手（CodeBuddy / vibcode 等）自动读取并遵守。**
>
> **改动本项目时，必须遵循以下规则。**

---

## 分支策略

```
master       → 正式发布，只含稳定代码
beta         → 日常开发和测试
```

---

## Tag 规则

### ⚠️ 何时打 tag（重要）

**只应在以下情况才创建 tag 触发构建：**

| 场景 | 操作 | 示例 |
|------|------|------|
| 功能开发完成，需要测试 | 打 `build-*` tag | `build-1.3.4-beta` |
| 修复完成，验证通过后 | 打 `build-*` tag | `build-1.3.5-beta` |
| 正式发布 | 打 `release-*` tag | `release-1.4.0` |

**以下情况禁止打 tag：**

| 场景 | 正确操作 |
|------|----------|
| 代码格式化 / lint 修复 | 只 `git push` 到分支 |
| 小 bug 修复（还在开发中） | 只 `git push` 到分支 |
| 翻译补充（未完成全部） | 只 `git push` 到分支 |
| 任何非功能完成的改动 | 只 `git push` 到分支 |

> **核心原则：一个完整的开发周期只打一次 build tag。**  
> 开发过程中频繁 push 代码到分支即可，等所有问题修完、lint 通过、确认可以测试时，再统一打 **一个** tag。  
> 避免无意义地触发 CI 构建，浪费资源。

### 开发构建 (build-*)

触发 CI 构建，生成 APK 供测试安装。

**格式：`build-{版本号}-{分支名的最后一段}`**

规则：取当前分支名的最后一段作为 tag 标识。`/` 替换为 `-`。

| 当前分支 | 自动生成 Tag |
|----------|-------------|
| `beta` | `build-1.4.0-beta` |
| `develop` | `build-1.4.0-dev` |
| `master` | `build-1.4.0-master` |
| `feature/new-ui` | `build-1.4.0-new-ui` |
| `experiment/dark-theme` | `build-1.4.0-dark-theme` |
| `hotfix/crash` | `build-1.4.0-crash` |

> ⚠️ **Tag 的第二段从当前分支名自动派生**，不要随意起名（如 test、chinese 等），避免误导。

### 正式发布 (release-*)

触发 CI 正式发布。

| 场景 | Tag 格式 |
|------|----------|
| 正式发布 | `release-{版本号}` |

示例：
```
release-1.4.0
release-2.0.0
```

---

## 版本号规则

> **⚠️⚠️⚠️ 最高优先级规则 — 违反此规则将直接导致 APK 版本号显示错误 ⚠️⚠️⚠️**

### ❌ 绝对禁止的操作

| 禁止行为 | 后果 | 正确做法 |
|----------|------|----------|
| 手动编辑 `package.json` 的 `version` 字段 | 与 VERSION 不同步，APK 显示错误版本 | 用 `npm run sync-version` |
| 手动编辑 `tauri.conf.json` 的 `version` 字段 | APK 显示旧版本号（如 1.3.4 tag 打出 1.3.3 的 APK） | 用 `npm run sync-version` |
| 手动编辑 `Cargo.toml` 的 `version` 字段 | Rust 层版本不一致 | 用 `npm run sync-version` |
| 不验证就打 tag | 用户下载的 APK 版本号与 tag 不符 | 打 tag 前**必须**运行验证命令 |

### ✅ 唯一正确的版本号变更流程

```
步骤 1: 编辑 VERSION 文件（唯一真相源）
        echo "1.3.6" > VERSION

步骤 2: 运行同步脚本
        npm run sync-version

步骤 3: 验证 4 个文件全部一致（必须执行！）
        npm run sync-version -- --check

步骤 4: git commit + git push（只 push 代码，不打 tag）

步骤 5: 所有问题修完后，才打 build tag 触发构建
        git tag build-1.3.6-beta && git push origin build-1.3.6-beta
```

### 单一真相源

- **`VERSION` 文件是唯一版本号来源**，绝对不可手动修改其他 3 个文件
- 其他文件由 `npm run sync-version`（或 `node scripts/sync-version.js`）自动同步：
  - `package.json` → `"version"`
  - `src-tauri/tauri.conf.json` → `"version"` （⚠️ 此文件控制 APP 显示版本号）
  - `src-tauri/Cargo.toml` → `version = "..."`
- CI 构建前会自动运行同步脚本，确保一致

### 🔒 打 tag 前强制验证

**每次创建 `build-*` 或 `release-*` tag 前，必须先执行：**

```bash
npm run sync-version -- --check
```

该命令会检查 4 个文件版本号是否完全一致。如果不一致，会报错并退出，**禁止在不一致的情况下打 tag**。

### 版本号递增规则

每次打 tag 前，先检查当前 VERSION 文件和已有 tag 的最高版本号，新版本号 **不得低于** 两者中的最大值。

根据修改幅度决定递增哪一位：

| 类型 | 命令 | 适用场景 |
|------|------|----------|
| PATCH | `npm run sync-version patch` (x.y.Z+1) | 小修复：修 bug、改文案、调整样式 |
| MINOR | `npm run sync-version minor` (x.Y+1.0) | 新功能、翻译对齐、中等改动 |
| MAJOR | `npm run sync-version major` (X+1.0.0) | 破坏性变更、架构重构 |

禁止随意跳跃版本号（如从 1.2.0 突然跳到 9.9），保持节制递增。

---

## CI 构建触发规则

所有构建均由 `build.yml` 统一处理，根据 tag 前缀自动区分：

| Tag 前缀 | prerelease | 用途 |
|----------|------------|------|
| `build-*` | ✅ `true` | 开发测试构建 |
| `release-*` | `false` | 正式发布 |
| `v*` | ❌ 不触发 CI | 仅作标记记录 |

---

## APK 命名

构建产物自动命名为：`aventuras-{分支名}-{tag}.apk`

例如在 `feature/new-ui` 分支打 `build-1.4.0-new-ui` tag：
→ 生成 `aventuras-feature/new-ui-build-1.4.0-new-ui.apk`

---

## 注意事项

1. 不要对非 `build-*` / `release-*` 的 tag 做 `git push --tags`，避免推送历史遗留的 `v*` 标签
2. 版本号记录在 `VERSION` 文件中
3. 推送 tag 时请同时推送代码：先 `git push` 再 `git push origin <tagname>`
