// The paid unlock: Small is free, one purchase unlocks Medium and Large.
//
// RIGHT NOW THIS IS A TEST STAND-IN. Tapping "Unlock" does not charge
// anyone; it just flips a switch saved on the phone so the whole flow can
// be tried out. Before the app goes to the stores, purchase() and restore()
// must call the real App Store / Google Play purchase (for example through
// RevenueCat). That needs Apple and Google developer accounts and a product
// set up in each store. Everything else in the app only talks to this file,
// so that swap happens here and nowhere else.

import { useSyncExternalStore } from 'react';
import { PackId } from './catalog';
import { File, Paths } from './fs';

export const TEST_MODE = true; // set to false once real store purchases are wired in
export const PRICE_LABEL = '$19.99'; // shown on buttons; the stores supply the real local price
export const PRODUCT_ID = 'all_packs_unlock'; // the product to create in both stores

const FLAG = new File(Paths.document, 'unlocked.json');
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return FLAG.exists && JSON.parse(FLAG.textSync()).unlocked === true;
  } catch {
    return false;
  }
}
let unlocked = read();

function set(value: boolean) {
  unlocked = value;
  FLAG.writeSync(JSON.stringify({ unlocked: value }));
  listeners.forEach((l) => l());
}

/** Small is always free. Medium and Large need the unlock. */
export function needsUnlock(pack: PackId): boolean {
  return pack !== 'small' && !unlocked;
}

/** Start the purchase. Resolves true if the packs are now unlocked. */
export async function purchase(): Promise<boolean> {
  if (!TEST_MODE) throw new Error('Real store purchases are not set up yet.');
  set(true);
  return true;
}

/** "Restore purchases": for people who already paid, on a new phone. */
export async function restore(): Promise<boolean> {
  if (!TEST_MODE) throw new Error('Real store purchases are not set up yet.');
  return unlocked;
}

/** Test helper: lock the packs again. */
export function resetForTesting() {
  if (TEST_MODE) set(false);
}

/** React hook: re-renders the screen when the unlock changes. */
export function useUnlocked(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => unlocked,
    () => unlocked,
  );
}
