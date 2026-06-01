// Stub for all @tauri-apps/* when running in web-only mode (npm run dev without Tauri)

const noop = (..._args: unknown[]) => Promise.resolve(null)
const noopSync = (..._args: unknown[]) => undefined

// @tauri-apps/api/core
export const invoke = (...args: unknown[]) => {
  console.log('[Tauri mock] invoke:', args)
  return Promise.resolve(null)
}

// @tauri-apps/plugin-sql
export default class Database {
  static async load() {
    return new Database()
  }
  async select() {
    return []
  }
  async execute() {
    return { rowsAffected: 0 }
  }
  async close() {}
}

// @tauri-apps/plugin-dialog
export const save = noop
export const open = noop
export const message = noop
export const ask = noop
export const confirm = noop

// @tauri-apps/plugin-fs
export const writeTextFile = noop
export const readTextFile = () => Promise.resolve('')
export const writeFile = noop
export const readFile = () => Promise.resolve(new Uint8Array())
export const mkdir = noop
export const remove = noop
export const exists = () => Promise.resolve(false)
export const readDir = () => Promise.resolve([])

// @tauri-apps/plugin-http
export const fetch = (url: string, init?: RequestInit) => globalThis.fetch(url, init)

// @tauri-apps/api/path
export const appDataDir = () => Promise.resolve('/mock/')
export const appLocalDataDir = () => Promise.resolve('/mock/')
export const documentDir = () => Promise.resolve('/mock/')
export const downloadDir = () => Promise.resolve('/mock/')
export const homeDir = () => Promise.resolve('/mock/')
export const resolve = (...args: string[]) => Promise.resolve(args.join('/'))
export const join = (...args: string[]) => Promise.resolve(args.join('/'))

// @tauri-apps/api/app
export const getVersion = () => Promise.resolve('0.0.0')
export const getName = () => Promise.resolve('Aventuras')

// @tauri-apps/api/event
export const emit = noop
export const listen = (...args: unknown[]) => {
  console.log('[Tauri mock] listen:', args)
  return Promise.resolve(noopSync)
}

// @tauri-apps/api/webviewWindow
export const WebviewWindow = {
  getByLabel: () => null,
  create: () => null,
}

// @tauri-apps/plugin-updater
export const check = () => Promise.resolve(null)

// @tauri-apps/plugin-process
export const exit = (code?: number) => console.log('[Tauri mock] exit:', code)
export const relaunch = () => Promise.resolve()

// @tauri-apps/plugin-notification
export const sendNotification = noop
export const requestPermission = () => Promise.resolve('granted')
export const isPermissionGranted = () => Promise.resolve(true)

// Types
export type UnlistenFn = () => void
