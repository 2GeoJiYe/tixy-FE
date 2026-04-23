const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const numberFormatter = new Intl.NumberFormat("ko-KR");

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
  if (!value) {
    return "-";
  }

  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return dateTimeFormatter.format(new Date(value));
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

export function toLocalDateTimeString(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function startOfDayString(dateText: string) {
  const date = new Date(`${dateText}T00:00:00`);
  return toLocalDateTimeString(date);
}

export function endOfDayString(dateText: string) {
  const date = new Date(`${dateText}T23:59:59`);
  return toLocalDateTimeString(date);
}
