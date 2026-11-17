// Asks the phone where it is. GPS works with no cell signal or Wi-Fi, it just
// needs a view of the sky and can take a minute.
import { LocationManager } from '@maplibre/maplibre-react-native';

export type Fix = { lat: number; lon: number };

/** Returns null if the person says no, or no fix arrives in time. */
export async function locate(timeoutMs = 20000): Promise<Fix | null> {
  try {
    const ok = await LocationManager.requestPermissions();
    if (!ok) return null;
    const pos = await Promise.race([
      LocationManager.getCurrentPosition(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (!pos) return null;
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch {
    return null;
  }
}
