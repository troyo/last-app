// Browser stand-in for expo-file-system, used ONLY for previewing the app
// in a web browser during development. "Files" live in memory (and in
// localStorage for small text files), so nothing here is meant for real use.
// Phones use the real file system via fs.ts.

const mem = new Map<string, string>();
const hashes = new Map<string, string>(); // sha256 of downloaded bytes
const LS_PREFIX = 'lastapp-fs:';

function load(uri: string): string | undefined {
  if (mem.has(uri)) return mem.get(uri);
  try {
    const v = localStorage.getItem(LS_PREFIX + uri);
    if (v !== null) mem.set(uri, v);
    return v ?? undefined;
  } catch {
    return undefined;
  }
}
function save(uri: string, v: string) {
  mem.set(uri, v);
  try {
    localStorage.setItem(LS_PREFIX + uri, v);
  } catch {
    // quota or private mode: memory only
  }
}
function drop(uri: string) {
  mem.delete(uri);
  try {
    localStorage.removeItem(LS_PREFIX + uri);
  } catch {}
}
function allUris(): string[] {
  const set = new Set(mem.keys());
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(LS_PREFIX)) set.add(k.slice(LS_PREFIX.length));
    }
  } catch {}
  return [...set];
}

const join = (...parts: (string | Directory | File)[]) =>
  parts
    .map((p) => (typeof p === 'string' ? p : p.uri))
    .join('/')
    .replace(/\/+/g, '/');

export class Directory {
  uri: string;
  constructor(...parts: (string | Directory | File)[]) {
    this.uri = join(...parts);
  }
  get exists() {
    return true;
  }
  create(_opts?: unknown) {}
  list(): (File | Directory)[] {
    return allUris()
      .filter((u) => u.startsWith(this.uri + '/') && !u.slice(this.uri.length + 1).includes('/'))
      .map((u) => new File(u));
  }
}

export class File {
  uri: string;
  constructor(...parts: (string | Directory | File)[]) {
    this.uri = join(...parts);
  }
  get name() {
    return this.uri.split('/').pop()!;
  }
  get exists() {
    return load(this.uri) !== undefined;
  }
  textSync() {
    return load(this.uri) ?? '';
  }
  async text() {
    return this.textSync();
  }
  writeSync(v: string) {
    save(this.uri, v);
  }
  async write(v: string) {
    save(this.uri, v);
  }
  delete() {
    drop(this.uri);
  }
  move(dest: File) {
    save(dest.uri, this.textSync());
    hashes.delete(this.uri);
    drop(this.uri);
  }
  async digest(_alg: string) {
    return hashes.get(this.uri) ?? '';
  }
  async preview(_opts?: unknown) {}

  static createDownloadTask(
    url: string,
    dest: File,
    opts?: { onProgress?: (p: { bytesWritten: number; totalBytes: number }) => void },
  ) {
    const ctrl = new AbortController();
    return {
      async downloadAsync() {
        try {
          const res = await fetch(url, { signal: ctrl.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const raw = await res.arrayBuffer();
          const hash = await crypto.subtle.digest('SHA-256', raw);
          hashes.set(
            dest.uri,
            [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join(''),
          );
          const body = new TextDecoder().decode(raw);
          opts?.onProgress?.({ bytesWritten: body.length, totalBytes: body.length });
          save(dest.uri, body);
          return dest;
        } catch (e) {
          if (ctrl.signal.aborted) return null;
          throw e;
        }
      },
      cancel() {
        ctrl.abort();
      },
    };
  }
}

export type DownloadTask = ReturnType<typeof File.createDownloadTask>;

export const Paths = {
  document: new Directory('web-docs'),
  availableDiskSpace: 64 * 1024 ** 3,
};
