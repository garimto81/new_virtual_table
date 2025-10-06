# 포커 핸드 로거

> 토너먼트 데이터 매니저를 위한 빠른 핸드 기록 앱

## 🚀 빠른 시작

```bash
# 설치 및 실행
npm install
npm run dev

# 브라우저 열기
http://localhost:5173
```

## 📚 문서 구조

**신규 참여자는 이 순서로 읽으세요**:

1. **[PLAN.md](docs/PLAN.md)** - 제품 비전 (왜 만드는가?)
2. **[STATUS.md](docs/STATUS.md)** - 현재 진행 상황 (어디까지 왔나?)
3. **[PRD.md](docs/PRD.md)** - 다음 할 일 (무엇을 할 것인가?)
4. **[LLD.md](docs/LLD.md)** - 구현 상세 (어떻게 만들었나?)
5. **[CHANGELOG.md](docs/CHANGELOG.md)** - 완료 기록 (무엇을 했나?)

## 🛠️ 기술 스택

- Vanilla JavaScript (No 프레임워크)
- Google Sheets API
- IndexedDB (Local-First Architecture)
- PWA (Progressive Web App)

## 📁 프로젝트 구조

```
new_virtual_table/
├── index.html        # 진입점 (304줄)
├── css/
│   └── styles.css    # Minimal Design (474줄)
├── js/               # 8개 파일로 분리
│   ├── config.js     # 설정
│   ├── api.js        # Google Sheets API
│   ├── db.js         # IndexedDB
│   ├── sync.js       # 동기화
│   ├── ui.js         # Modal 관리
│   ├── utils.js      # 공통 함수
│   ├── table-manager.js  # 테이블 관리
│   └── hand-recorder.js  # 핸드 기록
├── sw.js             # Service Worker (PWA)
├── manifest.json     # PWA 설정
├── docs/             # 프로젝트 문서 (5개)
├── package.json
└── README.md         # 이 파일
```

## 🤝 개발 참여

개발 규칙 및 워크플로우는 `c:\claude\CLAUDE.md`를 참조하세요.

**핵심 규칙**:
- Code Review 필수 (모든 코드 작업 후)
- Minimal Design 철학 준수
- 문서 5개만 유지 (PLAN, PRD, LLD, STATUS, CHANGELOG)
