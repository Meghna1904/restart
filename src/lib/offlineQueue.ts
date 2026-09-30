import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { supabase } from './supabase'

interface OfflineQueueSchema extends DBSchema {
  queue: {
    key: number
    value: {
      id?: number
      table: string
      operation: 'insert' | 'update' | 'upsert'
      payload: Record<string, unknown>
      onConflict?: string
      timestamp: number
      retries: number
    }
    indexes: { 'by-timestamp': number }
  }
}

let db: IDBPDatabase<OfflineQueueSchema> | null = null

async function getDb() {
  if (!db) {
    db = await openDB<OfflineQueueSchema>('restart-offline', 1, {
      upgrade(database) {
        const store = database.createObjectStore('queue', {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('by-timestamp', 'timestamp')
      },
    })
  }
  return db
}

export async function queueOfflineAction(
  table: string,
  operation: 'insert' | 'update' | 'upsert',
  payload: Record<string, unknown>,
  options?: { onConflict?: string }
) {
  const database = await getDb()
  await database.add('queue', {
    table,
    operation,
    payload,
    onConflict: options?.onConflict,
    timestamp: Date.now(),
    retries: 0,
  })
}

export function isOfflineError(error: unknown) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true
  if (error instanceof TypeError) return true
  if (typeof error !== 'object' || error === null || !('message' in error)) return false
  return /network|fetch|offline/i.test(String(error.message))
}

export async function syncOfflineQueue() {
  const database = await getDb()
  const all = await database.getAllFromIndex('queue', 'by-timestamp')
  
  for (const item of all) {
    try {
      let error: unknown = null
      if (item.operation === 'insert') {
        ;({ error } = await supabase.from(item.table as never).insert(item.payload as never))
      } else if (item.operation === 'upsert') {
        ;({ error } = await supabase
          .from(item.table as never)
          .upsert(item.payload as never, item.onConflict ? { onConflict: item.onConflict } : undefined))
      } else if (item.operation === 'update' && item.payload.id) {
        ;({ error } = await supabase
          .from(item.table as never)
          .update(item.payload as never)
          .eq('id', item.payload.id as string))
      }
      
      if (!error && item.id !== undefined) {
        await database.delete('queue', item.id)
      } else if (item.id !== undefined) {
        await database.put('queue', { ...item, retries: item.retries + 1 })
      }
    } catch {
      // Leave in queue for next sync attempt
    }
  }
}

// Register sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineQueue()
  })
}
