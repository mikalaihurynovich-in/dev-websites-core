/**
 * Shared websites UI Tailwind preset — full theme contract, WDK defaults.
 *
 * Same utility names everywhere (`bg-accent`, `text-foreground`, `text-display-1`,
 * `rounded-btn`, `h-btn`, …). Apps point CSS variables at their brand palette.
 *
 *   // WDK — defaults already match site tokens
 *   presets: [uiPreset]
 *
 *   // QVAC — same keys, override color (and any other) values
 *   presets: [uiPreset]
 *   theme: { extend: { colors: { accent: { DEFAULT: '…' }, … } } }
 *
 * CSS: define the `--color-*` / `--primitive-*` / `--btn-*` vars the preset
 * references (see WDK `globals.css`), or remap them in the app `:root`.
 *
 * Button fills/borders prefer `--btn-primary-*` / `--btn-secondary-*` and fall
 * back to `--color-accent` so sites that only set accent keep today’s look.
 * Override those `--btn-*` vars (e.g. Pear outline = gray) without forking Button.
 */

const hsl = (name: string) => `hsl(var(${name}) / <alpha-value>)`
const cssVar = (name: string) => `var(${name})`
/** HSL channel var with fallback channel var (both unwrapped). */
const hslFallback = (name: string, fallback: string) =>
  `hsl(var(${name}, var(${fallback})) / <alpha-value>)`

const preset = {
  theme: {
    extend: {
      colors: {
        'background': hsl('--color-bg-base'),
        'recessed': hsl('--color-bg-recessed'),
        'surface': hsl('--color-bg-surface'),
        'surface-elevated': hsl('--color-bg-card-elevated'),
        'card': hsl('--color-bg-card'),
        'card-elevated': hsl('--color-bg-card-elevated'),
        'foreground': hsl('--color-text-primary'),
        'secondary': hsl('--color-text-secondary'),
        'muted': hsl('--color-text-muted'),
        'landing-text': hsl('--color-landing-text'),
        'landing-text-light': hsl('--color-landing-text-light'),
        'landing-text-light-30': cssVar('--landing-text-light-30'),

        'accent': {
          DEFAULT: hsl('--color-accent'),
          foreground: hsl('--color-text-primary'),
          hover: hsl('--color-accent-hover'),
          dim: hsl('--color-accent-dim'),
        },

        /**
         * Solid CTA fill. Defaults to accent when `--btn-primary-*` are unset
         * (QVAC) or alias accent (WDK/MDK).
         */
        'btn': {
          DEFAULT: hslFallback('--btn-primary-bg', '--color-accent'),
          hover: hslFallback('--btn-primary-bg-hover', '--color-accent-hover'),
          foreground: hslFallback('--btn-primary-text', '--color-text-primary'),
        },
        /** Outline CTA border/text. Defaults to accent border + primary text. */
        'btn-secondary': {
          border: hslFallback('--btn-secondary-border', '--color-accent'),
          DEFAULT: hslFallback('--btn-secondary-text', '--color-text-primary'),
        },
        /**
         * Form control stroke. Defaults to border-subtle (current Input/Textarea).
         * Set `--control-border` to remap without CSS attribute overrides.
         */
        'control': {
          border: hslFallback('--control-border', '--color-border-subtle'),
        },

        'border': {
          DEFAULT: hsl('--color-border-default'),
          subtle: hsl('--color-border-subtle'),
        },
        'success': hsl('--color-success'),
        'warning': hsl('--color-warning'),
        'error': hsl('--color-error'),
        'destructive': hsl('--color-error'),
        'info': hsl('--color-info'),
        'ring': hsl('--color-accent'),

        'teal': hsl('--color-teal'),
        'amber': hsl('--color-amber'),
        'purple': hsl('--color-purple'),
        'green': hsl('--color-green'),

        'blog-primary': hsl('--color-blog-primary'),
        'blog-body': hsl('--color-blog-body'),
        'blog-meta': hsl('--color-blog-meta'),

        'primitive': {
          'black': hsl('--primitive-black'),
          'dark-grey': hsl('--primitive-dark-grey'),
          'grey': hsl('--primitive-grey'),
          'light-grey': hsl('--primitive-light-grey'),
          'white': hsl('--primitive-white'),
          'orange': hsl('--primitive-orange'),
          'orange-dark': hsl('--primitive-orange-dark'),
          'purple': hsl('--primitive-purple'),
        },
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-sharp)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      fontSize: {
        'display-1': ['60px', { lineHeight: '1.05', letterSpacing: '0' }],
        'display-2': ['50px', { lineHeight: '1.05', letterSpacing: '0' }],
        'heading-3': ['38px', { lineHeight: '40px', letterSpacing: '0' }],
        'subhead-1': ['28px', { lineHeight: '32px', letterSpacing: '0' }],
        'subhead-2': ['22px', { lineHeight: '26px', letterSpacing: '0' }],
        'subhead-3': ['13px', { lineHeight: '1', letterSpacing: '2px' }],
        'body-1': ['22px', { lineHeight: '32px' }],
        'body-2': ['18px', { lineHeight: '28px' }],
        'body-sm': ['15px', { lineHeight: '20px' }],
        'body-md': ['14px', { lineHeight: '20px' }],
        'body-xs': ['13px', { lineHeight: '18px' }],
        'btn': ['14px', { lineHeight: '19px', letterSpacing: '0.5px' }],
        'btn-cta': ['15px', { lineHeight: '1' }],
        'code': ['17px', { lineHeight: '20px' }],
        'label': ['11px', { lineHeight: '16px', letterSpacing: '0.3px' }],
        'badge': ['10px', { lineHeight: '1', letterSpacing: '0.4px' }],
        'caption': ['12px', { lineHeight: '16px' }],
        'inter-h1': ['50px', { lineHeight: '60px' }],
        'inter-h2': ['30px', { lineHeight: '38px' }],
        'inter-h3': ['26px', { lineHeight: '36px' }],
        'blog-mob': ['16px', { lineHeight: '24px' }],
      },

      borderRadius: {
        // Keep 5px default (current WDK/MDK render). Apps override via
        // theme.extend.borderRadius.btn (QVAC / Pear) — do not read
        // `--btn-primary-radius` here so WDK’s declared 4px token does not
        // silently change live buttons from 5px → 4px.
        btn: '5px',
        card: '10px',
        badge: '5px',
        control: 'var(--control-radius)',
        pill: '9999px',
      },

      height: {
        'btn': 'var(--btn-primary-height)',
        'btn-sm': 'var(--btn-sm-height)',
      },

      size: {
        'btn-sm': 'var(--btn-sm-height)',
      },

      padding: {
        'btn': 'var(--btn-primary-px)',
        'btn-sm': 'var(--btn-sm-px)',
      },
    },
  },
}

export default preset
