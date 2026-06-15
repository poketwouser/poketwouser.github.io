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
| `/Blogs/`   | external        | Blog (separate deployment)        |

## Structure

- `_layouts/default.html` — shared shell: `<head>`, nav, footer, dev-terminal, scripts.
- `_data/nav.yml` — primary navigation; looped for both desktop + mobile menus and used to mark the active page.
- `styles.css`, `script.js`, `particles.js` — shared assets, loaded on every page. The JS is null-safe, so each page only activates the widgets it contains.

## Local preview

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000. Without Ruby/Jekyll installed, just push — GitHub Pages builds it automatically.
