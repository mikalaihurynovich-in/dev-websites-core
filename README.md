# `@tetherto/dev-websites-core`

Shared CMS, SEO, i18n, utils, UI, and analytics primitives for WDK / QVAC / PEAR / MDK websites.

| Import | Contents |
| --- | --- |
| `@tetherto/dev-websites-core/cms` | Payload `buildCmsConfig`, stock collections, access, Lexical, media I/O |
| `@tetherto/dev-websites-core/seo` | `createMetadataFactory`, `getSiteUrl`, `getOgBackgroundDataUrl` |
| `@tetherto/dev-websites-core/i18n` | `Languages` / `LanguageLabel` |
| `@tetherto/dev-websites-core/utils` | `createLogger`, `toPlainValue`, `stripShikiPreBackground` |
| `@tetherto/dev-websites-core/analytics` | `GtmLoader`, `createTrackedLink` (optional `@next/third-parties` peer) |
| `@tetherto/dev-websites-core/ui` | UI primitives (`Button`, `Dialog`, `Pagination`, `Tooltip`, …) + `cn` |
| `@tetherto/dev-websites-core/ui/a11y` | `focusRingClassName`, `VisuallyHidden` |
| `@tetherto/dev-websites-core/ui/carousel` | `Carousel` (+ optional `embla-carousel-react` peer) |
| `@tetherto/dev-websites-core/ui/theme.css` | One-shot: tokens + Tailwind v4 `@theme` preset |
| `@tetherto/dev-websites-core/ui/theme/tokens.css` | CSS variables (HSL channels) |
| `@tetherto/dev-websites-core/ui/theme/preset.css` | Tailwind v4 `@theme` map |
| `@tetherto/dev-websites-core/ui/theme/preset` | JS Tailwind preset for `tailwind.config.ts` |

### Install

```bash
npm install @tetherto/dev-websites-core
```

Local development — consume via `"@tetherto/dev-websites-core": "file:../wdk-core"`.

Sites use `install-links=true` in `.npmrc` so npm **copies** the package into
`node_modules` (Turbopack cannot follow a symlink outside the app root).

Built with [`tsdown`](https://tsdown.dev) (ESM only, per-domain entry points,
`.d.ts` + sourcemaps). `npm run prepare` / `npm publish` rebuilds `dist` via
`tsdown`. `npm run dev` runs `tsdown --watch`.

Released under the [Apache License 2.0](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
npm install
npm run build
# or: npm run dev
```

After changing this package locally, re-link it in each site — the `prepare` hook
rebuilds `dist` automatically on install, so an explicit `npm run build` is
usually unnecessary:

```bash
rm -rf node_modules/@tetherto/dev-websites-core && npm install @tetherto/dev-websites-core@file:../wdk-core
```

Do **not** import `@tetherto/dev-websites-core/cms` from Client Components — it includes Node-only
modules (`fs`, Payload, S3). Prefer domain subpaths over the root barrel.

### Analytics

```ts
import { GtmLoader, createTrackedLink } from '@tetherto/dev-websites-core/analytics'
import { Link } from '@/i18n/navigation'
import { analytics } from '@/lib/analytics'

// Delay GTM until window.load (optional `@next/third-parties` peer)
<GtmLoader gtmId={gtmId} />

// App owns Link + event catalog; core owns click wiring
export const TrackedLink = createTrackedLink(Link, {
  docsClicked: analytics.docsClicked,
  getStartedClicked: analytics.getStartedClicked,
  externalLinkClicked: analytics.externalLinkClicked,
})
```

### UI theming

One **Tailwind theme contract** for all sites (same utility names). Defaults are
**WDK**. QVAC (and future apps) override values only.

```ts
// core: @tetherto/dev-websites-core/ui/theme/preset
// — full theme.extend (colors, type scale, radii, btn sizing)

// WDK
import uiPreset from '@tetherto/dev-websites-core/ui/theme/preset'
export default {
  presets: [uiPreset],
  content: [/* app + dist/ui */],
}

// QVAC — same keys, different CSS variables / brand values
import uiPreset from '@tetherto/dev-websites-core/ui/theme/preset'
export default {
  presets: [uiPreset],
  content: [/* app + dist/ui */],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: 'hsl(var(--color-text-action) / <alpha-value>)', /* … */ },
        // …
      },
    },
  },
}
```

Apps define the CSS variables the preset references (`--color-bg-base`,
`--color-accent`, …). QVAC also aliases those names onto its Figma tokens in
`globals.css`. Product-only utilities (e.g. QVAC `text-heading`) stay in the
app config until migrated onto the shared names.

**Button / form theming (optional):** `solid` fill reads `--btn-primary-bg`
(fallback: accent); label stays `text-accent-foreground` so per-site accent
foreground overrides (e.g. QVAC on-action) keep working. `outline` border
reads `--btn-secondary-border` (fallback: accent). Input/Textarea borders
read `--control-border` (fallback: `--color-border-subtle`).

Optional CSS helpers: `ui/theme/tokens.css`, `ui/theme/preset.css`, `ui/theme.css`
(short-name contract / Tailwind v4 `@theme`). The JS preset above is the source
of truth for WDK/QVAC.

### CMS stock

Registered by `buildCmsConfig` in this order. Disable or extend any of them via
`overrides[slug]` (`false` to drop, or `{ fields, hooks, admin, access, config }`).

| Slug             | Kind       | Purpose                                                                                                           |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `users`          | collection | Admin auth users (Payload local strategy).                                                                        |
| `api-tokens`     | collection | Server-to-server API-key auth for non-admin REST/GraphQL clients. Disable with `overrides['api-tokens'] = false`. |
| `media`          | collection | Uploads (image/video/pdf) with image sizes; served from S3 or disk.                                               |
| `authors`        | collection | Blog authors — bio, social profiles, JSON-LD `Person` overrides.                                                  |
| `categories`     | collection | Blog post categories.                                                                                             |
| `blog-posts`     | collection | Blog posts — drafts + autosave, SEO, author/category relations.                                                   |
| `pages`          | collection | Generic content pages (block-based body).                                                                         |
| `legal-pages`    | collection | Legal/policy content pages (same shape as `pages`).                                                               |
| `changelog-tags` | collection | Editor-managed tags shown on changelog entries.                                                                   |
| `changelog`      | collection | Changelog entries — **shared fields only** (see below).                                                           |
| `event-tags`     | collection | Editor-managed event categories (Meetup, Workshop, Hackathon, …). Related from `events`.                          |
| `events`         | collection | Events — drafts + autosave, start/end, timezone, location, tag, external URL, optional cover/body.                |
| `site-settings`  | global     | Site name, default description/OG image, organization + social.                                                   |

Changelog stock ships shared fields only; site-specific body / GitHub /
`relatedBlock` fields go in `overrides.fields`. Revalidation hooks go in
`overrides.hooks` (site-owned, e.g. `src/lib/cache`) — hook arrays are **appended**
to stock hooks, not replaced.

Draft collections enable Payload `schedulePublish`. `buildCmsConfig` starts
`jobs.autoRun` every minute so scheduled publishes run in a long-lived Node
process (`next start` / Docker). Override or disable via `payload.jobs`. This
is not for serverless hosts.

### Peer dependencies

CMS / Next (required for `/cms` consumers):
`payload`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`,
`@aws-sdk/client-s3`, `next`.

UI (required for `/ui` consumers):
`react`, `react-dom`, `@radix-ui/react-*` (dialog, dropdown-menu, primitive, slot, tooltip),
`class-variance-authority`, `clsx`, `tailwind-merge`. Optional: `react-icons`,
`embla-carousel-react` (carousel entry only).

### Environment variables

Read from `process.env` at runtime by the package — **set them in the consuming
site's environment** (`.env` / hosting / CI); `@tetherto/dev-websites-core` never defines them.

| Variable                                      | Used by                                           | Notes                                                                                          |
| --------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `AWS_S3_BUCKET`                               | `media`, `createS3MediaPlugin`, `readMediaBuffer` | When set, media reads/writes go to S3; otherwise disk (`<cwd>/media`).                         |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | S3 access                                         | Optional; falls back to the default AWS credential chain.                                      |
| `AWS_S3_REGION`                               | S3 access                                         | Defaults to `us-east-1`.                                                                       |
| `AWS_S3_ENDPOINT`                             | S3 access                                         | Optional custom endpoint (S3-compatible stores on QVAC / PEAR). Omit on WDK for default AWS S3. |
| `AWS_S3_FORCE_PATH_STYLE`                     | S3 access                                         | Set to `true` when the custom endpoint requires path-style addressing.                         |
| `NEXT_PUBLIC_SITE_URL`                        | `getSiteUrl`                                      | Public origin; trailing slash trimmed. Warns in production if this and `VERCEL_URL` are unset. |
| `VERCEL_URL`                                  | `getSiteUrl`                                      | Fallback origin on Vercel when `NEXT_PUBLIC_SITE_URL` is unset.                                |
| `LOG_LEVEL`                                   | `createLogger`                                    | `debug` \| `info` \| `warn` \| `error`. Defaults to `info` in production, `debug` otherwise.   |
| `NEXT_PHASE`                                  | `requireEnvAtRuntime`                             | Build phases skip the required-env check (no DB connection).                                   |

Hard-required vars (e.g. `PAYLOAD_SECRET`, `MONGODB_URI`) should be read via
`requireEnvAtRuntime(name)` — it logs and throws at runtime when the var is
missing, but returns `""` during Next.js build phases (which never connect to
the DB). Silent fallbacks that would mask a misconfiguration (e.g. `getSiteUrl`)
log a warning in production.

### Usage

```ts
// src/payload.config.ts
import { buildCmsConfig, createS3MediaPlugin } from '@tetherto/dev-websites-core/cms'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import { Languages } from '@tetherto/dev-websites-core/i18n'

export default buildCmsConfig({
  secret: process.env.PAYLOAD_SECRET!,
  db: mongooseAdapter({ url: process.env.DATABASE_URI! }),
  sharp,
  locales: [Languages.English],
  defaultLocale: Languages.English,
  plugins: [createS3MediaPlugin()],
  overrides: {
    'api-tokens': false, // drop a stock collection
    'changelog': { fields: (base) => [...base /* site-specific fields */] },
  },
  extraCollections: [/* site-only collections */],
})
```
