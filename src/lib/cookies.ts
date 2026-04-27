import { cookies } from 'next/headers'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from './jwt'

export async function setAccessTokenCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
    })
}

export async function setRefreshTokenCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    })
}

export async function clearAuthCookies() {
    const cookieStore = await cookies()
    cookieStore.delete(ACCESS_COOKIE_NAME)
    cookieStore.delete(REFRESH_COOKIE_NAME)
}

export async function getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies()
    return cookieStore.get(REFRESH_COOKIE_NAME)?.value
}