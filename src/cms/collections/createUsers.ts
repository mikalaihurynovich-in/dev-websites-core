import type { AccessHelpers } from '../shared/access.js'
import type { CollectionConfig } from 'payload'

export function createUsers(access: AccessHelpers): CollectionConfig {
  return {
    slug: 'users',
    admin: {
      useAsTitle: 'email',
    },
    auth: {
      verify: false,
    },
    access: {
      read: access.adminOnly,
      create: access.adminOnly,
      update: access.adminOnly,
      delete: access.adminOnly,
      admin: access.adminOnly,
    },
    fields: [
      {
        name: 'googleId',
        type: 'text',
        unique: true,
        index: true,
        admin: {
          position: 'sidebar',
          readOnly: true,
          description: 'Google OAuth user ID',
        },
      },
      {
        name: 'name',
        type: 'text',
        admin: {
          description: 'Display name from Google',
        },
      },
      {
        name: 'picture',
        type: 'text',
        admin: {
          description: 'Profile picture URL from Google',
        },
      },
    ],
  }
}
