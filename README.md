# Mohammed Suhail — Portfolio

Personal portfolio built with **Angular 20**, **PrimeNG 20** and a small custom SCSS design system.
Single-page layout (hero → about → skills → contact) with smooth section navigation, scroll-reveal
animations, light/dark theme and an EmailJS-powered contact form.

## Requirements

- Node.js `^20.19 || ^22.12 || >=24` and npm 10+
- Chrome (only for `npm test`)

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Dev server at <http://localhost:4200/> |
| `npm run build` | Production build → `dist/my-portfolio/browser` |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (Karma + Jasmine) |

## Project structure

```
src/
  index.html                 SEO meta, JSON-LD, font/image preloads, pre-paint theme script
  styles.scss                Global entry — imports the partials below in order
  styles/
    _tokens.scss             Design tokens (colours, type, spacing, radius, shadows, motion)
    _mixins.scss             Breakpoints, hover/motion guards, card/lift/eyebrow helpers
    _base.scss               Reset, typography, focus styles, skip link
    _layout.scss             .container, .section, .grid-2, .grid-auto, .stack, .cluster
    _motion.scss             Reveal, entrance, hover, route + theme transitions, reduced motion
    _primeng.scss            Small PrimeNG adjustments
  app/
    app.config.ts            Router (anchor scrolling, view transitions), PrimeNG theme, Toast
    config/site.config.ts    Name, role, contact details, social links, EmailJS keys, feature flags
    config/app.preset.ts     PrimeNG Aura preset tuned to the design tokens
    data/                    Editable content: about, skills, experience, projects, tech icons
    services/                ThemeService (light/dark), NavigationService (sections, scroll-spy)
    directives/              RevealDirective (IntersectionObserver reveal-on-scroll)
    shared/                  SectionHeading, TechIcon
    pages/                   header, hero, about, experience, skills, projects, contact, footer, home
  assets/
    fonts/                   Inter Variable (latin), self-hosted
    images/                  portrait.jpg is the rendered hero image
  _redirects                 Netlify SPA fallback (copied to the build output)
```

## Editing content

Everything visible on the site is data, not markup:

- **Identity & contact** — `src/app/config/site.config.ts` (`SITE`).
- **About** — `src/app/data/about.data.ts` (intro paragraphs, stats, services).
- **Skills** — `src/app/data/skills.data.ts`. Levels are shown as tiers (Expert ≥ 90, Advanced ≥ 80,
  otherwise Intermediate). Brand icons come from `tech-icons.ts` (Simple Icons, CC0).
- **Experience** — `src/app/data/experience.data.ts`. The timeline section and its navigation link
  appear automatically once the array has entries.
- **Projects** — `src/app/data/projects.data.ts` currently holds clearly-marked **placeholder**
  sample data. Replace it with real projects, then set `SITE.features.projects = true`.

## Theme

`ThemeService` follows the OS colour scheme until the visitor toggles it (persisted in
`localStorage` under `portfolio-theme`). The `.app-dark` class on `<html>` switches both the
design tokens and PrimeNG's dark scheme; `index.html` applies it before first paint to avoid a
flash.

## Deployment (Netlify or any static host)

- Publish directory: `dist/my-portfolio/browser`
- `src/_redirects` provides the `/* /index.html 200` SPA rule (keep it UTF-8).
- Once the site has a public URL, set `SITE.siteUrl` and fill in the commented `canonical`,
  `og:url` and `og:image` tags in `src/index.html` so link previews and canonical URLs work.

## Contact form

The form posts through [EmailJS](https://www.emailjs.com/) using the public keys in
`SITE.emailjs`. Template parameters sent: `from_name`, `from_email`, `subject`, `message`.
