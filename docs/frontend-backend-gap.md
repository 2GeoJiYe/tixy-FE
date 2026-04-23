# Frontend / Backend Gap

프론트 구현 중 실제 레포 기준으로 확인된 제약입니다.

## 1. 공연 목록/상세/회차가 현재 인증 필요

- `tixy` 보안 설정은 로그인/회원가입/웹훅 외 거의 모든 API를 인증으로 막고 있습니다.
- 프론트는 public-first 라우트 구조를 준비했지만, 현재 백엔드에서는 401 시 안내형 gate를 보여줍니다.
- 진짜 공개 티켓 사이트로 열려면 `permitAll` 조정이 필요합니다.

## 2. 포스터 이미지 필드 없음

- `GetEventResponse` 에 poster/image URL 없음
- 모든 포스터 UI는 `PosterImage` placeholder 정책으로 처리
- 추후 이미지 필드가 추가되면 공통 컴포넌트만 교체하면 됩니다.

## 3. 공연장 상세 주소 없음

- 현재 venue name, location 만 노출됨
- 상세 주소/지도/교통 정보는 확장 영역으로 남김

## 4. 좌석 도면 메타데이터 부족

- `GET /api/seats/v1/active` 는 `seatSectionId` 와 `seatSessionIds` 정도만 줌
- 좌석 라벨, 구역명, 등급, 좌석 배치 좌표, 통로 정보가 없음
- production path:
  - section-first
  - seat id 기반 선택
  - 과장된 실제 도면처럼 보이게 속이지 않음
- demo path:
  - `generateSeatLayout()` 기반 mock seat map
  - 명시적으로 demo 표시

## 5. 좌석 가격 확정 시점 제한

- 회차 상세에는 `ticketTypePrice` 맵이 있지만 `seatSectionId -> ticketType` 조회 API가 없음
- exact total price 는 주문 생성 응답에서만 확정
- 좌석 선택 단계에서는 회차 가격표와 운영 안내를 병행 표시

## 6. 마이티켓 / 예매내역 API 없음

- 현재 사용자 주문/티켓 조회 API가 없음
- 마이티켓은 운영 UI로 연결하지 않았고, waiting-payment 이후도 안내형으로만 제공

## 7. 결제 상태 조회 / 만료 시각 API 없음

- 브라우저 polling API 없음
- 결제 성공은 `/api/payments/v1/webhook` 처리 이후만 반영 가능
- 결제 만료 시각도 별도 응답 필드가 없어 waiting-payment 화면은 안내형으로 구성

## 8. 지갑 주소 조회/등록 API 없음

- 주문은 `Member#checkMemberWallet()` 에서 지갑 주소 없으면 `O001`
- 하지만 프론트가 사전에 조회하거나 수정할 사용자 API가 없음
- 체크아웃에서 placeholder error panel 로 노출

## 9. 회원가입 phone 저장 누락

- `SignUpRequest` 는 `phone` 포함
- `MemberService#createMember()` 는 `Member.builder()` 에 phone을 넣지 않음
- 프론트는 필드를 유지하되, 저장 누락은 백엔드 TODO로 문서화

## 10. 이벤트 목록 total count / 정렬 계약 제한

- `GET /api/events/v1` 응답은 `List<GetEventResponse>` 로 총 개수 없음
- 서버 정렬 파라미터 계약도 없음
- 검색 결과 화면은 "현재 불러온 결과 N건" 기준으로 구성하고, 정렬은 프론트 현재 응답 집합 내부 정렬만 제공

## 11. Support queue / unread 전역 이벤트 제한

- queue 는 실시간 이벤트가 있으나, 고객용 전체 room unread 증가를 직접 푸시하는 별도 목록 이벤트는 없음
- 목록은 polling + 읽음 sync invalidation 조합으로 처리

## 12. SUPER_ADMIN support write 제한

- `SupportAccessPolicy.validateParticipantWritable()` 에 따라 SUPER_ADMIN 은 읽기 위주
- 프론트에서 super admin room thread 는 조회 전용으로 막음
