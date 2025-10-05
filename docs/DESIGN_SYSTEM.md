# Design System - Minimal Mobile

> **철학**: 실무자 중심, 정보 밀도 최대화, 불필요한 요소 제거

---

## 🎯 핵심 원칙

### 1. Information Density (정보 밀도)
**스마트폰 화면에서 최대한 많은 정보 표시**

- ❌ 큰 제목, 설명 텍스트, 아이콘
- ✅ 압축된 레이블, 숫자 중심, 그리드 레이아웃

**예시**:
```
❌ Bad:
┌─────────────────────────┐
│ 📋 테이블 목록           │
│ 아래에서 테이블을...    │
└─────────────────────────┘

✅ Good:
┌─────────────────────────┐
│ ⭐ 키 플레이어 | 📋 전체  │
└─────────────────────────┘
```

### 2. Action-First (액션 우선)
**버튼/레이블 최소화, 직접 조작**

- ❌ "칩 수정 버튼 → 모달 → 입력 → 저장"
- ✅ "칩 금액 탭 → 직접 입력"

### 3. Text Hierarchy (텍스트 위계)
```
대분류: 16px, 600
데이터:  14px, 400
메타:    12px, 400, #666
```

### 4. Spacing System (간격 체계)
```
XS:  4px   - 같은 그룹 내 요소
S:   8px   - 관련 요소
M:   12px  - 섹션 내부
L:   16px  - 섹션 간
XL:  24px  - 페이지 구분
```

### 5. Color Palette (색상)
```
Primary:   #667eea  - 액션 버튼
Success:   #28a745  - 칩 금액
Warning:   #ffd700  - 키 플레이어
Danger:    #dc3545  - Fold
Gray-100:  #f8f9fa  - 배경
Gray-600:  #666666  - 메타 정보
```

---

## 📐 컴포넌트 설계

### 테이블 카드
```
┌─────────────────────────────────┐
│ Ocean Blue - T3        ⭐2      │ ← 14px, 600
│ RWM | 8명 | John, Alice         │ ← 12px, #666
└─────────────────────────────────┘
  ↑ 56px 높이 (정보 2줄 압축)
```

**규칙**:
- 제목 없음 ("테이블 목록" X)
- 패딩: 8px 12px (상하 8px, 좌우 12px)
- 행간: 4px
- 2줄 정보 (플레이어 이름 인라인)

### 플레이어 카드
```
┌─────────────────────────────────┐
│ #3  John Doe  ⭐    55,000     │ ← 단일 행
└─────────────────────────────────┘
  ↑ 48px 높이 (터치 영역)
```

**규칙**:
- 단일 행 배치
- 좌석 → 이름 → 키 마크 → 칩
- 버튼 없음 (탭으로 직접 수정)

### 필터 토글
```
⭐ 키 플레이어 | 📋 전체
```

**규칙**:
- 제목 없음 ("필터:", "선택:" X)
- 아이콘 + 2글자
- 구분선 |

### 모달/시트
```
┌─────────────────────────────────┐
│ 칩 수정                    ×    │ ← 16px
├─────────────────────────────────┤
│ John Doe                        │ ← 14px, #666
│ [________50000________]         │ ← 48px 입력
│ [    저장    ]                  │ ← 48px 버튼
└─────────────────────────────────┘
```

**규칙**:
- 제목 1줄 (설명 X)
- 패딩: 16px
- 입력 필드 한 개당 48px
- 버튼 하나만 (취소 버튼 X)

---

## 🚫 금지 사항

### 텍스트
- ❌ "아래에서 테이블을 선택하세요"
- ❌ "전체 8명 (키 플레이어 2명)"
- ❌ "플레이어 정보를 입력해주세요"

### UI 요소
- ❌ 큰 헤더 (padding > 20px)
- ❌ 아이콘 + 텍스트 중복 ("⭐ 키 플레이어 테이블만")
- ❌ 불필요한 버튼 ("칩 수정", "좌석 변경")

### 레이아웃
- ❌ 카드 그리드 (공간 낭비)
- ❌ 큰 여백 (margin > 16px)
- ❌ 중앙 정렬 긴 텍스트

---

## ✅ 적용 예시

### Before (기존)
```html
<div class="section">
  <h2>📋 테이블 목록</h2>
  <p>아래에서 테이블을 선택하세요</p>

  <div class="filter">
    <label>필터:</label>
    <label>
      <input type="radio" name="filter" value="keyplayer">
      ⭐ 키 플레이어 테이블만
    </label>
    <label>
      <input type="radio" name="filter" value="all">
      📋 전체 테이블
    </label>
  </div>

  <div class="table-card">
    <h4>Ocean Blue - Table 3</h4>
    <div class="table-info">
      <span>🏢 Resorts World Manila</span>
      <span>👥 8명</span>
      <span>⭐ 키 플레이어 2명</span>
    </div>
    <p>John Doe, Alice Wang</p>
  </div>
</div>
```

### After (Minimal)
```html
<div class="filter">
  <label><input type="radio" name="filter" value="keyplayer" checked>⭐ 키 플레이어</label>
  <label><input type="radio" name="filter" value="all">📋 전체</label>
</div>

<div class="table-list">
  <div class="table-item">
    <div class="t-name">Ocean Blue - T3 <span class="t-key">⭐2</span></div>
    <div class="t-meta">RWM | 8명</div>
    <div class="t-players">John, Alice</div>
  </div>
</div>
```

**차이**:
- 제목 제거 (h2, p)
- 필터 레이블 제거 ("필터:")
- 아이콘 중복 제거 (🏢, 👥)
- 텍스트 압축 ("Table 3" → "T3")
- 플레이어 이름 약어 (Full Name → First Name)

---

## 📱 모바일 최적화

### 터치 영역
- 최소 48px × 48px
- 버튼 간격 8px
- 리스트 아이템 48-68px

### 폰트 크기
```css
/* iOS 줌 방지 */
input, select, textarea {
  font-size: 16px !important;
}

/* 일반 텍스트 */
body { font-size: 14px; }

/* 제목 */
h1, h2 { font-size: 16px; font-weight: 600; }

/* 메타 */
.meta { font-size: 12px; color: #666; }
```

### Safe Area
```css
header {
  padding-top: max(env(safe-area-inset-top), 12px);
}

.main-content {
  padding-bottom: max(env(safe-area-inset-bottom), 60px);
}
```

---

## 🎨 CSS 변수

```css
:root {
  /* Spacing */
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 12px;
  --space-l: 16px;
  --space-xl: 24px;

  /* Touch */
  --touch-min: 48px;

  /* Font */
  --font-s: 12px;
  --font-m: 14px;
  --font-l: 16px;

  /* Colors */
  --primary: #667eea;
  --success: #28a745;
  --warning: #ffd700;
  --danger: #dc3545;
  --gray-100: #f8f9fa;
  --gray-600: #666666;
}
```

---

**승인**: _______________
**날짜**: 2025-10-05
