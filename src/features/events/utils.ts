import { categoryOptions, locationOptions } from "@/features/events/constants";
import type { EventCardModel, EventItem, EventSessionDetail, EventSessionItem } from "@/features/events/types";
import { formatCurrency, formatDateTime } from "@/shared/lib/format";

export function getLocationLabel(location: string) {
  return locationOptions.find((option) => option.value === location)?.label ?? location;
}

export function getEventStatusPresentation(status: string) {
  switch (status) {
    case "OPEN":
      return { label: "판매중", tone: "success" as const };
    case "SCHEDULED":
      return { label: "오픈예정", tone: "warning" as const };
    case "CLOSED":
      return { label: "종료", tone: "muted" as const };
    default:
      return { label: status, tone: "muted" as const };
  }
}

export function toEventCardModel(event: EventItem, tag?: string): EventCardModel {
  const status = getEventStatusPresentation(event.eventStatus);
  return {
    ...event,
    posterUrl: null,
    locationLabel: getLocationLabel(event.location),
    statusLabel: status.label,
    statusTone: status.tone,
    tags: tag ? [tag] : [],
  };
}

export function sortEvents(items: EventItem[], sort: string) {
  const next = [...items];
  switch (sort) {
    case "openDate":
      return next.sort(
        (left, right) => new Date(left.openDate).getTime() - new Date(right.openDate).getTime(),
      );
    case "closingSoon":
      return next.sort(
        (left, right) => new Date(left.endDate).getTime() - new Date(right.endDate).getTime(),
      );
    default:
      return next;
  }
}

export function getFeaturedCollections(events: EventItem[]) {
  const now = Date.now();
  return {
    openingToday: events.filter((event) => {
      const open = new Date(event.openDate).getTime();
      return Math.abs(open - now) < 86_400_000;
    }),
    closingSoon: [...events]
      .filter((event) => new Date(event.endDate).getTime() >= now)
      .sort((left, right) => new Date(left.endDate).getTime() - new Date(right.endDate).getTime())
      .slice(0, 4),
  };
}

export function formatSessionPrice(session: EventSessionItem) {
  if (session.minPrice === session.maxPrice) {
    return formatCurrency(session.minPrice);
  }
  return `${formatCurrency(session.minPrice)} ~ ${formatCurrency(session.maxPrice)}`;
}

export function formatTicketTypePriceMap(detail: EventSessionDetail) {
  return Object.entries(detail.ticketTypePrice)
    .map(([grade, price]) => `${grade}: ${formatCurrency(price)}`)
    .join(" · ");
}

export function getSessionSaleStatus(detail: EventSessionDetail) {
  const now = Date.now();
  const open = new Date(detail.saleOpenDate).getTime();
  const close = new Date(detail.saleCloseDate).getTime();

  if (now < open) {
    return {
      label: `판매 오픈 전 · ${formatDateTime(detail.saleOpenDate)}`,
      tone: "warning" as const,
    };
  }

  if (now > close) {
    return {
      label: "판매 종료",
      tone: "muted" as const,
    };
  }

  return {
    label: `예매 가능 · ${formatDateTime(detail.saleCloseDate)} 마감`,
    tone: "success" as const,
  };
}

export function categoryLabel(category: string) {
  return categoryOptions.find((option) => option.value === category)?.label ?? category;
}
