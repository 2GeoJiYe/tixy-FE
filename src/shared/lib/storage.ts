export function readStorage<T>(storage: Storage, key: string) {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStorage<T>(storage: Storage, key: string, value: T | null) {
  if (value == null) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}
