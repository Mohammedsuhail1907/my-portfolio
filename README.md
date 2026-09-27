# Mohammed Suhail — Portfolio

Personal portfolio built with **Angular 20**, **PrimeNG 20** and a small custom SCSS design system.
Single-page layout (hero → about → skills → contact) with smooth section navigation, scroll-reveal
animations, an ambient animated backdrop, a floating light/dark toggle and an EmailJS-powered
contact form. There is no menu bar: the hero's calls to action, the scroll cue and the footer's
Quick Links move between sections. There is exactly one route (the root) — section links scroll
the page in place and never change the URL. Every route is pre-rendered to static HTML at build
time and hydrated in the browser, so crawlers and link scrapers get the full page without running
JavaScript (see [SEO](#seo-pre-rendering-meta-tags-sitemap)).

## Requirements

- Node.js `^20.19 || ^22.12 || >=24` and npm 10+
- Chrome (only for `npm test`)

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Dev server at <http://localhost:4200/> |
| `npm run build` | Production build → `dist/my-portfolio/browser`: pre-renders every route, then writes `sitemap.xml` + `robots.txt` and verifies the HTML (see [SEO](#seo-pre-rendering-meta-tags-sitemap)) |
| `npm run preview` | Serves the build output at <http://localhost:4173/> exactly as the static host will (no server-side JavaScript) |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (Karma + Jasmine) |

## Project structure

```
src/
  index.html                 Static head (viewport, icon, font/image preloads, pre-paint theme
                             script); every page's SEO tags are written by app/seo
  main.server.ts             Build-time prerender entry (never runs in production)
  styles.scss                Global entry — imports the partials below in order
  styles/
    _tokens.scss             Design tokens (colours, glass surfaces, gradients, type, spacing,
                             radius, shadows/glows, motion) — separate light and dark sets
    _mixins.scss             Breakpoints, hover/motion guards, glass-surface, hover-lift,
                             gradient-border-hover, eyebrow, icon-tile
    _base.scss               Reset, typography, focus styles, skip link, .icon-tile, .gradient-text
    _layout.scss             .container, .section, .grid-2, .grid-auto, .stack, .cluster
    _motion.scss             Reveal, entrance, float, pulse-ring, hover, theme reveal/cross-fade,
                             reduced motion
    _primeng.scss            PrimeNG in the design language: glass cards/chips/dialog/toast,
                             button feedback, form fields, scroll-to-top
  app/
    app.routes.ts            One route (the root) that lazy-loads the page; '**' redirects to it.
                             Each route carries its SEO contract (`title` + `data.seo`)
    app.config.ts            Router, hydration, HttpClient (fetch), SEO title strategy, PrimeNG theme
    app.config.server.ts     Prerender-only providers: server rendering, site URL from the environment
    app.routes.server.ts     Render mode per route (everything is pre-rendered)
    config/site.config.ts    Name, role, contact details, social links, EmailJS keys, feature flags,
                             site URL and SEO defaults
    seo/                     SeoService (title / description / canonical / Open Graph / Twitter /
                             JSON-LD), SeoTitleStrategy (applies a route's contract on navigation),
                             SITE_URL token + build-time resolver, structured-data.ts
    config/app.preset.ts     PrimeNG Aura preset tuned to the design tokens
    models/                  Skill/Project/PortfolioData types shared by the service and components
    data/                    Editable content that isn't Skills/Projects: about, experience, tech icons
    services/                PortfolioDataService (skills/projects), ThemeService (light/dark),
                             NavigationService (in-page scroll — never touches the URL)
    directives/              HomeZoomDirective (scroll-driven, pointer-anchored zoom out of Home),
                             RevealDirective (IntersectionObserver reveal-on-scroll),
                             CountUpDirective (stat tiles count up when they scroll into view)
    shared/                  SectionHeading (self-revealing), TechIcon, EmptyState, ThemeToggle
                             (floating light/dark switch), AmbientBackground (animated backdrop),
                             load-state.ts (loading / ready / error wrapper for async content)
    pages/                   hero, about, experience, skills, projects, contact, footer, home
  assets/
    data/portfolio.json      Skills and Projects content (see PortfolioDataService)
    fonts/                   Inter Variable (latin), self-hosted
    images/                  portrait.jpg is the rendered hero image
  _redirects                 Static-host SPA fallback (copied to the build output; see Deployment)
scripts/                     Post-build SEO steps: generate-seo-files.mjs (sitemap + robots),
                             verify-prerender.mjs (fails the build on broken output),
                             serve-static.mjs (local preview mirroring the host's routing)
vercel.json                  Vercel project config: output directory, SPA fallback, /home → / redirect
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
- **SEO** — the page title lives on the route (`app.routes.ts`), the description, share image
  and structured data in the route's `data.seo` (`HOME_SEO`) and `SITE.seo`; see below.

## Design language

Every section is built from the same shared pieces, so new UI should reuse them rather than
restyle locally:

- **Canvas** — the page scrolls without a visible scrollbar (`html { scrollbar-width: none }` in
  `_base.scss`); the scroll cue, footer links and the scroll-to-top button are the way-finding.
  `.app` clips sideways overflow so the offset reveals never let the page pan horizontally.
- **Glass surfaces** — `p-card`, chips, form fields, dialog and toast are translucent, blurred
  over the ambient backdrop (`glass-surface` mixin / `--surface-card`). Cards marked `hover-lift`
  lift, glow and light up a gradient hairline over their border.
- **Gradient accents** — `--gradient-brand` drives eyebrow rules, `.gradient-text`, icon-tile
  hover fills, section hairlines and the contact form's top edge.
- **Motion** — leaving the Home page is a scroll-driven zoom (`appHomeZoom` on the hero
  section): scroll position maps to a 0–1 progress over `--home-zoom-distance` of the hero's
  height, the hero zooms towards the mouse pointer up to `--home-zoom-max` (accelerating) and
  fades out over the last part while the next section slides in beneath it; scrolling back
  scrubs it in reverse. Touch devices zoom from the viewport centre. Leaving Home via a link is
  cinematic too: `NavigationService` holds the destination zoomed out and hidden while the page
  scrolls, then zooms it into the viewport once the scroll settles (`page-enter-pending` /
  `page-enter`). Every other section scrolls normally. Inside a section,
  elements reveal on scroll (`appReveal`, staggered with `revealStagger`) in hierarchy order via
  `revealDelay` — heading first, body groups next, their items after (the delay is the inherited
  `--reveal-delay`). The page lands with a fade while the hero enters once (`.enter`), decorative
  pieces drift (`.float`), the scroll cue and current-role marker pulse, and async content shows
  skeletons (`p-skeleton`) or an `<app-empty-state>`. Real route changes (there is only one route
  today) animate only from or to the Home route — it recedes or zooms back in via the Router's
  view transitions; other route changes skip the transition. Everything is disabled or instant
  under `prefers-reduced-motion`.

## Theme

`ThemeService` follows the OS colour scheme until the visitor toggles it (persisted in
`localStorage` under `portfolio-theme`). The `.app-dark` class on `<html>` switches both the
design tokens and PrimeNG's dark scheme; `index.html` applies it before first paint to avoid a
flash.

The toggle is the floating button in the top-right corner (`shared/theme-toggle`). Switching
animates a circular reveal of the new scheme out from the button (View Transitions API) and falls
back to a colour cross-fade where that is unsupported; both are skipped under
`prefers-reduced-motion`, as is the drifting of the ambient backdrop (`shared/ambient-background`).

## SEO (pre-rendering, meta tags, sitemap)

There is no server. `ng build` (angular.json `outputMode: "static"`, `server: src/main.server.ts`)
boots the app once per route in a Node worker at build time, waits for its data (`portfolio.json`
is fetched through the same `HttpClient`, served from the output directory), and writes the
rendered DOM to `dist/my-portfolio/browser/<route>/index.html`. In the browser
`provideClientHydration` reuses that DOM instead of re-creating it, and the HTTP transfer cache
ships the JSON response inside the HTML, so the first client render is identical to the file.
Which routes are rendered is declared in `app.routes.server.ts` (a parameterised route lists its
values through `getPrerenderParams`).

**Per-page head tags.** A route declares `title` and `data: { seo: PageSeo }`
(`src/app/seo/seo.model.ts`: description, canonical path, share image, Open Graph type, Twitter
card, robots, JSON-LD). `SeoTitleStrategy` runs after every completed navigation — the prerender's
included — and hands them to `SeoService`, which writes `<title>`, description, robots, the
canonical link, `og:*`, `twitter:*` and one `<script type="application/ld+json">` per object,
updating tags in place so nothing is ever duplicated. Routes without `seo` data get the defaults
from `SITE.seo`. The Home page's structured data (`WebSite` → `ProfilePage` → `Person`) is built
in `structured-data.ts` from `SITE`.

**Site URL.** Absolute URLs (canonical, `og:url`, `og:image`, JSON-LD `@id`s, the sitemap) come
from the `SITE_URL` token: at build time the `SITE_URL` env var, else `SITE.siteUrl`, else
Vercel's `VERCEL_PROJECT_PRODUCTION_URL` (`site-url.server.ts`). With none of them set the
absolute tags are simply omitted and the build warns; on CI / Vercel that is an error.

**sitemap.xml / robots.txt.** `scripts/generate-seo-files.mjs` runs after the build and derives
both from the rendered pages: one `<url>` per pre-rendered `index.html` with a canonical link
(pages marked `noindex` are skipped), `lastmod` = last commit date, and a `Sitemap:` line in
`robots.txt`. Nothing to maintain by hand — a new route shows up once it is pre-rendered.

**Verifying the output.** `scripts/verify-prerender.mjs` runs last and fails the build if any
page is not actually rendered (empty `<app-root>`), lacks a single `<h1>`, title, description,
Open Graph / Twitter tags, has invalid JSON-LD or duplicated tags — and, in strict mode
(`--strict`, `CI` or `VERCEL` set), if the canonical / `og:url` / `og:image` are missing.
To see exactly what a crawler gets, `npm run preview` and fetch a page without JavaScript:

```sh
SITE_URL=https://example.com npm run build      # bash; PowerShell: $env:SITE_URL='https://example.com'; npm run build
npm run preview
curl -s http://localhost:4173/ | grep -o '<h1[^>]*>[^<]*</h1>\|<link rel="canonical"[^>]*>\|<meta property="og:[^>]*>'
```

After deploying, confirm with Google's Rich Results Test (JSON-LD), the Facebook Sharing
Debugger, X's Card Validator and LinkedIn's Post Inspector (Open Graph), and submit
`/sitemap.xml` in Google Search Console.

**Writing prerender-safe code.** Constructors, `ngOnInit` and `ngAfterViewInit` also run in
Node during the build, where `window`, `location`, `matchMedia`, `IntersectionObserver` and
`localStorage` do not exist: guard them (`typeof x !== 'undefined'`, `isPlatformBrowser`) or move
the work into `afterNextRender`, which runs in the browser only. The first browser render must
match the pre-rendered HTML — state that depends on the viewport (see `ExperienceComponent`) is
applied after hydration, not in the constructor. Directives that create browser listeners must
not remove them unconditionally in `ngOnDestroy` (the prerender destroys the app after
rendering). A component whose DOM can never match can opt out with `ngSkipHydration`. Use the
`pButton` directive on a native `<button>` rather than `<p-button>`: the component writes
`autofocus="true"` into the DOM, which the browser honours in static HTML and scrolls the page to
it on load (the verifier fails the build if any `autofocus` reaches the output).

## Deployment (Vercel)

`vercel.json` configures the project: build command `npm run build`, output directory
`dist/my-portfolio/browser`, `cleanUrls` and no trailing slash (one URL per page, `/index.html`
redirects to `/`), a permanent redirect from the old `/home` path to `/`, and a rewrite of
unknown paths to `index.html` (the app's `'**'` route then redirects to the root). Nothing runs on
a server: the pre-rendered HTML and the assets are served from Vercel's CDN. The site URL baked
into the head and the sitemap is Vercel's production domain (see SEO); set `SITE.siteUrl` or the
`SITE_URL` env var in the project settings to override it, e.g. for a custom domain that Vercel
does not report as the shortest one.

Other static hosts: publish `dist/my-portfolio/browser`, set `SITE.siteUrl` (or `SITE_URL` in
the host's build environment), and keep an SPA fallback — `src/_redirects` provides the Netlify
`/* /index.html 200` rule (keep it UTF-8).

## Contact form

The form posts through [EmailJS](https://www.emailjs.com/) using the public keys in
`SITE.emailjs`. Template parameters sent: `from_name`, `from_email`, `subject`, `message`.
