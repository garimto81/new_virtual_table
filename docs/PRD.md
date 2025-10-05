# PRD v7.3 - 현실 반영 및 재설계

> **모바일 전용 PWA | 정보 밀도 최대화 | 실무자 중심**
> **업데이트**: 2025-10-05
> **상태**: 읽기 50% 완료, 쓰기 0% 미완성

## 📝 변경 이력
### v7.3 - 2025-10-05 (현실 반영)
- 🔍 **현실 진단**: Week 2 작업이 파일만 생성되고 통합 안됨
- ❌ **쓰기 기능 미완성**: 모든 쓰기 작업이 동기 API 호출 (Local-First 실패)
- ❌ **핸드 기록**: IndexedDB/syncQueue 무시하고 즉시 appendToSheet 호출
- ❌ **플레이어 관리**: 로컬만 업데이트, 서버 동기화 없음
- 📊 **실제 완성도**: 50% (이전 착각 75% → 수정)

### v7.2 - 2025-10-05
- ✅ **모듈화 완료**: 1615줄 → 8개 파일 (index.html, styles.css, 6개 JS 모듈)
- ✅ **utils.js 생성**: formatChips, getFirstName, getTableNumberAbbr 공통 함수
- ✅ **ui.js 생성**: openModal, closeModal UI 헬퍼
- ✅ **코드 중복 제거**: 5건 → 0건 (Code Reviewer 승인)
- ✅ **window namespace 구조화**: tableManager, handRecorder 네임스페이스

### v7.1 - 2025-10-05
- ✅ Minimal Design 전체 적용 완료
- ✅ 테이블 목록: 압축 형식 (T3, RWM, First Name)
- ✅ 플레이어 카드: 단일 행 48px
- ✅ 칩 금액 압축 (50K, 120K)
- ✅ 모든 모달 헤더: First Name만 표시
- ✅ 액션 로그: 압축된 이름 및 금액

### v7.0 - 2025-10-05
- Minimal Design 철학 정립
- DESIGN_SYSTEM.md 생성
- PROJECT_RULES.md 생성

## 관련 문서
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - **Minimal 디자인 철학**
- [PLAN.md](PLAN.md) - 개발 계획
- [LLD.md](LLD.md) - 기술 설계

---

## 🎯 제품 비전

**"키 플레이어가 앉은 테이블의 모든 활동을 실시간 추적하여, 카지노가 게임 데이터를 분석하고 키 플레이어를 효과적으로 관리할 수 있게 한다"**

### 핵심 가치
1. **Minimal Design** - 정보 밀도 최대화, 불필요한 텍스트/버튼 제거
2. **한 손 조작** - 카지노 플로어 이동 중 사용
3. **빠른 전환** - 1초 이내 테이블 이동
4. **직접 입력** - 탭 → 입력, 불필요한 모달 최소화

---

## 👤 사용자 페르소나

### Sarah Kim (포커 데이터 매니저)

```yaml
나이: 28세
근무지: 마닐라 카지노
업무: 키 플레이어 게임 활동 추적

하루 일과:
  09:00 - 출근, 앱 시작
  09:10 - 키 플레이어 리스트 확인 (John Doe, Alice Wang, Bob Smith)
  09:15 - John Doe 추적 시작
         → Ocean Blue 테이블 찾기
         → 테이블 전체 플레이어 8명 로드
         → 플레이어 칩/좌석 정보 업데이트
  09:30 - 핸드 기록 모드로 전환
         → 같은 8명으로 핸드 #127 시작
         → John, Alice(키 플레이어) 액션 집중 관찰
         → 모든 플레이어 액션/카드 기록
  10:30 - Alice가 Dragon Green 테이블로 이동
         → 빠른 테이블 전환 (<1초)
         → 새 테이블 플레이어 6명 로드

주요 불만:
  ❌ 테이블 전환이 느림 (현재 5-10초)
  ❌ 핸드 번호 수동 입력 귀찮음
  ❌ 플레이어 관리 vs 핸드 기록이 분리 안 됨

원하는 기능:
  ✅ 테이블 목록에서 선택 (키 플레이어 테이블 필터)
  ✅ 테이블 선택 = 해당 테이블 플레이어만 로드
  ✅ 명확한 모드 전환 (관리 ↔ 기록)
  ✅ 핸드 번호 자동 증가
```

---

## 🎬 핵심 사용자 시나리오

### 시나리오 1: 테이블 선택 및 플레이어 관리

```
1. 앱 시작
   → 테이블 목록 표시 (기본: 키 플레이어 포함 테이블만)
   → Resorts World Manila - Ocean Blue - Table 3
   → Resorts World Manila - Dragon Green - Table 7
   → Solaire Resort - Royal Table - Table 1

2. 필터 선택 (옵션)
   → [⭐ 키 플레이어 테이블만] / [📋 전체 테이블] 토글

3. 테이블 선택
   → "Ocean Blue - Table 3" 클릭
   → 해당 테이블의 플레이어 8명만 로드:
      #1 Tom Lee     (일반)  10K
      #2 Sarah Kim   (일반)  15K
      #3 John Doe    🌟 키 플레이어   50K
      #4 Mike Chen   (일반)  8K
      #5 Alice Wang  🌟 키 플레이어   120K
      ... (계속)

4. 플레이어 정보 업데이트
   → John 칩: 50K → 55K
   → Alice 좌석: #5 → #7
   → Tom 새로 추가

시간: < 30초
```

### 시나리오 2: 핸드 기록

```
1. [핸드 기록 모드] 버튼 클릭
   → 같은 8명의 플레이어 표시
   → 핸드 #127 자동 시작
   → 액션 패드 활성화

2. 액션 기록
   → Tom: Call 100
   → Sarah: Fold
   → John 🌟: Raise 500  ← 키 플레이어 강조
   → Mike: Call 500
   → Alice 🌟: Call 500
   ... (계속)

3. 카드 입력 (쇼다운 시)
   → John: A♠ K♠
   → Mike: Q♥ Q♦
   → Alice: J♣ 10♣

4. 핸드 완료
   → John 승리 선택
   → [저장 중...] (1초)
   → 자동으로 핸드 #128 시작

시간: 핸드당 2-5분
```

### 시나리오 3: 다른 테이블로 이동

```
1. 핸드 기록 중 Alice가 Dragon Green으로 이동

2. 빠른 전환
   → [← 테이블 목록] 버튼 클릭
   → 1초 이내 테이블 목록 복귀

3. 새 테이블 선택
   → "Dragon Green - Table 7" 클릭
   → 해당 테이블 플레이어 6명만 로드 (Alice 포함)
   → 플레이어 관리 모드로 시작

시간: < 2초
```

---

## 🗂️ 핵심 기능 요구사항

### F1. 테이블 플레이어 관리 모드

**목적**: 테이블의 모든 플레이어 정보 관리

**기능 구현 상태**:
- ✅ 테이블 선택 시 모든 플레이어 로드
- ✅ 키 플레이어 🌟 강조 표시
- ⚠️ 플레이어 추가/제거 (UI만 동작, 서버 동기화 없음)
- ⚠️ 칩 정보 실시간 수정 (UI만 동작, 서버 동기화 없음)
- ⚠️ 좌석 번호 변경 (UI만 동작, 서버 동기화 없음)
- ❌ 즉시 로컬 저장, 백그라운드 동기화 (미구현)

**화면 구성**:
```
┌─────────────────────────────────────────┐
│ Ocean Blue 테이블 - 플레이어 관리          │
│ 전체 8명 (키 플레이어 2명)                        │
├─────────────────────────────────────────┤
│ #1  Tom Lee       (일반)                │
│     Chips: 10,000  🇰🇷                  │
│     [칩 수정] [좌석] [제거]                │
│                                          │
│ #3  John Doe      🌟 키 플레이어                │
│     Chips: 55,000  🇺🇸                  │
│     [칩 수정] [좌석] [제거]                │
│                                          │
│ #5  Alice Wang    🌟 키 플레이어                │
│     Chips: 120,000 🇨🇳                  │
│     [칩 수정] [좌석] [제거]                │
├─────────────────────────────────────────┤
│ [+ 플레이어 추가]                          │
│ [📝 핸드 기록 모드로 전환]                  │
└─────────────────────────────────────────┘
```

**성능 목표**:
- 테이블 로드: < 1초
- 정보 수정: 즉시 반영 (< 0.3초)

---

### F2. 핸드 기록 모드

**목적**: 게임 핸드의 모든 액션 기록

**기능 구현 상태**:
- ✅ 테이블의 활성 플레이어로 핸드 시작
- ✅ 핸드 번호 자동 증가
- ⚠️ 모든 플레이어 액션 기록 (동기 API 호출, Local-First 실패)
- ⚠️ 카드 정보 입력 (동기 API 호출, Local-First 실패)
- ✅ 키 플레이어 액션 강조 표시
- ❌ 3초 실행취소 기능 (미구현)
- ✅ 핸드 완료 후 자동으로 다음 핸드 시작

**화면 구성**:
```
┌─────────────────────────────────────────┐
│ Ocean Blue - 핸드 #127                   │
│ 참여 플레이어 8명 (키 플레이어 2명)                │
├─────────────────────────────────────────┤
│ #1  Tom      10K   [액션] [카드]         │
│ #2  Sarah    15K   [액션] [카드]         │
│ #3  John 🌟  55K   [액션] [카드]         │
│ #5  Alice 🌟 120K  [액션] [카드]         │
├─────────────────────────────────────────┤
│ 액션 로그:                                │
│ Tom: Call 100                           │
│ Sarah: Fold                             │
│ 🌟 John: Raise 500  ← 키 플레이어 강조          │
│ Alice: Call 500                         │
├─────────────────────────────────────────┤
│ 현재 차례: #5 Alice (키 플레이어)                │
│ [폴드] [콜] [레이즈] [올인]                │
│                                          │
│ [핸드 완료] [← 플레이어 관리]              │
└─────────────────────────────────────────┘
```

**성능 목표**:
- 핸드 시작: < 0.5초
- 액션 기록: < 0.3초
- 핸드 완료 & 자동 갱신: < 2초

---

### F3. 테이블 목록 및 필터

**목적**: 테이블 선택 및 키 플레이어 테이블 필터링

**기능**:
- ✅ 전체 테이블 목록 표시 (Poker Room + Table Name + Table No.)
- ✅ 키 플레이어 포함 테이블만 필터링 (기본값)
- ✅ 전체 테이블 보기 토글
- ✅ 테이블 선택 시 해당 테이블 플레이어만 로드

**화면 구성 (Minimal)**:
```
┌─────────────────────────────────────┐
│ ⭐ 키 플레이어 | 📋 전체             │ ← 제목 없음, 필터만
├─────────────────────────────────────┤
│ Ocean Blue - T3          ⭐2        │ ← 68px 높이
│ RWM | 8명                           │
│ John, Alice                         │
├─────────────────────────────────────┤
│ Dragon Green - T7        ⭐1        │
│ RWM | 6명                           │
│ Alice                               │
└─────────────────────────────────────┘
```

**변경 사항**:
- ❌ "테이블 목록" 제목 제거
- ❌ "필터:" 레이블 제거
- ❌ "전체 8명 (⭐ 키 플레이어 2명)" → "8명"으로 압축
- ✅ "Table 3" → "T3" 약어
- ✅ 플레이어 이름 약어 (First Name만)

**성능 목표**:
- 테이블 목록 로드: < 1초
- 필터 전환: < 0.3초
- 테이블 선택 & 플레이어 로드: < 0.5초

---

## 🚀 비기능 요구사항

### NFR1. 성능

| 작업 | 목표 시간 |
|-----|----------|
| 앱 시작 | < 2초 |
| 테이블 전환 | < 1초 |
| 핸드 시작 | < 0.5초 |
| 액션 기록 | < 0.3초 |
| 핸드 완료 & 갱신 | < 2초 |

### NFR2. Minimal Design (필수)

> **철학**: 실무자 중심, 정보 밀도 최대화, 불필요한 요소 제거

#### 핵심 원칙

**1. Information Density (정보 밀도)**
- 화면당 최소 6-8개 테이블 표시
- 단일 행 = 단일 플레이어 (48px)
- ❌ 큰 제목, 설명 텍스트, 아이콘
- ✅ 압축된 레이블, 숫자 중심, 그리드 레이아웃

**2. Action-First (액션 우선)**
- ❌ "칩 수정 버튼 → 모달 → 입력 → 저장"
- ✅ "칩 금액 탭 → 직접 입력"

**3. Text Hierarchy (텍스트 위계)**
- 대분류: 16px, 600
- 데이터: 14px, 400
- 메타: 12px, 400, #666

**4. Spacing System (간격 체계)**
- XS: 4px (같은 그룹 내 요소)
- S: 8px (관련 요소)
- M: 12px (섹션 내부)
- L: 16px (섹션 간)
- XL: 24px (페이지 구분)

**5. Color Palette (색상)**
- Primary: #667eea (액션 버튼)
- Success: #28a745 (칩 금액)
- Warning: #ffd700 (키 플레이어)
- Danger: #dc3545 (Fold)

#### 압축 규칙
- "Table 3" → "T3"
- "John Doe" → "John" (First Name만)
- "전체 8명 (키 플레이어 2명)" → "8명" + "⭐2"

#### 컴포넌트 규칙

**테이블 카드** (56px 높이, 2줄 압축)
- 제목 없음 ("테이블 목록" X)
- 패딩: 8px 12px
- Ocean Blue - T3 ⭐2 | RWM | 8명 | John, Alice

**플레이어 카드** (48px 높이, 단일 행)
- 좌석 → 이름 → 키 마크 → 칩
- 버튼 없음 (탭으로 직접 수정)
- #3 John Doe ⭐ 55,000

**모달/시트**
- 제목 1줄 (설명 X)
- 패딩: 16px
- 입력 필드 48px
- 버튼 하나만 (취소 버튼 X)

#### 금지 사항
- ❌ 큰 헤더 (padding > 20px)
- ❌ 설명 텍스트 ("아래에서 선택...")
- ❌ 아이콘 + 텍스트 중복 ("⭐ 키 플레이어 테이블만")
- ❌ 불필요한 버튼 ("칩 수정", "좌석 변경")
- ❌ 카드 그리드 (공간 낭비)
- ❌ 큰 여백 (margin > 16px)

#### 모바일 최적화
- 터치 영역: 최소 48px × 48px
- 버튼 간격: 8px
- iOS 줌 방지: input font-size 16px
- Safe Area 대응: env(safe-area-inset-*)

### NFR3. 로컬 우선 (Local-First)

- ✅ 모든 작업 로컬에서 즉시 완료
- ✅ 백그라운드 서버 동기화
- ✅ 오프라인 100% 지원
- ✅ 온라인 복구 시 자동 동기화

### NFR4. 데이터 무결성

- ✅ 핸드 번호 중복 방지
- ✅ 플레이어 좌석 중복 방지
- ✅ 트랜잭션 처리 (핸드 저장)

---

## 📊 성공 지표

| KPI | 목표 | 측정 방법 |
|-----|------|----------|
| 평균 테이블 전환 시간 | < 1초 | Analytics |
| 핸드 기록 완료율 | > 95% | 시작 vs 완료 |
| 오프라인 사용 비율 | > 50% | 네트워크 상태 로그 |
| 사용자 만족도 (CSAT) | > 4.5/5 | 설문 |

---

## ⚠️ 제약사항

1. **Google Sheets 제한**
   - 동시 쓰기 제한
   - API 쿼터 제한
   - **해결**: 로컬 우선, 배치 동기화

2. **모바일 환경**
   - 작은 화면 (iPhone: 393px, Galaxy: 360px)
   - 터치 인터페이스 (손가락 평균 44-48px)
   - 한 손 조작 (카지노 플로어 이동 중 사용)
   - **해결**: 48px 최소 터치 영역, 하단 고정 버튼, 하단 시트 UI

---

## 🏗️ 시스템 아키텍처

### 전체 구조
```
┌─────────────────────────────────────┐
│  Frontend (PWA)                     │
│  - index.html (Single Page)         │
│  - Vanilla JavaScript               │
│  - Tailwind CSS                     │
└────────────┬────────────────────────┘
             │
             ├─ 읽기 (CSV Export)
             │  ├─ Type 시트: 플레이어 정보
             │  ├─ Index 시트: 핸드 인덱스
             │  └─ Hand 시트: 핸드 상세
             │
             └─ 쓰기 (Apps Script API)
                └─ doPost(action, data)
                   ├─ addPlayer / updatePlayer
                   ├─ deletePlayer
                   └─ batchUpdate

┌─────────────────────────────────────┐
│  Google Sheets (Database)           │
│  - Type: 플레이어 마스터             │
│  - Index: 핸드 메타데이터            │
│  - Hand: 핸드 상세 데이터            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Apps Script (Backend)              │
│  - v71.1.0 (Phase 0 Week 1)         │
│  - createPlayer() - 중복 자동 업데이트│
│  - updatePlayer() / deletePlayer()  │
└─────────────────────────────────────┘
```

### 데이터 흐름
1. **앱 초기화:**
   - Frontend → CSV URLs → Google Sheets (공개 Export)
   - Type/Index/Hand 시트 데이터 로드
   - parseCSV() → buildTypeFromCsv()

2. **플레이어 추가/수정:**
   - Frontend → Apps Script URL → doPost()
   - Apps Script: createPlayer() 실행
   - 중복 시 자동 업데이트 (Phase 0)
   - Type 시트 업데이트

3. **핸드 저장:**
   - Frontend → Apps Script URL → doPost()
   - Hand 시트 append
   - Index 시트 append

### 기술 스택
- **Frontend:**
  - HTML5 / JavaScript (ES6+)
  - Tailwind CSS 3.x
  - PWA (Service Worker, Manifest)
  - LocalStorage (설정 저장)

- **Backend:**
  - Google Apps Script v71.1.0
  - Google Sheets API (간접 사용 via CSV)

- **데이터 저장:**
  - Google Sheets (Database)
  - CSV Export (읽기 전용)

### 아키텍처 결정 배경
**선택:** Apps Script + CSV 하이브리드

**이유:**
1. ✅ 안정성: 검증된 아키텍처
2. ✅ 단순성: 설정 1개 (Apps Script URL)
3. ✅ 성능: 현재 사용량 충분 (할당량 0.5%)
4. ✅ 무료: Google Workspace 기본 제공

**대안 고려:**
- Google Sheets API v4: 복잡도 증가, Service Account 관리 필요
- Redis 3-tier: Phase 3에서 검토 (성능 최적화용)

**상세 문서:** [docs/ARCHITECTURE_DECISION.md](../../docs/ARCHITECTURE_DECISION.md)

---

## 📝 용어 정의

- **키 플레이어**: 카지노가 집중 관리하는 고액 플레이어
- **테이블**: 포커 게임이 진행되는 물리적 장소 (Poker Room + Table Name + Table No. 조합)
- **핸드**: 포커 게임의 한 라운드
- **액션**: 플레이어의 행동 (폴드, 콜, 레이즈, 올인)
- **모드**: 플레이어 관리 모드 vs 핸드 기록 모드
- **필터**: 키 플레이어 포함 테이블만 보기 vs 전체 테이블 보기
- **Apps Script**: Google Sheets 백엔드 로직 (doPost API)
- **CSV Export**: Google Sheets 공개 데이터 읽기 방식

---

---

## 🚀 구현 계획 (Week 2)

> **현재 상태**: 읽기 50% 완료, 쓰기 0% 미완성
> **목표**: IndexedDB + syncQueue 기반 오프라인 지원 완성

### 📊 현재 상태 진단

#### ✅ 완료된 것
```yaml
읽기 기능 (50%):
  - ✅ 테이블 목록 로드 (IndexedDB 캐싱)
  - ✅ 테이블 필터링 (키플레이어/전체)
  - ✅ 플레이어 정보 표시

인프라 (파일만 존재):
  - ✅ db.js (IndexedDB 구조)
  - ✅ sync.js (백그라운드 동기화 매니저)
  - ✅ Service Worker (오프라인 캐싱)

UI/UX:
  - ✅ Minimal Design 전체 적용
  - ✅ 모듈화 구조 (8개 파일)
```

#### ❌ 미완성/문제점
```yaml
쓰기 기능 (0%):
  플레이어 관리:
    - ❌ saveChips() - 로컬만 업데이트, 서버 동기화 없음
    - ❌ saveSeat() - 로컬만 업데이트, 서버 동기화 없음
    - ❌ addPlayer() - 로컬만 업데이트, 서버 동기화 없음
    - ❌ removePlayer() - 로컬만 업데이트, 서버 동기화 없음

  핸드 기록:
    - ❌ saveAction() - 동기 API 호출 (appendToSheet 즉시)
    - ❌ saveCards() - 동기 API 호출 (appendToSheet 즉시)
    - ⚠️ completeHand() - syncQueue 추가하지만 즉시 API도 호출

Local-First 실패:
  - ❌ IndexedDB 생성했지만 사용 안함
  - ❌ syncQueue 생성했지만 무시함
  - ❌ 오프라인에서 쓰기 작업 불가
  - ❌ 성능: 액션당 2초 (목표 0.3초)
```

---

### 📌 Phase 1: 플레이어 관리 쓰기 동기화 (최우선)

**목표**: saveChips, saveSeat, addPlayer, removePlayer에 syncQueue 추가

**왜 이게 먼저?**
- ✅ **가장 간단한 쓰기 기능** (핸드 기록보다 난이도 낮음)
- ✅ 단일 행 업데이트로 테스트 용이
- ✅ Local-First 아키텍처 학습에 최적
- ✅ 핸드 기록은 복잡하므로 나중에 구현

**서브 에이전트**:
1. **backend-specialist (병렬 실행)**:
   - 작업 A: saveChips, saveSeat 수정 (table-manager.js:275-349)
   - 작업 B: addPlayer, removePlayer 수정
   - DB.addToSyncQueue('player', {...}) 추가

2. **debugger**: 플레이어 관리 테스트
   - 칩 수정 → 좌석 변경 → 플레이어 추가 → 삭제
   - 오프라인 → 온라인 전환 확인

3. **code-reviewer**: 코드 중복 및 품질 검증

**예상 시간**: 2-3시간 (병렬 실행)
**완료 기준**: 플레이어 관리 후 새로고침해도 데이터 유지

---

### 📌 Phase 2: sync.js 플레이어 동기화 로직

**목표**: syncQueue의 'player' 타입 처리

**서브 에이전트**:
1. **backend-specialist**: sync.js의 syncPlayer() 구현
   - Type 시트에서 해당 플레이어 행 찾기
   - updateChips, updateSeat, add, remove 4가지 타입 처리
   - Google Sheets API 호출

2. **debugger**: 전체 워크플로우 E2E 테스트
   - 테이블 선택
   - 플레이어 칩 수정
   - 오프라인 → 온라인 전환 확인

**예상 시간**: 2시간
**완료 기준**: syncQueue → Google Sheets 자동 동기화 성공

---

### 📌 Phase 3: 핸드 기록 Local-First 전환 (난이도 높음, 나중에)

**목표**: saveAction, saveCards를 IndexedDB + syncQueue로 변경

**왜 나중에?**
- ❌ **가장 복잡한 쓰기 기능** (액션 시퀀스, 트랜잭션 처리)
- ❌ 여러 테이블 동시 업데이트 (Hand + Index 시트)
- ❌ 에러 처리 복잡 (핸드 완료 후 동기화 실패 시)
- ✅ Phase 1-2에서 Local-First 패턴 학습 후 진행

**서브 에이전트**:
1. **backend-specialist**: hand-recorder.js 리팩토링
   - saveAction() → IndexedDB 저장 + syncQueue만
   - saveCards() → IndexedDB 저장 + syncQueue만
   - completeHand() → 즉시 appendToSheet 제거

2. **debugger**: 리팩토링 후 테스트
   - 핸드 시작 → 액션 5개 → 카드 입력 → 완료
   - 오프라인 모드에서 동작 확인
   - Google Sheets 동기화 확인 (10초 후)

3. **code-reviewer**: 코드 중복 및 품질 검증

**예상 시간**: 3-4시간
**완료 기준**: 오프라인에서 핸드 기록 → 온라인 복구 시 자동 동기화

---

### 📌 Phase 4: sync.js 핸드 동기화 로직

**목표**: syncQueue의 'hand' 타입 처리

**서브 에이전트**:
1. **backend-specialist**: sync.js의 syncHand() 구현
   - syncQueue에서 'hand' 타입 꺼내기
   - Google Sheets Hand, Index 시트 업데이트
   - 실패 시 재시도 큐 추가

2. **debugger**: 동기화 테스트
   - 오프라인에서 핸드 3개 기록
   - 온라인 전환
   - 10초 후 Google Sheets 확인

**예상 시간**: 2-3시간
**완료 기준**: syncQueue → Google Sheets 자동 동기화 성공

---

### 📌 Phase 5: 3초 실행취소 기능

**목표**: 액션 기록 후 3초 내 취소 가능

**서브 에이전트**:
1. **frontend-developer**: 실행취소 UI 구현
   - 액션 기록 후 3초 타이머 표시
   - [실행취소] 버튼 추가
   - 3초 후 자동 숨김

2. **javascript-pro**: 실행취소 로직
   - currentHand.actions에서 마지막 액션 제거
   - IndexedDB 업데이트
   - syncQueue에서 해당 액션 제거

3. **debugger**: 실행취소 테스트
   - 액션 5개 → 2초 내 취소 → 3초 후 취소 불가

**예상 시간**: 2-3시간
**완료 기준**: 3초 내 실행취소 성공

---

### ✅ Week 2 완료 기준

- ✅ 모든 쓰기 작업이 Local-First (IndexedDB)
- ✅ 오프라인 100% 지원
- ✅ 성능 목표 달성 (액션 0.3초)
- ✅ 3초 실행취소 기능

**총 예상 시간**: 9-14시간 (1-2일)

---

## 🔗 관련 문서

**필수 참조:**
- [ARCHITECTURE_DECISION.md](../../docs/ARCHITECTURE_DECISION.md) - 아키텍처 선택 이유
- [SETUP_GUIDE.md](../../docs/SETUP_GUIDE.md) - 프로젝트 설정 가이드
- [ROOT_CAUSE_ANALYSIS.md](../../docs/ROOT_CAUSE_ANALYSIS.md) - 문제 해결 가이드

**기술 설계:**
- [LLD.md](LLD.md) - Low-Level Design
- [PLAN.md](PLAN.md) - Week 1 MVP 참고용
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Minimal 디자인 철학
- [PROJECT_RULES.md](PROJECT_RULES.md) - 개발 규칙

---

**승인**: _______________
**날짜**: 2025-10-05
**버전**: 7.4
