# KhaoJai on Play Store & App Store (Capacitor)

KhaoJai is a web app (PWA). To put it in the stores we wrap the same files with **Capacitor** — no rewrite.
Order: **Play Store first**, then App Store. Nothing here costs money until you open the store accounts.

## What is already prepared
- `capacitor.config.json` — app id `app.khaojai.learn` (change before the first upload if you want another id; it can't change later), name, colours.
- The app works offline (service worker) and has icons 192/512 + apple-touch-icon.

## Steps (on the Mac)
1. Install Node.js LTS (nodejs.org) and Android Studio. For iPhone later: Xcode from the App Store.
2. In the KhaoJai folder:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
   mkdir -p www && cp -R index.html manifest.webmanifest sw.js src icons audio www/ 2>/dev/null
   npx cap add android
   npx cap sync
   npx cap open android
   ```
3. Android Studio → Build → Generate Signed Bundle (.aab). **Keep the keystore file and its password safe** — you need it for every update.
4. Play Console (one-time US$25, under sataporn.yodp@gmail.com): create app → upload the .aab → fill in store listing, privacy policy link (`#privacy` page of the site), content rating, data safety (email, learning progress).
5. iPhone (later): `npx cap add ios`, open in Xcode, Apple Developer Program (US$99/year).

## Sign-in inside the app
Email + password and email codes work unchanged. Google/Apple sign-in in a native app needs extra redirect setup — do it when those buttons are switched on.

## Before submitting
- Real mascot artwork and app icon (replace emoji placeholders).
- Thai reviewer has checked Phases 3–8 content.
- Run `docs/sql/delete_account.sql` (stores require in-app account deletion).
