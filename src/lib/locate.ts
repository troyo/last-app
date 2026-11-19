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

type Position = {
  coords: { latitude: number; longitude: number; accuracy?: number };
  timestamp?: number;
};

const toFix = (p: Position | null | undefined): Fix | null =>
  p && Number.isFinite(Number(p.coords?.latitude)) && Number.isFinite(Number(p.coords?.longitude))
    ? { lat: Number(p.coords.latitude), lon: Number(p.coords.longitude) }
    : null;

/** Meters the fix could be off by. Unknown counts as fine. */
const fuzz = (p: Position) => {
  const a = Number(p.coords?.accuracy);
  return Number.isFinite(a) && a > 0 ? a : 0;
};

/** True if the fix is known to be more than a few minutes old. */
const stale = (p: Position) => {
  let ts = Number(p.timestamp);
  if (!Number.isFinite(ts) || ts <= 0) return false;
  if (ts < 1e12) ts *= 1000; // some phones report seconds
  return Date.now() - ts > 5 * 60 * 1000;
};

// Good enough to tell which state you're in (about 2 miles).
const GOOD_ENOUGH = 3000;

/**
 * Returns null if the person says no, or no fix arrives in time.
 *
 * MapLibre's getCurrentPosition() only returns the last location the phone
 * already had, which can be empty, rough (cell towers) or from hours ago and
 * somewhere else. We only trust it if it's recent and sharp. Otherwise we
 * listen for live updates and take the first sharp one. If time runs out we
 * use the sharpest live one we got rather than nothing. One timer covers the whole
 * thing, including the permission prompt, so the screen can never get stuck.
 */
export function locate(timeoutMs = 20000): Promise<Fix | null> {
  return new Promise((resolve) => {
    let finished = false;
    let best: { fix: Fix; fuzz: number } | null = null;
    const onUpdate = (p: Position) => {
      const fix = toFix(p);
      // An old fix could be from somewhere else entirely, so skip it.
      if (!fix || stale(p)) return;
      if (fuzz(p) <= GOOD_ENOUGH) return finish(fix);
      // Keep the sharpest so far in case nothing sharp arrives in time.
      if (!best || fuzz(p) < best.fuzz) best = { fix, fuzz: fuzz(p) };
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
    const timer = setTimeout(() => finish(best?.fix ?? null), timeoutMs);

    (async () => {
      try {
        const ok = await LocationManager.requestPermissions();
        if (!ok) return finish(null);
        // Use the phone's saved fix straight away if it's recent and sharp.
        const saved = (await LocationManager.getCurrentPosition()) as Position | undefined;
        const known = toFix(saved);
        if (saved && known && !stale(saved) && fuzz(saved) <= GOOD_ENOUGH) return finish(known);
        LocationManager.addListener(onUpdate as never);
      } catch {
        finish(null);
      }
    })();
  });
}
