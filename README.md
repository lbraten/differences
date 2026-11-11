# differences

A client-only text comparison workspace, built with Vite, Lucide, and jsdiff. No backend, remote fonts, analytics, telemetry, browser storage, or text uploads.

## Run

```sh
npm install
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

Deploy `dist/` to a static host. All assets and the comparison worker are served locally. The development server's WebSocket is only for Vite hot reload; production has no application network requests.

## GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy.yml` tests, builds, and publishes the site on every push to `main`. It can also be started manually from the Actions tab.

1. In the GitHub repository, open **Settings > Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Push the workflow to `main`, or run **Deploy to GitHub Pages** from the Actions tab.
4. Open the published URL shown by the deployment or in **Settings > Pages**.

The build uses the base path supplied by GitHub Pages, so assets work at the repository URL and with a configured custom domain. No backend server or secrets are required.

## Behavior

- Live comparison is debounced by 450 ms. Compare or Ctrl/Cmd+Enter runs immediately.
- Line and character comparisons and unified patch generation run in a cancellable Web Worker. Stale results are ignored.
- Results render in batches of 120 aligned rows. Changes only filters out unchanged lines.
- Adjacent removed and added lines are paired by position and classified as modified. Character replacements count as `changed`; surplus inserted or deleted characters count as `added` or `removed`. Whole-line additions/deletions contribute all their characters. Newline separators are represented in line counts, not character counts. Editor counts include newline characters.
- CRLF and CR line endings are normalized to LF for comparison. A final newline is a separate empty line. Unicode character counts use code points.
- For unusually complex diffs, jsdiff has time budgets: the fallback treats the unresolved region as a replacement, preserving all text. Inline comparison also has a per-line time budget.
- Import accepts local UTF-8 `.txt` files up to 5 MB. Text is read with the browser File API, never uploaded or persisted. Reloading resets the workspace to the sample.
- Copy exports a standard unified patch to the system clipboard only when explicitly requested. Clipboard permission requires HTTPS or localhost.
- Theme changes remain in memory. All controls are keyboard accessible; icon buttons have accessible names and hover/focus tooltips.

Fonts: Geist and Geist Mono by Vercel, distributed under the SIL Open Font License (see `public/fonts/OFL.txt`).
