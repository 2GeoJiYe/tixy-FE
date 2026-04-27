import { categoryOptions, locationOptions } from "@/features/events/constants";
import type {
  EventCardModel,
  EventItem,
  EventSessionDetail,
  EventSessionItem,
  EventSortValue,
} from "@/features/events/types";
import { getDisplayCategory, getDisplayPriceLabel, getGeneratedPosterImage } from "@/features/events/showcase";
import { formatCurrency, formatDateTime, getKoreaTime, isSameKoreaDay } from "@/shared/lib/format";

const eventStatusPriority: Record<string, number> = {
  OPEN: 0,
  SCHEDULED: 1,
  CLOSED: 2,
};

const eventSortValues: EventSortValue[] = ["recommended", "status", "openDate", "closingSoon"];

function getTime(value: string) {
  return getKoreaTime(value);
}

function compareStatus(left: EventItem, right: EventItem) {
  const leftPriority = eventStatusPriority[normalizeEventStatus(left.eventStatus)] ?? Number.MAX_SAFE_INTEGER;
  const rightPriority = eventStatusPriority[normalizeEventStatus(right.eventStatus)] ?? Number.MAX_SAFE_INTEGER;

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  const openDiff = getTime(left.openDate) - getTime(right.openDate);
  if (openDiff !== 0) {
    return openDiff;
  }

  return getTime(left.endDate) - getTime(right.endDate);
}

export function normalizeEventSort(value: string | null | undefined): EventSortValue {
  if (value && eventSortValues.includes(value as EventSortValue)) {
    return value as EventSortValue;
  }

  return "recommended";
}

export function getLocationLabel(location: string) {
  return locationOptions.find((option) => option.value === location)?.label ?? location;
}

export function normalizeEventStatus(status: string) {
  const value = status.trim();
  const upper = value.toUpperCase();

  if (upper === "OPEN") {
    return "OPEN";
  }

  if (upper === "SCHEDULED") {
    return "SCHEDULED";
  }

  if (upper === "CLOSED") {
    return "CLOSED";
  }

  if (value.includes("종료") || value.includes("마감")) {
    return "CLOSED";
  }

  if (value.includes("예정")) {
    return "SCHEDULED";
  }

  return "OPEN";
}

export function getEventStatusPresentation(status: string) {
  switch (normalizeEventStatus(status)) {
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

export function isEventBookable(status: string) {
  return normalizeEventStatus(status) !== "CLOSED";
}

export function toEventCardModel(event: EventItem, tag?: string): EventCardModel {
  const status = getEventStatusPresentation(event.eventStatus);
  const displayCategory = getDisplayCategory(event, tag ? categoryLabel(tag) : undefined);

  return {
    ...event,
    posterUrl: getGeneratedPosterImage(event.id, displayCategory),
    locationLabel: getLocationLabel(event.location),
    statusLabel: status.label,
    statusTone: status.tone,
    priceLabel: getDisplayPriceLabel(event.id),
    tags: [displayCategory],
  };
}

export function sortEvents(items: EventItem[], sort: EventSortValue) {
  const next = [...items];

  switch (sort) {
    case "status":
      return next.sort(compareStatus);
    case "openDate":
      return next.sort((left, right) => getTime(left.openDate) - getTime(right.openDate));
    case "closingSoon":
      return next.sort((left, right) => getTime(left.endDate) - getTime(right.endDate));
    default:
      return next;
  }
}

export function getFeaturedCollections(events: EventItem[]) {
  const now = Date.now();
  const visibleEvents = events.filter((event) => normalizeEventStatus(event.eventStatus) !== "CLOSED");
  const onSale = visibleEvents
    .filter((event) => normalizeEventStatus(event.eventStatus) === "OPEN")
    .sort((left, right) => getTime(right.openDate) - getTime(left.openDate));

  return {
    onSale,
    openingToday: visibleEvents
      .filter((event) => isSameKoreaDay(event.openDate, now))
      .sort((left, right) => getTime(left.openDate) - getTime(right.openDate)),
    closingSoon: onSale
      .filter((event) => getTime(event.endDate) >= now)
      .sort((left, right) => getTime(left.endDate) - getTime(right.endDate)),
    upcoming: visibleEvents
      .filter((event) => normalizeEventStatus(event.eventStatus) === "SCHEDULED")
      .sort((left, right) => getTime(left.openDate) - getTime(right.openDate)),
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
  const open = getTime(detail.saleOpenDate);
  const close = getTime(detail.saleCloseDate);

  if (now < open) {
    return {
      label: `판매 오픈 · ${formatDateTime(detail.saleOpenDate)}`,
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

export function isSessionBookable(status: string) {
  return normalizeEventStatus(status) !== "CLOSED";
}

export function categoryLabel(category: string) {
  return categoryOptions.find((option) => option.value === category)?.label ?? category;
}
