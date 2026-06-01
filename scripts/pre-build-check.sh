#!/bin/bash
# 构建前检查脚本：确保 lint / format / type-check 全部通过后再打 tag 推送
set -e

echo "========================================"
echo "  Pre-Build Check"
echo "========================================"

# 1. Prettier 格式检查
echo ""
echo "[1/3] Prettier format check..."
npx prettier --check "**/*.{svelte,ts,js,css,json,html,yml}" 2>/dev/null
echo "  ✓ Prettier passed"

# 2. ESLint 检查
echo ""
echo "[2/3] ESLint check..."
npx eslint . --quiet
echo "  ✓ ESLint passed"

# 3. Type-check
echo ""
echo "[3/3] Type-check..."
npm run check
echo "  ✓ Type-check passed"

echo ""
echo "========================================"
echo "  All checks passed! Ready to build."
echo "========================================"
