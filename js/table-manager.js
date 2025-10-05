// ========================================
// 테이블 & 플레이어 관리
// ========================================

import { CONFIG } from './config.js';
import { readSheet, appendToSheet } from './api.js';
import { openModal, closeModal } from './ui.js';
import { formatChips, getFirstName, getTableNumberAbbr, renderPlayerCard } from './utils.js';
import { DB } from './db.js';

// ========================================
// 전역 상태
// ========================================
export let allTables = [];
export let currentTable = null;
export let currentPlayers = [];

// 모달에서 선택된 플레이어 인덱스
let currentModalPlayerIndex = null;

// ========================================
// 1. 앱 시작 - 테이블 목록 로드 (Local-First)
// ========================================
export async function loadKeyPlayerTables() {
  try {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading').textContent = '테이블 목록 로딩 중...';

    // IndexedDB 초기화
    await DB.init();

    // 1단계: 캐시된 데이터 먼저 로드 (0.1초)
    const cachedTables = await DB.getAllTables();
    if (cachedTables.length > 0) {
      allTables = cachedTables;
      renderTableList();
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('tableListSection').classList.remove('hidden');

      // 캐시 사용 알림 (개발 시에만 표시)
      console.log('✅ 캐시된 테이블 로드:', cachedTables.length, '개');
    }

    // 2단계: 백그라운드에서 Google Sheets API 호출 (최신 데이터)
    const data = await readSheet(CONFIG.MAIN_SHEET_ID, `${CONFIG.SHEETS.TYPE}!A:H`);

    if (!data.values || data.values.length < 2) {
      // 캐시가 있으면 계속 사용, 없으면 에러
      if (cachedTables.length === 0) {
        throw new Error('Type 시트에 데이터가 없습니다');
      }
      console.warn('⚠️ Type 시트가 비어있지만 캐시 사용 중');
      return;
    }

    // 테이블 파싱
    allTables = parseAndFilterTables(data.values);

    // IndexedDB 캐시 업데이트
    await DB.saveTables(allTables);
    console.log('✅ 캐시 업데이트:', allTables.length, '개');

    // UI 재렌더링 (최신 데이터 반영)
    renderTableList();

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('tableListSection').classList.remove('hidden');

  } catch (error) {
    document.getElementById('loading').innerHTML =
      `<p style="color: #dc3545;">❌ 오류: ${error.message}</p>
       <p style="font-size: 0.9em; margin-top: 10px;">
         ⚠️ CONFIG.API_KEY를 설정했는지 확인하세요<br>
         ⚠️ Google Sheets가 "링크가 있는 모든 사용자" 공유 설정인지 확인하세요
       </p>`;
  }
}

// ========================================
// 테이블 파싱
// ========================================
export function parseAndFilterTables(rows) {
  const tables = new Map();

  // 헤더 제외
  for (let i = 1; i < rows.length; i++) {
    const [pokerRoom, tableName, tableNo, seatNo, playerName, nationality, chips, isKeyPlayer] = rows[i];

    if (!tableName || !playerName) continue;

    const tableId = `${pokerRoom || 'Unknown'}-${tableName}-${tableNo || 'NoTable'}`.replace(/\s+/g, '-').toLowerCase();

    if (!tables.has(tableId)) {
      tables.set(tableId, {
        id: tableId,
        pokerRoom: pokerRoom || 'Unknown',
        tableName: tableName,
        tableNo: tableNo || '',
        players: [],
        keyPlayerCount: 0,
        keyPlayerNames: []
      });
    }

    const table = tables.get(tableId);

    const player = {
      seatNo: parseInt(seatNo) || 0,
      name: playerName,
      nationality: nationality || 'KR',
      chips: parseInt((chips || '0').toString().replace(/,/g, '')),
      isKeyPlayer: isKeyPlayer === 'TRUE'
    };

    table.players.push(player);

    if (player.isKeyPlayer) {
      table.keyPlayerCount++;
      table.keyPlayerNames.push(player.name);
    }
  }

  // 모든 테이블 반환 (필터는 renderTableList에서)
  return Array.from(tables.values())
    .sort((a, b) => b.keyPlayerCount - a.keyPlayerCount);
}

// ========================================
// 필터 적용
// ========================================
export function applyTableFilter() {
  renderTableList();
}

// ========================================
// 테이블 목록 렌더링
// ========================================
export function renderTableList() {
  const container = document.getElementById('tableList');
  const filterValue = document.querySelector('input[name="tableFilter"]:checked').value;

  // 필터 적용
  const filteredTables = filterValue === 'keyplayer'
    ? allTables.filter(table => table.keyPlayerCount > 0)
    : allTables;

  if (filteredTables.length === 0) {
    container.innerHTML = '<p style="color: #999;">조건에 맞는 테이블이 없습니다</p>';
    return;
  }

  // Minimal Design: 제목 제거, 압축된 형식
  const html = filteredTables.map(table => {
    // 약어: Poker Room 축약
    const roomAbbr = table.pokerRoom === 'Resorts World Manila' ? 'RWM'
      : table.pokerRoom === 'Solaire Resort' ? 'Solaire'
      : table.pokerRoom.substring(0, 10);

    // 약어: Table No. (Table 3 → T3)
    const tableNoAbbr = getTableNumberAbbr(table.tableNo);

    // 플레이어 이름 압축 (First Name만)
    const playerFirstNames = table.keyPlayerNames
      .map(name => getFirstName(name))
      .join(', ');

    return `
      <div class="table-card" onclick="window.tableManager.selectTable('${table.id}')" style="
        padding: 8px 12px;
        margin-bottom: 6px;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        min-height: 56px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="font-size: 14px; font-weight: 600;">
            ${table.tableName}${tableNoAbbr ? ' - ' + tableNoAbbr : ''} ${table.keyPlayerCount > 0 ? `<span style="color: #ffd700;">⭐${table.keyPlayerCount}</span>` : ''}
          </div>
        </div>
        <div style="font-size: 12px; color: #666;">
          ${roomAbbr} | ${table.players.length}명${table.keyPlayerCount > 0 && playerFirstNames ? ` | ${playerFirstNames}` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// ========================================
// 2. 테이블 선택
// ========================================
export function selectTable(tableId) {
  currentTable = allTables.find(t => t.id === tableId);

  if (!currentTable) {
    alert('테이블을 찾을 수 없습니다');
    return;
  }

  currentPlayers = [...currentTable.players].sort((a, b) => a.seatNo - b.seatNo);

  // UI 전환
  document.getElementById('tableListSection').classList.add('hidden');
  document.getElementById('playerManagementMode').classList.remove('hidden');

  // Minimal Design: 테이블 정보 압축
  const tableNoAbbr = currentTable.tableNo ? `T${currentTable.tableNo}` : '';
  document.getElementById('selectedTableName').textContent =
    `${currentTable.tableName}${tableNoAbbr ? ' - ' + tableNoAbbr : ''}`;
  document.getElementById('selectedTableInfo').textContent =
    `${currentPlayers.length}명${currentTable.keyPlayerCount > 0 ? ' | ⭐' + currentTable.keyPlayerCount : ''}`;

  renderPlayerList();
}

// ========================================
// 테이블 목록으로 돌아가기
// ========================================
export function backToTableList() {
  document.getElementById('playerManagementMode').classList.add('hidden');
  document.getElementById('tableListSection').classList.remove('hidden');
  currentTable = null;
  currentPlayers = [];
}

// ========================================
// 3. 플레이어 관리
// ========================================
export function renderPlayerList() {
  const container = document.getElementById('playerList');

  const html = currentPlayers.map((player, index) =>
    renderPlayerCard(player, index, {
      onClick: 'window.tableManager.openChipsModal'
    })
  ).join('');

  container.innerHTML = html;
}

// ========================================
// Helper: 국기 이모지
// ========================================
export function getFlagEmoji(nationality) {
  const flags = {
    'KR': '🇰🇷', 'US': '🇺🇸', 'CN': '🇨🇳', 'JP': '🇯🇵',
    'VN': '🇻🇳', 'TH': '🇹🇭', 'PH': '🇵🇭', 'SG': '🇸🇬'
  };
  return flags[nationality] || '🌐';
}

// ========================================
// 칩 수정 모달
// ========================================
export function openChipsModal(index) {
  currentModalPlayerIndex = index;
  const player = currentPlayers[index];

  // Minimal Design: First Name만 표시
  document.getElementById('chipsPlayerName').textContent = getFirstName(player.name);
  document.getElementById('newChipsInput').value = player.chips;
  openModal('chipsModal');
}

export async function saveChips() {
  const newChips = parseInt(document.getElementById('newChipsInput').value);

  if (isNaN(newChips) || newChips < 0) {
    alert('올바른 칩 수량을 입력하세요');
    return;
  }

  try {
    const player = currentPlayers[currentModalPlayerIndex];
    const oldChips = player.chips;

    // 1. 로컬 메모리 업데이트
    currentPlayers[currentModalPlayerIndex].chips = newChips;

    // 2. IndexedDB 캐시 업데이트
    // allTables에서 해당 테이블의 플레이어 칩 수정
    const tableIndex = allTables.findIndex(t => t.id === currentTable.id);
    if (tableIndex !== -1) {
      const playerIndex = allTables[tableIndex].players.findIndex(p =>
        p.name === player.name && p.seatNo === player.seatNo
      );
      if (playerIndex !== -1) {
        allTables[tableIndex].players[playerIndex].chips = newChips;
        await DB.saveTables(allTables);
      }
    }

    // 3. syncQueue에 추가 (백그라운드 동기화)
    await DB.addToSyncQueue('player', {
      action: 'updateChips',
      pokerRoom: currentTable.pokerRoom,
      tableName: currentTable.tableName,
      tableNo: currentTable.tableNo,
      playerName: player.name,
      seatNo: player.seatNo,
      oldChips,
      newChips
    });

    renderPlayerList();
    closeModal('chipsModal');

    alert('✅ 칩이 수정되었습니다\n\n⏳ 백그라운드로 Google Sheets에 동기화 중...');

  } catch (error) {
    alert(`오류: ${error.message}`);
  }
}

// ========================================
// 좌석 변경 모달
// ========================================
export function openSeatModal(index) {
  currentModalPlayerIndex = index;
  const player = currentPlayers[index];

  // Minimal Design: First Name만 표시
  document.getElementById('seatPlayerName').textContent = getFirstName(player.name);
  document.getElementById('newSeatSelect').value = player.seatNo;
  openModal('seatModal');
}

export async function saveSeat() {
  const newSeat = parseInt(document.getElementById('newSeatSelect').value);

  // 좌석 중복 체크
  const seatTaken = currentPlayers.some((p, i) =>
    i !== currentModalPlayerIndex && p.seatNo === newSeat
  );

  if (seatTaken) {
    alert('이미 사용 중인 좌석입니다');
    return;
  }

  try {
    const player = currentPlayers[currentModalPlayerIndex];
    const oldSeat = player.seatNo;

    // 1. 로컬 메모리 업데이트
    currentPlayers[currentModalPlayerIndex].seatNo = newSeat;
    currentPlayers.sort((a, b) => a.seatNo - b.seatNo);

    // 2. IndexedDB 캐시 업데이트
    const tableIndex = allTables.findIndex(t => t.id === currentTable.id);
    if (tableIndex !== -1) {
      const playerIndex = allTables[tableIndex].players.findIndex(p =>
        p.name === player.name && p.seatNo === oldSeat
      );
      if (playerIndex !== -1) {
        allTables[tableIndex].players[playerIndex].seatNo = newSeat;
        await DB.saveTables(allTables);
      }
    }

    // 3. syncQueue에 추가 (백그라운드 동기화)
    await DB.addToSyncQueue('player', {
      action: 'updateSeat',
      pokerRoom: currentTable.pokerRoom,
      tableName: currentTable.tableName,
      tableNo: currentTable.tableNo,
      playerName: player.name,
      oldSeat,
      newSeat
    });

    renderPlayerList();
    closeModal('seatModal');

    alert('✅ 좌석이 변경되었습니다\n\n⏳ 백그라운드로 Google Sheets에 동기화 중...');

  } catch (error) {
    alert(`오류: ${error.message}`);
  }
}

// ========================================
// 플레이어 제거
// ========================================
export async function removePlayer(index) {
  const player = currentPlayers[index];

  if (!confirm(`${player.name}을(를) 제거하시겠습니까?`)) {
    return;
  }

  try {
    // 1. 로컬 메모리 업데이트
    currentPlayers.splice(index, 1);

    // 키 플레이어 카운트 업데이트
    if (player.isKeyPlayer) {
      currentTable.keyPlayerCount--;
    }

    // 2. IndexedDB 캐시 업데이트
    const tableIndex = allTables.findIndex(t => t.id === currentTable.id);
    if (tableIndex !== -1) {
      const playerIndex = allTables[tableIndex].players.findIndex(p =>
        p.name === player.name && p.seatNo === player.seatNo
      );
      if (playerIndex !== -1) {
        allTables[tableIndex].players.splice(playerIndex, 1);

        // keyPlayerCount 및 keyPlayerNames 동기화
        if (player.isKeyPlayer) {
          allTables[tableIndex].keyPlayerCount--;
          const nameIndex = allTables[tableIndex].keyPlayerNames.indexOf(player.name);
          if (nameIndex !== -1) {
            allTables[tableIndex].keyPlayerNames.splice(nameIndex, 1);
          }
        }

        await DB.saveTables(allTables);
      }
    }

    // 3. syncQueue에 추가 (백그라운드 동기화, 롤백용 전체 정보 백업)
    await DB.addToSyncQueue('player', {
      action: 'remove',
      pokerRoom: currentTable.pokerRoom,
      tableName: currentTable.tableName,
      tableNo: currentTable.tableNo,
      player: { ...player }
    });

    renderPlayerList();

    alert('✅ 플레이어가 제거되었습니다\n\n⏳ 백그라운드로 Google Sheets에 동기화 중...');

  } catch (error) {
    alert(`오류: ${error.message}`);
  }
}

// ========================================
// 플레이어 추가
// ========================================
export function openAddPlayerModal() {
  document.getElementById('newPlayerName').value = '';
  document.getElementById('newPlayerSeat').value = '1';
  document.getElementById('newPlayerChips').value = '';
  document.getElementById('newPlayerNationality').value = 'KR';
  document.getElementById('newPlayerIsKeyPlayer').checked = false;
  openModal('addPlayerModal');
}

export async function addPlayer() {
  const name = document.getElementById('newPlayerName').value.trim();
  const seatNo = parseInt(document.getElementById('newPlayerSeat').value);
  const chips = parseInt(document.getElementById('newPlayerChips').value);
  const nationality = document.getElementById('newPlayerNationality').value.trim().toUpperCase();
  const isKeyPlayer = document.getElementById('newPlayerIsKeyPlayer').checked;

  if (!name) {
    alert('이름을 입력하세요');
    return;
  }

  if (isNaN(chips) || chips < 0) {
    alert('올바른 칩 수량을 입력하세요');
    return;
  }

  // 좌석 중복 체크
  const seatTaken = currentPlayers.some(p => p.seatNo === seatNo);
  if (seatTaken) {
    alert('이미 사용 중인 좌석입니다');
    return;
  }

  try {
    const newPlayer = {
      seatNo,
      name,
      nationality,
      chips,
      isKeyPlayer
    };

    // 1. 로컬 메모리 업데이트
    currentPlayers.push(newPlayer);
    currentPlayers.sort((a, b) => a.seatNo - b.seatNo);

    if (isKeyPlayer) {
      currentTable.keyPlayerCount++;
    }

    // 2. IndexedDB 캐시 업데이트
    const tableIndex = allTables.findIndex(t => t.id === currentTable.id);
    if (tableIndex !== -1) {
      allTables[tableIndex].players.push(newPlayer);

      // keyPlayerCount 및 keyPlayerNames 동기화
      if (isKeyPlayer) {
        allTables[tableIndex].keyPlayerCount++;
        if (!allTables[tableIndex].keyPlayerNames.includes(newPlayer.name)) {
          allTables[tableIndex].keyPlayerNames.push(newPlayer.name);
        }
      }

      await DB.saveTables(allTables);
    }

    // 3. syncQueue에 추가 (백그라운드 동기화)
    await DB.addToSyncQueue('player', {
      action: 'add',
      pokerRoom: currentTable.pokerRoom,
      tableName: currentTable.tableName,
      tableNo: currentTable.tableNo,
      player: newPlayer
    });

    renderPlayerList();
    closeModal('addPlayerModal');

    alert('✅ 플레이어가 추가되었습니다\n\n⏳ 백그라운드로 Google Sheets에 동기화 중...');

  } catch (error) {
    alert(`오류: ${error.message}`);
  }
}
