# Tixy Frontend

백엔드 3개 레포(`tixy`, `tixy-batch`, `tixy-pt`)를 실제로 읽고 계약을 맞춘 통합 운영형 프론트엔드 초안입니다.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- STOMP.js

## Run

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

## Environment

`.env.example`

```env
VITE_API_BASE_URL=/api
VITE_SUPPORT_API_BASE_URL=/api
VITE_SUPPORT_WS_URL=/ws/support
VITE_ENABLE_MOCK_SEAT_MAP=true
VITE_MAIN_PROXY_TARGET=http://localhost:8080
VITE_SUPPORT_PROXY_TARGET=http://localhost:8081
```

same-origin reverse proxy 기준 권장 라우팅:

- `/api/auth/**`, `/api/events/**`, `/api/event/**`, `/api/seats/**`, `/api/orders/**`, `/api/payments/**`, `/api/dashboard/**` -> `tixy`
- `/api/support/**`, `/api/admin/support/**`, `/ws/support` -> `tixy-pt`

로컬 `vite dev`에서는 위 same-origin 구조를 맞추기 위해 dev proxy를 함께 설정해 두었습니다.

## Structure

```text
src/
  app/
    layouts/
    providers/
    router/
  shared/
    api/
    config/
    hooks/
    lib/
    types/
    ui/
  features/
    auth/
    events/
    booking/
    support/
    admin-support/
    admin-dashboard/
```

## Main Flows

- Public-first browsing: 홈, 검색, 공연 상세, 회차 화면은 public route로 열어 두고, 현재 백엔드가 401을 반환하면 안내형 gate로 처리
- Booking: 회차 -> 좌석 선택 -> 좌석 홀드 -> 체크아웃 -> 입금 대기
- Support: 문의방 생성/재진입, 메시지 실시간 수신, 읽음 처리, 상담원 요청
- Admin: queue/closed/stale 운영 콘솔, claim/release/solve/close, sales dashboard

## Documents

- [백엔드 계약](./docs/backend-contract.md)
- [프론트-백엔드 갭](./docs/frontend-backend-gap.md)
- [디자인 결정](./docs/design-decisions.md)

## Notes

- `refresh token reissue`는 보안 설정만 열려 있고 컨트롤러는 비활성이라 구현하지 않았습니다.
- 좌석 도면 메타데이터가 없어 production path는 section-first, demo path는 명시적 mock seat map으로 분리했습니다.
- 결제 완료 폴링과 마이티켓은 백엔드 계약이 없어 안내형 UI로만 처리했습니다.
