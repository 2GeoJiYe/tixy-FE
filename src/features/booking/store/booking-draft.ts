import { readStorage, writeStorage } from "@/shared/lib/storage";
import type { BookingDraft } from "@/features/booking/types";

const STORAGE_KEY = "tixy.booking.draft";

export function readBookingDraft() {
  return readStorage<BookingDraft>(window.sessionStorage, STORAGE_KEY);
}

export function writeBookingDraft(draft: BookingDraft | null) {
  writeStorage(window.sessionStorage, STORAGE_KEY, draft);
}
