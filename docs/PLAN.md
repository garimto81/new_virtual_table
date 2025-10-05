# 📋 PLAN v6.2 - 프로토타입 우선 개발 계획

> **Prototype-First Development Roadmap**
> **최종 업데이트**: 2025-10-05
> **기반 문서**: [PRD v7.3](./PRD.md), [LLD v6.1](./LLD.md)
> **철학**: 핵심 기능 먼저 → 검증 → 부가 기능 확장

---

## 🔄 개발 워크플로우 (필수)

### Code Review 필수
**규칙**: 코드 변경/추가 작업이 완료되면 **항상** code-reviewer 에이전트를 실행합니다.

**체크 항목**:
- 코드 중복 (동일 코드 3번 이상 반복)
- 무분별한 코드 사용 (중첩 반복문, 과도한 DOM 조작)
- CSS/HTML 중복

**승인 기준**:
- ✅ APPROVED: 코드 중복 0건, 무분별한 사용 0건
- ❌ REJECTED: 수정 필요 항목 있음

**예외 없음**: 문서 수정만 한 경우를 제외하고 **모든 코드 작업**은 code-reviewer 통과 필수

### 서브에이전트 활용
**병렬 실행** (성능 최적화):
- 독립적인 작업은 동시에 여러 에이전트 호출
- 예: "javascript-pro와 debugger를 동시에 호출"

**순차 실행** (의존성 있는 작업):
- 코드 작성 → debugger → code-reviewer 순서

### 문서 관리
- **핵심 문서 3개만 유지**: PRD.md, LLD.md, PLAN.md
- 새 문서 추가 시 → 기존 문서에 통합 또는 삭제
- 매주 금요일 문서 정리

---

## 📝 Week 1 완료 상태

### ✅ Day 1-2: 핵심 로직 구현 (완료)
- 단일 파일 프로토타입 (index.html 1615줄)
- 테이블 목록 로드, 필터링, 선택
- 플레이어 관리 (칩, 좌석)
- 핸드 기록 (액션, 카드)

### ✅ Day 3: Minimal Design 적용 (완료)
- DESIGN_SYSTEM.md 생성
- 테이블 카드 2줄 압축 (56px)
- 플레이어 카드 1줄 (48px)
- 칩 금액 압축 (1K, 50K)

### ✅ Day 4-5: 모듈화 리팩토링 (완료)
- 1615줄 → 8개 파일 (1779줄)
- utils.js, ui.js 공통 모듈 분리
- window namespace 구조화
- Code Review 통과 (코드 중복 0건)

## 📚 관련 문서

- **요구사항**: [PRD.md](PRD.md)
- **상세 설계**: [LLD.md](LLD.md)
- **디자인 철학**: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- **개발 규칙**: [PROJECT_RULES.md](PROJECT_RULES.md)

---

## 🎯 개발 철학

### ❌ 기존 방식의 문제점
- 4주 후에야 동작하는 앱 완성
- 중간에 요구사항 변경 시 전체 재작업
- 실제 사용자 피드백 받기 어려움
- 처음부터 과도한 설계 (Over-Engineering)

### ✅ 프로토타입 우선 방식
- **3일 후 동작하는 앱** 완성
- **주간 사용자 피드백** 기반 개선
- **점진적 복잡도 증가** (필요할 때만)
- **매주 배포 가능한 버전** 유지

---

## 📅 Week 1: MVP 프로토타입

### 목표
**핵심 워크플로우만 동작**: 테이블 목록 표시 → 필터링 → 테이블 선택 → 플레이어 관리 → 핸드 기록 → 완료

### Day 1-2: 핵심 로직 구현 (단일 파일)

**파일**: `index.html` (올인원)

```html
<!DOCTYPE html>
<html>
<head>
  <title>포커 핸드 로거 - MVP</title>
  <style>
    .key-player { background: yellow; font-weight: bold; }
    .table-card { border: 1px solid #ccc; padding: 10px; margin: 10px 0; cursor: pointer; }
    .table-card:hover { background: #f0f0f0; }
  </style>
</head>
<body>
  <h1>포커 테이블 모니터링 - MVP</h1>

  <!-- 1. 초기 설정 (localStorage) -->
  <section id="settings" style="display: none;">
    <h2>⚙️ 설정</h2>
    <input id="apiKeyInput" placeholder="Google API Key">
    <input id="mainSheetInput" placeholder="Main Sheet ID">
    <input id="outputSheetInput" placeholder="Output Sheet ID">
    <button onclick="saveSettings()">저장</button>
  </section>

  <!-- 2. 테이블 목록 -->
  <section id="tableList">
    <h2>1. 테이블 선택</h2>
    <div>
      <label><input type="radio" name="filter" value="keyplayer" checked> ⭐ 키 플레이어 테이블만</label>
      <label><input type="radio" name="filter" value="all"> 📋 전체 테이블</label>
    </div>
    <div id="tables"></div>
  </section>

  <!-- 3. 플레이어 관리 -->
  <section id="playerManagement" style="display: none;">
    <h2>2. 플레이어 관리</h2>
    <button onclick="backToTableList()">← 테이블 목록</button>
    <div id="players"></div>
    <button onclick="switchToHandMode()">핸드 기록 모드로 전환</button>
  </section>

  <!-- 3. 핸드 컨트롤 -->
  <section>
    <h2>3. 핸드 기록</h2>
    <button id="startHandBtn" onclick="startHand()" disabled>핸드 시작</button>
    <div id="handInfo"></div>
  </section>

  <!-- 4. 액션 기록 -->
  <section>
    <input id="actionInput" placeholder="액션 (예: SHAHINA raises 5000)" disabled>
    <button id="recordBtn" onclick="recordAction()" disabled>기록</button>
    <div id="actions"></div>
  </section>

  <!-- 5. 핸드 완료 -->
  <section>
    <input id="winnerInput" placeholder="승자 이름" disabled>
    <button id="completeBtn" onclick="completeHand()" disabled>핸드 완료</button>
  </section>

  <script>
    // Google Sheets API 설정
    const SHEET_ID = 'YOUR_SHEET_ID';
    const API_KEY = 'YOUR_API_KEY';

    let currentTable = null;
    let currentHand = null;

    // 1. 키 플레이어 검색
    async function searchKeyPlayer() {
      const name = document.getElementById('keyPlayerInput').value;

      // Google Sheets Type 시트 조회
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Type!A:H?key=${API_KEY}`
      );
      const data = await response.json();

      // 키 플레이어 찾기
      const rows = data.values.slice(1); // 헤더 제외
      const tables = new Map();

      for (const row of rows) {
        const [pokerRoom, tableName, tableNo, seatNo, playerName, nationality, chips, isKeyPlayer] = row;
        const tableId = `${pokerRoom}-${tableName}`.replace(/ /g, '-').toLowerCase();

        if (!tables.has(tableId)) {
          tables.set(tableId, {
            id: tableId,
            pokerRoom,
            tableName,
            players: []
          });
        }

        tables.get(tableId).players.push({
          seatNo: parseInt(seatNo),
          name: playerName,
          chips: parseInt(chips.replace(/,/g, '')),
          isKeyPlayer: isKeyPlayer === 'TRUE'
        });
      }

      // 키 플레이어가 있는 테이블 찾기
      for (const table of tables.values()) {
        const keyPlayers = table.players.filter(p => p.isKeyPlayer);
        if (keyPlayers.some(p => p.name.includes(name))) {
          currentTable = table;
          displayTable(table);
          document.getElementById('startHandBtn').disabled = false;
          return;
        }
      }

      alert('키 플레이어를 찾을 수 없습니다');
    }

    // 2. 테이블 표시
    function displayTable(table) {
      const html = `
        <h3>${table.pokerRoom} - ${table.tableName}</h3>
        ${table.players.map(p => `
          <div class="${p.isKeyPlayer ? 'key-player' : ''}">
            좌석 #${p.seatNo}: ${p.name} ${p.isKeyPlayer ? '⭐' : ''} - ${p.chips.toLocaleString()} 칩
          </div>
        `).join('')}
      `;
      document.getElementById('players').innerHTML = html;
    }

    // 3. 핸드 시작
    async function startHand() {
      const handNumber = prompt('핸드 번호를 입력하세요', '1');

      currentHand = {
        number: parseInt(handNumber),
        tableId: currentTable.id,
        timestamp: Date.now(),
        actions: []
      };

      // Google Sheets에 HAND 행 추가
      await appendToSheet('Hand', [
        ['HAND', currentHand.number, currentHand.timestamp, 'HOLDEM', 'BB_ANTE', '', '', '', '', '', '', '', '', '', '', '', currentTable.id]
      ]);

      // 플레이어 행 추가
      for (const player of currentTable.players) {
        await appendToSheet('Hand', [
          ['PLAYER', player.name, player.seatNo, 0, player.chips, player.chips, '']
        ]);
      }

      document.getElementById('handInfo').innerHTML = `<strong>핸드 #${currentHand.number} 진행 중</strong>`;
      document.getElementById('actionInput').disabled = false;
      document.getElementById('recordBtn').disabled = false;
      document.getElementById('winnerInput').disabled = false;
      document.getElementById('completeBtn').disabled = false;
    }

    // 4. 액션 기록
    async function recordAction() {
      const action = document.getElementById('actionInput').value;

      currentHand.actions.push(action);

      // Google Sheets에 EVENT 행 추가
      await appendToSheet('Hand', [
        ['EVENT', 'ACTION', '', '', Date.now(), action]
      ]);

      // UI 업데이트
      const actionDiv = document.createElement('div');
      actionDiv.textContent = `${new Date().toLocaleTimeString()}: ${action}`;
      document.getElementById('actions').appendChild(actionDiv);

      document.getElementById('actionInput').value = '';
    }

    // 5. 핸드 완료
    async function completeHand() {
      const winner = document.getElementById('winnerInput').value;

      // Google Sheets에 빈 행 추가 (핸드 구분)
      await appendToSheet('Hand', [['']]);

      alert(`핸드 #${currentHand.number} 완료! 승자: ${winner}`);

      // 초기화
      document.getElementById('handInfo').innerHTML = '';
      document.getElementById('actions').innerHTML = '';
      document.getElementById('actionInput').disabled = true;
      document.getElementById('recordBtn').disabled = true;
      document.getElementById('winnerInput').disabled = true;
      document.getElementById('completeBtn').disabled = true;
      document.getElementById('winnerInput').value = '';

      currentHand = null;
    }

    // Google Sheets 추가 헬퍼
    async function appendToSheet(sheetName, values) {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!A:Z:append?valueInputOption=RAW&key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values })
        }
      );
      return response.json();
    }
  </script>
</body>
</html>
```

**완료 조건**:
- [ ] 키 플레이어 검색 동작
- [ ] 테이블 플레이어 표시
- [ ] 핸드 시작/기록/완료 동작
- [ ] Google Sheets 연동 확인

---

### Day 3: UI 개선 및 에러 처리

**개선 사항**:
```javascript
// 로딩 표시
function showLoading(message) {
  document.body.innerHTML += `<div id="loading">${message}...</div>`;
}

function hideLoading() {
  document.getElementById('loading')?.remove();
}

// 에러 처리
async function searchKeyPlayer() {
  try {
    showLoading('검색 중');
    // ... 검색 로직
    hideLoading();
  } catch (error) {
    hideLoading();
    alert(`에러: ${error.message}`);
  }
}

// 입력 검증
function recordAction() {
  const action = document.getElementById('actionInput').value;

  if (!action.trim()) {
    alert('액션을 입력하세요');
    return;
  }

  // ... 기록 로직
}
```

**완료 조건**:
- [ ] 로딩 상태 표시
- [ ] 에러 처리 완료
- [ ] 입력 검증 추가

---

### Day 4: E2E 테스트

**시나리오 테스트**:
```javascript
// test-scenario.js
async function testFullWorkflow() {
  console.log('🧪 E2E 테스트 시작...');

  // 1. 키 플레이어 검색
  console.log('1. 키 플레이어 검색 (SHAHINA)');
  document.getElementById('keyPlayerInput').value = 'SHAHINA';
  await searchKeyPlayer();

  await sleep(1000);

  // 2. 핸드 시작
  console.log('2. 핸드 시작');
  await startHand();

  await sleep(1000);

  // 3. 액션 기록 (5개)
  const actions = [
    'SHAHINA raises 5000',
    'Alice calls 5000',
    'Bob folds',
    'SHAHINA bets 10000',
    'Alice calls 10000'
  ];

  for (const action of actions) {
    console.log(`3. 액션 기록: ${action}`);
    document.getElementById('actionInput').value = action;
    await recordAction();
    await sleep(500);
  }

  // 4. 핸드 완료
  console.log('4. 핸드 완료 (승자: SHAHINA)');
  document.getElementById('winnerInput').value = 'SHAHINA';
  await completeHand();

  console.log('✅ E2E 테스트 완료!');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 실행
testFullWorkflow();
```

**완료 조건**:
- [ ] E2E 테스트 스크립트 작성
- [ ] 자동 테스트 통과
- [ ] Google Sheets 데이터 확인

---

### Day 5: 사용자 테스트 및 피드백

**테스트 시나리오**:
1. 실제 데이터 매니저와 함께 테스트
2. 키 플레이어 검색 (SHAHINA)
3. Ocean Blue 테이블 확인
4. 핸드 #128 시작
5. 5개 액션 기록
6. 핸드 완료

**피드백 수집 양식**:
```markdown
## 사용자 피드백

### 1. 좋은 점
- [ ]

### 2. 불편한 점
- [ ]

### 3. 빠진 기능
- [ ]

### 4. 성능 이슈
- [ ]

### 5. 우선순위 개선 사항
1.
2.
3.
```

**완료 조건**:
- [ ] 실제 사용자 테스트 완료
- [ ] 피드백 3개 이상 수집
- [ ] Week 2 우선순위 결정

---

## 🎯 다음 단계 (Week 2 옵션)

### 옵션 A: 실사용 테스트 및 버그 수정
**목표**: 실제 카지노 환경에서 1주일 사용 후 피드백 수집

**작업**:
1. 실사용자 테스트 (Sarah Kim과 함께)
2. 버그 리스트 작성
3. 우선순위 수정
4. 사용성 개선

**기간**: 3-5일

---

### 옵션 B: 성능 최적화
**목표**: 테이블 로드 시간 2초 → 0.5초

**작업**:
1. IndexedDB 캐싱 도입
2. 백그라운드 동기화
3. 오프라인 지원
4. 성능 측정 및 최적화

**기간**: 5-7일

---

### 옵션 C: PWA 기능 강화
**목표**: 앱처럼 동작하는 웹

**작업**:
1. Service Worker 등록
2. 오프라인 캐싱
3. 홈 화면 추가
4. 푸시 알림 (선택)

**기간**: 3-5일

---

### 옵션 D: 추가 기능 개발
**목표**: Week 2+ 기능 추가

**후보 기능**:
1. 통계 대시보드
2. 핸드 히스토리 조회
3. 플레이어 검색
4. 테이블 비교
5. 데이터 내보내기

**기간**: 기능당 2-3일

---

## 📅 Week 2 이후 계획

> **참고**: 상세 구현 계획은 [PRD.md - 구현 계획](PRD.md#-구현-계획-week-2) 참조

### Local-First 아키텍처 완성
- Phase 1-5: 핸드 기록 및 플레이어 관리 동기화
- IndexedDB + syncQueue 기반 오프라인 지원
- 총 예상 시간: 9-14시간 (1-2일)

### 완료 기준
- ✅ 모든 쓰기 작업 Local-First
- ✅ 오프라인 100% 지원
- ✅ 성능 목표 달성 (액션 0.3초)
- ✅ 3초 실행취소 기능

---

## 🎯 다음 단계 (Week 3+)

**상세 내용**: [LLD.md](LLD.md) 참조

### 향후 고려사항
- DDD 리팩토링 (코드 복잡도 증가 시)
- Redis 캐싱 (Multi-User 지원 필요 시)
- 실시간 동기화 (Pub/Sub)

---

## ✅ 성공 기준

### Week 1 ✅
- [x] 동작하는 MVP 완성
- [x] 사용자 피드백 수집

### Week 2 (진행중)
- [ ] Local-First 아키텍처 완성
- [ ] 성능 목표 달성 (액션 0.3초)
- [ ] 오프라인 100% 지원

---

**핵심 원칙**: 완벽한 설계보다 동작하는 프로토타입이 먼저다! 🚀
