# Design Decisions

## 1. Public-first 라우트, 현재 백엔드 401은 안내형 gate

사용자 요구는 공개 탐색 중심이었지만 실제 `tixy` 보안 설정은 목록/상세까지 인증이 필요했습니다. 그래서 프론트는 라우트 자체는 공개로 설계하고, 현재 백엔드 모드에서는 401을 설명 가능한 gate UI로 바꿨습니다. 이후 permitAll 이 열리면 라우트 구조를 바꾸지 않고 바로 public browsing 으로 전환할 수 있습니다.

## 2. 고객 플로우 우선, 운영 플로우는 별도 route group

한 앱 안에서 고객/운영을 모두 다루되, `/admin/**` 를 별도 layout 으로 분리했습니다. 이렇게 하면 공통 auth/http/query 는 공유하면서도 정보 구조와 작업 밀도를 역할별로 분리할 수 있습니다.

## 3. Access token only auth

실제 컨트롤러 기준 refresh reissue 가 비활성이라 silent refresh 를 구현하지 않았습니다. 로그인 응답의 access token 을 저장하고, 역할 정보는 UI 가드용으로만 JWT payload 에서 읽습니다.

## 4. API 없는 데이터는 adapter 또는 placeholder 로 명시

포스터, 공연장 주소, 결제 만료 시각, 마이티켓, 지갑 주소 조회처럼 백엔드가 주지 않는 데이터는 임의 생성하지 않았습니다. 대신:

- `PosterImage` placeholder
- waiting-payment 안내형 UI
- wallet gap panel
- mock seat map 을 production path 와 분리

로 처리했습니다.

## 5. 좌석 선택은 section-first production path

운영 경로에서는 실제 API가 주는 `seatSectionId` 와 `seatIds`만 사용했습니다. 상용 서비스처럼 좌석 선택 흐름은 유지하되, 없는 좌석 도면을 사실처럼 렌더링하지 않았습니다. 대신 데모 모드 seat map 을 별도 토글로 제공해 향후 도면 API 연결 지점을 분리했습니다.

## 6. Support 채팅은 polling + STOMP 혼합

REST 는 목록/상세/과거 메시지 cursor 조회에 사용하고, STOMP 는 실시간 메시지/읽음/queue 이벤트에만 사용했습니다. 이렇게 나누면 reconnect 시에도 기본 화면 복원이 안정적이고, 브로커 연결이 끊겨도 최소 기능은 REST 로 유지됩니다.

## 7. 운영 대시보드는 단일 응답 기반

`/api/dashboard/v1/sales` 는 summary/sessions/trend 를 한 번에 주므로, 프론트도 이를 그대로 묶어서 렌더링했습니다. 카드, 차트, 테이블을 따로 API fan-out 하지 않아 네트워크와 상태 관리가 단순합니다.

## 8. 디자인 톤

- 흰 배경 + 회색 스케일 + rose 계열 포인트 1색
- 낮은 shadow, 선명한 border
- 정보 위계 우선
- 모바일 sticky CTA
- 운영 화면은 dense 하지만 읽기 쉬운 split pane

과한 랜딩/네온/AI 슬롭 느낌은 의도적으로 피했습니다.
