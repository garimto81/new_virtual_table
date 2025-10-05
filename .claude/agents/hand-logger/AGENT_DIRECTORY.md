# Hand Logger Agent Directory

## 🎯 에이전트 시스템 개요

**4개 전문 서브에이전트**가 Hand Logger 앱을 분담 관리합니다.

## 📋 에이전트 매핑 테이블

| 에이전트 | 전담 영역 | 담당 파일 | 호출 시점 |
|---------|----------|----------|----------|
| **backend-specialist** | API, 데이터, 로직 | config.js, api.js, table-manager.js, hand-recorder.js | 데이터 처리, 비즈니스 로직 수정 |
| **frontend-specialist** | UI/UX, 디자인 | index.html, styles.css, ui.js, 렌더링 함수 | UI 변경, Minimal Design 적용 |
| **integration-tester** | E2E 테스트, 검증 | 모든 파일 (읽기 전용) | 작업 완료 후 전체 검증 |
| **code-reviewer** | 코드 품질, 최적화 | 모든 파일 (읽기 전용) | 파일 분리, PR, 배포 전 |

---

## 🤖 1. Backend Specialist

### 담당
- Google Sheets API 연동
- 데이터 파싱/변환
- 비즈니스 로직
- localStorage 관리

### 주요 함수
```javascript
// config.js
checkSettings(), saveSettings()

// api.js
readSheet(), appendToSheet(), updateSheet()

// table-manager.js
loadKeyPlayerTables(), parseAndFilterTables()
updateChips(), updateSeat(), removePlayer()

// hand-recorder.js
startNewHand(), recordAction(), completeHand()
```

### 호출 예시
```
"backend-specialist를 호출해서 Type 시트 파싱 로직을 개선해줘"
"backend-specialist로 핸드 완료 시 Index 시트 업데이트 기능 추가"
```

### 프롬프트 파일
[backend-specialist.md](backend-specialist.md)

---

## 🎨 2. Frontend Specialist

### 담당
- Minimal Design 구현
- 모바일 최적화 (393px, 48px 터치)
- UI 렌더링
- Modal/Loading 관리

### 주요 함수
```javascript
// ui.js
openModal(), closeModal(), showLoading()

// 렌더링 (table-manager.js, hand-recorder.js)
renderTableList()      // 2줄 테이블 카드
renderPlayerList()     // 1줄 플레이어 카드
renderHandPlayerList() // 핸드 플레이어 리스트
addActionToLog()       // 액션 로그
```

### 호출 예시
```
"frontend-specialist를 호출해서 테이블 카드를 2줄로 변경해줘"
"frontend-specialist로 플레이어 카드 높이를 48px로 조정"
```

### 프롬프트 파일
[frontend-specialist.md](frontend-specialist.md)

---

## �� 3. Integration Tester

### 담당
- E2E 테스트
- 문서-코드 일치 검증
- 회귀 테스트
- 성능 측정

### 테스트 범위
```
Workflow 1: 테이블 목록 로드
Workflow 2: 플레이어 관리
Workflow 3: 핸드 기록

문서 검증: PRD ↔ 코드
디자인 검증: DESIGN_SYSTEM ↔ UI
성능 검증: LLD 목표값 ↔ 실측
```

### 호출 예시
```
"integration-tester를 호출해서 전체 기능 테스트"
"integration-tester로 Minimal Design 준수 여부 검증"
```

### 프롬프트 파일
[integration-tester.md](integration-tester.md)

---

## 🔍 4. Code Reviewer

### 담당

- 코드 품질 검증
- 성능 최적화
- 보안 취약점 점검
- 메모리 누수 방지

### 검토 항목
```
1. 코드 품질
   - 함수명/변수명 규칙
   - 중첩 depth < 3
   - 함수 길이 < 50줄

2. 성능
   - DOM 조작 최소화
   - 이벤트 리스너 중복 방지
   - API 호출 최적화

3. 보안
   - XSS 방지
   - API 키 노출 방지
   - 입력값 검증

4. 에러 처리
   - try-catch 적절성
   - 사용자 피드백

5. 모듈화
   - 파일 분리 적절성
   - import/export 구조

6. 메모리 관리
   - 전역 변수 최소화
   - 이벤트 리스너 정리
```

### 호출 예시
```
"code-reviewer를 호출해서 파일 분리 후 코드 품질 검증"
"code-reviewer로 성능 최적화 제안"
```

### 프롬프트 파일
[code-reviewer.md](code-reviewer.md)

---

## 🔄 작업 워크플로우

### 패턴 1: Backend 작업
```
1. 요청: "핸드 완료 시 Index 시트 업데이트 추가"
2. backend-specialist 호출
   - completeHand() 수정
   - appendToSheet() 호출 추가
3. integration-tester 호출
   - Scenario 7 테스트
   - 승인/거부
```

### 패턴 2: Frontend 작업
```
1. 요청: "테이블 카드를 2줄로 압축"
2. frontend-specialist 호출
   - renderTableList() 수정
   - 56px 높이, 2줄 형식
3. integration-tester 호출
   - Minimal Design 체크리스트
   - 승인/거부
```

### 패턴 3: 복합 작업 (Backend + Frontend)
```
1. 요청: "1615줄 파일을 모듈로 분리"
2. backend-specialist 호출 (병렬)
   - config.js, api.js 분리
   - table-manager.js, hand-recorder.js 분리
3. frontend-specialist 호출 (병렬)
   - index.html, styles.css 분리
   - ui.js 분리
4. integration-tester 호출 (순차)
   - 전체 기능 테스트
   - 문서 일치 검증
```

### 패턴 4: 테스트 주도 개발
```
1. integration-tester 호출
   - 현재 상태 테스트
   - 실패 항목 리스트 생성
2. backend-specialist / frontend-specialist 호출
   - 실패 항목 수정
3. integration-tester 재호출
   - 재테스트
   - 승인 시 완료
```

### 패턴 5: 코드 리뷰 및 최적화
```
1. 요청: "파일 분리 후 코드 품질 검증"
2. code-reviewer 호출
   - 코드 품질 체크리스트
   - 성능 최적화 제안
   - 보안 취약점 점검
3. backend-specialist / frontend-specialist 호출
   - 개선 사항 반영
4. integration-tester 호출
   - 최종 검증
```

---

## 📊 에이전트 책임 분리

| 작업 | Backend | Frontend | Tester | Reviewer |
|-----|---------|----------|--------|----------|
| API 호출 | ✅ 담당 | ❌ 금지 | ✅ 검증 | ✅ 검증 |
| 데이터 파싱 | ✅ 담당 | ❌ 금지 | ✅ 검증 | ✅ 검증 |
| HTML 렌더링 | ❌ 금지 | ✅ 담당 | ✅ 검증 | ✅ 검증 |
| CSS 스타일 | ❌ 금지 | ✅ 담당 | ✅ 검증 | ✅ 검증 |
| 비즈니스 로직 | ✅ 담당 | ❌ 금지 | ✅ 검증 | ✅ 검증 |
| Modal 관리 | ui.js 사용 | ✅ 담당 | ✅ 검증 | ✅ 검증 |
| 성능 최적화 | ✅ 담당 | ✅ 담당 | ✅ 검증 | ✅ 제안 |
| 문서 업데이트 | ✅ 필요시 | ✅ 필요시 | ✅ 필수 | ✅ 필요시 |
| 코드 품질 | ✅ 필요시 | ✅ 필요시 | ✅ 검증 | ✅ 담당 |

---

## 🚫 금지 사항

### Backend Specialist
- ❌ HTML/CSS 직접 수정
- ❌ 렌더링 로직 직접 작성
- ❌ Modal 직접 open/close

### Frontend Specialist
- ❌ API 직접 호출
- ❌ 데이터 파싱 로직
- ❌ localStorage 직접 관리

### Integration Tester

- ❌ 코드 수정 (읽기 전용)
- ❌ 직접 구현 (다른 에이전트 호출)

### Code Reviewer

- ❌ 코드 직접 수정 (읽기 전용)
- ❌ 직접 구현 (제안만 제공)
- ❌ 테스트 실행 (integration-tester 호출)

---

## 📝 사용 예시

### 예시 1: "테이블 카드를 2줄로 변경"
```markdown
담당: frontend-specialist
파일: table-manager.js::renderTableList()
작업:
  - 3줄 → 2줄 구조 변경
  - 56px 높이 설정
  - First Name 압축
검증: integration-tester
```

### 예시 2: "핸드 완료 시 Index 시트 업데이트"
```markdown
담당: backend-specialist
파일: hand-recorder.js::completeHand()
작업:
  - Index 시트 행 생성
  - appendToSheet() 호출
  - 에러 처리
검증: integration-tester
```

### 예시 3: "1615줄 파일 모듈화"
```markdown
담당: backend-specialist + frontend-specialist (병렬)
작업:
  Backend:
    - config.js, api.js 분리
    - table-manager.js, hand-recorder.js 분리
  Frontend:
    - index.html, styles.css 분리
    - ui.js 분리
검증: integration-tester
  - 전체 기능 테스트
  - LLD 파일 구조 일치 확인
```

### 예시 4: "파일 분리 후 코드 품질 검증"
```markdown
담당: code-reviewer
파일: 전체 분리된 모듈 (config.js, api.js, table-manager.js, hand-recorder.js)
작업:
  - 코드 품질 체크리스트 검증
  - 성능 최적화 제안
  - 보안 취약점 점검
  - 메모리 누수 방지
후속: backend-specialist / frontend-specialist
  - 개선 사항 반영
검증: integration-tester
```

---

## 🔗 Context 자동 로드

모든 에이전트는 다음 문서를 자동으로 참조합니다:

- **PRD.md v7.1** - 요구사항, Minimal Design
- **LLD.md v6.0** - 아키텍처, 파일 구조
- **DESIGN_SYSTEM.md** - Minimal Design 철학
- **PLAN.md** - 개발 계획
- **PROJECT_RULES.md** - 프로젝트 규칙

---

## ⚙️ 에이전트 호출 방법

### Claude Code에서 호출
```
"backend-specialist 에이전트를 호출해서 [작업 내용]"
"frontend-specialist로 [작업 내용]"
"integration-tester를 실행해서 전체 테스트"
"code-reviewer로 파일 분리 후 코드 품질 검증"
```

### 병렬 호출 (성능 최적화)
```
"backend-specialist와 frontend-specialist를 동시에 호출해서 파일 분리"
```

### 순차 호출 (의존성 있음)
```
1. "backend-specialist로 데이터 로직 수정"
2. "frontend-specialist로 UI 업데이트"
3. "integration-tester로 검증"
```

---

## 📚 관련 문서

- [backend-specialist.md](backend-specialist.md)
- [frontend-specialist.md](frontend-specialist.md)
- [integration-tester.md](integration-tester.md)
- [code-reviewer.md](code-reviewer.md)
- [../../../docs/PROJECT_RULES.md](../../../docs/PROJECT_RULES.md)