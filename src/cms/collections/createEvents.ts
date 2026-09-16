import { setPublishedAt } from '../hooks/set-published-at.js'
import { slugify } from '../hooks/slugify.js'
import { richTextEditor } from '../lexical/editor.js'
import { draftsWithAutosave } from '../shared/drafts-with-autosave.js'

import type { AccessHelpers } from '../shared/access.js'
import type { CollectionConfig } from 'payload'

/**
 * Stock events collection (shared fields only).
 * SEO / site-specific fields — add via `overrides.fields`.
 * Revalidation — add via `overrides.hooks`.
 */
export function createEvents(access: AccessHelpers): CollectionConfig {
  return {
    slug: 'events',
    labels: { singular: 'Event', plural: 'Events' },
    defaultSort: 'startsAt',
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'slug', 'tag', 'startsAt', '_status'],
      description: 'Reusable events consumed by marketing / community surfaces across sites.',
    },
    access: {
      read: access.adminOrPublished,
      create: access.adminOnly,
      update: access.adminOnly,
      delete: access.adminOnly,
    },
    versions: draftsWithAutosave,
    hooks: {
      beforeChange: [setPublishedAt],
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        localized: true,
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        admin: {
          position: 'sidebar',
          description: 'URL-friendly identifier. Not localized — one slug per event.',
        },
        hooks: { beforeValidate: [slugify] },
      },
      {
        name: 'summary',
        type: 'textarea',
        required: true,
        localized: true,
        admin: {
          description: 'Short description for listings and previews.',
        },
      },
      {
        name: 'startsAt',
        type: 'date',
        required: true,
        admin: {
          position: 'sidebar',
          date: { pickerAppearance: 'dayAndTime', displayFormat: 'MMM d, yyyy h:mm a' },
          description: 'Event start date and time. Sites derive upcoming vs past from this value.',
        },
      },
      {
        name: 'location',
        type: 'text',
        required: true,
        localized: true,
        admin: {
          description: 'Venue or platform (e.g. Discord, Online, Lisbon).',
        },
      },
      {
        name: 'timezone',
        type: 'text',
        required: true,
        admin: {
          position: 'sidebar',
          description: 'Timezone abbreviation for display (e.g. CET, WET).',
        },
      },
      {
        name: 'tag',
        type: 'relationship',
        relationTo: 'event-tags',
        required: true,
        admin: {
          position: 'sidebar',
          description: 'Primary event category from Event Tags.',
        },
      },
      {
        name: 'ctaLabel',
        type: 'text',
        required: true,
        localized: true,
        admin: {
          description: 'Label for the primary external action (e.g. Register, Watch recording).',
        },
      },
      {
        name: 'ctaUrl',
        type: 'text',
        required: true,
        admin: {
          description: 'External URL for the primary action.',
        },
      },
      {
        name: 'coverImage',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description: 'Optional cover/hero image for detail or promotional surfaces.',
        },
      },
      {
        name: 'content',
        type: 'richText',
        localized: true,
        editor: richTextEditor(),
        admin: {
          description: 'Optional long-form body for event detail pages.',
        },
      },
      {
        name: 'publishedAt',
        type: 'date',
        admin: {
          position: 'sidebar',
          date: { pickerAppearance: 'dayAndTime' },
          description: 'Auto-filled on first publish if left empty.',
        },
      },
    ],
  }
}
