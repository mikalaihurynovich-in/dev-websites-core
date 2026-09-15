import { cn } from '../../utils/cn.js'

import type { ComponentProps } from 'react'

export type TextareaProps = Omit<ComponentProps<'textarea'>, 'children'> & {
  error?: boolean | string
}

function Textarea({ className, error, id, ref, ...props }: TextareaProps) {
  const errorId = id ? `${id}-error` : undefined
  const hasError = Boolean(error)

  return (
    <div className="flex w-full flex-col gap-1">
      <textarea
        ref={ref}
        id={id}
        data-slot="textarea"
        aria-invalid={hasError || undefined}
        aria-describedby={hasError && errorId ? errorId : undefined}
        className={cn(
          'min-h-24 w-full resize-y rounded-btn border border-control-border bg-background px-3.5 py-3 text-sm text-foreground',
          'placeholder:text-muted',
          'transition-colors hover:border-border',
          'focus-visible:border-accent focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive focus-visible:border-destructive',
          className
        )}
        {...props}
      />

      {typeof error === 'string' ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Textarea }
