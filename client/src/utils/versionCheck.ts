declare const __COMMIT_SHA__: string;

const VERSION_KEY = "arcade-app-version";
const CACHE_PREFIX = "arcade-query-cache-";

export function checkAndClearStaleCache() {
  const currentVersion = __COMMIT_SHA__;
  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion !== currentVersion) {
    clearStaleQueryCache();
    localStorage.setItem(VERSION_KEY, currentVersion);
  }
}

function clearStaleQueryCache() {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}
