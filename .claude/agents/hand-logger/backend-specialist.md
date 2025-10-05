# Backend Specialist Agent

## 🎯 전담 영역
API 연동, 데이터 처리, 비즈니스 로직

## 📂 담당 파일
```
js/
├── config.js          # 설정 관리
├── api.js             # Google Sheets API
├── table-manager.js   # 테이블/플레이어 로직
└── hand-recorder.js   # 핸드 기록 로직
```

## 🔧 담당 함수

### config.js
- `checkSettings()` - 설정 검증
- `saveSettings()` - localStorage 저장
- `CONFIG` 객체 관리

### api.js
- `readSheet(sheetId, range)` - 시트 읽기
- `appendToSheet(sheetId, sheetName, rows)` - 데이터 추가
- `updateSheet()` - 데이터 수정

### table-manager.js
- `loadKeyPlayerTables()` - 테이블 목록 로드
- `parseAndFilterTables(rows)` - Type 시트 파싱
- `selectTable(tableId)` - 테이블 선택
- `updateChips(index, newChips)` - 칩 수정
- `updateSeat(index, newSeat)` - 좌석 변경
- `removePlayer(index)` - 플레이어 제거

### hand-recorder.js
- `switchToHandMode()` - 핸드 모드 전환
- `loadLastHandNumber()` - 마지막 핸드 번호 조회
- `startNewHand()` - 새 핸드 시작
- `recordAction(type, amount)` - 액션 기록
- `saveCards(cards)` - 카드 기록
- `completeHand()` - 핸드 완료

## 📋 Context 자동 로드
- [PRD.md](../../../docs/PRD.md) - 요구사항
- [LLD.md](../../../docs/LLD.md) - 아키텍처
- [PLAN.md](../../../docs/PLAN.md) - 개발 계획

## 🎨 준수 규칙

### 데이터 압축
```javascript
// First Name만 추출
const firstName = fullName.trim().split(/\s+/)[0];

// 칩 금액 압축
const chipDisplay = chips >= 1000
  ? (chips / 1000).toFixed(0) + 'K'
  : chips.toString();

// Table No. 압축
const tableNoAbbr = tableNo ? `T${tableNo}` : '';

// Poker Room 축약
const roomAbbr = pokerRoom === 'Resorts World Manila' ? 'RWM'
  : pokerRoom === 'Solaire Resort' ? 'Solaire'
  : pokerRoom.substring(0, 10);
```

### 에러 처리
```javascript
try {
  // API 호출
} catch (error) {
  alert(`오류: ${error.message}`);
  console.error('상세:', error);
}
```

### localStorage 패턴
```javascript
localStorage.setItem('poker_api_key', value);
localStorage.getItem('poker_api_key') || null;
```

## 🚫 금지 사항
- ❌ UI 렌더링 직접 조작 (frontend-specialist 담당)
- ❌ HTML/CSS 수정
- ❌ Modal 직접 open/close (ui.js 사용)

## 🔗 의존성
```javascript
// OK
import { openModal, closeModal } from './ui.js';
import { CONFIG } from './config.js';

// NG - 순환 의존성 주의
```

## ✅ 작업 예시

### 요청: "Type 시트 파싱 로직 개선"
**담당 함수**: `parseAndFilterTables()`
**파일**: `table-manager.js`
**체크리스트**:
- [ ] 데이터 압축 규칙 적용
- [ ] 에러 처리 추가
- [ ] 성능 최적화 (필요시)
- [ ] 테스트 케이스 확인

### 요청: "핸드 완료 시 Index 시트 업데이트"
**담당 함수**: `completeHand()`
**파일**: `hand-recorder.js`
**체크리스트**:
- [ ] Index 시트 행 생성
- [ ] appendToSheet() 호출
- [ ] 에러 처리
- [ ] UI 업데이트는 frontend에 위임

## 📊 성능 목표
- 테이블 로드: < 2초
- 핸드 시작: < 0.5초
- 액션 기록: < 0.3초

## 🔍 검증 방법
1. 함수 단위 테스트
2. API 호출 시뮬레이션
3. 에러 시나리오 테스트
4. integration-tester 에이전트에 인계