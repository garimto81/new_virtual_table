// ===================================
// Background Sync Manager
// ===================================

import { DB } from './db.js';
import { appendToSheet, readSheet, updateSheet } from './api.js';
import { CONFIG } from './config.js';

/**
 * 백그라운드 동기화 관리자
 * 10초마다 syncQueue 확인 및 동기화 실행
 */
class SyncManager {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * 동기화 시작 (10초 간격)
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🔄 Background Sync 시작 (10초 간격)');

    // 즉시 한 번 실행
    this.processQueue();

    // 10초마다 실행
    this.intervalId = setInterval(() => {
      this.processQueue();
    }, 10000);
  }

  /**
   * 동기화 중지
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏸️ Background Sync 중지');
  }

  /**
   * syncQueue 처리
   */
  async processQueue() {
    try {
      const pendingItems = await DB.getPendingSyncQueue();

      if (pendingItems.length === 0) {
        return;
      }

      console.log(`🔄 동기화 대기 항목: ${pendingItems.length}개`);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await DB.updateSyncQueueStatus(item.id, 'synced');
          console.log(`✅ 동기화 완료: ${item.type} #${item.id}`);
        } catch (error) {
          console.error(`❌ 동기화 실패: ${item.type} #${item.id}`, error);
          await DB.updateSyncQueueStatus(item.id, 'failed');
        }
      }

      // 완료된 항목 정리
      await DB.cleanupSyncedItems();

    } catch (error) {
      console.error('❌ syncQueue 처리 오류:', error);
    }
  }

  /**
   * 개별 항목 동기화
   * @param {Object} item - { type, data }
   */
  async syncItem(item) {
    switch (item.type) {
      case 'hand':
        await this.syncHand(item.data);
        break;
      case 'table':
        await this.syncTable(item.data);
        break;
      case 'player':
        await this.syncPlayer(item.data);
        break;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  /**
   * 핸드 동기화 (Index 시트)
   */
  async syncHand(handData) {
    const { tableId, handNumber, winner, potSize, timestamp } = handData;

    // Index 시트에 추가
    await appendToSheet('INDEX', [[
      tableId,
      handNumber,
      winner,
      potSize,
      new Date(timestamp).toISOString()
    ]]);
  }

  /**
   * 테이블 동기화 (Type 시트 업데이트)
   */
  async syncTable(tableData) {
    // Week 2: Type 시트 특정 행 업데이트 로직
    console.log('⚠️ syncTable 미구현 (Week 2):', tableData);
  }

  /**
   * 플레이어 동기화 (Type 시트 업데이트)
   */
  async syncPlayer(playerData) {
    const { action, pokerRoom, tableName, tableNo, playerName, seatNo } = playerData;

    // Type 시트 전체 읽기
    const data = await readSheet(CONFIG.MAIN_SHEET_ID, `${CONFIG.SHEETS.TYPE}!A:H`);

    if (!data.values || data.values.length < 2) {
      throw new Error('Type 시트에 데이터가 없습니다');
    }

    // 해당 플레이어의 행 찾기
    let targetRowIndex = -1;
    for (let i = 1; i < data.values.length; i++) {
      const [sheetPokerRoom, sheetTableName, sheetTableNo, sheetSeatNo, sheetPlayerName] = data.values[i];

      if (
        sheetPokerRoom === pokerRoom &&
        sheetTableName === tableName &&
        String(sheetTableNo) === String(tableNo) && // 타입 통일
        sheetPlayerName === playerName &&
        String(sheetSeatNo) === String(seatNo) // 타입 통일
      ) {
        targetRowIndex = i + 1; // Google Sheets는 1-based index
        break;
      }
    }

    if (targetRowIndex === -1) {
      throw new Error(`플레이어를 찾을 수 없습니다: ${playerName}`);
    }

    // 액션별 처리
    switch (action) {
      case 'updateChips': {
        // G열 (chips) 업데이트
        const range = `${CONFIG.SHEETS.TYPE}!G${targetRowIndex}`;
        await updateSheet(CONFIG.MAIN_SHEET_ID, range, [[playerData.newChips]]);
        console.log(`✅ 칩 업데이트 완료: ${playerName} ${playerData.oldChips} → ${playerData.newChips}`);
        break;
      }

      case 'updateSeat': {
        // D열 (seatNo) 업데이트
        const range = `${CONFIG.SHEETS.TYPE}!D${targetRowIndex}`;
        await updateSheet(CONFIG.MAIN_SHEET_ID, range, [[playerData.newSeatNo]]);
        console.log(`✅ 좌석 업데이트 완료: ${playerName} ${playerData.oldSeatNo} → ${playerData.newSeatNo}`);
        break;
      }

      default:
        throw new Error(`Unknown player action: ${action}`);
    }
  }

  /**
   * 수동 동기화 트리거
   */
  async syncNow() {
    console.log('🔄 수동 동기화 실행...');
    await this.processQueue();
  }
}

// Singleton 인스턴스
export const SYNC = new SyncManager();
