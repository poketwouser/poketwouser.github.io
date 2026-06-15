# Writing — Kiran Kumar P

Long-form notes on cricket, AI, quant, and the things I build and help run.

🔴 **Live:** https://poketwouser.github.io/Blogs/

## How it works

A small, dependency-light **Jekyll** site served by GitHub Pages. The dark/cyan theme
mirrors the [portfolio](https://poketwouser.github.io/) so clicking through feels cohesive.

```
.
├── _config.yml          # site config (title, baseurl: /Blogs, permalinks)
├── index.html           # home page — lists posts from _posts/
├── _layouts/
│   ├── default.html     # shell: nav, fonts, footer
│   └── post.html        # single-post layout
├── _posts/
│   └── YYYY-MM-DD-*.md  # posts (front matter + markdown)
├── assets/css/style.css # theme
└── Gemfile              # github-pages gem for local preview
```

## Add a post

Drop a file in `_posts/` named `YYYY-MM-DD-title.md` with front matter:

```markdown
---
layout: post
title: "Your title"
subtitle: "One-line hook"
date: 2026-06-14
tags: [Cricket, IPL]
---

Your content…
```

## Preview locally

```bash
bundle install
bundle exec jekyll serve
# → http://127.0.0.1:4000/Blogs/
```

## Enable GitHub Pages

Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch →
`main` / `(root)`**. Jekyll builds automatically on push.
