// Paying for the bigger packs.
//
//   Small   free
//   Medium  one-time purchase (about $15)
//   Large   one-time purchase (about $30), or a $15 upgrade for people who
//           already own Medium, so nobody pays more than $30 in total.
//
// These are three "non-consumable" products in App Store Connect and Google
// Play Console. Their IDs are below and must match the stores exactly. The
// stores set the real price in each country; the labels here are only shown
// while the phone has not heard back from the store yet (for example offline).
//
// What someone owns is saved on the phone the moment they buy, so the packs
// stay unlocked with no signal. When there is a connection the app asks the
// store again, which also catches purchases made on another phone.
//
// Everything else in the app only talks to this file.

import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { PackId } from './catalog';
import { File, Paths } from './fs';
import * as Store from './store-iap';

/** Test mode: nothing is charged and buttons just flip the switch. Only the web preview. */
export const TEST_MODE = !Store.STORE_AVAILABLE;

export const PRODUCTS = {
  medium: 'pack_medium',
  large: 'pack_large',
  upgrade: 'pack_large_upgrade',
} as const;
export type ProductKey = keyof typeof PRODUCTS;

const FALLBACK_PRICE: Record<ProductKey, string> = {
  medium: '$15',
  large: '$30',
  upgrade: '$15',
};

/** What this person can open, from what they bought. */
export type Tier = 'free' | 'medium' | 'large';

const SAVED = new File(Paths.document, 'purchases.json');
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let owned = new Set<string>(readSaved());
let prices: Partial<Record<ProductKey, string>> = {};

function readSaved(): string[] {
  try {
    if (!SAVED.exists) return [];
    const v = JSON.parse(SAVED.textSync());
    return Array.isArray(v.owned) ? v.owned.filter((x: unknown) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function save() {
  try {
    SAVED.writeSync(JSON.stringify({ owned: [...owned] }));
  } catch {
    // Disk full or similar: it still counts for this session, and restore brings it back.
  }
}
function addOwned(ids: string[]) {
  const before = owned.size;
  ids.forEach((id) => owned.add(id));
  if (owned.size !== before) {
    save();
    tier = computeTier();
    emit();
  }
}

function computeTier(): Tier {
  const has = (k: ProductKey) => owned.has(PRODUCTS[k]);
  if (has('large') || (has('medium') && has('upgrade'))) return 'large';
  if (has('medium')) return 'medium';
  return 'free';
}
let tier: Tier = computeTier();

/** Does this pack still need to be bought? */
export function needsUnlock(pack: PackId): boolean {
  if (pack === 'small') return false;
  if (pack === 'medium') return tier === 'free';
  return tier !== 'large';
}

/** Which product unlocks this pack for this person right now (null if nothing to buy). */
export function productFor(pack: PackId): ProductKey | null {
  if (!needsUnlock(pack)) return null;
  if (pack === 'medium') return 'medium';
  return tier === 'medium' ? 'upgrade' : 'large';
}

/** The store's local price, like "$14.99" or "14,99 €". */
export function priceOf(key: ProductKey): string {
  return prices[key] ?? FALLBACK_PRICE[key];
}

// ---------------------------------------------------------------------------
// Talking to the store

let ready: Promise<boolean> | null = null;
let waiting: { key: ProductKey; done: (r: BuyResult) => void } | null = null;

/**
 * Connect to the store once, early (the app calls this at launch). Apple and
 * Google replay any purchase that wasn't finished last time, for example if
 * the app was closed mid-purchase, so the listener has to be in place early.
 */
export function initPurchases(): Promise<boolean> {
  if (TEST_MODE) return Promise.resolve(false);
  if (ready) return ready;
  ready = (async () => {
    try {
      await Store.initConnection();
    } catch {
      ready = null; // offline or store unavailable: try again next time
      return false;
    }
    Store.purchaseUpdatedListener(async (p) => {
      if (p.purchaseState === 'purchased') {
        addOwned([p.productId]);
        try {
          await Store.finishTransaction({ purchase: p, isConsumable: false });
        } catch {}
        if (waiting && PRODUCTS[waiting.key] === p.productId) {
          waiting.done('bought');
          waiting = null;
        }
      } else if (p.purchaseState === 'pending' && waiting) {
        // "Ask to Buy" or a slow payment method: it unlocks by itself once approved.
        waiting.done('pending');
        waiting = null;
      }
    });
    Store.purchaseErrorListener((e) => {
      if (!waiting) return;
      waiting.done(e.code === Store.ErrorCode.UserCancelled ? 'cancelled' : 'failed');
      waiting = null;
    });
    loadPrices();
    syncOwned();
    return true;
  })();
  return ready;
}

async function loadPrices() {
  try {
    const list = await Store.fetchProducts({ skus: Object.values(PRODUCTS), type: 'in-app' });
    const next: typeof prices = {};
    for (const p of list ?? []) {
      const key = (Object.keys(PRODUCTS) as ProductKey[]).find((k) => PRODUCTS[k] === p.id);
      if (key && p.displayPrice) next[key] = p.displayPrice;
    }
    prices = next;
    emit();
  } catch {}
}

/** Ask the store what this account already owns. Never takes anything away offline. */
async function syncOwned(): Promise<boolean> {
  try {
    const list = await Store.getAvailablePurchases();
    addOwned((list ?? []).map((p) => p.productId));
    return true;
  } catch {
    return false;
  }
}

export type BuyResult = 'bought' | 'pending' | 'cancelled' | 'failed' | 'offline';

/** Show the App Store / Google Play payment sheet for one product. */
export async function buy(key: ProductKey): Promise<BuyResult> {
  if (TEST_MODE) {
    addOwned([PRODUCTS[key]]);
    return 'bought';
  }
  if (!(await initPurchases())) return 'offline';
  if (waiting) waiting.done('cancelled');
  const result = new Promise<BuyResult>((done) => (waiting = { key, done }));
  try {
    const sku = PRODUCTS[key];
    await Store.requestPurchase({
      type: 'in-app',
      request: Platform.OS === 'ios' ? { apple: { sku } } : { google: { skus: [sku] } },
    });
  } catch (e: any) {
    if (waiting) {
      waiting.done(e?.code === Store.ErrorCode.UserCancelled ? 'cancelled' : 'failed');
      waiting = null;
    }
  }
  return result;
}

/** "Restore purchases": bring back what this Apple / Google account already bought. */
export async function restore(): Promise<'restored' | 'nothing' | 'offline'> {
  if (TEST_MODE) return tier === 'free' ? 'nothing' : 'restored';
  if (!(await initPurchases())) return 'offline';
  try {
    await Store.restorePurchases();
  } catch {}
  if (!(await syncOwned())) return 'offline';
  return tier === 'free' ? 'nothing' : 'restored';
}

/** Web preview helper: lock the packs again. */
export function resetForTesting() {
  if (!TEST_MODE) return;
  owned = new Set();
  save();
  tier = computeTier();
  emit();
}

/** React hook: re-renders when what's owned (or the prices) change. */
export function useTier(): Tier {
  useSyncExternalStore(
    subscribe,
    () => prices,
    () => prices,
  );
  return useSyncExternalStore(
    subscribe,
    () => tier,
    () => tier,
  );
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
