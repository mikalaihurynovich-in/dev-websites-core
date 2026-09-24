'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { Button } from '../Button/Button.js'

import { GOOGLE_OAUTH_START_PATH } from './googleOAuthStartPath.js'

export function GoogleOAuthButton() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('OAuth error:', error)
    }
  }, [searchParams])

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_OAUTH_START_PATH
  }

  return (
    <form className="w-full">
      <div className="form-submit flex w-full flex-col items-stretch">
        <div className="my-3 flex w-full items-center gap-3" role="separator">
          <span
            className="block h-px min-w-0 flex-1 bg-[var(--theme-elevation-250,#cfcfcf)]"
            aria-hidden="true"
          />
          <span className="shrink-0 text-center text-[13px] leading-none font-normal tracking-normal whitespace-nowrap text-[var(--theme-elevation-500,#8c8c8c)]">
            Or
          </span>
          <span
            className="block h-px min-w-0 flex-1 bg-[var(--theme-elevation-250,#cfcfcf)]"
            aria-hidden="true"
          />
        </div>
        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn--icon-style-without-border btn--size-large btn--withoutPopup btn--style-primary !my-0"
        >
          <svg className="mr-2 size-[18px] shrink-0" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
    </form>
  )
}
