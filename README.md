# mockhang

**Live: https://cjlovering.github.io/mockhang/**

Arrange artwork on a photo of your wall, to scale. Calibrate with a wall-height
measurement, place rectangles or real artwork, and read exact dimensions and
spacing. Single static page — no build, no server. Sessions auto-save to the
browser; use **Save config** / **Load config** to move between devices.

## Dev

```sh
just dev     # hot-reloading dev server → http://localhost:5174
just logs    # recent dev-server output
just stop    # stop the dev server
just check   # syntax-check the app scripts
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
