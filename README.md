# erensoylu.com

Personal site, built on [Jekyll](https://jekyllrb.com/) with the [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) theme (installed as a gem, not forked — all customization lives in `_sass/`, `_tabs/`, `_data/`, `assets/`, and `_config.yml`).

## Prerequisites

- Ruby 3.x and Bundler

## Local development

```bash
bundle install
bundle exec jekyll serve
```

Site is served at `http://localhost:4000`. Add `--livereload` to auto-refresh on changes.

## Deployment

Pushes to `main` trigger a GitHub Actions build (`.github/workflows/pages-deploy.yml`) that deploys to GitHub Pages.
