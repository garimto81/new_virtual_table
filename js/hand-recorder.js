// ========================================
// 핸드 기록
// ========================================

import { CONFIG } from './config.js';
import { readSheet, appendToSheet } from './api.js';
import { currentTable, currentPlayers } from './table-manager.js';
import { openModal, closeModal } from './ui.js';
import { formatChips, getFirstName, getTableNumberAbbr, renderPlayerCard } from './utils.js';
import { DB } from './db.js';

// ========================================
// 전역 상태
// ========================================
export let currentHand = null;
export let currentHandNumber = 1;
export let selectedPlayerIndex = null;
export let currentActionType = null;
export let currentModalPlayerIndex = null;

// ========================================
// 핸드 기록 모드로 전환
// ========================================
export async function switchToHandMode() {
  if (currentPlayers.length < 2) {
    alert('최소 2명의 플레이어가 필요합니다');
    return;
  }

  try {
    // 마지막 핸드 번호 조회
    await loadLastHandNumber();

    // 핸드 시작
    await startNewHand();

    // UI 전환
    document.getElementById('playerManagementMode').classList.add('hidden');
    document.getElementById('handRecordingMode').classList.remove('hidden');

  } catch (error) {
    alert(`핸드 시작 실패: ${error.message}`);
  }
}

// ========================================
// 플레이어 관리로 돌아가기
// ========================================
export function backToPlayerManagement() {
  document.getElementById('handRecordingMode').classList.add('hidden');
  document.getElementById('playerManagementMode').classList.remove('hidden');
  currentHand = null;
  selectedPlayerIndex = null;
}

// ========================================
// 마지막 핸드 번호 로드
// ========================================
export async function loadLastHandNumber() {
  try {
    const data = await readSheet(CONFIG.OUTPUT_SHEET_ID, `${CONFIG.SHEETS.INDEX}!A:A`);

    if (data.values && data.values.length > 1) {
      const lastRow = data.values[data.values.length - 1];
      const lastHandNumber = parseInt(lastRow[0]);
      currentHandNumber = isNaN(lastHandNumber) ? 1 : lastHandNumber + 1;
    } else {
      currentHandNumber = 1;
    }

  } catch (error) {
    console.warn('마지막 핸드 번호 조회 실패, 1번으로 시작:', error);
    currentHandNumber = 1;
  }
}

// ========================================
// 새 핸드 시작
// ========================================
export async function startNewHand() {
  const timestamp = Date.now();

  currentHand = {
    number: currentHandNumber,
    tableId: currentTable.id,
    timestamp,
    actions: [],
    startRow: 0
  };

  // Hand 시트에 HAND 행 추가
  const handRow = [
    'HAND',
    currentHandNumber,
    timestamp,
    'HOLDEM',
    'BB_ANTE',
    '', '', '', '', '', '', '', '', '', '', '',
    currentTable.id
  ];

  await appendToSheet(CONFIG.OUTPUT_SHEET_ID, CONFIG.SHEETS.HAND, [handRow]);

  // Hand 시트에 PLAYER 행들 추가
  for (const player of currentPlayers) {
    const playerRow = [
      'PLAYER',
      player.name,
      player.seatNo,
      0,
      player.chips,
      player.chips,
      ''
    ];
    await appendToSheet(CONFIG.OUTPUT_SHEET_ID, CONFIG.SHEETS.HAND, [playerRow]);
  }

  // Minimal Design: UI 업데이트
  const tableNoAbbr = getTableNumberAbbr(currentTable.tableNo);
  document.getElementById('handNumber').textContent = currentHandNumber;
  document.getElementById('handTableName').textContent =
    `${currentTable.tableName}${tableNoAbbr ? ' - ' + tableNoAbbr : ''}`;
  document.getElementById('handPlayerCount').textContent =
    `${currentPlayers.length}명${currentTable.keyPlayerCount > 0 ? ' | ⭐' + currentTable.keyPlayerCount : ''}`;

  renderHandPlayerList();
  clearActionLog();
}

// ========================================
// 핸드 플레이어 목록 렌더링
// ========================================
export function renderHandPlayerList() {
  const container = document.getElementById('handPlayerList');

  const html = currentPlayers.map((player, index) => {
    const additionalButton = `
      <button onclick="event.stopPropagation(); window.handRecorder.openCardsModal(${index})"
              style="
                padding: 4px 8px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">
        카드
      </button>
    `;

    return renderPlayerCard(player, index, {
      onClick: 'window.handRecorder.selectPlayerForAction',
      selectedIndex: selectedPlayerIndex,
      additionalButton: additionalButton
    });
  }).join('');

  container.innerHTML = html;
}

// ========================================
// 플레이어 선택 (액션용)
// ========================================
export function selectPlayerForAction(index) {
  selectedPlayerIndex = index;
  renderHandPlayerList();
}

// ========================================
// 액션 타입 기록
// ========================================
export function recordActionType(actionType) {
  if (selectedPlayerIndex === null) {
    alert('먼저 플레이어를 선택하세요');
    return;
  }

  currentActionType = actionType;
  const player = currentPlayers[selectedPlayerIndex];

  // Minimal Design: First Name만 표시
  document.getElementById('actionType').textContent = actionType.toUpperCase();
  document.getElementById('actionPlayerName').textContent = getFirstName(player.name);

  // Fold, Check는 금액 입력 불필요
  if (actionType === 'fold' || actionType === 'check') {
    document.getElementById('actionAmountGroup').style.display = 'none';
    document.getElementById('actionAmount').value = '0';
  } else {
    document.getElementById('actionAmountGroup').style.display = 'block';
    document.getElementById('actionAmount').value = '';
  }

  openModal('actionModal');
}

// ========================================
// 액션 저장
// ========================================
export async function saveAction() {
  const player = currentPlayers[selectedPlayerIndex];
  const amount = parseInt(document.getElementById('actionAmount').value) || 0;

  if (currentActionType !== 'fold' && currentActionType !== 'check' && amount <= 0) {
    alert('금액을 입력하세요');
    return;
  }

  try {
    // Minimal Design: First Name만 사용
    const firstName = getFirstName(player.name);
    const amountDisplay = formatChips(amount);

    const actionText = amount > 0
      ? `${firstName} ${currentActionType}s ${amountDisplay}`
      : `${firstName} ${currentActionType}s`;

    const actionRow = [
      'EVENT',
      'ACTION',
      '',
      '',
      Date.now(),
      actionText
    ];

    await appendToSheet(CONFIG.OUTPUT_SHEET_ID, CONFIG.SHEETS.HAND, [actionRow]);

    currentHand.actions.push({
      player: player.name,
      type: currentActionType,
      amount,
      isKeyPlayer: player.isKeyPlayer
    });

    addActionToLog(actionText, player.isKeyPlayer);
    closeModal('actionModal');

  } catch (error) {
    alert(`액션 기록 실패: ${error.message}`);
  }
}

// ========================================
// 액션 로그에 추가
// ========================================
export function addActionToLog(text, isKeyPlayer) {
  const log = document.getElementById('actionLog');

  if (log.innerHTML.includes('아직 기록된 액션이 없습니다')) {
    log.innerHTML = '';
  }

  const item = document.createElement('div');
  item.className = `action-item ${isKeyPlayer ? 'key-player-action' : ''}`;
  item.textContent = text;

  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
}

// ========================================
// 액션 로그 초기화
// ========================================
export function clearActionLog() {
  document.getElementById('actionLog').innerHTML =
    '<p style="color: #999;">아직 기록된 액션이 없습니다</p>';
}

// ========================================
// 카드 입력 모달
// ========================================
export function openCardsModal(index) {
  currentModalPlayerIndex = index;
  const player = currentPlayers[index];

  // Minimal Design: First Name만 표시
  document.getElementById('cardsPlayerName').textContent = getFirstName(player.name);
  document.getElementById('cardsInput').value = '';
  openModal('cardsModal');
}

// ========================================
// 카드 저장
// ========================================
export async function saveCards() {
  const cards = document.getElementById('cardsInput').value.trim();
  const player = currentPlayers[currentModalPlayerIndex];

  if (!cards) {
    alert('카드를 입력하세요 (예: A♠ K♠)');
    return;
  }

  try {
    // Minimal Design: First Name만 사용
    const firstName = getFirstName(player.name);

    const cardRow = [
      'EVENT',
      'CARD',
      player.name,
      '',
      Date.now(),
      cards
    ];

    await appendToSheet(CONFIG.OUTPUT_SHEET_ID, CONFIG.SHEETS.HAND, [cardRow]);

    addActionToLog(`${firstName}: ${cards}`, player.isKeyPlayer);
    closeModal('cardsModal');

  } catch (error) {
    alert(`카드 기록 실패: ${error.message}`);
  }
}

// ========================================
// 핸드 완료
// ========================================
export async function completeHand() {
  if (currentHand.actions.length === 0) {
    if (!confirm('액션이 기록되지 않았습니다. 그래도 완료하시겠습니까?')) {
      return;
    }
  }

  try {
    // Local-First: IndexedDB에 핸드 저장
    const handData = {
      tableId: currentTable.id,
      handNumber: currentHandNumber,
      timestamp: currentHand.timestamp,
      actions: currentHand.actions,
      players: currentPlayers.map(p => ({
        name: p.name,
        seatNo: p.seatNo,
        chips: p.chips
      }))
    };

    await DB.saveHand(handData);

    // SyncQueue에 추가 (백그라운드 동기화)
    await DB.addToSyncQueue('hand', {
      tableId: currentTable.id,
      handNumber: currentHandNumber,
      winner: null, // Week 2: 승자 선택 UI 추가
      potSize: 0,   // Week 2: Pot 크기 계산
      timestamp: currentHand.timestamp
    });

    // 빈 행 추가 (핸드 구분)
    await appendToSheet(CONFIG.OUTPUT_SHEET_ID, CONFIG.SHEETS.HAND, [['']]);

    // Index 시트에 메타데이터 추가
    const fullTableName = `${currentTable.pokerRoom} - ${currentTable.tableName}${currentTable.tableNo ? ' - ' + currentTable.tableNo : ''}`;
    const indexRow = [
      currentHandNumber,
      fullTableName,
      currentTable.id,
      currentHand.timestamp,
      Date.now(),
      'completed',
      currentPlayers.length,
      currentHand.actions.length
    ];

    await appendToSheet(CONFIG.OUTPUT_SHEET_ID, CONFIG.SHEETS.INDEX, [indexRow]);

    alert(`✅ 핸드 #${currentHandNumber} 완료!\n\n다음 핸드 #${currentHandNumber + 1}을(를) 시작합니다`);

    // 다음 핸드 시작
    currentHandNumber++;
    await startNewHand();

  } catch (error) {
    alert(`핸드 완료 실패: ${error.message}`);
  }
}
