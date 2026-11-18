// Shares "what's installed" and "what's downloading" with every screen.

import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import type { DownloadTask } from './fs';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PackId } from './catalog';
import { initPurchases, needsUnlock } from './purchases';
import {
  downloadPack,
  LibraryState,
  loadSavedCatalog,
  refreshCatalog,
  Progress,
  readState,
  removeExtras,
  writeState,
} from './library';

type Ctx = {
  state: LibraryState;
  downloading: boolean;
  lastFailed: string[];
  start: (pack: PackId) => void;
  pause: () => void;
  removeAll: () => void;
  version: number; // bumps when files or the catalog change, so screens re-check
  checkForUpdates: () => Promise<boolean>;
};

// Load the catalog saved on the phone before any screen renders.
loadSavedCatalog();
// Connect to the App Store / Google Play early, so an unfinished purchase is picked up.
initPurchases();

const LibraryContext = createContext<Ctx | null>(null);
// Download progress ticks several times a second. It lives on its own so only
// the progress bars redraw, not every screen that shows guides.
const ProgressContext = createContext<Progress | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(() => readState());
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [lastFailed, setLastFailed] = useState<string[]>([]);
  const [version, setVersion] = useState(0);
  const stopRef = useRef(false);
  const taskRef = useRef<DownloadTask | null>(null);

  const start = useCallback(
    async (pack: PackId) => {
      if (downloading || needsUnlock(pack)) return; // paid packs need the unlock
      // Switching to a smaller pack? Free up the space right away.
      removeExtras(pack);
      stopRef.current = false;
      setDownloading(true);
      setLastFailed([]);
      setState({ pack, complete: false });
      activateKeepAwakeAsync('download').catch(() => {});
      let lastDraw = 0;
      let lastDone = -1;
      try {
        const res = await downloadPack(
          pack,
          (p) => {
            // Byte-by-byte updates arrive very fast. Redraw at most ~4 times a
            // second, and only refresh the guide lists when a file finishes.
            const now = Date.now();
            const fileFinished = p.doneItems !== lastDone;
            if (!fileFinished && now - lastDraw < 250) return;
            lastDraw = now;
            lastDone = p.doneItems;
            setProgress(p);
            if (fileFinished) setVersion((v) => v + 1);
          },
          () => stopRef.current,
          (t) => (taskRef.current = t),
        );
        setLastFailed(res.failed);
        setState({ pack, complete: res.finished });
      } catch {
        // Never let a download problem take the app down. What's saved stays
        // saved, and tapping download again picks up where it stopped.
        setLastFailed(['The download stopped unexpectedly. Tap to try again.']);
      } finally {
        deactivateKeepAwake('download').catch(() => {});
        setDownloading(false);
        setProgress(null);
        setVersion((v) => v + 1);
      }
    },
    [downloading],
  );

  // When there's internet, quietly fetch the newest catalog.
  const checkForUpdates = useCallback(async () => {
    const changed = await refreshCatalog();
    if (changed) setVersion((v) => v + 1);
    return changed;
  }, []);
  useEffect(() => {
    // Wait until the first screen is up and settled, so this never competes with a tap.
    const timer = setTimeout(checkForUpdates, 4000);
    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  const pause = useCallback(() => {
    stopRef.current = true;
    taskRef.current?.cancel();
  }, []);

  const removeAll = useCallback(() => {
    pause();
    removeExtras(null);
    writeState({ pack: null, complete: false });
    setState({ pack: null, complete: false });
    setVersion((v) => v + 1);
  }, [pause]);

  const value = useMemo(
    () => ({ state, downloading, lastFailed, start, pause, removeAll, version, checkForUpdates }),
    [state, downloading, lastFailed, start, pause, removeAll, version, checkForUpdates],
  );
  return (
    <LibraryContext.Provider value={value}>
      <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>
    </LibraryContext.Provider>
  );
}

/** How far the current download is. Only for the parts that draw a progress bar. */
export const useProgress = () => useContext(ProgressContext);

export function useLibrary(): Ctx {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}
