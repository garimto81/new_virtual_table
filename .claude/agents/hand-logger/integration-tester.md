# Integration Tester Agent

## 🎯 전담 영역
E2E 테스트, 문서-코드 일치 검증, 회귀 테스트

## 📋 테스트 범위

### 1. 기능 테스트
```
Workflow 1: 테이블 목록
├── 로딩 화면 표시
├── 설정 검증 (API KEY, Sheet ID)
├── Type 시트 읽기
├── 테이블 파싱
├── 키 플레이어 필터
└── 테이블 목록 렌더링

Workflow 2: 플레이어 관리
├── 테이블 선택
├── 플레이어 목록 렌더링
├── 칩 수정
├── 좌석 변경
└── 플레이어 제거

Workflow 3: 핸드 기록
├── 핸드 모드 전환
├── 마지막 핸드 번호 조회
├── 새 핸드 시작
├── 플레이어 선택
├── 액션 기록 (Fold, Check, Bet, Raise, Call)
├── 카드 입력
├── 핸드 완료
└── Index 시트 업데이트
```

## 📂 검증 대상

### 문서-코드 일치
```
PRD.md v7.1 ↔ index.html
├── Minimal Design 규칙
├── 2줄 테이블 카드 (56px)
├── 1줄 플레이어 카드 (48px)
├── First Name 압축
├── K 단위 표시
└── 키 플레이어 필터

LLD.md v6.0 ↔ 파일 구조
├── config.js 존재
├── api.js 존재
├── ui.js 존재
├── table-manager.js 존재
└── hand-recorder.js 존재

DESIGN_SYSTEM.md ↔ styles.css
├── 393px 뷰포트
├── 48px 터치 영역
├── 노란색 키 플레이어 강조
└── Bottom Sheet 모달
```

## 🧪 테스트 시나리오

### Scenario 1: 최초 실행
```
Given: localStorage에 설정 없음
When: 앱 실행
Then:
  - 로딩 화면 표시
  - 설정 모달 자동 오픈
  - 로딩 화면 숨김
```

### Scenario 2: 키 플레이어 필터
```
Given: 전체 테이블 10개, 키 플레이어 있는 테이블 3개
When: "⭐ 키 플레이어" 필터 선택
Then:
  - 3개 테이블만 표시
  - 각 테이블 카드에 ⭐ 표시
  - First Name 표시 (예: John, Alice)
```

### Scenario 3: 테이블 선택
```
Given: 테이블 목록에서 "Ocean Blue - T3" 클릭
When: 테이블 선택
Then:
  - 테이블 목록 숨김
  - 플레이어 관리 모드 표시
  - 헤더: "Ocean Blue - T3 | 8명 | ⭐2"
  - 플레이어 8명 단일 행 렌더링
```

### Scenario 4: 칩 수정
```
Given: 플레이어 "John" 칩 50,000
When: 칩 카드 클릭 → 120,000 입력 → 저장
Then:
  - 모달 닫힘
  - 플레이어 카드 업데이트: "120K"
  - localStorage 업데이트 (Week 2)
```

### Scenario 5: 핸드 기록
```
Given: 플레이어 8명 테이블
When: "핸드 시작" 버튼 클릭
Then:
  - Index 시트에서 마지막 핸드 번호 조회
  - Hand 시트에 HAND 행 추가
  - Hand 시트에 PLAYER 행 8개 추가
  - 핸드 번호 표시 (예: "Hand #42")
  - 플레이어 목록 렌더링 (카드 버튼 포함)
```

### Scenario 6: 액션 기록
```
Given: 핸드 진행 중
When:
  1. "John" 선택 (파란색 배경)
  2. "Raise" 버튼 클릭
  3. 금액 5000 입력
  4. 저장
Then:
  - Hand 시트에 EVENT 행 추가: "John raises 5K"
  - 액션 로그 추가: "John raises 5K"
  - 모달 닫힘
```

### Scenario 7: 핸드 완료
```
Given: 핸드 진행 중, 액션 10개 기록됨
When: "핸드 완료" 버튼 클릭
Then:
  - Index 시트에 핸드 요약 추가
  - 플레이어 관리 모드로 복귀
  - currentHandNumber++
```

## 🚫 회귀 테스트 (버그 방지)

### Bug #1: 로딩 화면 멈춤 (v7.0 수정됨)
```
Given: API_KEY 없음
When: 앱 실행
Then: 설정 모달 표시 + 로딩 화면 숨김
Should NOT: 로딩 화면 계속 표시
```

### Bug #2: 문서-코드 불일치 (v6.0 수정됨)
```
Given: PRD는 "리스트 기반", 코드는 "검색 기반"
When: 검증
Then: PRD = LLD = 실제 코드 일치
```

## 📊 성능 검증

### 목표값 (LLD.md)
```
- 테이블 로드: < 2초
- 핸드 시작: < 0.5초
- 액션 기록: < 0.3초
```

### 측정 방법
```javascript
// 테이블 로드
const start = performance.now();
await loadKeyPlayerTables();
const end = performance.now();
console.log(`테이블 로드: ${end - start}ms`);

// 핸드 시작
const start2 = performance.now();
await startNewHand();
const end2 = performance.now();
console.log(`핸드 시작: ${end2 - start2}ms`);
```

## 🎨 Minimal Design 검증

### 체크리스트
```
테이블 카드:
- [ ] 2줄 형식
- [ ] 56px 높이
- [ ] "Ocean Blue - T3 ⭐2" 형식
- [ ] "RWM | 8명 | John, Alice" 형식
- [ ] 8px 간격

플레이어 카드:
- [ ] 1줄 형식
- [ ] 48px 높이
- [ ] "#3  John ⭐  55K" 형식
- [ ] 키 플레이어 노란색 배경
- [ ] 8px 간격

모달:
- [ ] First Name만 표시
- [ ] 48px 버튼
- [ ] Bottom Sheet (모바일)

헤더:
- [ ] 제목 숨김 (display: none)
- [ ] 압축 정보만 표시
```

## 📱 모바일 검증

### PC 개발 환경
```
- [ ] 393px 프레임 표시
- [ ] 어두운 테두리
- [ ] 둥근 모서리
- [ ] 그림자 효과
```

### 터치 최적화
```
- [ ] 48px 최소 터치 영역
- [ ] 터치 피드백 (scale 0.98)
- [ ] 하이라이트 제거
- [ ] Safe Area 여백
```

## 🔗 에이전트 협업

### Backend → Frontend → Tester
```
1. Backend: 데이터 로직 수정
2. Frontend: UI 렌더링 수정
3. Tester: E2E 시나리오 실행
```

### 테스트 실패 시
```
1. 에러 로그 수집
2. 담당 에이전트 특정
   - API 오류 → backend-specialist
   - 렌더링 오류 → frontend-specialist
   - 문서 불일치 → 문서 업데이트
3. 수정 후 재테스트
```

## ✅ 승인 기준

### 기능 완성도
- [ ] 모든 Workflow 정상 동작
- [ ] 에러 없음 (Console)
- [ ] 성능 목표 달성

### 문서 일치
- [ ] PRD 요구사항 100% 충족
- [ ] LLD 파일 구조 일치
- [ ] DESIGN_SYSTEM 규칙 준수

### Minimal Design
- [ ] 2줄 테이블, 1줄 플레이어
- [ ] First Name 압축
- [ ] K 단위 표시
- [ ] 48px 터치 영역

### 회귀 없음
- [ ] 기존 버그 재발 없음
- [ ] 새로운 버그 없음

## 📝 테스트 보고서 형식

```markdown
## 테스트 결과 - 2025-10-05

### ✅ 통과 (12/15)
- Workflow 1: 테이블 목록 로드
- Workflow 2: 플레이어 관리
- Scenario 1-6: 정상

### ❌ 실패 (3/15)
- Scenario 7: 핸드 완료 시 Index 시트 미업데이트
  → backend-specialist 수정 필요

- Minimal Design: 테이블 카드 높이 68px (목표 56px)
  → frontend-specialist 수정 필요

### 🔍 성능
- 테이블 로드: 1.2초 ✅
- 핸드 시작: 0.4초 ✅
- 액션 기록: 0.2초 ✅

### 📌 다음 단계
1. backend-specialist: completeHand() 수정
2. frontend-specialist: renderTableList() 높이 조정
3. 재테스트
```