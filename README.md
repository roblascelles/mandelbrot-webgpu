# WebGPU Mandelbrot Viewer

An interactive, GPU-accelerated Mandelbrot set viewer built with WebGPU. 

View at https://roblascelles.github.io/mandelbrot-webgpu/


## Controls

| Action | Control |
|--------|---------|
| Pan | Click and drag |
| Zoom In | Scroll up |
| Zoom Out | Scroll down |

The zoom always centers on your cursor position.

## Requirements

- A browser with WebGPU support:
  - Chrome/Edge 113+
  - Safari 18+ (macOS Sonoma or later)
  - Firefox Nightly (with WebGPU enabled)

## Run locally;

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5173`)


## Deploying to GitHub Pages

1. Build the project:
   ```bash
   npm run deploy
   ```

2. Push the `dist` folder to the `gh-pages` branch:
   ```bash
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

## License

MIT
