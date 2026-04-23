import { readStorage, writeStorage } from "@/shared/lib/storage";
import type { ReadReceiptEvent } from "@/features/support/types";

const STORAGE_KEY = "tixy.support.read-receipts";

type ReadReceiptMap = Record<string, ReadReceiptEvent>;

function readReadReceiptMap() {
  return readStorage<ReadReceiptMap>(window.sessionStorage, STORAGE_KEY) ?? {};
}

export function readStoredReadReceipt(roomId: number) {
  const receipts = readReadReceiptMap();
  return receipts[String(roomId)] ?? null;
}

export function writeStoredReadReceipt(roomId: number, event: ReadReceiptEvent | null) {
  const receipts = readReadReceiptMap();

  if (event == null) {
    delete receipts[String(roomId)];
  } else {
    receipts[String(roomId)] = event;
  }

  writeStorage(window.sessionStorage, STORAGE_KEY, receipts);
}
