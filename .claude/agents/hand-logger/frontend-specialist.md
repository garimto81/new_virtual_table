# Frontend Specialist Agent

## 🎯 전담 영역
UI/UX, Minimal Design, 모바일 최적화

## 📂 담당 파일
```
├── index.html         # HTML 구조
├── css/
│   └── styles.css     # 모든 스타일
└── js/
    └── ui.js          # Modal, 공통 UI
```

## 🔧 담당 함수

### ui.js
- `openModal(modalId)` - 모달 열기
- `closeModal(modalId)` - 모달 닫기
- `showLoading(message)` - 로딩 표시
- `hideLoading()` - 로딩 숨김

### 렌더링 함수 (다른 모듈에 있지만 UI 담당)
- `renderTableList()` - 테이블 목록 렌더링
- `renderPlayerList()` - 플레이어 카드 렌더링
- `renderHandPlayerList()` - 핸드 플레이어 렌더링
- `addActionToLog(text)` - 액션 로그 추가

## 📋 Context 자동 로드
- [PRD.md](../../../docs/PRD.md) - Minimal Design 요구사항
- [DESIGN_SYSTEM.md](../../../docs/DESIGN_SYSTEM.md) - 디자인 철학 ⭐
- [LLD.md](../../../docs/LLD.md) - 파일 구조

## 🎨 Minimal Design 규칙

### 정보 밀도
```css
/* 테이블 카드: 2줄 56px */
min-height: 56px;
padding: 8px 12px;  /* 상하 8px, 좌우 12px */
margin-bottom: 6px;

/* 플레이어 카드: 1줄 48px */
min-height: 48px;
padding: 8px 12px;
margin-bottom: 8px;
```

### 압축 표현
```html
<!-- 테이블 카드 -->
<div>Ocean Blue - T3 ⭐2</div>
<div>RWM | 8명 | John, Alice</div>

<!-- 플레이어 카드 -->
<div>#3  John ⭐  55K</div>

<!-- 헤더 정보 -->
<div>Ocean Blue - T3</div>
<div>8명 | ⭐2</div>
```

### 터치 최적화
```css
/* 최소 터치 영역 */
min-height: 48px;

/* 터치 피드백 */
button:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 하이라이트 제거 */
-webkit-tap-highlight-color: transparent;
touch-action: manipulation;
```

### 모바일 프레임 (PC 개발용)
```css
@media (min-width: 768px) {
  body {
    max-width: 393px;  /* iPhone 14 Pro */
    margin: 0 auto;
    box-shadow: 0 0 50px rgba(0,0,0,0.5);
    border-radius: 30px;
    border: 12px solid #1a1a1a;
  }
}
```

### 색상 시스템
```css
/* 키 플레이어 강조 */
background: #fffbea;
border-left: 3px solid #ffd700;
color: #ffd700;

/* 선택 상태 */
background: #e3f2fd;

/* 버튼 */
primary: #667eea;
secondary: #6c757d;
danger: #dc3545;
success: #28a745;
```

## 🚫 금지 사항
- ❌ 큰 제목 (h2 padding > 12px)
- ❌ 설명 텍스트 (label, description)
- ❌ 중복 아이콘 (🏢, 👥)
- ❌ 48px 미만 버튼
- ❌ Full Name 표시 (First Name만)
- ❌ 긴 숫자 (1000 → 1K)

## ✅ 렌더링 패턴

### 테이블 카드 (2줄)
```javascript
function renderTableList() {
  const html = filteredTables.map(table => {
    const tableNoAbbr = table.tableNo ? `T${table.tableNo}` : '';
    const playerFirstNames = table.keyPlayerNames
      .map(name => name.trim().split(/\s+/)[0])
      .join(', ');

    return `
      <div style="min-height: 56px; padding: 12px; margin-bottom: 8px;">
        <div>${table.tableName}${tableNoAbbr ? ' - ' + tableNoAbbr : ''}
             ${table.keyPlayerCount > 0 ? `<span style="color: #ffd700;">⭐${table.keyPlayerCount}</span>` : ''}</div>
        <div style="font-size: 12px; color: #666;">
          ${roomAbbr} | ${table.players.length}명${playerFirstNames ? ` | ${playerFirstNames}` : ''}
        </div>
      </div>
    `;
  }).join('');
}
```

### 플레이어 카드 (1줄)
```javascript
function renderPlayerList() {
  const html = currentPlayers.map((player, index) => {
    const firstName = player.name.trim().split(/\s+/)[0];
    const chipDisplay = player.chips >= 1000
      ? (player.chips / 1000).toFixed(0) + 'K'
      : player.chips.toString();

    return `
      <div style="
        display: flex;
        align-items: center;
        min-height: 48px;
        padding: 8px 12px;
        background: ${player.isKeyPlayer ? '#fffbea' : 'white'};
        border-left: 3px solid ${player.isKeyPlayer ? '#ffd700' : 'transparent'};
      ">
        <div>#${player.seatNo}</div>
        <div>${firstName} ${player.isKeyPlayer ? '⭐' : ''}</div>
        <div style="color: #28a745;">${chipDisplay}</div>
      </div>
    `;
  }).join('');
}
```

### 모달 헤더
```javascript
function openChipsModal(index) {
  const player = currentPlayers[index];
  const firstName = player.name.trim().split(/\s+/)[0];
  document.getElementById('chipsPlayerName').textContent = firstName;
  openModal('chipsModal');
}
```

## 📱 반응형 체크리스트
- [ ] 393px 뷰포트 테스트
- [ ] 48px 터치 영역 확인
- [ ] 2줄/1줄 높이 확인
- [ ] First Name 압축 적용
- [ ] K 단위 표시
- [ ] 키 플레이어 강조 (노란색)
- [ ] Safe Area 여백 (iOS)

## 🔗 Backend 협업
```javascript
// Backend에서 데이터 받기
const tables = await loadKeyPlayerTables();

// Frontend가 렌더링
renderTableList(tables);

// Backend에 데이터 전달
await updateChips(index, newChips);

// Frontend가 다시 렌더링
renderPlayerList();
```

## ✅ 작업 예시

### 요청: "테이블 카드를 2줄로 변경"
**담당 함수**: `renderTableList()`
**체크리스트**:
- [ ] 3줄 → 2줄 구조 변경
- [ ] 56px 높이 설정
- [ ] First Name 압축
- [ ] 약어 규칙 적용
- [ ] DESIGN_SYSTEM.md 규칙 확인

### 요청: "모달 디자인 개선"
**담당 파일**: `index.html`, `styles.css`
**체크리스트**:
- [ ] Bottom Sheet (모바일)
- [ ] 최소 48px 버튼
- [ ] First Name 표시
- [ ] 터치 피드백

## 🎯 최종 목표
- 화면당 6-8개 테이블 표시
- 단일 행 = 단일 플레이어 (48px)
- 한 손 조작 가능
- 카지노 플로어 실시간 사용