// ========================================
// 설정 관리 (localStorage)
// ========================================

import { openModal, closeModal } from './ui.js';

export const CONFIG = {
  API_KEY: localStorage.getItem('poker_api_key') || null,
  MAIN_SHEET_ID: localStorage.getItem('poker_main_sheet') || null,
  OUTPUT_SHEET_ID: localStorage.getItem('poker_output_sheet') || null,
  SHEETS: {
    TYPE: 'Type',
    HAND: 'Hand',
    INDEX: 'Index'
  }
};

// ========================================
// 설정 확인
// ========================================
export function checkSettings() {
  if (!CONFIG.API_KEY || !CONFIG.MAIN_SHEET_ID || !CONFIG.OUTPUT_SHEET_ID) {
    openModal('settingsModal');
    return false;
  }
  return true;
}

// ========================================
// 설정 저장
// ========================================
export function saveSettings() {
  const apiKey = document.getElementById('settingsApiKey').value.trim();
  const mainSheet = document.getElementById('settingsMainSheet').value.trim();
  const outputSheet = document.getElementById('settingsOutputSheet').value.trim();

  if (!apiKey) {
    alert('Google API Key를 입력해주세요');
    return;
  }

  if (!mainSheet || !outputSheet) {
    alert('시트 ID를 모두 입력해주세요');
    return;
  }

  // localStorage에 저장
  localStorage.setItem('poker_api_key', apiKey);
  localStorage.setItem('poker_main_sheet', mainSheet);
  localStorage.setItem('poker_output_sheet', outputSheet);

  // CONFIG 업데이트
  CONFIG.API_KEY = apiKey;
  CONFIG.MAIN_SHEET_ID = mainSheet;
  CONFIG.OUTPUT_SHEET_ID = outputSheet;

  closeModal('settingsModal');

  // 앱 시작 (동적 import)
  import('./table-manager.js').then(module => {
    module.loadKeyPlayerTables();
  });
}

