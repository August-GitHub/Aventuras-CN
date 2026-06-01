import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const host = process.env.TAURI_DEV_HOST

// When running without Tauri (npm run dev), mock all @tauri-apps imports
// so the frontend can render for translation/ui checks.
const mockPath = path.resolve(__dirname, 'src/lib/tauri-mock.ts')

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [tailwindcss(), sveltekit()],
  resolve: host
    ? undefined
    : {
        alias: [
          { find: /^@tauri-apps\/api\/core$/, replacement: mockPath },
          { find: /^@tauri-apps\/plugin-sql$/, replacement: mockPath },
          { find: /^@tauri-apps\/plugin-dialog$/, replacement: mockPath },
          { find: /^@tauri-apps\/plugin-fs$/, replacement: mockPath },
          { find: /^@tauri-apps\/plugin-http$/, replacement: mockPath },
          { find: /^@tauri-apps\/api\/path$/, replacement: mockPath },
          { find: /^@tauri-apps\/api\/app$/, replacement: mockPath },
          { find: /^@tauri-apps\/api\/event$/, replacement: mockPath },
          { find: /^@tauri-apps\/api\/webviewWindow$/, replacement: mockPath },
          { find: /^@tauri-apps\/plugin-updater$/, replacement: mockPath },
          { find: /^@tauri-apps\/plugin-process$/, replacement: mockPath },
          { find: /^@tauri-apps\/plugin-notification$/, replacement: mockPath },
        ],
      },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}))
