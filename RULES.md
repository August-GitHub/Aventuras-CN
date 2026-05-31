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

- `v{MAJOR}.{MINOR}.{PATCH}` 格式的 tag（如 `v1.2.0`）**仅作标记记录**
- 要触发构建，必须使用 `build-*` 或 `release-*` 前缀
- **单一真相源**：`VERSION` 文件是唯一版本号来源
  - 其他文件由 `npm run sync-version`（或 `node scripts/sync-version.js`）自动同步：
    - `package.json` → `"version"`
    - `src-tauri/tauri.conf.json` → `"version"`
    - `src-tauri/Cargo.toml` → `version = "..."`
  - CI 构建前会自动运行同步脚本，确保一致

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
