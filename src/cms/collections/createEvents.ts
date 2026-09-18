import { setPublishedAt } from '../hooks/set-published-at.js'
import { slugify } from '../hooks/slugify.js'
import { richTextEditor } from '../lexical/editor.js'
import { draftsWithAutosave } from '../shared/drafts-with-autosave.js'

import type { AccessHelpers } from '../shared/access.js'
import type { CollectionConfig, Validate } from 'payload'

/**
 * Display abbreviations accepted in addition to IANA names (e.g. Europe/Paris).
 * Sites map these to IANA when they need a timezone database identifier.
 */
const TIMEZONE_ABBREVIATIONS = new Set([
  'UTC',
  'GMT',
  'CET',
  'CEST',
  'WET',
  'WEST',
  'EET',
  'EEST',
  'BST',
  'EST',
  'EDT',
  'CST',
  'CDT',
  'MST',
  'MDT',
  'PST',
  'PDT',
])

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
    return true
  } catch {
    return false
  }
}

const validateTimezone: Validate<string | null | undefined> = (value) => {
  if (!value || !value.trim()) return 'Timezone is required.'
  const timeZone = value.trim()
  if (TIMEZONE_ABBREVIATIONS.has(timeZone.toUpperCase())) return true
  if (isValidIanaTimeZone(timeZone)) return true
  return 'Must be a timezone abbreviation (CET, UTC, …) or a valid IANA timezone (e.g. Europe/Paris).'
}

const validateExternalUrl: Validate<string | null | undefined> = (value) => {
  if (!value || !value.trim()) return 'External URL is required.'
  try {
    new URL(value)
    return true
  } catch {
    return 'Must be a valid URL (e.g. https://example.com/event).'
  }
}

const validateEndsAt: Validate<string | Date | null | undefined> = (value, { siblingData }) => {
  const end = parseDate(value)
  if (!end) return 'End date and time is required.'

  const start = parseDate(
    siblingData && typeof siblingData === 'object' && 'startsAt' in siblingData
      ? siblingData.startsAt
      : undefined
  )
  if (start && end.getTime() <= start.getTime()) {
    return 'End date and time must be after the start.'
  }

  return true
}

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
      defaultColumns: ['title', 'slug', 'tag', 'startsAt', 'endsAt', '_status'],
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
          description: 'Short description for listings, previews, and calendar bodies.',
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
        name: 'endsAt',
        type: 'date',
        required: true,
        validate: validateEndsAt,
        admin: {
          position: 'sidebar',
          date: { pickerAppearance: 'dayAndTime', displayFormat: 'MMM d, yyyy h:mm a' },
          description: 'Event end date and time. Must be after the start.',
        },
      },
      {
        name: 'timezone',
        type: 'text',
        required: true,
        validate: validateTimezone,
        admin: {
          position: 'sidebar',
          description:
            'Display timezone: abbreviation (CET, WET, UTC) or IANA name (Europe/Paris).',
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
        name: 'ctaKind',
        type: 'select',
        required: true,
        defaultValue: 'link',
        options: [
          { label: 'External link', value: 'link' },
          { label: 'Add to calendar', value: 'calendar' },
        ],
        admin: {
          position: 'sidebar',
          description:
            'Primary listing action. Link opens the external URL; calendar lets the site offer an add-to-calendar flow.',
        },
      },
      {
        name: 'ctaLabel',
        type: 'text',
        required: true,
        localized: true,
        admin: {
          description: 'Label for the primary listing action (e.g. Register, Watch recording).',
        },
      },
      {
        name: 'ctaUrl',
        type: 'text',
        required: true,
        validate: validateExternalUrl,
        admin: {
          description:
            'External event URL. Opened for link actions; included in calendar details for calendar actions.',
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
