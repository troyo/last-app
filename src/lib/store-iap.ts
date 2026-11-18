// The real App Store / Google Play connection (expo-iap, which talks to
// Apple's StoreKit and Google Play Billing directly: no extra account, no
// server, nothing about the buyer leaves the phone except what Apple or
// Google already handle). The web preview uses store-iap.web.ts instead.
export * from 'expo-iap';
export const STORE_AVAILABLE = true;
