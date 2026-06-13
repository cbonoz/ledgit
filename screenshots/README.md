# Screenshots

| File | Description |
|------|-------------|
| `logo.svg` | LEDGIT logo (512x512, indigo "L" on gradient background) |
| `cover.html` | Widescreen cover image for project presentations |
| `01-homepage.svg` | LEDGIT dashboard home page with persona tabs and comparison table |
| `02-agent-tab.svg` | "I'm an Agent" persona tab with setup instructions |
| `03-actions-list.svg` | CLI: `ledgit actions list` showing available action types |
| `04-propose-cli.svg` | CLI: `ledgit propose` with Ledger approval and HCS recording |
| `05-verify-cli.svg` | CLI: `ledgit verify` showing ordered audit trail with signatures |
| `06-dashboard.svg` | Web dashboard: agent audit trail with calendar and action cards |

To capture actual browser screenshots:

```bash
# Open a page and capture the browser window
open http://localhost:3456
screencapture -W screenshots/01-homepage.png  # click the window

# Or use a browser's built-in screenshot tool (F12 → Capture screenshot)
```

All SVGs are vector graphics — open in any browser or convert to PNG using:
- **macOS:** Preview.app → File → Export → PNG
- **CLI:** `qlmanage -t -s 1200 -o . screenshot.svg` (macOS)
- **Web:** drag into browser, right-click → Save as PNG
