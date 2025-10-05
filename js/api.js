// ========================================
// Google Sheets API
// ========================================

import { CONFIG } from './config.js';

// ========================================
// Helper: Sheet ID 추출
// ========================================
function extractSheetId(input) {
  if (!input.includes('/') && !input.includes('docs.google.com')) {
    return input;
  }
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match && match[1] ? match[1] : input;
}

// ========================================
// Sheet 읽기
// ========================================
export async function readSheet(sheetId, range) {
  const id = extractSheetId(sheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?key=${CONFIG.API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`읽기 실패: ${error.error.message}`);
  }

  return await response.json();
}

// ========================================
// Sheet에 행 추가
// ========================================
export async function appendToSheet(sheetId, sheetName, values) {
  const id = extractSheetId(sheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${sheetName}!A:Z:append?valueInputOption=RAW&key=${CONFIG.API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`쓰기 실패: ${error.error.message}`);
  }

  return await response.json();
}

// ========================================
// Sheet 업데이트 (사용되지 않음 - 향후 사용 가능)
// ========================================
export async function updateSheet(sheetId, range, values) {
  const id = extractSheetId(sheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?valueInputOption=RAW&key=${CONFIG.API_KEY}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`업데이트 실패: ${error.error.message}`);
  }

  return await response.json();
}
