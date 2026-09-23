import { OAuth2Client } from 'google-auth-library'
import { NextRequest, NextResponse } from 'next/server'
import { getFieldsToSign, getPayload, jwtSign } from 'payload'
import { addSessionToUser, generatePayloadCookie } from 'payload/shared'

import { getSiteUrl } from '../../seo/site-url.js'
import { createLogger } from '../../utils/logger/logger.js'

import type { Config, SanitizedConfig } from 'payload'

const log = createLogger('googleOAuth')

export const GOOGLE_OAUTH_START_PATH = '/api/auth/google'
export const GOOGLE_OAUTH_CALLBACK_PATH = '/api/auth/google/callback'
export const GOOGLE_OAUTH_LOGIN_PATH = '/admin/login'
export const GOOGLE_OAUTH_ADMIN_PATH = '/admin'

/** Payload `admin.components.afterLogin` path for the shared Google button. */
export const GOOGLE_OAUTH_AFTER_LOGIN = [
  '@tetherto/dev-websites-core/ui#GoogleOAuthButton',
] as const

export const GOOGLE_OAUTH_SCOPES = ['openid', 'email', 'profile'] as const

export type HandleGoogleOAuthCallbackOptions = {
  /** Site Payload config default export (`import config from '@payload-config'`). */
  config: Config | SanitizedConfig | Promise<Config | SanitizedConfig>
}

function getGoogleOAuthClient(redirectUri: string) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri)
}

function loginErrorRedirect(siteUrl: string, error: string) {
  return NextResponse.redirect(
    `${siteUrl}${GOOGLE_OAUTH_LOGIN_PATH}?error=${encodeURIComponent(error)}`
  )
}

/** GET `/api/auth/google` — start the Google OAuth redirect. */
export async function handleGoogleOAuthStart() {
  try {
    const siteUrl = getSiteUrl()
    const redirectUri = `${siteUrl}${GOOGLE_OAUTH_CALLBACK_PATH}`
    const client = getGoogleOAuthClient(redirectUri)

    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [...GOOGLE_OAUTH_SCOPES],
      prompt: 'select_account',
    })

    return NextResponse.redirect(authorizeUrl)
  } catch (error) {
    log.error(error instanceof Error ? error.message : 'OAuth configuration error')
    return NextResponse.json({ error: 'OAuth configuration error' }, { status: 500 })
  }
}

/** GET `/api/auth/google/callback` — exchange the code and set the Payload session cookie. */
export async function handleGoogleOAuthCallback(
  request: NextRequest,
  { config }: HandleGoogleOAuthCallbackOptions
) {
  try {
    const { searchParams } = new URL(request.url)
    const siteUrl = getSiteUrl()
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return loginErrorRedirect(siteUrl, error)
    }

    if (!code) {
      return loginErrorRedirect(siteUrl, 'no_code')
    }

    const redirectUri = `${siteUrl}${GOOGLE_OAUTH_CALLBACK_PATH}`
    const client = getGoogleOAuthClient(redirectUri)

    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    if (!tokens.id_token) {
      return loginErrorRedirect(siteUrl, 'no_token')
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    })

    const googlePayload = ticket.getPayload()
    if (!googlePayload?.email) {
      return loginErrorRedirect(siteUrl, 'no_email')
    }

    const { email, sub: googleId, name, picture } = googlePayload
    const payload = await getPayload({
      config: (await config) as SanitizedConfig,
    })

    const users = await payload.find({
      collection: 'users',
      where: {
        or: [{ email: { equals: email } }, { googleId: { equals: googleId } }],
      },
      limit: 1,
    })

    let user = users.docs[0]
    if (users.docs.length > 0) {
      user = users.docs[0]

      const googleUser = user as typeof user & {
        googleId?: string | null
        name?: string | null
        picture?: string | null
      }
      const updateData: Record<string, unknown> = {}

      if (!googleUser.googleId) {
        updateData.googleId = googleId
        updateData.name = name || googleUser.name
        updateData.picture = picture || googleUser.picture
      }

      if (Object.keys(updateData).length > 0) {
        user = await payload.update({
          collection: 'users',
          id: user.id,
          data: updateData,
        })
      }
    } else {
      return loginErrorRedirect(siteUrl, 'user_not_found')
    }

    const collectionConfig = payload.collections['users'].config

    const sessionUser = user as Parameters<typeof addSessionToUser>[0]['user']

    const { sid } = await addSessionToUser({
      collectionConfig,
      payload,
      req: {
        payload,
        user: sessionUser,
      } as unknown as Parameters<typeof addSessionToUser>[0]['req'],
      user: sessionUser,
    })

    const fieldsToSign = getFieldsToSign({
      collectionConfig,
      email: sessionUser.email as string,
      sid,
      user: sessionUser,
    })

    const tokenExpiration = collectionConfig.auth.tokenExpiration || 7200
    const secret = payload.secret

    const { token } = await jwtSign({
      fieldsToSign,
      secret,
      tokenExpiration,
    })

    const cookie = generatePayloadCookie({
      collectionAuthConfig: collectionConfig.auth,
      cookiePrefix: payload.config.cookiePrefix || 'payload',
      token,
      returnCookieAsObject: true,
    })

    const response = NextResponse.redirect(`${siteUrl}${GOOGLE_OAUTH_ADMIN_PATH}`)

    response.cookies.set(cookie.name, cookie.value!, {
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite?.toLowerCase() as 'strict' | 'lax' | 'none' | undefined,
      secure: cookie.secure,
      path: cookie.path,
      expires: cookie.expires ? new Date(cookie.expires) : undefined,
      maxAge: cookie.maxAge,
    })

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
    log.error(errorMessage)
    return loginErrorRedirect(getSiteUrl(), errorMessage)
  }
}
