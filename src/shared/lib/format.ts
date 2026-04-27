export const KOREA_TIME_ZONE = "Asia/Seoul";

const KOREA_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1000;
const ISO_TIME_ZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i;
const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?/;

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KOREA_TIME_ZONE,
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KOREA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const koreaDateTimePartsFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KOREA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const numberFormatter = new Intl.NumberFormat("ko-KR");

function normalizeMilliseconds(value: string | undefined) {
  return Number((value ?? "0").padEnd(3, "0").slice(0, 3));
}

function parseKoreaLocalDateTime(value: string) {
  const match = value.match(LOCAL_DATE_TIME_PATTERN);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour = "0", minute = "0", second = "0", millisecond] = match;
  const utcTime =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      normalizeMilliseconds(millisecond),
    ) - KOREA_OFFSET_MILLISECONDS;

  return new Date(utcTime);
}

function parseUtcLocalDateTime(value: string) {
  const match = value.match(LOCAL_DATE_TIME_PATTERN);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour = "0", minute = "0", second = "0", millisecond] = match;
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      normalizeMilliseconds(millisecond),
    ),
  );
}

export function parseKoreaDate(value: string | Date | number | null | undefined) {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  if (ISO_TIME_ZONE_PATTERN.test(value)) {
    return new Date(value);
  }

  return parseKoreaLocalDateTime(value) ?? new Date(value);
}

export function parseUtcDateToKorea(value: string | Date | number | null | undefined) {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  if (ISO_TIME_ZONE_PATTERN.test(value)) {
    return new Date(value);
  }

  return parseUtcLocalDateTime(value) ?? new Date(value);
}

function getKoreaDateTimeParts(date: Date) {
  const parts = koreaDateTimePartsFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

export function getKoreaTime(value: string | Date | number | null | undefined) {
  return parseKoreaDate(value)?.getTime() ?? 0;
}

export function isSameKoreaDay(
  left: string | Date | number | null | undefined,
  right: string | Date | number | null | undefined,
) {
  const leftDate = parseKoreaDate(left);
  const rightDate = parseKoreaDate(right);

  if (!leftDate || !rightDate) {
    return false;
  }

  const leftParts = getKoreaDateTimeParts(leftDate);
  const rightParts = getKoreaDateTimeParts(rightDate);

  return (
    leftParts.year === rightParts.year &&
    leftParts.month === rightParts.month &&
    leftParts.day === rightParts.day
  );
}

function getKoreaDayNumber(date: Date) {
  const parts = getKoreaDateTimeParts(date);
  return Math.floor(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86_400_000,
  );
}

export function differenceInKoreaCalendarDays(
  target: string | Date | number | null | undefined,
  base: string | Date | number | null | undefined = Date.now(),
) {
  const targetDate = parseKoreaDate(target);
  const baseDate = parseKoreaDate(base);

  if (!targetDate || !baseDate) {
    return null;
  }

  return getKoreaDayNumber(targetDate) - getKoreaDayNumber(baseDate);
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null) {
    return "-";
  }

  return `${numberFormatter.format(value)}원`;
}

export function formatCount(value: number | null | undefined) {
  if (value == null) {
    return "-";
  }

  return numberFormatter.format(value);
}

export function formatDate(value: string | Date | null | undefined) {
  const date = parseKoreaDate(value);
  if (!date) {
    return "-";
  }

  return dateFormatter.format(date);
}

export function formatDateTime(value: string | Date | null | undefined) {
  const date = parseKoreaDate(value);
  if (!date) {
    return "-";
  }

  return dateTimeFormatter.format(date);
}

export function formatUtcDateTimeToKorea(value: string | Date | null | undefined) {
  const date = parseUtcDateToKorea(value);
  if (!date) {
    return "-";
  }

  return dateTimeFormatter.format(date);
}

export function formatDateRange(start?: string | Date | null, end?: string | Date | null) {
  if (!start && !end) {
    return "일정 정보 준비 중";
  }

  if (start && end) {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  }

  return formatDate(start ?? end);
}

export function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function toKoreaDateTimeString(date: Date) {
  const parts = getKoreaDateTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function toLocalDateTimeString(date: Date) {
  return toKoreaDateTimeString(date);
}

export function startOfDayString(dateText: string) {
  return `${dateText}T00:00:00`;
}

export function endOfDayString(dateText: string) {
  return `${dateText}T23:59:59`;
}
