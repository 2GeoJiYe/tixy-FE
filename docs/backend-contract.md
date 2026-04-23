# Backend Contract

이 문서는 `C:\Users\phj\Documents\2team\tixy`, `C:\Users\phj\Documents\2team\tixy-batch`, `C:\Users\phj\Documents\2team\tixy-pt`의 실제 컨트롤러/DTO/보안/스케줄러를 기준으로 작성했습니다.

## Common Response

`tixy`, `tixy-pt` 공통 응답:

```ts
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    timestamp?: string;
    status?: number;
    error?: string;
    code?: string;
    message?: string;
    path?: string;
  } | null;
}
```

## tixy

### Security

- `POST /api/auth/v1/login`
- `POST /api/auth/v1/signup`
- `POST /api/payments/v1/webhook`
- `POST /api/auth/v1/reissue` 는 보안 설정상 permitAll이지만 실제 컨트롤러는 주석 처리
- `/api/dashboard/v1/**` 는 `ROLE_SUPER_ADMIN`
- 그 외는 `authenticated`

### Auth

- `POST /api/auth/v1/signup`
  - request: `{ email, password, phone, name }`
  - response: `{ email, message }`
- `POST /api/auth/v1/login`
  - request: `{ email, password }`
  - response:

```ts
{
  tokens: {
    accessToken: string;
  };
  user: {
    id: number;
    email: string;
    name: string;
  };
}
```

- `POST /api/auth/v1/logout`

### Events

- `GET /api/events/v1`
  - query:
    - `reservePossible`
    - `area[]`
    - `category[]`
    - `startDate: LocalDateTime`
    - `endDate: LocalDateTime`
    - `keyword`
    - `startPrice`
    - `endPrice`
    - `page`, `size` 파라미터는 `Pageable`로 받을 수 있으나 실제 응답은 `List<GetEventResponse>`
  - response item:

```ts
{
  id: number;
  title: string;
  description: string;
  location: string;
  venue: string;
  eventStatus: string;
  openDate: string;
  endDate: string;
}
```

- `GET /api/events/v1/{eventId}`
  - response: `GetEventResponse`

- `GET /api/v1/events/popular?category=`
  - response:

```ts
{
  referenceCategory: string;
  eventInfo: GetEventResponse;
  viewScore: number;
}[]
```

### Sessions

- `GET /api/event/v1/{eventId}/schedules`
  - response: `Page<GetEventSessionsResponse>`

```ts
{
  content: Array<{
    sessionId: number;
    eventTitle: string;
    sessionSeatCount: number;
    eventSessionStatus: string;
    sessionOpenDate: string;
    sessionCloseDate: string;
    minPrice: number;
    maxPrice: number;
  }>;
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

- `GET /api/event/v1/{eventId}/schedules/{scheduleId}`

```ts
{
  eventTitle: string;
  sessionSeatCount: number;
  eventSessionStatus: string;
  sessionOpenDate: string;
  sessionCloseDate: string;
  saleOpenDate: string;
  saleCloseDate: string;
  ticketTypePrice: Record<string, number>;
}
```

### Seats / Hold

- `POST /api/seats/v1/seat-hold`

```ts
request {
  eventSessionId: number;
  seatIds: number[];
  seatSectionId: number;
}

response {
  seatLabels: string[];
  ticketTypeId: number;
  eventTitle: string;
  seatSectionName: string;
  sessionOpenDatetime: string;
  sessionEndDatetime: string;
}
```

- `GET /api/seats/v1/active?eventSessionId=`

```ts
Array<{
  eventSessionId: number;
  seatSectionId: number;
  seatSessionIds: number[];
}>
```

주의:

- `SeatSession#setHeld()` 는 `expireAt = now.plusMinutes(5)`
- `tixy-batch` 스케줄러가 `seat_sessions` 만료 해제를 5분 주기로 실행

### Orders / Payments

- `POST /api/orders/v1`

```ts
request {
  ticketTypeId: number;
  eventSessionId: number;
  seatIds: number[];
}

response {
  totalPayment: number;
  depositAddress: string;
  ticketCount: number;
}
```

- 주문 전 `seatHoldService.checkMember(...)`
- `Member#checkMemberWallet()` 에서 지갑 주소 없으면 `O001`

- `POST /api/payments/v1/webhook`
  - 브라우저용 완료 확인 API 아님

### Sales Dashboard

- `GET /api/dashboard/v1/sales?from=&to=&granularity=&eventId=`
  - `granularity`: `DAY | HOUR`
  - response:

```ts
{
  summary: {
    soldTicketCount: number;
    paidAmount: number;
    paymentCount: number;
    sessionCount: number;
  };
  sessions: Array<{
    eventId: number;
    eventTitle: string;
    sessionId: number;
    sessionName: string;
    sessionOpenDate: string;
    sessionSeatCount: number;
    soldTicketCount: number;
    paidAmount: number;
    sold10m: number;
    sold30m: number;
    sold60m: number;
    sellThroughRate: number;
    remainingSeatCount: number;
  }>;
  trend: Array<{
    bucket: string;
    soldTicketCount: number;
    paidAmount: number;
    paymentCount: number;
  }>;
}
```

## tixy-batch

프론트 연동 API는 없지만 상태 전이 규칙은 UX에 반영해야 함.

- 이벤트 세션 상태 전이: 매분 `0 * * * * *`
- 티켓 타입 상태 전이: 매분 `30 * * * * *`
- 좌석 홀드 만료 해제: `15 */5 * * * *`
- 이벤트 상태 전이: 매일 `45 0 0 * * *`

## tixy-pt

### Security / Access

- `/ws/**` permitAll 이지만 STOMP CONNECT 시 `Authorization: Bearer {accessToken}` 필요
- 고객용 room 생성은 `ROLE_USER`
- 운영 API는 `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`
- `ROLE_SUPER_ADMIN` 은 조회는 가능하지만 읽음/메시지 write 는 제한됨

### REST

- `POST /api/support/v1/rooms`

```ts
{
  roomId: number;
  created: boolean;
}
```

- `POST /api/support/v1/rooms/{roomId}/counselor-request`

```ts
{
  roomId: number;
  status: "OPEN" | "SOLVED" | "CLOSED";
  counselorUserId: number | null;
  customerRequestedCounselorAt: string | null;
  requested: boolean;
  reopened: boolean;
  alreadyRequested: boolean;
  alreadyAssigned: boolean;
}
```

- `GET /api/support/v1/rooms/me?page=&size=`
  - response: `SliceResponse<RoomSummaryResponse>`

- `GET /api/support/v1/rooms/{roomId}`

```ts
{
  roomId: number;
  customerUserId: number;
  counselorUserId: number | null;
  customerRequestedCounselorAt: string | null;
  status: "OPEN" | "SOLVED" | "CLOSED";
  lastMessageId: number | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

- `GET /api/support/v1/rooms/{roomId}/messages?beforeMessageId=&size=`

```ts
{
  messages: Array<{
    messageId: number;
    senderUserId: number | null;
    senderType: "USER" | "COUNSELOR" | "AI" | "SYSTEM";
    messageType: "TEXT" | "SYSTEM";
    content: string;
    createdAt: string;
  }>;
  hasNext: boolean;
  nextCursor: number | null;
}
```

- 운영자 목록:
  - `GET /api/admin/support/v1/queue`
  - `GET /api/admin/support/v1/rooms/closed`
  - `GET /api/admin/support/v1/rooms/stale`
- 운영 액션:
  - `POST /api/admin/support/v1/rooms/{roomId}/claim`
  - `POST /api/admin/support/v1/rooms/{roomId}/release`
  - `POST /api/admin/support/v1/rooms/{roomId}/solve`
  - `POST /api/admin/support/v1/rooms/{roomId}/close`

### STOMP

- endpoint: `/ws/support`
- connect header: `Authorization: Bearer {accessToken}`
- publish:
  - `/pub/support/v1/rooms/{roomId}/messages`
  - `/pub/support/v1/rooms/{roomId}/read`
- subscribe:
  - `/sub/support/v1/rooms/{roomId}`
  - `/sub/support/v1/rooms/{roomId}/read`
  - `/sub/support/v1/queue`
  - `/user/queue/support/v1/read`

이벤트 payload:

- room message: `MessageEvent`
- read receipt:

```ts
{
  roomId: number;
  readerUserId: number;
  readerRole: string;
  lastReadMessageId: number;
  readAt: string;
}
```

- unread sync:

```ts
{
  roomId: number;
  lastReadMessageId: number;
  unreadCount: number;
  readAt: string;
}
```

- queue event:

```ts
{
  roomId: number;
  eventType: "CLAIMED" | "RELEASED" | "REQUESTED" | "SOLVED" | "CLOSED";
  counselorUserId: number | null;
}
```

### Support Scheduler

- `RoomSolvedAutoCloseScheduler`
  - 기본 주기: `support.solved-auto-close-check-ms: 3600000`
- `RoomSolvedAutoCloseService`
  - 기본 자동 종료 일수: `support.solved-auto-close-days: 7`

## Error Codes To Know

- `tixy`
  - `S004`: 이미 예약된 좌석
  - `S008`: 좌석 홀드 시간 초과
  - `O001`: 유저 지갑 없음
- `tixy-pt`
  - `SR002`: 문의방 접근 불가
  - `SR003`: 이미 종료된 문의방
  - `SR009`: 상담원 요청 후 AI 응답 차단
  - `SR010`: 문의방 생성 진행 중
