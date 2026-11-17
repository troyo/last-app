// Web preview version of locate.ts, using the browser's location.
export type Fix = { lat: number; lon: number };

export function locate(timeoutMs = 20000): Promise<Fix | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: timeoutMs },
    );
  });
}
