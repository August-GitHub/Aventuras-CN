import { init, register, locale } from 'svelte-i18n'

// Register locales
register('en', () => import('$locales/en.json'))
register('zh-CN', () => import('$locales/zh-CN.json'))

// Initialize i18n
init({
  fallbackLocale: 'en',
  initialLocale: 'zh-CN',
})

export { locale }
