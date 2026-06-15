# poketwouser.github.io

Personal portfolio of **Kiran Kumar P** — a Jekyll multi-page site hosted on GitHub Pages.

## Pages

| URL         | Source          | Sections                          |
|-------------|-----------------|-----------------------------------|
| `/`         | `index.html`    | Hero + "Start here" navigation    |
| `/about/`   | `about.html`    | About · Journey · Skills galaxy   |
| `/work/`    | `work.html`     | Research · Projects               |
| `/honors/`  | `honors.html`   | Achievements · Live stats         |
| `/contact/` | `contact.html`  | Contact                           |
| `/blog/`   | `blog.html`     | Writing index (lists `_posts`)    |
| `/blog/:title/` | `_posts/*.md` | Individual blog posts          |

## Structure

- `_layouts/default.html` — shared shell for every page (portfolio and blog): `<head>`, nav, footer, dev-terminal, particle scripts.
- `_layouts/post.html` — blog-post template; chains into `default` so posts share the same chrome as the rest of the site.
- `_data/nav.yml` — primary navigation; looped for both desktop + mobile menus and used to mark the active page.
- `_posts/` — blog posts (Markdown). Permalinked to `/blog/:title/` via `_config.yml` defaults.
- `styles.css` — the single site stylesheet (portfolio + blog content styles share the same design tokens).
- `script.js`, `particles.js` — shared JS, loaded on every page. The JS is null-safe, so each page only activates the widgets it contains.

## Local preview

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000. Without Ruby/Jekyll installed, just push — GitHub Pages builds it automatically.
