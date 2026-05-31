const fs = require('fs');
const { execSync } = require('child_process');

const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const zh = JSON.parse(fs.readFileSync('src/locales/zh-CN.json', 'utf8'));

function getValue(obj, keyPath) {
  return keyPath.split('.').reduce((curr, part) => {
    if (curr === undefined || curr === null || typeof curr !== 'object') return undefined;
    return curr[part];
  }, obj);
}

// Extract all $_() calls from source
const raw = execSync(
  `grep -roh "\\$_[^)]*)" src/ --include='*.svelte' --include='*.ts' 2>/dev/null`,
  { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
);

const keys = new Set();
const lines = raw.split('\n').filter(Boolean);
for (const line of lines) {
  // Match $_('key') or $_("key")
  let m = line.match(/\$_\('([^']+)'\)/);
  if (!m) m = line.match(/\$_\"([^\"]+)\"\)/);
  if (m) keys.add(m[1]);
}

const sorted = [...keys].sort();

const missingBoth = [];
const missingZh = [];
const missingEn = [];

for (const k of sorted) {
  const ev = getValue(en, k);
  const zv = getValue(zh, k);
  if (ev === undefined && zv === undefined) missingBoth.push(k);
  else if (ev !== undefined && zv === undefined) missingZh.push(k);
  else if (ev === undefined && zv !== undefined) missingEn.push(k);
}

console.log(`源码中使用的唯一 i18n key: ${sorted.length} 个`);
console.log('');

if (missingBoth.length > 0) {
  console.log(`🔴 完全缺失 (en + zh 都没有): ${missingBoth.length} 个`);
  missingBoth.forEach(k => console.log(`   ${k}`));
  console.log('');
}
if (missingZh.length > 0) {
  console.log(`🟡 仅缺中文: ${missingZh.length} 个`);
  missingZh.forEach(k => console.log(`   ${k}`));
  console.log('');
}
if (missingEn.length > 0) {
  console.log(`🟠 仅缺英文: ${missingEn.length} 个`);
  missingEn.forEach(k => console.log(`   ${k}`));
  console.log('');
}

if (missingBoth.length === 0 && missingZh.length === 0 && missingEn.length === 0) {
  console.log('✅ 所有翻译 key 完整！');
} else {
  process.exit(1);
}
