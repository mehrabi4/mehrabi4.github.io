# mehrabi4.github.io

A minimal personal site for projects and learning notes. It uses plain HTML, CSS, and JavaScript, so GitHub Pages can publish it directly without a build step.

## Preview locally

From this directory, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages

1. Create a public repository named `mehrabi4.github.io` on the `mehrabi4` GitHub account.
2. Push these files to the repository's `main` branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.

The site will be available at <https://mehrabi4.github.io>.

## Add learning content

Learning content lives in [`learning/index.html`](./learning/index.html). Replace the `.empty-note` block with article links or note cards as content is added.
