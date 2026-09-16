# Site memory

This repository is the live GitHub Pages site for `mehrabi4`: <https://mehrabi4.github.io>.

## Direction

- Keep the site extremely simple, quiet, and minimal.
- It is a single-screen site, not a scrolling portfolio or multi-section landing page.
- The left side contains a native click-to-open list titled **concepts i'm working through** in lowercase, using a machine-like monospace typeface.
- The right side shows the user-supplied black-and-white artwork.
- Do not show a GitHub profile link unless the user asks for it again.
- Avoid frameworks, decorative effects, complex interactions, and unnecessary pages.
- Preserve good mobile behavior and accessibility.

## Ongoing workflow

- The user will add learning material through this conversation over time.
- The writing mediator is a local-only, intentionally gitignored tool at `local-studio/`. Never commit or deploy that directory. `local-studio/open-studio.command` launches it on this computer.
- The local studio autosaves in the browser and exports `.concept-draft.json` handoff files containing the draft, rich-text structure, links, equations, and embedded images.
- When the user supplies an exported studio draft and asks to publish it, interpret and lightly structure it, preserve the user's meaning and voice, extract embedded images into site assets, create or update the topic page, add it to the homepage list, verify, commit, and push.
- Add new material to the **concepts i'm working through** list in `index.html`, creating a separate plain page when an item needs its own content.
- The first learning topic is **tokenizers** at `learning/tokenizers/index.html`.
- Treat requested website updates as intended for the live site: verify them, commit them, and push `main` to `origin` unless the user explicitly asks for a local draft only.
- Update this file when the site's long-term direction changes.
