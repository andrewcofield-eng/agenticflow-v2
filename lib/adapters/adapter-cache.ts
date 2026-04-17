type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  updatedAt: string;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();

export function getCachedValue<T>(key: string): CacheEntry<T> | null {
  const entry = cacheStore.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry;
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  const now = Date.now();

  const entry: CacheEntry<T> = {
    value,
    expiresAt: now + ttlMs,
    updatedAt: new Date(now).toISOString(),
  };

  cacheStore.set(key, entry);
  return entry;
}

export function clearCachedValue(key: string) {
  cacheStore.delete(key);
}

export function clearCacheByPrefix(prefix: string) {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}

export function clearAllCachedValues() {
  cacheStore.clear();
}

export function getCacheSnapshot() {
  return Array.from(cacheStore.entries()).map(([key, entry]) => ({
    key,
    expiresAt: entry.expiresAt,
    updatedAt: entry.updatedAt,
  }));
}

export type { CacheEntry };
