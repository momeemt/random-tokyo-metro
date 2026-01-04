export interface GameRecord {
  id?: number
  name: string
  createdAt: number
  startStation: string
}

export interface HistoryRecord {
  id?: number
  gameId: number
  timestamp: number
  fromStation: string
  toStation: string
  lineName: string
  lineCode: string
  route: string[] // 経路（駅名の配列）
}

const DB_NAME = 'RandomTokyoMetroDB'
const DB_VERSION = 2
const GAMES_STORE = 'games'
const HISTORY_STORE = 'history'

let db: IDBDatabase | null = null

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // 古いhistoryストアを削除（スキーマ変更のため）
      if (database.objectStoreNames.contains('history')) {
        database.deleteObjectStore('history')
      }

      // gamesストア
      if (!database.objectStoreNames.contains(GAMES_STORE)) {
        const gamesStore = database.createObjectStore(GAMES_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        })
        gamesStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // historyストア
      if (!database.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = database.createObjectStore(HISTORY_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        })
        historyStore.createIndex('gameId', 'gameId', { unique: false })
        historyStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

function formatGameName(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${d} ${h}:${min}`
}

export async function createGame(startStation: string): Promise<number> {
  const database = await openDB()
  const now = Date.now()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GAMES_STORE], 'readwrite')
    const store = transaction.objectStore(GAMES_STORE)
    const record: Omit<GameRecord, 'id'> = {
      name: formatGameName(new Date(now)),
      createdAt: now,
      startStation,
    }
    const request = store.add(record)

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export async function getGame(gameId: number): Promise<GameRecord | undefined> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GAMES_STORE], 'readonly')
    const store = transaction.objectStore(GAMES_STORE)
    const request = store.get(gameId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function updateGameName(gameId: number, name: string): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GAMES_STORE], 'readwrite')
    const store = transaction.objectStore(GAMES_STORE)
    const getRequest = store.get(gameId)

    getRequest.onsuccess = () => {
      const game = getRequest.result
      if (game) {
        game.name = name
        const putRequest = store.put(game)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      } else {
        reject(new Error('Game not found'))
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

export async function getAllGames(): Promise<GameRecord[]> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GAMES_STORE], 'readonly')
    const store = transaction.objectStore(GAMES_STORE)
    const index = store.index('createdAt')
    const request = index.openCursor(null, 'prev')

    const results: GameRecord[] = []
    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        resolve(results)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

export async function addHistory(record: Omit<HistoryRecord, 'id'>): Promise<number> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([HISTORY_STORE], 'readwrite')
    const store = transaction.objectStore(HISTORY_STORE)
    const request = store.add(record)

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export async function getHistoryByGame(gameId: number): Promise<HistoryRecord[]> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([HISTORY_STORE], 'readonly')
    const store = transaction.objectStore(HISTORY_STORE)
    const index = store.index('gameId')
    const request = index.openCursor(IDBKeyRange.only(gameId))

    const results: HistoryRecord[] = []
    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        // timestampでソート
        results.sort((a, b) => a.timestamp - b.timestamp)
        resolve(results)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteGame(gameId: number): Promise<void> {
  const database = await openDB()

  // まず履歴を削除
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([HISTORY_STORE], 'readwrite')
    const store = transaction.objectStore(HISTORY_STORE)
    const index = store.index('gameId')
    const request = index.openCursor(IDBKeyRange.only(gameId))

    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      } else {
        resolve()
      }
    }
    request.onerror = () => reject(request.error)
  })

  // ゲームを削除
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GAMES_STORE], 'readwrite')
    const store = transaction.objectStore(GAMES_STORE)
    const request = store.delete(gameId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllData(): Promise<void> {
  const database = await openDB()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([HISTORY_STORE], 'readwrite')
    const store = transaction.objectStore(HISTORY_STORE)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GAMES_STORE], 'readwrite')
    const store = transaction.objectStore(GAMES_STORE)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
