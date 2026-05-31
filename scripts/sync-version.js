#!/usr/bin/env node
/**
 * sync-version.js
 * 以 VERSION 文件为单一真相源，同步版本号到所有其他位置。
 *
 * 用法:
 *   node scripts/sync-version.js          # 同步当前 VERSION 的值（只读检查/修复不一致）
 *   node scripts/sync-version.js 1.2.5    # 先更新 VERSION 再同步全部
 *   node scripts/sync-version.js patch    # 自动递增 PATCH 位
 *   node scripts/sync-version.js minor    # 自动递增 MINOR 位
 *   node scripts/sync-version.js major    # 自动递增 MAJOR 位
 *
 * CI 中使用: 在构建前运行，确保所有文件版本一致。
 */

import fs from 'fs'
import path from 'path'

const rootDir = process.cwd()

// ---- helpers ----

function readVersion() {
  return fs.readFileSync(path.join(rootDir, 'VERSION'), 'utf8').trim()
}

function writeVersion(v) {
  // strip leading v if present
  const clean = v.replace(/^v/, '')
  fs.writeFileSync(path.join(rootDir, 'VERSION'), clean + '\n')
}

function bump(version, type) {
  const [major, minor, patch] = version.split('.').map(Number)
  switch (type) {
    case 'major': return `${major + 1}.0.0`
    case 'minor': return `${major}.${minor + 1}.0`
    case 'patch': return `${major}.${minor}.${patch + 1}`
    default: return version
  }
}

// ---- targets ----

const targets = [
  {
    name: 'package.json',
    path: path.join(rootDir, 'package.json'),
    get: () => JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version,
    set: (v) => {
      const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
      pkg.version = v
      fs.writeFileSync(path.join(rootDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
    },
  },
  {
    name: 'tauri.conf.json',
    path: path.join(rootDir, 'src-tauri/tauri.conf.json'),
    get: () => JSON.parse(fs.readFileSync(path.join(rootDir, 'src-tauri/tauri.conf.json'), 'utf8')).version,
    set: (v) => {
      const conf = JSON.parse(fs.readFileSync(path.join(rootDir, 'src-tauri/tauri.conf.json'), 'utf8'))
      conf.version = v
      fs.writeFileSync(path.join(rootDir, 'src-tauri/tauri.conf.json'), JSON.stringify(conf, null, 2) + '\n')
    },
  },
  {
    name: 'Cargo.toml',
    path: path.join(rootDir, 'src-tauri/Cargo.toml'),
    get: () => {
      const content = fs.readFileSync(path.join(rootDir, 'src-tauri/Cargo.toml'), 'utf8')
      const m = content.match(/^version\s*=\s*"(.*)"/m)
      return m ? m[1] : '?'
    },
    set: (v) => {
      let content = fs.readFileSync(path.join(rootDir, 'src-tauri/Cargo.toml'), 'utf8')
      content = content.replace(/^version\s*=\s*".*"/m, `version = "${v}"`)
      fs.writeFileSync(path.join(rootDir, 'src-tauri/Cargo.toml'), content)
    },
  },
]

// ---- main ----

let version = readVersion()
const arg = process.argv[2]

if (arg && ['major', 'minor', 'patch'].includes(arg)) {
  version = bump(version, arg)
} else if (arg && !arg.startsWith('v') && /^\d+\.\d+\.\d+$/.test(arg)) {
  // Direct version string like "1.2.5"
  version = arg
} else if (arg?.startsWith('v')) {
  version = arg.slice(1)
}

writeVersion(version)

console.log(`\n📌 版本号统一为 ${version}`)
console.log('─'.repeat(36))
console.log(`  文件                          状态`)
console.log('─'.repeat(36))

let changed = false
for (const target of targets) {
  const current = target.get()
  if (current !== version) {
    console.log(`  ${target.name.padEnd(28)} ${current} → ${version}`)
    target.set(version)
    changed = true
  } else {
    console.log(`  ${target.name.padEnd(28)} ✅ ${version}`)
  }
}

console.log('─'.repeat(36))

if (!changed) {
  console.log('✅ 所有文件版本已一致，无需修改。')
} else {
  console.log(`⚠️  已修改 ${targets.filter(t => t.get() === version).length} 个文件。请 git commit 提交更改。`)
}
