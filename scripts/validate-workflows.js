import fs from 'fs'
import path from 'path'

/**
 * 校验 GitHub Actions workflow YAML 文件的基本语法。
 * 在 pre-push 阶段自动运行，拦截常见的 CI 配置错误。
 */

const files = process.argv.slice(2).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
if (files.length === 0) process.exit(0)

let hasError = false

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  const errors = []

  // Check 1: Unbalanced ${{ }} expressions
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const opens = (line.match(/\$\{\{/g) || []).length
    const closes = (line.match(/\}\}/g) || []).length
    if (opens !== closes) {
      errors.push(`  L${i + 1}: ${{}} 表达式未闭合 (${opens} 个 {{, ${closes} 个 }})`)
    }
  }

  // Check 2: Single quotes in boolean expressions (common escaping issue)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Only flag when there's a boolean expression containing single-quoted string literals
    // Pattern: ${{ ... && '...' ... || '...' ... }}
    if (/\$\{\{.*(&&|\|\|).*'.*'.*\}\}/.test(line)) {
      const match = line.match(/\$\{\{[^}]*\}\}/g)
      if (match) {
        for (const m of match) {
          if (/(&&|\|\|).*'.*'/.test(m)) {
            errors.push(
              `  L${i + 1}: 布尔表达式内含单引号字符串可能导致转义错误 → ${m.slice(0, 60)}...\n     建议改用 steps.outputs 输出变量替代。`,
            )
          }
        }
      }
    }
  }

  // Check 3: Basic YAML indentation (no tabs)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('\t')) {
      errors.push(`  L${i + 1}: 使用了 Tab 缩进，GitHub Actions 要求空格缩进`)
    }
  }

  // Check 4: Missing 'name' key at top level (warning only)
  if (!content.match(/^name:\s*\S/m)) {
    errors.push(`  (warning) workflow 缺少 name 字段`)
  }

  if (errors.length > 0) {
    hasError = true
    console.error(`\n❌ ${path.basename(file)}`)
    errors.forEach((e) => console.error(e))
  } else {
    console.log(`✅ ${path.basename(file)}`)
  }
}

if (hasError) {
  console.error('\n请修复以上错误后再推送。')
  process.exit(1)
}
