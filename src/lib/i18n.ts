import { init, register, locale } from 'svelte-i18n'
import en from '$locales/en.json'
import zhCN from '$locales/zh-CN.json'

// Register locales with pre-loaded messages (avoids race condition)
register('en', () => Promise.resolve(en))
register('zh-CN', () => Promise.resolve(zhCN))

// Initialize i18n — initialLocale triggers immediate locale resolution
init({
  fallbackLocale: 'en',
  initialLocale: 'zh-CN',
})

export { locale }
