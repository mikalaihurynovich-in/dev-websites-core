import type { CollectionOverride, GlobalOverride } from './applyOverride.js'

/** Slugs of the stock collections shipped by `buildCmsConfig`, in registration order. */
export const STOCK_COLLECTION_SLUGS = [
  'users',
  'api-tokens',
  'media',
  'authors',
  'categories',
  'blog-posts',
  'pages',
  'legal-pages',
  'changelog-tags',
  'changelog',
  'event-tags',
  'events',
] as const

export type StockCollectionSlug = (typeof STOCK_COLLECTION_SLUGS)[number]

/** Typed map of collection/global overrides for `buildCmsConfig`. */
export type Overrides = Partial<Record<StockCollectionSlug, CollectionOverride>> & {
  'site-settings'?: GlobalOverride
}
