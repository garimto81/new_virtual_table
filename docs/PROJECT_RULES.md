# Project Rules - 프로젝트 필수 규칙

> **이 문서의 모든 규칙은 영구 유지됩니다**

---

## 🔄 개발 워크플로우 (필수)

### 모든 코드 작업 후 Code Review 실행

**규칙**: 코드 변경/추가 작업이 완료되면 **항상** code-reviewer 에이전트를 실행합니다.

```bash
# 작업 완료 → 즉시 실행
"code-reviewer를 호출해서 코드 중복 및 무분별한 사용 체크"
```

**체크 항목**:
- 코드 중복 (동일 코드 3번 이상 반복)
- 무분별한 코드 사용 (중첩 반복문, 과도한 DOM 조작)
- CSS/HTML 중복

**승인 기준**:
- ✅ APPROVED: 코드 중복 0건, 무분별한 사용 0건
- ❌ REJECTED: 수정 필요 항목 있음 → backend-specialist/frontend-specialist로 수정

**예외 없음**: 문서 수정만 한 경우를 제외하고 **모든 코드 작업**은 code-reviewer 통과 필수

---

## 📁 문서 구조

### 핵심 문서 (루트)
```
docs/
├── PRD.md              # 제품 요구사항 (v7.0+)
├── LLD.md              # 기술 설계
├── PLAN.md             # 개발 계획
├── DESIGN_SYSTEM.md    # Minimal 디자인 철학 ⭐
└── PROJECT_RULES.md    # 이 문서
```

### 보조 문서 (archive)
```
docs/archive/
├── API_REFERENCE.md
├── PHASE7_REFACTORING_PLAN.md
├── TECHNICAL_DESIGN.md
└── PHASE0_WEEK1_TEST_CHECKLIST.md
```

### 규칙
1. **핵심 문서 5개만 유지**
2. 새 문서 추가 시 → `archive/` 또는 통합
3. 중복 내용 → 삭제 또는 하나로 통합

---

## 🎨 Minimal Design 철학 (필수)

> **상세 내용**: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

### 핵심 원칙
1. **Information Density** - 정보 밀도 최대화
2. **Action-First** - 버튼 최소화, 직접 조작
3. **압축 규칙** - "Table 3" → "T3", "John Doe" → "John"
4. **실무자 중심** - 설명 텍스트 제거

### 주요 금지사항
- ❌ 큰 제목/설명 텍스트
- ❌ 불필요한 버튼 ("칩 수정", "좌석 변경")
- ❌ 48px 미만 터치 영역

---

## 📱 모바일 우선 (필수)

### 1. PC에서 모바일 프레임 시뮬레이션
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

### 2. 터치 영역
```css
button, .touchable {
  min-height: 48px;
  min-width: 48px;
  gap: 8px;
}
```

### 3. 입력 최적화
```css
input, select {
  font-size: 16px !important; /* iOS 줌 방지 */
  min-height: 48px;
}
```

### 4. Safe Area
```css
header {
  padding-top: max(env(safe-area-inset-top), 12px);
}

.main-content {
  padding-bottom: max(env(safe-area-inset-bottom), 60px);
}
```

---

## 🚀 개발 워크플로우

### 1. 기능 추가 전 필수 확인
```
1. DESIGN_SYSTEM.md 검토
2. PRD.md에 명시되어 있는가?
3. Minimal 철학 위배하는가?
4. 모바일 터치 영역 48px 이상?
```

### 2. 코드 작성
```
1. 제목/설명 텍스트 제거
2. 압축 규칙 적용 (T3, First Name)
3. 불필요한 버튼 제거
4. 정보 밀도 확인 (6-8개 카드)
```

### 3. 문서 업데이트
```
1. PRD.md 업데이트
2. LLD.md (필요 시)
3. PLAN.md (필요 시)
4. archive로 이동 또는 통합
```

---

## 📐 CSS 변수 (필수 사용)

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

## ⚠️ 위반 시 조치

### 자동 리뷰 체크리스트
```
□ 제목/설명 텍스트 있음? → 제거
□ 버튼 높이 < 48px? → 수정
□ 압축 규칙 미적용? → 적용
□ 새 문서 추가? → archive 이동 또는 통합
□ 정보 밀도 낮음? → 재설계
```

### 문서 정리 주기
```
매주 금요일:
1. docs/ 폴더 검토
2. 중복 문서 → archive/ 또는 통합
3. 5개 핵심 문서만 유지
```

---

## 📝 버전 관리

### 문서 버전
```
PRD.md:              v7.0+  (Minimal Design)
DESIGN_SYSTEM.md:    v1.0+
PROJECT_RULES.md:    v1.0+
```

### 변경 시 필수 기록
```markdown
## v7.1 - 2025-10-06
- Minimal Design 적용
- 정보 밀도 최대화
- 압축 규칙 추가
```

---

## 🤖 서브에이전트 시스템

### 에이전트 구성 (4개)

```
.claude/agents/hand-logger/
├── AGENT_DIRECTORY.md          # 에이전트 매핑 테이블
├── backend-specialist.md       # API + 데이터 + 로직
├── frontend-specialist.md      # UI + UX + Minimal Design
├── integration-tester.md       # E2E 테스트 + 검증
└── code-reviewer.md            # 코드 품질 + 최적화
```

### 책임 분리

| 작업 | Backend | Frontend | Tester | Reviewer |
|-----|---------|----------|--------|----------|
| API 호출 | ✅ | ❌ | 검증 | 검증 |
| 데이터 파싱 | ✅ | ❌ | 검증 | 검증 |
| HTML/CSS | ❌ | ✅ | 검증 | 검증 |
| 렌더링 함수 | ❌ | ✅ | 검증 | 검증 |
| 비즈니스 로직 | ✅ | ❌ | 검증 | 검증 |
| Modal 관리 | ui.js | ✅ | 검증 | 검증 |
| E2E 테스트 | ❌ | ❌ | ✅ | ❌ |
| 문서 검증 | ❌ | ❌ | ✅ | ❌ |
| 코드 품질 | 필요시 | 필요시 | 검증 | ✅ |
| 성능 최적화 | ✅ | ✅ | 검증 | ✅ 제안 |

### 호출 방법

**Backend 작업**
```
"backend-specialist를 호출해서 Type 시트 파싱 로직 개선"
"backend-specialist로 핸드 완료 시 Index 시트 업데이트 추가"
```

**Frontend 작업**
```
"frontend-specialist를 호출해서 테이블 카드를 2줄로 변경"
"frontend-specialist로 플레이어 카드 높이를 48px로 조정"
```

**테스트/검증**
```
"integration-tester를 호출해서 전체 기능 테스트"
"integration-tester로 Minimal Design 준수 여부 검증"
```

**코드 리뷰/최적화**
```
"code-reviewer를 호출해서 파일 분리 후 코드 품질 검증"
"code-reviewer로 성능 최적화 제안"
```

**병렬 실행** (성능 최적화)
```
"backend-specialist와 frontend-specialist를 동시에 호출해서 파일 분리"
```

### 워크플로우

**1. 기능 추가**
```
1. backend-specialist: 데이터 로직 구현
2. frontend-specialist: UI 렌더링
3. integration-tester: E2E 테스트
```

**2. 버그 수정**
```
1. integration-tester: 버그 재현 + 원인 분석
2. backend or frontend: 수정
3. integration-tester: 재테스트
```

**3. 리팩토링**
```
1. backend-specialist + frontend-specialist (병렬)
2. integration-tester: 회귀 테스트
```

**4. 코드 리뷰**
```
1. code-reviewer: 코드 품질 검증 + 최적화 제안
2. backend-specialist / frontend-specialist: 개선 사항 반영
3. integration-tester: 최종 검증
```

### 금지 사항

**Backend Specialist**
- ❌ HTML/CSS 직접 수정
- ❌ 렌더링 로직 작성
- ❌ Modal 직접 open/close

**Frontend Specialist**
- ❌ API 직접 호출
- ❌ 데이터 파싱 로직
- ❌ localStorage 직접 관리

**Integration Tester**
- ❌ 코드 직접 수정 (읽기 전용)
- ❌ 구현 작업 (다른 에이전트 호출)

**Code Reviewer**
- ❌ 코드 직접 수정 (읽기 전용)
- ❌ 직접 구현 (제안만 제공)
- ❌ 테스트 실행 (integration-tester 호출)

### 상세 문서
[.claude/agents/hand-logger/AGENT_DIRECTORY.md](../.claude/agents/hand-logger/AGENT_DIRECTORY.md)

---

**이 문서는 프로젝트의 헌법입니다. 모든 개발자와 에이전트는 이 규칙을 따라야 합니다.**

**승인**: _______________
**날짜**: 2025-10-05
