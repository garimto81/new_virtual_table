# 📐 LLD v6.1 - 포커 테이블 모니터링 시스템

> **Low Level Design v6.1**
> **최종 업데이트**: 2025-10-05
> **기반 문서**: [PRD v7.2](./PRD.md)

## 📝 변경 이력
### v6.1 - 2025-10-05
- ✅ **모듈화 구현 완료**: 8개 파일로 분리 (index.html 304줄, styles.css 474줄, JS 모듈 6개)
- ✅ **window namespace 전략 추가**: tableManager, handRecorder 네임스페이스 패턴
- ✅ **공통 함수 모듈 설계**: utils.js, ui.js 분리
- ✅ **ES6 모듈 import/export 구조 확정**

### v6.0 - 2025-10-05
- ✅ 파일 분리 구조 설계 (1615줄 → 모듈화)
- ✅ Minimal Design 아키텍처 반영
- ✅ 모바일 전용 PWA 구조

### v5.0 - 2025-10-05
- 3-Layer Architecture 정립
- Domain-Driven Design 적용

## 📚 관련 문서

- **요구사항**: [PRD.md](PRD.md)
- **개발 계획**: [PLAN.md](PLAN.md)
- **전략 문서**: [strategies/](strategies/)
  - [프로토타입 우선 전략](strategies/PROTOTYPE_FIRST_STRATEGY.md)
  - [Redis 캐싱 전략](strategies/REDIS_STRATEGY.md)
  - [IndexedDB 전략](strategies/INDEXEDDB_STRATEGY.md)
  - [에이전트 확장 전략](strategies/AGENT_SCALING_STRATEGY.md)
- **아키텍처**: [architecture/](architecture/)
  - [에이전트 아키텍처](architecture/AGENT_ARCHITECTURE.md)
- **가이드**: [guides/](guides/)
  - [README](guides/README.md)
  - [요약](guides/SUMMARY.md)

---

## 🎯 설계 원칙

### 1. Workflow-First Design
- **기술이 아닌 업무 흐름 중심** 설계
- 키 플레이어 추적 → 테이블 찾기 → 모든 플레이어 관리 → 핸드 기록

### 2. Domain-Driven Design
- **Aggregate**: Table, Hand
- **Entity**: Player
- **Value Object**: Action, Money, TableId, HandNumber

### 3. Local-First Architecture
- 모든 작업은 로컬에서 즉시 완료
- 백그라운드 서버 동기화
- 오프라인 100% 지원

### 4. Performance Target
- 테이블 전환: < 1초
- 핸드 시작: < 0.5초
- 액션 기록: < 0.3초

---

## 📁 파일 구조 (모듈화)

### ✅ 완료 상태
```
project/
├── index.html (304줄)           # HTML 구조 + ES6 모듈 import
├── css/
│   └── styles.css (474줄)       # 모든 스타일
└── js/
    ├── config.js (65줄)         # 설정 관리
    ├── api.js (75줄)            # Google Sheets API
    ├── ui.js (18줄)             # Modal 관리 ⭐ NEW
    ├── utils.js (33줄)          # 공통 유틸리티 ⭐ NEW
    ├── table-manager.js (427줄) # 테이블 관리
    └── hand-recorder.js (383줄) # 핸드 기록
```

**총 라인 수**: 1779줄 (이전 1615줄 → 164줄 증가)
- 증가 이유: utils.js, ui.js 분리로 import 라인 추가, JSDoc 주석 추가

### 모듈 역할

**config.js**
```javascript
// 설정 관리 (localStorage)
- CONFIG 객체
- checkSettings()
- saveSettings()
```

**api.js**
```javascript
// Google Sheets API
- readSheet()
- appendToSheet()
- updateSheet()
```

**ui.js** ⭐ NEW
```javascript
// Modal 관리
- openModal(modalId)
- closeModal(modalId)
```

**utils.js** ⭐ NEW
```javascript
// 공통 유틸리티 함수
- formatChips(chips)           // 1000 → "1K"
- getFirstName(fullName)       // "John Doe" → "John"
- getTableNumberAbbr(tableNo)  // 3 → "T3"
```

**table-manager.js**
```javascript
// 테이블 & 플레이어 관리
- loadKeyPlayerTables()
- parseAndFilterTables()
- renderTableList()
- selectTable()
- renderPlayerList()
- updateChips()
- updateSeat()
```

**hand-recorder.js**
```javascript
// 핸드 기록
- switchToHandMode()
- startNewHand()
- renderHandPlayerList()
- recordAction()
- recordCards()
- completeHand()
```

**db.js** ⭐ NEW (Week 2)
```javascript
// IndexedDB 캐싱
- DB.init()                    // DB 초기화
- DB.tables.getAll()           // 모든 테이블 조회
- DB.tables.save(tables)       // 테이블 저장
- DB.tables.clear()            // 캐시 클리어
- DB.hands.getAll()            // 핸드 히스토리 조회
- DB.hands.save(hand)          // 핸드 저장
```

**sync.js** ⭐ NEW (Week 2)
```javascript
// 백그라운드 동기화
- Sync.start()                 // 동기화 시작 (10초 간격)
- Sync.stop()                  // 동기화 중지
- Sync.syncTables()            // 테이블 동기화
- Sync.syncHands()             // 핸드 동기화
- Sync.handleConflict()        // 충돌 해결
```

---

## 🏗️ 3-Layer Architecture

```
┌─────────────────────────────────────────────┐
│          Presentation Layer                  │
│  (HTML + CSS + ui.js)                        │
│                                              │
│  - index.html (구조)                         │
│  - styles.css (Minimal Design)               │
│  - ui.js (Modal, Loading)                    │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│          Application Layer                   │
│  (table-manager.js + hand-recorder.js)       │
│                                              │
│  - 테이블 목록 로드                           │
│  - 필터 적용 (키 플레이어)                    │
│  - 플레이어 관리 (칩, 좌석)                   │
│  - 핸드 시작/기록/완료                        │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│          Infrastructure Layer                │
│  (api.js + config.js + db.js + sync.js)      │
│                                              │
│  - Google Sheets API 호출                    │
│  - localStorage 관리                         │
│  - IndexedDB 캐싱 ⭐ NEW (Week 2)            │
│  - 백그라운드 동기화 ⭐ NEW (Week 2)          │
└─────────────────────────────────────────────┘
```

### Local-First Architecture (Week 2)

```
사용자 액션
    ↓
1. IndexedDB 즉시 저장 (0.1초)
    ↓
2. UI 즉시 업데이트
    ↓
3. 백그라운드 동기화 큐에 추가
    ↓
4. 10초 후 Google Sheets 동기화
    ↓
5. 충돌 감지 → 해결
```

**성능 개선**:
- 테이블 로드: 2초 → 0.1초 (IndexedDB 캐시)
- 오프라인 지원: 100%
- 데이터 손실 위험: 0%

---

## 📦 Domain Layer

### Table (Aggregate Root)

```typescript
class Table {
  // 속성
  readonly id: TableId;              // pokerRoom-tableName-tableNo (예: "RWM-OceanBlue-3")
  readonly pokerRoom: string;        // 포커룸 이름 (예: "Resorts World Manila")
  readonly tableName: string;        // 테이블 이름 (예: "Ocean Blue")
  readonly tableNo: string;          // 테이블 번호 (예: "Table 3")
  private players: Map<string, Player>;  // playerId → Player
  lastHandNumber: number;
  updatedAt: Date;

  // 생성자
  static create(pokerRoom: string, tableName: string, tableNo: string): Table {
    const id = `${pokerRoom}-${tableName}-${tableNo}`.replace(/\s+/g, '-').toLowerCase();
    return new Table(id, pokerRoom, tableName, tableNo, new Map(), 0, new Date());
  }

  // 플레이어 관리
  addPlayer(player: Player): Result<void> {
    // 좌석 중복 체크
    if (this.isSeatTaken(player.seatNumber)) {
      return Result.fail('좌석이 이미 사용 중입니다');
    }

    this.players.set(player.id, player);
    this.updatedAt = new Date();
    return Result.ok();
  }

  removePlayer(playerId: string): Result<void> {
    if (!this.players.has(playerId)) {
      return Result.fail('플레이어를 찾을 수 없습니다');
    }

    this.players.delete(playerId);
    this.updatedAt = new Date();
    return Result.ok();
  }

  updatePlayer(playerId: string, changes: Partial<PlayerData>): Result<void> {
    const player = this.players.get(playerId);
    if (!player) {
      return Result.fail('플레이어를 찾을 수 없습니다');
    }

    const updated = player.update(changes);
    if (updated.isFailure) {
      return updated;
    }

    this.players.set(playerId, updated.value);
    this.updatedAt = new Date();
    return Result.ok();
  }

  // 쿼리
  getAllPlayers(): Player[] {
    return Array.from(this.players.values())
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }

  get키 플레이어Players(): Player[] {
    return this.getAllPlayers().filter(p => p.is키 플레이어);
  }

  getActivePlayers(): Player[] {
    return this.getAllPlayers().filter(p => !p.isFolded);
  }

  getPlayerBySeat(seatNumber: number): Player | null {
    return this.getAllPlayers().find(p => p.seatNumber === seatNumber) || null;
  }

  // 검증
  private isSeatTaken(seatNumber: number): boolean {
    return this.getAllPlayers().some(p => p.seatNumber === seatNumber);
  }

  has키 플레이어Player(): boolean {
    return this.get키 플레이어Players().length > 0;
  }
}
```

### Hand (Aggregate Root)

```typescript
class Hand {
  // 속성
  readonly number: HandNumber;
  readonly tableId: TableId;
  private players: Map<string, Player>;  // 스냅샷
  private actions: Action[];
  private winners: Set<string>;
  status: HandStatus;  // 'active' | 'completed'
  startedAt: Date;
  completedAt: Date | null;

  // 팩토리 메서드
  static createNext(table: Table, previousNumber: number): Result<Hand> {
    const activePlayers = table.getActivePlayers();

    if (activePlayers.length < 2) {
      return Result.fail('최소 2명의 플레이어가 필요합니다');
    }

    return Result.ok(new Hand(
      new HandNumber(previousNumber + 1),
      table.id,
      new Map(activePlayers.map(p => [p.id, p.snapshot()])),
      [],
      new Set(),
      'active',
      new Date(),
      null
    ));
  }

  // 액션 기록
  recordAction(action: Action): Result<void> {
    if (this.status !== 'active') {
      return Result.fail('완료된 핸드에는 액션을 추가할 수 없습니다');
    }

    // 액션 검증
    const player = this.players.get(action.playerId);
    if (!player) {
      return Result.fail('플레이어를 찾을 수 없습니다');
    }

    if (player.isFolded && action.type !== 'fold') {
      return Result.fail('폴드한 플레이어는 액션할 수 없습니다');
    }

    this.actions.push(action);

    // 플레이어 상태 업데이트
    if (action.type === 'fold') {
      const updated = player.fold();
      this.players.set(action.playerId, updated);
    }

    return Result.ok();
  }

  // 핸드 완료
  complete(winnerIds: string[]): Result<void> {
    if (this.status === 'completed') {
      return Result.fail('이미 완료된 핸드입니다');
    }

    if (winnerIds.length === 0) {
      return Result.fail('승자를 지정해야 합니다');
    }

    // 승자 검증
    for (const id of winnerIds) {
      if (!this.players.has(id)) {
        return Result.fail(`승자 ${id}를 찾을 수 없습니다`);
      }
    }

    this.winners = new Set(winnerIds);
    this.status = 'completed';
    this.completedAt = new Date();

    return Result.ok();
  }

  // 쿼리
  getActions(): Action[] {
    return [...this.actions];
  }

  get키 플레이어Actions(): Action[] {
    return this.actions.filter(action => {
      const player = this.players.get(action.playerId);
      return player?.is키 플레이어;
    });
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values())
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }

  getWinners(): Player[] {
    return Array.from(this.winners)
      .map(id => this.players.get(id))
      .filter(p => p !== undefined) as Player[];
  }
}
```

### Player (Entity)

```typescript
class Player {
  // 속성
  readonly id: string;
  name: string;
  seatNumber: number;
  chips: Money;
  is키 플레이어: boolean;
  isFolded: boolean;
  cards: Card[];
  country: string;

  // 생성자
  static create(data: PlayerData): Result<Player> {
    // 검증
    if (!data.name || data.name.trim().length === 0) {
      return Result.fail('이름은 필수입니다');
    }

    if (data.seatNumber < 1 || data.seatNumber > 10) {
      return Result.fail('좌석 번호는 1-10 사이여야 합니다');
    }

    if (data.chips < 0) {
      return Result.fail('칩은 0 이상이어야 합니다');
    }

    return Result.ok(new Player(
      data.id || generateId(),
      data.name.trim(),
      data.seatNumber,
      new Money(data.chips),
      data.is키 플레이어 || false,
      false,
      [],
      data.country || 'KR'
    ));
  }

  // 업데이트
  update(changes: Partial<PlayerData>): Result<Player> {
    const updated = new Player(
      this.id,
      changes.name !== undefined ? changes.name : this.name,
      changes.seatNumber !== undefined ? changes.seatNumber : this.seatNumber,
      changes.chips !== undefined ? new Money(changes.chips) : this.chips,
      changes.is키 플레이어 !== undefined ? changes.is키 플레이어 : this.is키 플레이어,
      this.isFolded,
      this.cards,
      changes.country !== undefined ? changes.country : this.country
    );

    // 재검증
    if (!updated.name || updated.name.trim().length === 0) {
      return Result.fail('이름은 필수입니다');
    }

    if (updated.seatNumber < 1 || updated.seatNumber > 10) {
      return Result.fail('좌석 번호는 1-10 사이여야 합니다');
    }

    if (updated.chips.amount < 0) {
      return Result.fail('칩은 0 이상이어야 합니다');
    }

    return Result.ok(updated);
  }

  // 액션
  fold(): Player {
    return new Player(
      this.id,
      this.name,
      this.seatNumber,
      this.chips,
      this.is키 플레이어,
      true,  // folded
      this.cards,
      this.country
    );
  }

  setCards(cards: Card[]): Player {
    return new Player(
      this.id,
      this.name,
      this.seatNumber,
      this.chips,
      this.is키 플레이어,
      this.isFolded,
      cards,
      this.country
    );
  }

  // 스냅샷 (Hand용)
  snapshot(): Player {
    return new Player(
      this.id,
      this.name,
      this.seatNumber,
      this.chips,
      this.is키 플레이어,
      false,  // 핸드 시작 시 모두 active
      [],
      this.country
    );
  }
}
```

### Value Objects

```typescript
// Action
class Action {
  constructor(
    readonly playerId: string,
    readonly type: ActionType,  // 'fold' | 'call' | 'raise' | 'allin'
    readonly amount: Money,
    readonly timestamp: Date
  ) {}

  static fold(playerId: string): Action {
    return new Action(playerId, 'fold', new Money(0), new Date());
  }

  static call(playerId: string, amount: number): Action {
    return new Action(playerId, 'call', new Money(amount), new Date());
  }

  static raise(playerId: string, amount: number): Action {
    return new Action(playerId, 'raise', new Money(amount), new Date());
  }

  static allin(playerId: string, amount: number): Action {
    return new Action(playerId, 'allin', new Money(amount), new Date());
  }
}

// Money
class Money {
  constructor(readonly amount: number) {
    if (amount < 0) {
      throw new Error('금액은 0 이상이어야 합니다');
    }
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return new Money(Math.max(0, this.amount - other.amount));
  }

  format(): string {
    return this.amount.toLocaleString();
  }
}

// Result (Railway Oriented Programming)
class Result<T> {
  private constructor(
    readonly isSuccess: boolean,
    readonly value?: T,
    readonly error?: string
  ) {}

  static ok<T>(value?: T): Result<T> {
    return new Result<T>(true, value);
  }

  static fail<T>(error: string): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }
}
```

---

## 🎬 Application Layer (Use Cases)

### FindTableBy키 플레이어

```typescript
class FindTableBy키 플레이어 {
  constructor(private tableRepo: TableRepository) {}

  async execute(vipName: string): Promise<Result<Table>> {
    // 1. 로컬에서 검색
    const tables = await this.tableRepo.findAll();

    for (const table of tables) {
      const vips = table.get키 플레이어Players();
      const found = vips.find(p =>
        p.name.toLowerCase().includes(vipName.toLowerCase())
      );

      if (found) {
        return Result.ok(table);
      }
    }

    // 2. 서버에서 검색 (백그라운드)
    this.searchFromServer(vipName);

    return Result.fail('테이블을 찾을 수 없습니다');
  }

  private async searchFromServer(vipName: string): Promise<void> {
    // 백그라운드 서버 검색
    try {
      const table = await api.search키 플레이어Table(vipName);
      if (table) {
        await this.tableRepo.save(table);
      }
    } catch (error) {
      logger.warn('서버 검색 실패:', error);
    }
  }
}
```

### LoadTablePlayers

```typescript
class LoadTablePlayers {
  constructor(private tableRepo: TableRepository) {}

  async execute(tableId: TableId): Promise<Result<Player[]>> {
    const table = await this.tableRepo.findById(tableId);

    if (!table) {
      return Result.fail('테이블을 찾을 수 없습니다');
    }

    return Result.ok(table.getAllPlayers());
  }
}
```

### UpdatePlayerChips

```typescript
class UpdatePlayerChips {
  constructor(private tableRepo: TableRepository) {}

  async execute(
    tableId: TableId,
    playerId: string,
    newChips: number
  ): Promise<Result<void>> {
    // 1. 테이블 로드
    const table = await this.tableRepo.findById(tableId);
    if (!table) {
      return Result.fail('테이블을 찾을 수 없습니다');
    }

    // 2. 플레이어 업데이트
    const result = table.updatePlayer(playerId, { chips: newChips });
    if (result.isFailure) {
      return result;
    }

    // 3. 즉시 로컬 저장
    await this.tableRepo.save(table);

    // 4. 백그라운드 동기화
    this.syncToServer(table);

    return Result.ok();
  }

  private async syncToServer(table: Table): Promise<void> {
    try {
      await api.updateTable(table);
    } catch (error) {
      logger.warn('서버 동기화 실패:', error);
      // 재시도 큐에 추가
      syncQueue.add({ type: 'updateTable', data: table });
    }
  }
}
```

### StartNewHand

```typescript
class StartNewHand {
  constructor(
    private tableRepo: TableRepository,
    private handRepo: HandRepository
  ) {}

  async execute(tableId: TableId): Promise<Result<Hand>> {
    // 1. 테이블 로드
    const table = await this.tableRepo.findById(tableId);
    if (!table) {
      return Result.fail('테이블을 찾을 수 없습니다');
    }

    // 2. 새 핸드 생성
    const handResult = Hand.createNext(table, table.lastHandNumber);
    if (handResult.isFailure) {
      return handResult;
    }

    const hand = handResult.value!;

    // 3. 테이블 lastHandNumber 업데이트
    table.lastHandNumber = hand.number.value;

    // 4. 즉시 로컬 저장
    await this.handRepo.save(hand);
    await this.tableRepo.save(table);

    // 5. 백그라운드 동기화
    this.syncToServer(hand);

    return Result.ok(hand);
  }

  private async syncToServer(hand: Hand): Promise<void> {
    try {
      await api.createHand(hand);
    } catch (error) {
      logger.warn('서버 동기화 실패:', error);
      syncQueue.add({ type: 'createHand', data: hand });
    }
  }
}
```

### RecordAction

```typescript
class RecordAction {
  constructor(private handRepo: HandRepository) {}

  async execute(
    handNumber: HandNumber,
    action: Action
  ): Promise<Result<void>> {
    // 1. 핸드 로드
    const hand = await this.handRepo.findByNumber(handNumber);
    if (!hand) {
      return Result.fail('핸드를 찾을 수 없습니다');
    }

    // 2. 액션 기록
    const result = hand.recordAction(action);
    if (result.isFailure) {
      return result;
    }

    // 3. 즉시 로컬 저장
    await this.handRepo.save(hand);

    // 4. 백그라운드 동기화
    this.syncToServer(hand);

    return Result.ok();
  }

  private async syncToServer(hand: Hand): Promise<void> {
    try {
      await api.updateHand(hand);
    } catch (error) {
      logger.warn('서버 동기화 실패:', error);
      syncQueue.add({ type: 'updateHand', data: hand });
    }
  }
}
```

### CompleteHand

```typescript
class CompleteHand {
  constructor(private handRepo: HandRepository) {}

  async execute(
    handNumber: HandNumber,
    winnerIds: string[]
  ): Promise<Result<void>> {
    // 1. 핸드 로드
    const hand = await this.handRepo.findByNumber(handNumber);
    if (!hand) {
      return Result.fail('핸드를 찾을 수 없습니다');
    }

    // 2. 핸드 완료
    const result = hand.complete(winnerIds);
    if (result.isFailure) {
      return result;
    }

    // 3. 즉시 로컬 저장
    await this.handRepo.save(hand);

    // 4. 백그라운드 동기화
    this.syncToServer(hand);

    return Result.ok();
  }

  private async syncToServer(hand: Hand): Promise<void> {
    try {
      await api.updateHand(hand);
    } catch (error) {
      logger.warn('서버 동기화 실패:', error);
      syncQueue.add({ type: 'updateHand', data: hand });
    }
  }
}
```

---


## 🗄️ Infrastructure Layer

### LocalStorage Repository

```typescript
class LocalStorageTableRepository implements TableRepository {
  private readonly KEY_PREFIX = 'table:';

  async findById(id: TableId): Promise<Table | null> {
    const json = localStorage.getItem(this.KEY_PREFIX + id.value);
    if (!json) return null;

    return this.deserialize(JSON.parse(json));
  }

  async findAll(): Promise<Table[]> {
    const tables: Table[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.KEY_PREFIX)) {
        const json = localStorage.getItem(key);
        if (json) {
          tables.push(this.deserialize(JSON.parse(json)));
        }
      }
    }

    return tables;
  }

  async save(table: Table): Promise<void> {
    const json = this.serialize(table);
    localStorage.setItem(this.KEY_PREFIX + table.id.value, JSON.stringify(json));
  }

  async delete(id: TableId): Promise<void> {
    localStorage.removeItem(this.KEY_PREFIX + id.value);
  }

  private serialize(table: Table): any {
    return {
      id: table.id.value,
      name: table.name,
      players: table.getAllPlayers().map(p => ({
        id: p.id,
        name: p.name,
        seatNumber: p.seatNumber,
        chips: p.chips.amount,
        is키 플레이어: p.is키 플레이어,
        country: p.country
      })),
      lastHandNumber: table.lastHandNumber,
      updatedAt: table.updatedAt.toISOString()
    };
  }

  private deserialize(data: any): Table {
    const table = Table.create(new TableId(data.id), data.name);

    for (const playerData of data.players) {
      const player = Player.create(playerData).value!;
      table.addPlayer(player);
    }

    table.lastHandNumber = data.lastHandNumber;
    table.updatedAt = new Date(data.updatedAt);

    return table;
  }
}
```

### Background Sync

```typescript
class BackgroundSync {
  private queue: SyncTask[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInterval: number | null = null;

  constructor() {
    // 온라인 상태 감지
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingTasks();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 5초마다 동기화 시도
    this.startAutoSync(5000);
  }

  add(task: SyncTask): void {
    this.queue.push(task);

    if (this.isOnline) {
      this.processPendingTasks();
    }
  }

  private async processPendingTasks(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    const task = this.queue[0];

    try {
      await this.executeTask(task);
      this.queue.shift();  // 성공하면 제거

      // 다음 작업 처리
      if (this.queue.length > 0) {
        setTimeout(() => this.processPendingTasks(), 100);
      }
    } catch (error) {
      logger.error('동기화 실패:', error);
      // 실패하면 큐에 남겨둠 (재시도)
    }
  }

  private async executeTask(task: SyncTask): Promise<void> {
    switch (task.type) {
      case 'updateTable':
        await api.updateTable(task.data);
        break;
      case 'createHand':
        await api.createHand(task.data);
        break;
      case 'updateHand':
        await api.updateHand(task.data);
        break;
    }
  }

  private startAutoSync(interval: number): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.processPendingTasks();
      }
    }, interval);
  }
}
```

---

## 📁 폴더 구조

```
src/
├── domain/
│   ├── table/
│   │   ├── Table.ts
│   │   ├── TableId.ts
│   │   └── TableRepository.ts (interface)
│   ├── hand/
│   │   ├── Hand.ts
│   │   ├── HandNumber.ts
│   │   └── HandRepository.ts (interface)
│   ├── player/
│   │   ├── Player.ts
│   │   └── PlayerData.ts
│   ├── action/
│   │   ├── Action.ts
│   │   └── ActionType.ts
│   └── shared/
│       ├── Money.ts
│       ├── Result.ts
│       └── Card.ts
│
├── application/
│   ├── table/
│   │   ├── FindTableBy키 플레이어.ts
│   │   ├── LoadTablePlayers.ts
│   │   └── UpdatePlayerChips.ts
│   └── hand/
│       ├── StartNewHand.ts
│       ├── RecordAction.ts
│       └── CompleteHand.ts
│
├── presentation/
│   ├── views/
│   │   ├── TableManagementView.ts
│   │   ├── HandRecordingView.ts
│   │   └── TableSwitcherView.ts
│   ├── components/
│   │   ├── PlayerCard.ts
│   │   ├── ActionLog.ts
│   │   └── ActionPad.ts
│   └── styles/
│       ├── table-management.css
│       └── hand-recording.css
│
└── infrastructure/
    ├── repositories/
    │   ├── LocalStorageTableRepository.ts
    │   └── LocalStorageHandRepository.ts
    ├── api/
    │   ├── GoogleSheetsAPI.ts
    │   └── BackgroundSync.ts
    └── utils/
        ├── logger.ts
        ├── errorHandler.ts
        └── eventManager.ts
```

---

## ⚡ 성능 최적화

### 1. 테이블 전환 < 1초

```typescript
// 전략: 최근 테이블 프리로드
class TableCache {
  private cache: Map<string, Table> = new Map();
  private maxSize = 5;

  async preload(recentTableIds: TableId[]): Promise<void> {
    const promises = recentTableIds
      .slice(0, this.maxSize)
      .map(id => this.load(id));

    await Promise.all(promises);
  }

  private async load(id: TableId): Promise<void> {
    const table = await tableRepo.findById(id);
    if (table) {
      this.cache.set(id.value, table);
    }
  }

  get(id: TableId): Table | null {
    return this.cache.get(id.value) || null;
  }
}
```

### 2. 핸드 시작 < 0.5초

```typescript
// 전략: 플레이어 스냅샷 미리 준비
class HandFactory {
  async prepareNext(table: Table): Promise<Hand | null> {
    // 백그라운드에서 다음 핸드 준비
    const result = Hand.createNext(table, table.lastHandNumber);

    if (result.isSuccess) {
      return result.value!;
    }

    return null;
  }
}
```

### 3. 액션 기록 < 0.3초

```typescript
// 전략: 낙관적 UI 업데이트
async function recordActionOptimistic(action: Action): Promise<void> {
  // 1. UI 즉시 업데이트 (낙관적)
  updateUIWithAction(action);

  // 2. 백그라운드 저장
  try {
    await recordAction.execute(currentHandNumber, action);
  } catch (error) {
    // 실패 시 롤백
    rollbackUIAction(action);
    showError('액션 기록에 실패했습니다');
  }
}
```

---

## 🔒 데이터 무결성

### 1. 핸드 번호 중복 방지

```typescript
class HandNumber {
  constructor(readonly value: number) {
    if (value < 1) {
      throw new Error('핸드 번호는 1 이상이어야 합니다');
    }
  }

  next(): HandNumber {
    return new HandNumber(this.value + 1);
  }
}
```

### 2. 좌석 중복 방지

```typescript
// Table.addPlayer() 내부
private isSeatTaken(seatNumber: number): boolean {
  return this.getAllPlayers().some(p => p.seatNumber === seatNumber);
}
```

### 3. 트랜잭션 처리

```typescript
class HandTransaction {
  async completeAndCreateNext(
    currentHand: Hand,
    winnerIds: string[],
    table: Table
  ): Promise<Result<Hand>> {
    try {
      // 1. 현재 핸드 완료
      const completeResult = currentHand.complete(winnerIds);
      if (completeResult.isFailure) {
        return Result.fail(completeResult.error!);
      }

      // 2. 저장
      await handRepo.save(currentHand);

      // 3. 다음 핸드 생성
      const nextResult = Hand.createNext(table, currentHand.number.value);
      if (nextResult.isFailure) {
        return nextResult;
      }

      // 4. 저장
      await handRepo.save(nextResult.value!);

      return nextResult;

    } catch (error) {
      return Result.fail('핸드 전환에 실패했습니다');
    }
  }
}
```

---

**승인**: _______________
**날짜**: 2025-10-05
