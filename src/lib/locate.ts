// Asks the phone where it is. GPS works with no cell signal or Wi-Fi, it just
// needs a view of the sky and can take a minute.
import { LocationManager } from '@maplibre/maplibre-react-native';
import { File, Paths } from './fs';

// Set once the person has let us find them, so screens can locate them
// quietly later without springing the permission prompt on them unasked.
const GRANTED = new File(Paths.document, 'location-ok.json');

/** True if location has worked before, so asking again won't pop a prompt. */
export function canLocateQuietly(): boolean {
  try {
    return GRANTED.exists;
  } catch {
    return false;
  }
}

function rememberGranted() {
  try {
    if (!GRANTED.exists) GRANTED.writeSync('{"ok":true}');
  } catch {
    // only a convenience
  }
}

export type Fix = { lat: number; lon: number };

type Position = { coords: { latitude: number; longitude: number } };

const toFix = (p: Position | null | undefined): Fix | null =>
  p && Number.isFinite(Number(p.coords?.latitude))
    ? { lat: Number(p.coords.latitude), lon: Number(p.coords.longitude) }
    : null;

/**
 * Returns null if the person says no, or no fix arrives in time.
 *
 * MapLibre's getCurrentPosition() only returns the last location iOS already
 * had, which is empty until location updates have started. So we start
 * listening and take the first real update. One timer covers the whole thing,
 * including the permission prompt, so the screen can never get stuck.
 */
export function locate(timeoutMs = 20000): Promise<Fix | null> {
  return new Promise((resolve) => {
    let finished = false;
    const onUpdate = (p: Position) => {
      const fix = toFix(p);
      if (fix) finish(fix);
    };
    const finish = (fix: Fix | null) => {
      if (finished) return;
      finished = true;
      if (fix) rememberGranted();
      clearTimeout(timer);
      try {
        LocationManager.removeListener(onUpdate as never);
      } catch {
        // already stopped
      }
      resolve(fix);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);

    (async () => {
      try {
        const ok = await LocationManager.requestPermissions();
        if (!ok) return finish(null);
        // Use a recent fix straight away if iOS already has one.
        const known = toFix((await LocationManager.getCurrentPosition()) as Position | undefined);
        if (known) return finish(known);
        LocationManager.addListener(onUpdate as never);
      } catch {
        finish(null);
      }
    })();
  });
}
