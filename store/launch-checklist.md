# Launch checklist: getting Last App into the App Store

Everything needed to go from "works on my phone" to "live in the App Store".
Steps marked **Troy** need your Apple login or your decision. Everything else is done in the code.

## 1. Apple Developer membership (Troy, ~10 minutes + up to 48 hours wait)

1. Go to https://developer.apple.com/programs/enroll and sign in with **troy@zagged.com**.
2. Enroll as an **Organization** (8MB LLC). You'll need the company's D-U-N-S number (free, lookup link is on that page). Enrolling as an Individual is faster but shows your personal name as the seller.
3. Pay the $99/year fee. Apple usually approves within 1 to 2 days.
4. After approval: https://appstoreconnect.apple.com → **Business** → sign the **Paid Apps** agreement and add bank and tax info. Paid packs won't work, even in testing, until this is done.

## 2. Turn on the website (Troy, 1 minute, after the launch PR is merged)

GitHub → troyo/last-app → **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main**, folder **/docs** → Save.

In a minute or two these will be live (Apple needs the first two):
- Privacy policy: https://troyo.github.io/last-app/privacy.html
- Support: https://troyo.github.io/last-app/support.html
- Marketing page: https://troyo.github.io/last-app/

## 3. Create the app in App Store Connect (Troy, ~5 minutes)

App Store Connect → **Apps → + → New App**
- Platform: iOS
- Name: `Last App - Survival Guide`
- Primary language: English (U.S.)
- Bundle ID: `com.troyo.lastapp` (register it first at developer.apple.com → Identifiers if it isn't in the list)
- SKU: `lastapp`
- User access: Full access

## 4. The three in-app purchases (Troy, ~10 minutes)

App → **Monetization → In-App Purchases → +**. Type for all three: **Non-Consumable**. The Product IDs must be typed exactly as below.

| Reference name | Product ID | Price | Display name | Description |
|---|---|---|---|---|
| Medium pack | `pack_medium` | $14.99 (or $15.00) | Medium pack | Adds injuries, food storage, power and disaster prep guides. |
| Large pack | `pack_large` | $29.99 (or $30.00) | Large pack | The full library: everything in Medium plus wilderness medicine, growing food, radio and more. |
| Large upgrade | `pack_large_upgrade` | $14.99 (or $15.00) | Upgrade to Large | For Medium owners: unlocks the full Large pack. |

For each one also add a review screenshot (any screenshot of the My packs screen works) and the review note: "Unlocks a downloadable offline guide pack. Found under More → My packs."

The app only offers "Upgrade to Large" to people who already own Medium, and treats Medium + upgrade the same as Large.

On the first app submission, tick all three purchases under **In-App Purchases** on the version page so Apple reviews them together.

## 5. App Privacy (Troy, 2 minutes)

App → **App Privacy** → Privacy Policy URL: `https://troyo.github.io/last-app/privacy.html` → Data collection: **No, we do not collect data from this app**. That's accurate: location, household and everything else stays on the phone, and purchases are handled by Apple.

## 6. Version page fields

Copy from `store/listing.md`:
- Promotional text, Description, Keywords, Subtitle, What's New
- Support URL: `https://troyo.github.io/last-app/support.html`
- Marketing URL: `https://troyo.github.io/last-app/`
- Screenshots: `store/screenshots/` (6.9" and 6.5"). iPad screenshots are not needed: v1 is iPhone only.
- Category: Reference (primary), Lifestyle (secondary)
- Copyright: `2026 8MB LLC`
- Age rating questionnaire: answer **Infrequent** (or Mild) for "Medical or Treatment Information" and none for everything else. Apple picks the rating from your answers. (The medical cards describe injuries in plain words.)
- App Review contact: your name, phone and email
- Sign-in required: **No**
- Review notes: "Last App is an offline survival guide. No account is needed. Emergency cards, disaster guides and checklists are built in. Optional guide packs download from More → My packs; Small is free, Medium and Large are in-app purchases. Maps need the phone's location only to show where you are."

## 7. Build and upload (done from Troy's Mac, with Claude driving it)

Either way works; Xcode is simplest since it's already set up on the Mac:
- **Xcode:** `npx expo prebuild --clean` → open `ios/LastApp.xcworkspace` → set the version to 1.0 and build to 1 → Product → **Archive** → Distribute App → App Store Connect → Upload.
- **EAS (Expo's cloud builder):** `npx eas-cli build -p ios --profile production` then `npx eas-cli submit -p ios`. Needs a free expo.dev account.

After upload the build shows up under **TestFlight** in 10 to 30 minutes. Install it via the TestFlight app and do a test purchase with a Sandbox account (App Store Connect → Users and Access → Sandbox → +). Sandbox purchases are free.

## 8. Submit (only with Troy's OK)

Version page → pick the build → tick the three in-app purchases → **Add for Review → Submit**. Apple usually answers in 1 to 3 days.

## Before you submit: open items

- [ ] Medical and safety fixes from the card review (being applied in the app)
- [ ] Have a medical professional read the emergency cards and Show me pictures
- [ ] Lawyer read of the terms screen (src/app/legal.tsx and agree.tsx)
- [ ] Test a real sandbox purchase, an upgrade and Restore on the iPhone
