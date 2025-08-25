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

Artifacts will be in `dist-electron/`:

- `win-unpacked/electron.exe` — portable app
- `Cyber Agents Dashboard Setup <version>.exe` — installer

### App icon

1. Add a 256x256 `.ico` at `build/icon.ico`.
2. Rebuild the installer:

```powershell
npm run dist:win
```
