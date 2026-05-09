# WebGPU Mandelbrot Viewer

An interactive, GPU-accelerated Mandelbrot set viewer built with WebGPU. 

## Requirements

- A browser with WebGPU support:
  - Chrome/Edge 113+
  - Safari 18+ (macOS Sonoma or later)
  - Firefox Nightly (with WebGPU enabled)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

## Controls

| Action | Control |
|--------|---------|
| Pan | Click and drag |
| Zoom In | Scroll up |
| Zoom Out | Scroll down |

The zoom always centers on your cursor position, making it easy to explore specific regions.

## Deploying to GitHub Pages

1. Update the `base` path in [vite.config.js](vite.config.js) to match your repo name:
   ```js
   base: '/your-repo-name/'
   ```

2. Build the project:
   ```bash
   npm run deploy
   ```

3. In your GitHub repo settings:
   - Go to **Settings** → **Pages**
   - Set source to **GitHub Actions** (or deploy the `dist` folder to a `gh-pages` branch)

4. Push the `dist` folder to the `gh-pages` branch:
   ```bash
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

Your site will be available at `https://username.github.io/repo-name/`

## License

MIT
