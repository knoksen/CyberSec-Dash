# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Desktop App (Windows)

You can run the dashboard in a native desktop shell (Electron) and package it into a Windows installer.

Run in Electron during development:

```powershell
npm run dev:electron
```

Build and package a Windows installer and a portable exe:

```powershell
npm run dist:win
```

Artifacts will be in `dist-electron-out/`:

- `win-unpacked/Cyber Agents Dashboard.exe` — portable app
- `Cyber Agents Dashboard Setup <version>.exe` — installer

### App icon

1. Add a 256x256 `.ico` at `build/icon.ico`.
2. Rebuild the installer:

```powershell
npm run dist:win
```

### About dialog and preload API

- Help > About shows app and runtime versions.
- Renderer can read app info via `window.api.getAppInfo()` which returns `{ name, version, electron, chrome, node }`.

### Data and logs

- Help > Open Data Folder opens the app’s data directory.
- Help > Open Logs Folder opens `%APPDATA%/<App>/logs`.
- Help > Reset App Data clears settings and logs.
- Help > Start on System Login toggles OS login startup.
- Help > Clear Cache clears the embedded browser cache.

### Tray behavior

- The app adds a system tray icon with Show/Hide and Quit options.
- View > Close to Tray on Close controls whether closing the window hides to tray instead of quitting.

Note: Packaged server sets basic security headers (CSP, X-Frame-Options, etc.). If you add remote assets, you may need to relax the CSP in `electron/server.cjs`.

### Auto-updates (optional)

- Help > Check for Updates… is wired. To enable actual updates:
  - Add a GitHub publish config in `electron-builder.yml` (see commented `publish` section).
  - Create a GitHub release with the generated artifacts.
  - Set `ELECTRON_AUTOUPDATE=true` at runtime to allow background checks.
  - Rebuild and distribute the signed installer.

### Deep linking (optional)

- The app registers a custom protocol `cyberdash://` for deep links.
- In packaged builds, you can test by running `cyberdash://open?tab=alerts` from Win+R or a browser.
- Renderer can poll `window.api.getPendingDeepLink()` on launch to process queued links.

### Code signing (Windows)

To reduce SmartScreen warnings and enable seamless updates, sign your app:

1. Obtain a code-signing certificate (EV or OV).
2. Export to a PFX or host a base64-encoded file in a secure secret.
3. For local builds, set environment variables before packaging:

```powershell
$env:CSC_LINK="file://C:/path/to/cert.pfx"; $env:CSC_KEY_PASSWORD="<password>"; npm run dist:win
```

1. For GitHub Actions, set `CSC_LINK` and `CSC_KEY_PASSWORD` secrets (or use the Windows cert store via `WIN_CSC_LINK`).

### Publishing releases

- A workflow at `.github/workflows/release.yml` builds and publishes on tag push (e.g., `v0.1.0`).
- Set `GH_TOKEN` in repo secrets. On tag push, artifacts are uploaded to a draft GitHub Release.
- In-app: you can use the footer “Check for Updates” button (Electron builds) to trigger a manual check.
- Diagnostics: call `window.api.copyDiagnostics()` to copy version and log location to clipboard.
