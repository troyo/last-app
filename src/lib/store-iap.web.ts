// Web preview only: there is no App Store in a browser, so purchases run in
// test mode there (see purchases.ts). These stubs keep the same shape.
export const STORE_AVAILABLE = false;
const no = async (): Promise<never> => {
  throw new Error('No store in the web preview.');
};
export const initConnection = no;
export const fetchProducts = no;
export const requestPurchase = no;
export const finishTransaction = no;
export const getAvailablePurchases = no;
export const restorePurchases = no;
export const purchaseUpdatedListener = () => ({ remove() {} });
export const purchaseErrorListener = () => ({ remove() {} });
export const ErrorCode = { UserCancelled: 'user-cancelled' } as const;
