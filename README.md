# mehrabi4.github.io

A deliberately minimal personal learning site.

The homepage has two parts: a left-hand **concepts i'm working through** menu and a single featured artwork. Learning entries are added directly to the list in [`index.html`](./index.html), with topic pages stored under `learning/`.

The browser-based writing mediator is available at `/studio/`. It autosaves drafts in the browser and exports structured `.concept-draft.json` files for publishing through Codex.

## Preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
