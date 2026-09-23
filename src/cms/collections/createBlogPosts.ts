import { blogContentBlocks } from '../blocks/index.js'
import {
  coerceBlogPostCategoriesOnRead,
  coerceBlogPostCategoriesOnWrite,
} from '../hooks/coerce-blog-post-categories.js'
import { setPublishedAt } from '../hooks/set-published-at.js'
import { slugify } from '../hooks/slugify.js'
import { draftsWithAutosave } from '../shared/drafts-with-autosave.js'
import { seoFields } from '../shared/seo-fields.js'

import type { AccessHelpers } from '../shared/access.js'
import type { CollectionConfig } from 'payload'

/** Stock blog-posts collection (no site revalidation — add via overrides.hooks). */
export function createBlogPosts(access: AccessHelpers): CollectionConfig {
  return {
    slug: 'blog-posts',
    defaultSort: '-publishedAt',
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'slug', 'author', 'publishedAt', '_status'],
    },
    access: {
      read: access.adminOrPublished,
      create: access.adminOnly,
      update: access.adminOnly,
      delete: access.adminOnly,
    },
    versions: draftsWithAutosave,
    hooks: {
      beforeChange: [setPublishedAt, coerceBlogPostCategoriesOnWrite],
      afterRead: [coerceBlogPostCategoriesOnRead],
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
          description: 'URL-friendly identifier. Not localized — one slug per post.',
        },
        hooks: { beforeValidate: [slugify] },
      },
      {
        name: 'coverImage',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'imageAlt',
        type: 'text',
        localized: true,
        admin: {
          description:
            'Alt text used for the auto-generated social/OG image (`og:image:alt`). Should describe the post for screen readers.',
        },
      },
      {
        name: 'excerpt',
        type: 'textarea',
        localized: true,
        admin: {
          description: 'Short summary shown in listing cards and meta description fallback.',
        },
      },
      {
        name: 'content',
        type: 'blocks',
        localized: true,
        blocks: blogContentBlocks,
      },
      {
        name: 'author',
        type: 'relationship',
        relationTo: 'authors',
        admin: { position: 'sidebar' },
      },
      {
        name: 'category',
        type: 'relationship',
        relationTo: 'categories',
        hasMany: true,
        label: 'Categories',
        admin: { position: 'sidebar' },
      },
      {
        name: 'readingTime',
        type: 'number',
        min: 1,
        admin: {
          position: 'sidebar',
          description: 'Estimated reading time in minutes.',
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
      {
        name: 'showLatestNews',
        type: 'checkbox',
        defaultValue: true,
        admin: {
          position: 'sidebar',
          description: 'Show a "Latest News" section at the bottom of this post.',
        },
      },
      seoFields,
    ],
  }
}
