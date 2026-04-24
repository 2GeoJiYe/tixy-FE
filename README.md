# Tixy Frontend

백엔드 3개 레포(`tixy`, `tixy-batch`, `tixy-pt`)의 계약을 맞춘 통합 운영형 프론트엔드 초안.

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
VITE_API_BASE_URL=/tixy/api
VITE_SUPPORT_API_BASE_URL=/tixypt/api
VITE_SUPPORT_WS_URL=/tixypt/ws/support
VITE_ENABLE_MOCK_SEAT_MAP=true
VITE_MAIN_PROXY_TARGET=http://localhost:8080
VITE_SUPPORT_PROXY_TARGET=http://localhost:8081
```

same-origin reverse proxy 기준 권장 라우팅:

- `/tixy/api/auth/**`, `/tixy/api/events/**`, `/tixy/api/event/**`, `/tixy/api/seats/**`, `/tixy/api/orders/**`, `/tixy/api/payments/**`, `/tixy/api/dashboard/**` -> `tixy`
- `/tixypt/api/support/**`, `/tixypt/api/admin/support/**`, `/tixypt/ws/support` -> `tixy-pt`

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
