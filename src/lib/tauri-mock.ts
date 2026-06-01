// Stub for all @tauri-apps/* when running in web-only mode (npm run dev without Tauri)

const noop = (..._args: unknown[]) => Promise.resolve(null)
const noopSync = (..._args: unknown[]) => undefined

// @tauri-apps/api/core
export const invoke = (...args: unknown[]) => {
  console.log('[Tauri mock] invoke:', args)
  return Promise.resolve(null)
}

// @tauri-apps/plugin-sql
// In web-only mode (no Tauri backend) we persist all table data to localStorage
// so settings, preferences, and other state survive page refreshes.
// This lightweight SQL emulation handles the common query patterns used by the app.

type Row = Record<string, unknown>

const DB_KEY = 'aventura-web-db'

export default class Database {
  /** In-memory mirror of all table data; synced to localStorage on every write. */
  private tables: Record<string, Row[]> = {}

  static async load(): Promise<Database> {
    const db = new Database()
    try {
      const raw = localStorage.getItem(DB_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          db.tables = parsed as Record<string, Row[]>
        }
      }
    } catch {
      // Corrupted or absent — start fresh.
    }
    return db
  }

  private persist(): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.tables))
    } catch {
      console.warn('[WebDB] localStorage write failed (quota?); data may be lost on refresh')
    }
  }

  async select(query: string, params?: unknown[]): Promise<Row[]> {
    const tName = this._extractTable(query)
    if (!tName) return []

    const rows: Row[] = this.tables[tName] ?? []
    if (rows.length === 0) return []

    // Parse simple WHERE clause: col = ? [AND col2 = ? ...]
    const where = this._extractWhere(query)
    if (!where || !params || params.length === 0) {
      return rows.slice()
    }

    const conditions = where.split(/\s+AND\s+/i).map((c) => c.trim())

    return rows.filter((row) => {
      let pi = 0
      return conditions.every((cond) => {
        // col = ?
        let m = cond.match(/^(\w+)\s*=\s*\?$/)
        if (m && pi < params.length) {
          return row[m[1]] === params[pi++]
        }
        // col IS NULL / col IS NOT NULL
        m = cond.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i)
        if (m) {
          const isNotNull = !!m[2]
          const val = row[m[1]]
          return isNotNull ? val !== null && val !== undefined : val === null || val === undefined
        }
        // col != ?
        m = cond.match(/^(\w+)\s*!=\s*\?$/)
        if (m && pi < params.length) {
          return row[m[1]] !== params[pi++]
        }
        // col IN (?, ?, ...) — for simple single-value patterns
        m = cond.match(/^(\w+)\s+IN\s*\(([?,\s]+)\)$/i)
        if (m && pi < params.length) {
          const count = m[2].split(',').length
          const vals = params.slice(pi, pi + count)
          pi += count
          const rowVal = row[m[1]]
          // Handle string/array: if rowVal is JSON array, parse it
          if (typeof rowVal === 'string') {
            try {
              const arr = JSON.parse(rowVal)
              if (Array.isArray(arr)) {
                return vals.some((v) => arr.includes(v))
              }
            } catch {}
          }
          return vals.some((v) => String(rowVal) === String(v))
        }
        return true
      })
    })
  }

  async execute(query: string, params?: unknown[]): Promise<{ rowsAffected: number }> {
    const upper = query.trim().toUpperCase()
    const qt = query.trim()

    // ── CREATE TABLE ──
    if (upper.startsWith('CREATE TABLE')) {
      const m = qt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)
      if (m && !this.tables[m[1]]) {
        this.tables[m[1]] = []
        this.persist()
      }
      return { rowsAffected: 0 }
    }

    // ── PRAGMA / BEGIN / COMMIT / ROLLBACK (no-op) ──
    if (['PRAGMA', 'BEGIN', 'COMMIT', 'ROLLBACK'].some((p) => upper.startsWith(p))) {
      return { rowsAffected: 0 }
    }

    // ── INSERT OR REPLACE INTO table (cols) VALUES (vals) ──
    if (upper.startsWith('INSERT OR REPLACE')) {
      return this._handleInsertOrReplace(qt, params ?? [])
    }

    // ── INSERT INTO table (cols) VALUES (vals) [ON CONFLICT ...] ──
    if (upper.startsWith('INSERT INTO')) {
      return this._handleInsert(qt, params ?? [])
    }

    // ── DELETE FROM table WHERE ... ──
    if (upper.startsWith('DELETE FROM')) {
      return this._handleDelete(qt, params ?? [])
    }

    // ── UPDATE table SET ... WHERE ... ──
    if (upper.startsWith('UPDATE')) {
      return this._handleUpdate(qt, params ?? [])
    }

    // ── DROP TABLE ──
    if (upper.startsWith('DROP TABLE')) {
      const m = qt.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i)
      if (m) {
        delete this.tables[m[1]]
        this.persist()
      }
      return { rowsAffected: 0 }
    }

    // ── VACUUM INTO (export) — no-op in web mode ──
    if (upper.startsWith('VACUUM')) {
      return { rowsAffected: 0 }
    }

    console.warn('[WebDB] unhandled execute:', qt.substring(0, 100))
    return { rowsAffected: 0 }
  }

  async close(): Promise<void> {
    this.persist()
  }

  // ─── SQL helpers ────────────────────────────────────────────

  private _extractTable(query: string): string | null {
    // SELECT ... FROM / DELETE FROM / INSERT INTO
    let m = query.match(/FROM\s+(\w+)/i)
    if (m) return m[1]
    // UPDATE table
    m = query.match(/^UPDATE\s+(\w+)/i)
    if (m) return m[1]
    // INSERT INTO table
    m = query.match(/INTO\s+(\w+)/i)
    if (m) return m[1]
    return null
  }

  private _extractWhere(query: string): string | null {
    // Match WHERE clause up to ORDER BY / LIMIT / GROUP BY / end-of-string
    const m = query.match(/WHERE\s+(.+?)(?:\s+ORDER\s+|\s+LIMIT\s+|\s+GROUP\s+|\s*$)/is)
    return m ? m[1].trim() : null
  }

  private _parseColumnsAndValues(
    qt: string,
    prefix: string,
  ): { table: string; cols: string[] } | null {
    const m = qt.match(
      new RegExp(prefix.replace(/\s+/g, '\\s+') + '\\s+(\\w+)\\s*\\(([^)]+)\\)\\s*VALUES\\s*', 'i'),
    )
    if (!m) return null
    return { table: m[1], cols: m[2].split(',').map((c) => c.trim()) }
  }

  private _rowFromCols(cols: string[], params: unknown[]): Row {
    const row: Row = {}
    cols.forEach((c, i) => {
      row[c] = params[i] ?? null
    })
    return row
  }

  private _ensure(table: string): Row[] {
    if (!this.tables[table]) this.tables[table] = []
    return this.tables[table]
  }

  // ── Operation handlers ──────────────────────────────────────

  private _handleInsertOrReplace(qt: string, params: unknown[]): { rowsAffected: number } {
    const m = qt.match(/INSERT\s+OR\s+REPLACE\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i)

    if (!m) {
      // Try without VALUES — some INSERT OR REPLACE may use SELECT
      console.warn('[WebDB] unhandled INSERT OR REPLACE:', qt.substring(0, 80))
      return { rowsAffected: 0 }
    }

    const table = m[1]
    const cols = m[2].split(',').map((c) => c.trim())
    const row = this._rowFromCols(cols, params)

    const rows = this._ensure(table)

    // Replace by first-column primary key
    const pk = cols[0]
    const idx = rows.findIndex((r) => r[pk] === row[pk])
    if (idx >= 0) rows[idx] = row
    else rows.push(row)

    this.persist()
    return { rowsAffected: 1 }
  }

  private _handleInsert(qt: string, params: unknown[]): { rowsAffected: number } {
    // Multi-value INSERT: VALUES (?,?,...), (?,?,...), ...
    const m = qt.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s+(.+)/is)

    if (!m) {
      console.warn('[WebDB] unhandled INSERT:', qt.substring(0, 80))
      return { rowsAffected: 0 }
    }

    const table = m[1]
    const cols = m[2].split(',').map((c) => c.trim())
    const nCols = cols.length

    // Detect ON CONFLICT
    const hasConflict = /ON\s+CONFLICT/i.test(qt)

    // Split values into groups
    const valuesStr = m[3].replace(/\s+/g, ' ')
    const groups = valuesStr.split('),(').map((g) => g.replace(/[()]/g, '').trim())

    const rows = this._ensure(table)
    let affected = 0

    for (const _group of groups) {
      // Count ? in this group — but we already have flat params, so use nCols
      // Each group has nCols params
      const startIdx = affected * nCols
      const groupParams = params.slice(startIdx, startIdx + nCols)
      if (groupParams.length === 0) continue

      const row = this._rowFromCols(cols, groupParams)

      if (hasConflict) {
        // ON CONFLICT — upsert by first-column PK
        const pk = cols[0]
        const idx = rows.findIndex((r) => r[pk] === row[pk])
        if (idx >= 0) {
          // Merge: update all columns (simple DO UPDATE SET all)
          Object.assign(rows[idx], row)
        } else {
          rows.push(row)
        }
      } else {
        rows.push(row)
      }
      affected++
    }

    if (affected > 0) this.persist()
    return { rowsAffected: affected }
  }

  private _handleDelete(qt: string, params: unknown[]): { rowsAffected: number } {
    const tName = this._extractTable(qt)
    if (!tName) return { rowsAffected: 0 }

    const rows = this.tables[tName]
    if (!rows || rows.length === 0) return { rowsAffected: 0 }

    const where = this._extractWhere(qt)
    if (!where || params.length === 0) {
      // No WHERE clause — truncate table (dangerous but matches SQLite behavior)
      this.tables[tName] = []
      this.persist()
      return { rowsAffected: rows.length }
    }

    // Parse single condition: col = ?
    const m = where.match(/^(\w+)\s*=\s*\?$/)
    if (m && params.length > 0) {
      const col = m[1]
      const val = params[0]
      const before = rows.length
      this.tables[tName] = rows.filter((r) => {
        if (val === null) return r[col] !== null && r[col] !== undefined
        return r[col] !== val
      })
      const after = this.tables[tName].length
      if (before !== after) this.persist()
      return { rowsAffected: before - after }
    }

    // Complex WHERE (e.g. story_id = ? AND branch_id IS NULL)
    // The filter: a row is KEPT when !every(condMatch). So each condition
    // returns true when the row DOES match the delete criterion.
    const conditions = where.split(/\s+AND\s+/i).map((c) => c.trim())
    const before = rows.length
    this.tables[tName] = rows.filter((row) => {
      let pi = 0
      return !conditions.every((cond) => {
        let cm = cond.match(/^(\w+)\s*=\s*\?$/)
        if (cm && pi < params.length) {
          return row[cm[1]] === params[pi++]
        }
        cm = cond.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i)
        if (cm) {
          const notNull = !!cm[2]
          const v = row[cm[1]]
          if (notNull) return v !== null && v !== undefined
          return v === null || v === undefined
        }
        return false
      })
    })
    const after = this.tables[tName].length
    if (before !== after) this.persist()
    return { rowsAffected: before - after }
  }

  private _handleUpdate(qt: string, params: unknown[]): { rowsAffected: number } {
    const tName = this._extractTable(qt)
    if (!tName) return { rowsAffected: 0 }

    const rows = this.tables[tName]
    if (!rows || rows.length === 0) return { rowsAffected: 0 }

    // Extract SET clause and WHERE clause
    const m = qt.match(/UPDATE\s+\w+\s+SET\s+(.+?)\s+WHERE\s+(.+)/is)
    if (!m || params.length === 0) return { rowsAffected: 0 }

    const setClause = m[1].trim()
    const whereClause = m[2].trim()

    // Parse SET assignments: col = ?, col2 = ?, ...
    const setPairs = setClause.split(',').map((s) => s.trim())
    const setSpecs: { col: string; paramIdx: number }[] = []
    for (const pair of setPairs) {
      const sm = pair.match(/^(\w+)\s*=\s*\?$/)
      if (sm) setSpecs.push({ col: sm[1], paramIdx: setSpecs.length })
    }

    if (setSpecs.length === 0) return { rowsAffected: 0 }

    const setParamCount = setSpecs.length
    const whereParams = params.slice(setParamCount)

    // Parse WHERE condition
    const whereConds = whereClause.split(/\s+AND\s+/i).map((c) => c.trim())

    let affected = 0
    for (const row of rows) {
      let wpi = 0
      const matches = whereConds.every((cond) => {
        let cm = cond.match(/^(\w+)\s*=\s*\?$/)
        if (cm && wpi < whereParams.length) {
          return row[cm[1]] === whereParams[wpi++]
        }
        cm = cond.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i)
        if (cm) {
          const notNull = !!cm[2]
          const v = row[cm[1]]
          return notNull ? v !== null && v !== undefined : v === null || v === undefined
        }
        return false
      })

      if (matches) {
        for (const spec of setSpecs) {
          row[spec.col] = params[spec.paramIdx] ?? null
        }
        affected++
      }
    }

    if (affected > 0) this.persist()
    return { rowsAffected: affected }
  }
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
