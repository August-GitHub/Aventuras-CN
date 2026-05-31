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

### 开发构建 (build-*)

触发 CI 构建，生成 APK 供测试安装。

**格式：`build-{版本号}-{分支名}`**

| 当前分支 | Tag 示例 |
|----------|----------|
| `beta` | `build-1.4.0-beta` |
| `develop` | `build-1.4.0-dev` |
| `master` | `build-1.4.0-master` |
| `experiment/xxx` | `build-1.4.0-experiment-xxx` |

> ⚠️ **Tag 的第二段必须匹配当前分支名**，不要随意起名（如 test、chinese 等），避免误导。

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

- `v{MAJOR}.{MINOR}.{PATCH}` 格式的 tag（如 `v1.4.0-test-chinese`）**仅作记录，不会触发 CI 构建**
- 要触发构建，必须使用 `build-*` 或 `release-*` 前缀

---

## CI 构建触发规则

| Tag 前缀 | 触发 | 用途 |
|----------|------|------|
| `build-*` | ✅ | 开发测试构建 |
| `release-*` | ✅ | 正式发布 |
| `v*` | ❌ | 不会触发 CI |

---

## APK 命名

构建产物自动命名为：`aventuras-{分支名}-{tag}.apk`

例如在 `beta` 分支打 `build-1.4.0-beta` tag：
→ 生成 `aventuras-beta-build-1.4.0-beta.apk`

---

## 注意事项

1. 不要对非 `build-*` / `release-*` 的 tag 做 `git push --tags`，避免推送历史遗留的 `v*` 标签
2. 版本号记录在 `VERSION` 文件中
3. 推送 tag 时请同时推送代码：先 `git push` 再 `git push origin <tagname>`
