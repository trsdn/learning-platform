import { useEffect, useState } from 'react';

/**
 * Tracks whether the browser currently has a network connection.
 *
 * `navigator.onLine` only reports whether a network interface is available, so
 * a `true` value is not a promise that requests will succeed. A `false` value
 * is reliable and is what the offline handling depends on.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine !== false
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // The connection can change between the initial render and this effect.
    setIsOnline(navigator.onLine !== false);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}
