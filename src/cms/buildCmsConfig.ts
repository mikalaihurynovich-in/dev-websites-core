import { buildConfig } from 'payload'

import { createAccessHelpers, type AccessOptions } from './shared/access.js'
import { createApiTokens } from './collections/createApiTokens.js'
import { createAuthors } from './collections/createAuthors.js'
import { createBlogPosts } from './collections/createBlogPosts.js'
import { createCategories } from './collections/createCategories.js'
import { createChangelog } from './collections/createChangelog.js'
import { createChangelogTags } from './collections/createChangelogTags.js'
import { createEventTags } from './collections/createEventTags.js'
import { createEvents } from './collections/createEvents.js'
import { createMedia } from './collections/createMedia.js'
import { createLegalPages, createPages } from './collections/createPages.js'
import { createUsers } from './collections/createUsers.js'
import { createSiteSettings } from './globals/createSiteSettings.js'
import { richTextEditor } from './lexical/editor.js'
import { applyCollectionOverride, applyGlobalOverride } from './applyOverride.js'
import { STOCK_COLLECTION_SLUGS, type Overrides, type StockCollectionSlug } from './overrides.js'

import type { CollectionConfig, Config, GlobalConfig, Plugin } from 'payload'

export type BuildCmsConfigOptions<TLocale extends string = string> = {
  secret: string
  // Payload DB adapter instance (e.g. mongooseAdapter({ url }))
  db: Config['db']
  /** Sharp instance from the `sharp` package. */
  sharp?: Config['sharp']
  cors?: Config['cors']
  csrf?: Config['csrf']
  locales: readonly TLocale[]
  /** Must be one of `locales`. */
  defaultLocale: TLocale
  admin?: Config['admin']
  plugins?: Plugin[]
  /** Defaults to the package Lexical editor. */
  editor?: Config['editor']
  access?: AccessOptions
  /** Collection/global slug → override | false. */
  overrides?: Overrides
  extraCollections?: CollectionConfig[]
  extraGlobals?: GlobalConfig[]
  typescript?: Config['typescript']
  /** Extra top-level Payload config keys (e.g. endpoints, graphQL). */
  payload?: Partial<
    Omit<
      Config,
      | 'secret'
      | 'db'
      | 'sharp'
      | 'cors'
      | 'csrf'
      | 'admin'
      | 'plugins'
      | 'editor'
      | 'collections'
      | 'globals'
      | 'localization'
      | 'typescript'
    >
  >
}

/** Drop keys whose value is `undefined` so they don't clobber Payload defaults. */
function defined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>
}

/**
 * Build a Payload config from shared stock collections/globals plus site
 * overrides and extras. Types are still generated in the consuming app.
 */
export function buildCmsConfig<const TLocale extends string>(
  options: BuildCmsConfigOptions<TLocale>
) {
  const overrides = options.overrides ?? {}
  const access = createAccessHelpers({
    ...options.access,
    apiTokens: options.access?.apiTokens ?? overrides['api-tokens'] !== false,
  })

  const stock: Record<StockCollectionSlug, CollectionConfig> = {
    'users': createUsers(access),
    'api-tokens': createApiTokens(access),
    'media': createMedia(access),
    'authors': createAuthors(access),
    'categories': createCategories(access),
    'blog-posts': createBlogPosts(access),
    'pages': createPages(access),
    'legal-pages': createLegalPages(access),
    'changelog-tags': createChangelogTags(access),
    'changelog': createChangelog(access),
    'event-tags': createEventTags(access),
    'events': createEvents(access),
  }

  const collections = [
    ...STOCK_COLLECTION_SLUGS.map((slug) =>
      applyCollectionOverride(stock[slug], overrides[slug])
    ).filter((c): c is CollectionConfig => c !== null),
    ...(options.extraCollections ?? []),
  ]

  const siteSettings = applyGlobalOverride(createSiteSettings(access), overrides['site-settings'])
  const globals = [...(siteSettings ? [siteSettings] : []), ...(options.extraGlobals ?? [])]
  const { jobs: jobsOverride, ...payloadRest } = options.payload ?? {}

  return buildConfig({
    ...payloadRest,
    jobs: {
      // In-process cron so Payload `schedulePublish` jobs actually run.
      // Override via `payload.jobs`. Do not use on serverless hosts.
      autoRun: [{ cron: '* * * * *' }],
      ...jobsOverride,
    },
    ...defined({
      sharp: options.sharp,
      cors: options.cors,
      csrf: options.csrf,
      plugins: options.plugins,
    }),
    secret: options.secret,
    db: options.db,
    admin: {
      user: 'users',
      ...options.admin,
    },
    editor: options.editor ?? richTextEditor(),
    collections,
    ...(globals.length ? { globals } : {}),
    localization: {
      locales: options.locales.map((code) => ({
        code,
        label: code.toUpperCase(),
      })),
      defaultLocale: options.defaultLocale,
      fallback: true,
    },
    typescript: options.typescript ?? {
      outputFile: 'src/payload-types.ts',
    },
  })
}
