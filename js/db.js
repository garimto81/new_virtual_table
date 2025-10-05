// ===================================
// IndexedDB 캐싱 레이어
// ===================================

const DB_NAME = 'poker_hand_logger';
const DB_VERSION = 1;

/**
 * IndexedDB 래퍼
 * Local-First Architecture의 핵심
 */
class Database {
  constructor() {
    this.db = null;
  }

  /**
   * DB 초기화
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Tables 저장소 (테이블 캐시)
        if (!db.objectStoreNames.contains('tables')) {
          const tableStore = db.createObjectStore('tables', { keyPath: 'id' });
          tableStore.createIndex('pokerRoom', 'pokerRoom', { unique: false });
          tableStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Hands 저장소 (핸드 히스토리)
        if (!db.objectStoreNames.contains('hands')) {
          const handStore = db.createObjectStore('hands', { keyPath: 'id', autoIncrement: true });
          handStore.createIndex('tableId', 'tableId', { unique: false });
          handStore.createIndex('handNumber', 'handNumber', { unique: false });
          handStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // SyncQueue 저장소 (동기화 큐)
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * IndexedDB 쿼리 실행 헬퍼
   * @param {string} storeName - 저장소 이름
   * @param {string} mode - 'readonly' | 'readwrite'
   * @param {Function} callback - store를 받아 request를 반환하는 콜백
   * @returns {Promise<any>}
   */
  async _executeQuery(storeName, mode, callback) {
    const tx = this.db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = callback(store);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 모든 테이블 조회
   * @returns {Promise<Array>}
   */
  async getAllTables() {
    return this._executeQuery('tables', 'readonly', store => store.getAll());
  }

  /**
   * 테이블 저장/업데이트
   * @param {Array} tables - 테이블 배열
   * @returns {Promise<void>}
   */
  async saveTables(tables) {
    const tx = this.db.transaction('tables', 'readwrite');
    const store = tx.objectStore('tables');

    // 모든 테이블에 updatedAt 추가
    const timestamp = Date.now();
    tables.forEach(table => {
      table.updatedAt = timestamp;
      store.put(table);
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 테이블 캐시 클리어
   * @returns {Promise<void>}
   */
  async clearTables() {
    return this._executeQuery('tables', 'readwrite', store => store.clear());
  }

  /**
   * 핸드 저장
   * @param {Object} hand - 핸드 객체
   * @returns {Promise<number>} 저장된 핸드 ID
   */
  async saveHand(hand) {
    return this._executeQuery('hands', 'readwrite', store => store.add(hand));
  }

  /**
   * 테이블별 핸드 조회
   * @param {string} tableId
   * @returns {Promise<Array>}
   */
  async getHandsByTable(tableId) {
    return this._executeQuery('hands', 'readonly', store => {
      const index = store.index('tableId');
      return index.getAll(tableId);
    });
  }

  /**
   * 동기화 큐에 추가
   * @param {string} type - 'table' | 'hand' | 'player'
   * @param {Object} data - 동기화할 데이터
   * @returns {Promise<number>}
   */
  async addToSyncQueue(type, data) {
    const item = {
      type,
      data,
      status: 'pending',
      createdAt: Date.now(),
      retryCount: 0
    };
    return this._executeQuery('syncQueue', 'readwrite', store => store.add(item));
  }

  /**
   * 대기 중인 동기화 항목 조회
   * @returns {Promise<Array>}
   */
  async getPendingSyncQueue() {
    return this._executeQuery('syncQueue', 'readonly', store => {
      const index = store.index('status');
      return index.getAll('pending');
    });
  }

  /**
   * 동기화 항목 상태 업데이트
   * @param {number} id
   * @param {string} status - 'pending' | 'synced' | 'failed'
   * @returns {Promise<void>}
   */
  async updateSyncQueueStatus(id, status) {
    const tx = this.db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.status = status;
          item.updatedAt = Date.now();
          store.put(item);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 동기화 완료 항목 삭제
   * @returns {Promise<void>}
   */
  async cleanupSyncedItems() {
    const tx = this.db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const index = store.index('status');
    const request = index.openCursor('synced');

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton 인스턴스
export const DB = new Database();
