import { slugify } from '../hooks/slugify.js'

import type { AccessHelpers } from '../shared/access.js'
import type { CollectionConfig } from 'payload'

/** Stock event-tags (no site revalidation — add via overrides.hooks). */
export function createEventTags(access: AccessHelpers): CollectionConfig {
  return {
    slug: 'event-tags',
    defaultSort: 'order',
    admin: {
      useAsTitle: 'name',
      defaultColumns: ['name', 'slug', 'order'],
      description:
        'Reusable event categories (Meetup, Workshop, Hackathon, …). Editors can add types without code changes.',
    },
    access: {
      read: access.publicRead,
      create: access.adminOnly,
      update: access.adminOnly,
      delete: access.adminOnly,
    },
    fields: [
      {
        name: 'name',
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
          description: 'URL-friendly identifier used by filters and relationships.',
        },
        hooks: { beforeValidate: [slugify] },
      },
      {
        name: 'order',
        type: 'number',
        defaultValue: 0,
        admin: {
          position: 'sidebar',
          description: 'Display order in admin lists (ascending). Ties broken by name.',
        },
      },
      {
        name: 'description',
        type: 'textarea',
        localized: true,
        admin: { description: 'Optional context shown to editors.' },
      },
    ],
  }
}
