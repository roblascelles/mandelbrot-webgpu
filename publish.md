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
