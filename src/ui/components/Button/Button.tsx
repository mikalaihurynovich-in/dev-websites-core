'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { focusRingClassName } from '../../a11y/focus.js'
import { cn } from '../../utils/cn.js'

import type { ComponentProps } from 'react'

const buttonVariants = cva(
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50',
    focusRingClassName
  ),
  {
    variants: {
      variant: {
        // Fill uses `--btn-primary-*` (accent fallback). Label keeps
        // `text-accent-foreground` so QVAC’s tailwind override
        // (`--color-text-on-action`) is unchanged; Pear already maps
        // accent.foreground → ink.
        'solid': 'rounded-btn bg-btn text-accent-foreground hover:opacity-90',
        'outline':
          'rounded-btn border border-btn-secondary-border bg-transparent text-foreground hover:border-accent hover:bg-foreground/5',
        'ghost': 'rounded-btn bg-transparent text-accent hover:bg-foreground/5',
        'secondary':
          'rounded-btn border border-foreground/20 bg-foreground/5 text-foreground hover:bg-foreground/10',
        'social':
          'rounded-btn border border-foreground/10 bg-card-elevated text-secondary hover:border-foreground/20 hover:text-foreground',
        'action':
          'rounded-btn border-0 bg-foreground text-background hover:opacity-90 no-underline',
        'elevated-outline':
          'rounded-btn border border-foreground bg-surface-elevated text-foreground hover:bg-surface-elevated/80',
        'link': 'bg-transparent p-0 text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-btn px-btn text-sm',
        sm: 'h-btn-sm px-btn-sm text-xs',
        cta: 'h-auto rounded-control px-4 py-3 text-sm font-medium',
        icon: 'size-9 rounded-btn p-0',
        social: 'h-[42px] gap-2 px-btn',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
    },
  }
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({
  className,
  variant = 'solid',
  size = 'default',
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
