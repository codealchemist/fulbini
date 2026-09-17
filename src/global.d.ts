declare const __APP_VERSION__: string

// netlify-identity-widget@2 ships no type declarations — this covers the
// slice of its API this app actually uses. Verified against the widget's
// own source (netlify-identity.tsx: on/off/open/close/init/currentUser/
// logout/refresh/gotrue) rather than guessed.
declare module 'netlify-identity-widget' {
  export interface NetlifyIdentityUser {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
      [key: string]: unknown
    }
    app_metadata?: {
      provider?: string
      roles?: string[]
      [key: string]: unknown
    }
    token?: {
      access_token: string
      token_type: string
      expires_at: number
    }
    /** Current access token, transparently refreshed via GoTrue if expired. */
    jwt(forceRefresh?: boolean): Promise<string>
  }

  export type NetlifyIdentityEvent = 'init' | 'login' | 'logout' | 'signup' | 'error' | 'open' | 'close'

  export interface InitOptions {
    APIUrl?: string
    logo?: boolean
    locale?: string
    container?: string
  }

  export interface NetlifyIdentity {
    init(options?: InitOptions): void
    open(action?: 'login' | 'signup', metadata?: Record<string, unknown>): void
    close(): void
    on(event: 'init' | 'login', cb: (user: NetlifyIdentityUser | null) => void): void
    on(event: 'logout' | 'close' | 'open', cb: () => void): void
    on(event: 'error', cb: (err: Error) => void): void
    off(event: NetlifyIdentityEvent, cb?: (...args: unknown[]) => void): void
    currentUser(): NetlifyIdentityUser | null
    logout(): Promise<void>
    refresh(force?: boolean): Promise<string | undefined>
    readonly gotrue: unknown
  }

  const netlifyIdentity: NetlifyIdentity
  export default netlifyIdentity
}
