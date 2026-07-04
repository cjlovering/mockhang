# Art Placer

Arrange artwork on a photo of your wall, to scale. Calibrate with a wall-height
measurement, add rectangles or upload/crop real artwork, lift existing art off
the wall, touch up the seam with a texture-matched brush, and read exact
dimensions and spacing.

It's a single static page — no server, no build. Everything runs in the browser.

## Run it

Because it loads React over the network (via `support.js`) and reads its own
HTML, open it through a web server rather than `file://`:

```sh
# any static server works
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Deploy (GitHub Pages)

Push to `main`/`master`. The workflow in `.github/workflows/deploy.yml`
publishes the repo root to Pages. In the repo settings, set
**Settings → Pages → Source → GitHub Actions**. The live app is `index.html`.

## Storage

Your session **auto-saves to this browser** (IndexedDB) and restores on reload —
wall photo, calibration, placed art, lift patches, brush touch-ups, and your
artwork library. IndexedDB is used (not `localStorage`) so large photos don't
hit the ~5 MB quota and writes stay off the main thread.

Use **Save config** / **Load config** to export a `.json` backup or move a
project to another device or browser.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The app (deployed page). |
| `support.js` | `dc-runtime` — parses the `<x-dc>` template, loads React, mounts the component. |
| `uploads/wall_image-*.jpg` | Default wall photo shown on first load. |
| `Art Placer.dc.html` | Original artifact export this page was built from. |
