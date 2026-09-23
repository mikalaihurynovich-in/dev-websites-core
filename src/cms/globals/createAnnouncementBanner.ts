import type { AccessHelpers } from '../shared/access.js'
import type { GlobalConfig, Validate } from 'payload'

const validateBannerId: Validate<string | null | undefined, { enabled?: boolean | null }> = (
  value,
  { siblingData }
) => {
  if (siblingData?.enabled && !String(value ?? '').trim()) {
    return 'Banner ID is required when the banner is enabled.'
  }
  return true
}

/** Announcement banner global (no site revalidation — add via applyGlobalOverride hooks). */
export function createAnnouncementBanner(access: AccessHelpers): GlobalConfig {
  return {
    slug: 'announcement-banner',
    label: 'Announcement Banner',
    admin: {
      description:
        'Sticky site-wide banner shown above the main navigation. Bump Banner ID when replacing content so users who dismissed an older message in the current session see the new one.',
    },
    access: {
      read: access.publicRead,
      update: access.adminOnly,
    },
    fields: [
      {
        name: 'enabled',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          description: 'When off, the banner is hidden on the public site.',
        },
      },
      {
        name: 'bannerId',
        type: 'text',
        admin: {
          description:
            'Stable identifier for this banner version. Change it when publishing new copy so users who dismissed an older banner in this session see the update.',
        },
        validate: validateBannerId,
      },
      {
        type: 'row',
        fields: [
          {
            name: 'prefix',
            type: 'text',
            localized: true,
            maxLength: 8,
            admin: {
              width: '25%',
              description: 'Accent label (max 8 characters), e.g. "New:"',
            },
          },
          {
            name: 'description',
            type: 'text',
            localized: true,
            maxLength: 1000,
            admin: {
              width: '75%',
              description: 'Banner message (max 1000 characters).',
            },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'ctaLabel',
            type: 'text',
            localized: true,
            maxLength: 18,
            admin: {
              width: '50%',
              description: 'Optional button label (max 18 characters).',
            },
          },
          {
            name: 'ctaHref',
            type: 'text',
            admin: {
              width: '50%',
              description: 'Optional button URL. Relative paths stay in-site.',
            },
          },
        ],
      },
    ],
  }
}
