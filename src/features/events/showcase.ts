import type { EventCardModel, EventItem } from "@/features/events/types";
import { formatCurrency } from "@/shared/lib/format";

export const quickNavItems = [
  { label: "홈", to: "/" },
  { label: "콘서트", to: "/search?category=CONCERT" },
  { label: "뮤지컬", to: "/search?category=MUSICAL" },
  { label: "연극", to: "/search?category=PLAY" },
  { label: "전시", to: "/search?category=EXHIBITION" },
  { label: "스포츠", to: "/search?category=SPORT" },
  { label: "랭킹", to: "/search?sort=status" },
  { label: "혜택·이벤트", to: "/search?reservePossible=true" },
];

export const moodChips = [
  "신나는",
  "감동적인",
  "로맨틱",
  "힐링되는",
  "웅장한",
  "유쾌한",
  "몰입감 있는",
];

export const popularSearchTerms = [
  "임영웅 콘서트",
  "뮤지컬 드라큘라",
  "워터밤 서울",
  "세븐틴 팬미팅",
  "빛의 시어터",
  "K리그 티켓",
  "연극 옥탑방 고양이",
  "클래식 페스티벌",
];

export const generatedPosterImages = [
  "/assets/posters/tixy-poster-01.png",
  "/assets/posters/tixy-poster-02.png",
  "/assets/posters/tixy-poster-03.png",
  "/assets/posters/tixy-poster-04.png",
  "/assets/posters/tixy-poster-05.png",
  "/assets/posters/tixy-poster-06.png",
  "/assets/posters/tixy-poster-07.png",
  "/assets/posters/tixy-poster-08.png",
];

const generatedPosterImagesByCategory: Record<string, string[]> = {
  콘서트: [
    "/assets/posters/tixy-poster-01.png",
    "/assets/posters/tixy-poster-05.png",
    "/assets/posters/tixy-poster-06.png",
    "/assets/posters/tixy-poster-08.png",
  ],
  뮤지컬: [
    "/assets/posters/tixy-poster-02.png",
    "/assets/posters/tixy-poster-07.png",
  ],
  연극: [
    "/assets/posters/tixy-poster-07.png",
    "/assets/posters/tixy-poster-02.png",
  ],
  전시: [
    "/assets/posters/tixy-poster-03.png",
  ],
  스포츠: [
    "/assets/posters/tixy-poster-04.png",
  ],
  페스티벌: [
    "/assets/posters/tixy-poster-05.png",
    "/assets/posters/tixy-poster-01.png",
  ],
  추천: [
    "/assets/posters/tixy-poster-01.png",
    "/assets/posters/tixy-poster-02.png",
    "/assets/posters/tixy-poster-03.png",
    "/assets/posters/tixy-poster-05.png",
    "/assets/posters/tixy-poster-08.png",
  ],
};

export function getGeneratedPosterImage(eventId: number, category?: string) {
  const pool = category ? generatedPosterImagesByCategory[category] : undefined;
  const images = pool && pool.length > 0 ? pool : generatedPosterImages;

  return images[Math.abs(eventId) % images.length];
}

const priceSeeds = [16000, 25000, 33000, 40000, 55000, 77000, 99000, 110000, 132000, 165000];

export function getDisplayPrice(eventId: number) {
  return priceSeeds[Math.abs(eventId) % priceSeeds.length];
}

export function getDisplayPriceLabel(eventId: number) {
  return `From ${formatCurrency(getDisplayPrice(eventId))}`;
}

export function getDisplayCategory(event: Pick<EventItem, "title" | "description">, fallback?: string) {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();

  if (fallback) {
    return fallback;
  }

  if (text.includes("concert") || text.includes("콘서트") || text.includes("live")) return "콘서트";
  if (text.includes("musical") || text.includes("뮤지컬")) return "뮤지컬";
  if (text.includes("전시") || text.includes("exhibition")) return "전시";
  if (text.includes("스포츠") || text.includes("fc") || text.includes("리그")) return "스포츠";
  if (text.includes("연극") || text.includes("theater")) return "연극";

  return "추천";
}

export function getEventAccent(eventId: number) {
  const accents = [
    { badge: "HOT", color: "bg-violet-100 text-violet-700" },
    { badge: "NEW", color: "bg-pink-100 text-pink-600" },
    { badge: "인기", color: "bg-emerald-100 text-emerald-700" },
    { badge: "단독", color: "bg-primary text-zinc-950" },
    { badge: "추천", color: "bg-blue-100 text-blue-700" },
  ];

  return accents[Math.abs(eventId) % accents.length];
}

export function getCountdownLabel(dateText?: string) {
  if (!dateText) {
    return "일정 확인";
  }

  const diffDays = Math.ceil((new Date(dateText).getTime() - Date.now()) / 86_400_000);

  if (diffDays < 0) return "진행중";
  if (diffDays === 0) return "D-Day";

  return `D-${diffDays}`;
}

export function getSeatPick(eventId: number) {
  const picks = [
    { title: "A2열 10-14번", note: "무대 정면, 몰입도 최고", ratio: "24%" },
    { title: "10구역 5-8열", note: "시야와 가격의 밸런스", ratio: "18%" },
    { title: "7구역 3-6열", note: "무대 전체 시야 확보", ratio: "15%" },
  ];

  return picks.map((pick, index) => ({
    ...pick,
    active: index === Math.abs(eventId) % picks.length,
  }));
}

export function getTicketFeeEstimate(totalTicketPrice: number) {
  return {
    ticketAmount: totalTicketPrice,
    serviceFee: totalTicketPrice > 0 ? Math.max(2000, Math.round(totalTicketPrice * 0.025)) : 0,
    deliveryFee: totalTicketPrice > 0 ? 2500 : 0,
  };
}

export function getEventMiniStats(event: EventCardModel) {
  const seed = Math.abs(event.id);

  return {
    rating: (4.6 + (seed % 4) * 0.1).toFixed(1),
    viewers: (28_476 + seed * 137).toLocaleString("ko-KR"),
    runtime: `${90 + (seed % 4) * 15}분`,
    age: seed % 3 === 0 ? "8세 이상 관람가" : seed % 3 === 1 ? "12세 이상 관람가" : "전체 관람가",
  };
}
