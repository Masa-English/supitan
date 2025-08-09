import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // セッション未所持時の 400/"Auth session missing" は正常系として扱う
  let user: { email?: string } | null = null
  let authError: unknown = null
  try {
    const { data, error } = await supabase.auth.getUser()
    user = data?.user ?? null
    authError = error ?? null
  } catch (e) {
    authError = e
  }

  const isMissingSession = (() => {
    if (!authError) return false
    const err = authError as { [k: string]: unknown }
    const name = String(err?.name ?? '')
    const message = String(err?.message ?? '')
    const status = Number((err as { status?: number }).status ?? 0)
    const isFlag = (err as { __isAuthError?: boolean }).__isAuthError === true
    return isFlag || status === 400 || name.includes('AuthSessionMissingError') || /Auth session missing/i.test(message)
  })()
  if (isMissingSession) {
    // 未ログイン扱いとしてスルー（ノイズログを抑制）
    user = null
    authError = null
  }

  // パブリックパスの定義
  const publicPaths = [
    '/auth',
    '/landing',
    '/contact',
    '/faq',
    '/api/health',
    '/api/static-data',
    '/api/revalidate',
    '/api/contact',
    '/favicon.ico',
    '/manifest.json',
  ]

  // 現在のパスがパブリックパスかどうかをチェック
  const isPublicPath = (() => {
    const pathname = request.nextUrl.pathname
    for (const path of publicPaths) {
      if (path === '/') {
        if (pathname === '/') return true
        continue
      }
      if (pathname === path || pathname.startsWith(path + '/')) return true
    }
    return false
  })()

  const isAPIRoute = request.nextUrl.pathname.startsWith('/api')
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

  // デバッグ用ログ（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${request.nextUrl.pathname}`)
    console.log(`[Middleware] User: ${user ? 'authenticated' : 'not authenticated'}`)
    console.log(`[Middleware] IsPublicPath: ${isPublicPath}`)
    if (authError) {
      console.warn(`[Middleware] Auth error:`, authError)
    }
  }

  // 認証エラーがある場合の処理
  if (authError) {
    console.error('Middleware auth error:', authError)
    
    // パブリックパスでない場合
    if (!isPublicPath) {
      if (isAPIRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/landing'
      return NextResponse.redirect(url)
    }
  }

  // ユーザーが未認証で、かつプライベートパスにアクセスしようとしている場合
  if (!user && !isPublicPath) {
    console.log(`Unauthorized access attempt to: ${request.nextUrl.pathname}`)
    
    // ダッシュボード関連のパスへの未認証アクセスを特に厳格にチェック
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/landing'
      return NextResponse.redirect(url)
    }
    
    // その他のプライベートパスも同様に保護
    if (isAPIRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return NextResponse.redirect(url)
  }

  // 管理画面へのアクセス制御
  if (isAdminPath) {
    // 認証済みかつ管理者かチェック
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/landing'
      return NextResponse.redirect(url)
    }

    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single()

      if (adminError || !adminData) {
        console.warn(`Non-admin attempted to access admin path: ${request.nextUrl.pathname}`)
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch (e) {
      console.error('Admin check failed in middleware:', e)
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // 認証済みユーザーが認証ページにアクセスしようとしている場合
  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}
