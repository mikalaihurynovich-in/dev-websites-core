'use client'

import { Primitive } from '@radix-ui/react-primitive'

import { cn } from '../../utils/cn.js'

import type { ComponentProps, ReactNode } from 'react'

export type InputProps = Omit<ComponentProps<typeof Primitive.input>, 'children'> & {
  error?: boolean | string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

function Input({ className, error, leftIcon, rightIcon, id, ref, ...props }: InputProps) {
  const errorId = id ? `${id}-error` : undefined
  const hasError = Boolean(error)

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="relative flex items-center">
        {leftIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 flex items-center"
          >
            {leftIcon}
          </span>
        ) : null}

        <Primitive.input
          ref={ref}
          id={id}
          data-slot="input"
          aria-invalid={hasError || undefined}
          aria-describedby={hasError && errorId ? errorId : undefined}
          className={cn(
            'h-11 w-full rounded-btn border border-control-border bg-background px-3.5 text-sm text-foreground',
            'placeholder:text-muted',
            'transition-colors hover:border-border',
            'focus-visible:border-accent focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-destructive focus-visible:border-destructive',
            leftIcon && 'pl-11',
            rightIcon && 'pr-11',
            className
          )}
          {...props}
        />

        {rightIcon ? (
          <span className="absolute right-3.5 flex items-center">{rightIcon}</span>
        ) : null}
      </div>

      {typeof error === 'string' ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Input }
