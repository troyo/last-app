// Shares "what's installed" and "what's downloading" with every screen.

import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import type { DownloadTask } from './fs';
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { PackId } from './catalog';
import {
  downloadPack,
  LibraryState,
  Progress,
  readState,
  removeExtras,
  writeState,
} from './library';

type Ctx = {
  state: LibraryState;
  downloading: boolean;
  progress: Progress | null;
  lastFailed: string[];
  start: (pack: PackId) => void;
  pause: () => void;
  removeAll: () => void;
  version: number; // bumps when files change, so lists re-check what's on disk
};

const LibraryContext = createContext<Ctx | null>(null);

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
      if (downloading) return;
      // Switching to a smaller pack? Free up the space right away.
      removeExtras(pack);
      stopRef.current = false;
      setDownloading(true);
      setLastFailed([]);
      setState({ pack, complete: false });
      activateKeepAwakeAsync('download').catch(() => {});
      try {
        const res = await downloadPack(
          pack,
          (p) => {
            setProgress(p);
            setVersion((v) => v + 1);
          },
          () => stopRef.current,
          (t) => (taskRef.current = t),
        );
        setLastFailed(res.failed);
        setState({ pack, complete: res.finished });
      } finally {
        deactivateKeepAwake('download').catch(() => {});
        setDownloading(false);
        setProgress(null);
        setVersion((v) => v + 1);
      }
    },
    [downloading],
  );

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

  return (
    <LibraryContext.Provider
      value={{ state, downloading, progress, lastFailed, start, pause, removeAll, version }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): Ctx {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}
