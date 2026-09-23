# Mohammed Suhail — Portfolio

Personal portfolio built with **Angular 20**, **PrimeNG 20** and a small custom SCSS design system.
Single-page layout (hero → about → skills → contact) with smooth section navigation, scroll-reveal
animations, an ambient animated backdrop, a floating light/dark toggle and an EmailJS-powered
contact form. There is no menu bar: the hero's calls to action, the scroll cue and the footer's
Quick Links move between sections. There is exactly one route (the root) — section links scroll
the page in place and never change the URL.

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
    app.routes.ts            One route (the root) that lazy-loads the page; '**' redirects to it
    app.config.ts            Router, HttpClient, PrimeNG theme, Toast
    config/site.config.ts    Name, role, contact details, social links, EmailJS keys, feature flags
    config/app.preset.ts     PrimeNG Aura preset tuned to the design tokens
    models/                  Skill/Project/PortfolioData types shared by the service and components
    data/                    Editable content that isn't Skills/Projects: about, experience, tech icons
    services/                PortfolioDataService (skills/projects), ThemeService (light/dark),
                             NavigationService (in-page scroll — never touches the URL)
    directives/              RevealDirective (IntersectionObserver reveal-on-scroll)
    shared/                  SectionHeading, TechIcon, ThemeToggle (floating light/dark switch),
                             AmbientBackground (animated backdrop behind every page)
    pages/                   hero, about, experience, skills, projects, contact, footer, home
  assets/
    data/portfolio.json      Skills and Projects content (see PortfolioDataService)
    fonts/                   Inter Variable (latin), self-hosted
    images/                  portrait.jpg is the rendered hero image
  _redirects                 Static-host SPA fallback (copied to the build output; see Deployment)
```

## Editing content

Everything visible on the site is data, not markup:

- **Identity & contact** — `src/app/config/site.config.ts` (`SITE`).
- **About** — `src/app/data/about.data.ts` (intro paragraphs, stats, services).
- **Skills & Projects** — `src/assets/data/portfolio.json`, read through `PortfolioDataService`
  (`getSkillCategories()`, `getHeroHighlights()`, `getProjectCategories()`, `getProjects()`).
  Components never read the file directly, so pointing the service at a real API later is a
  one-line change (swap the `http.get` URL) with no component changes.
  - Skill levels (0–100) are shown as tiers (Expert ≥ 90, Advanced ≥ 80, otherwise Intermediate),
    never as a raw percentage. Brand icons come from `tech-icons.ts` (Simple Icons, CC0); a skill
    with no brand mark (e.g. C#, which Simple Icons doesn't publish) sets `fallbackIcon` to a
    PrimeIcons class instead.
  - Projects currently holds clearly-marked **placeholder** sample data. Replace `projects.items`
    with real work, then set `SITE.features.projects = true`.
- **Experience** — `src/app/data/experience.data.ts`. The timeline section and its navigation link
  appear automatically once the array has entries.

## Theme

`ThemeService` follows the OS colour scheme until the visitor toggles it (persisted in
`localStorage` under `portfolio-theme`). The `.app-dark` class on `<html>` switches both the
design tokens and PrimeNG's dark scheme; `index.html` applies it before first paint to avoid a
flash.

The toggle is the floating button in the top-right corner (`shared/theme-toggle`). Switching
animates a circular reveal of the new scheme out from the button (View Transitions API) and falls
back to a colour cross-fade where that is unsupported; both are skipped under
`prefers-reduced-motion`, as is the drifting of the ambient backdrop (`shared/ambient-background`).

## Deployment (Netlify or any static host)

- Publish directory: `dist/my-portfolio/browser`
- `src/_redirects` provides the `/* /index.html 200` SPA rule (keep it UTF-8).
- Once the site has a public URL, set `SITE.siteUrl` and fill in the commented `canonical`,
  `og:url` and `og:image` tags in `src/index.html` so link previews and canonical URLs work.

## Contact form

The form posts through [EmailJS](https://www.emailjs.com/) using the public keys in
`SITE.emailjs`. Template parameters sent: `from_name`, `from_email`, `subject`, `message`.
