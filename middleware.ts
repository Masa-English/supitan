import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { hasValidSessionCookie, setSessionHeaders, isSessionMissingError } from '@/lib/auth/session-utils'

export async function middleware(request: NextRequest) {
  // 事前にパスとCookieを評価して、重い認証問い合わせを回避できる場合は早期リダイレクト
  const pathname = request.nextUrl.pathname
  
  // 静的リソースのキャッシュ設定
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }
  
  // API ルートのキャッシュ設定
  if (pathname.startsWith('/api/static-data')) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200')
  }
  
  // より正確なSupabaseセッションCookie検出
  const hasSupabaseSessionCookie = hasValidSessionCookie(request)

  // ルートアクセス時の最適化されたリダイレクト処理
  if (pathname === '/') {
    // セッションCookieが存在する場合のみ、後続の認証チェックを行う
    // セッションCookieがない場合は、ルートページでログインフォームを表示
    if (!hasSupabaseSessionCookie) {
      return NextResponse.next({ request })
    }
    // セッションCookieがある場合は後続の認証チェックに進む
  }

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
  // supabase.auth.getUser() in flows that REQUIRE a refresh. ただし、
  // セッションCookieが存在しない場合は getUser() をスキップして
  // 例外や不要なノイズログを回避する。

  // セッション未所持時の 400/"Auth session missing" は正常系として扱う
  let user: { email?: string } | null = null
  let authError: unknown = null
  
  // セッションCookieがある場合のみ認証チェックを実行
  if (hasSupabaseSessionCookie) {
    try {
      const { data, error } = await supabase.auth.getUser()
      user = data?.user ?? null
      authError = error ?? null
      
      // セッション状態の維持を強化
      if (user && !error) {
        // 有効なセッションの場合、レスポンスヘッダーでセッション維持を指示
        supabaseResponse.headers.set('x-session-valid', 'true')
        // キャッシュ制御を追加
        supabaseResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        supabaseResponse.headers.set('Pragma', 'no-cache')
        supabaseResponse.headers.set('Expires', '0')
        
        // ルートパスで認証済みユーザーをダッシュボードにリダイレクト
        if (pathname === '/') {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          const response = NextResponse.redirect(url)
          setSessionHeaders(response)
          response.headers.set('x-authenticated-redirect', 'true')
          // リダイレクト時もキャッシュ制御
          response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
          return response
        }
      }
    } catch (e) {
      authError = e
    }
  }

  const isMissingSession = isSessionMissingError(authError)
  if (isMissingSession) {
    // 未ログイン扱いとしてスルー（ノイズログを抑制）
    user = null
    authError = null
  }

  // パブリックパスの定義
  const publicPaths = [
    '/',
    '/auth',
    '/login',
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
    // ここに来るのは想定外の認証エラーのみ。ログ出力は控えめにする
    if (process.env.NODE_ENV !== 'production') {
      console.error('Middleware auth error:', authError)
    }
    
    // パブリックパスでない場合
    if (!isPublicPath) {
      if (isAPIRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // ユーザーが未認証で、かつプライベートパスにアクセスしようとしている場合
  if (!user && !isPublicPath) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Unauthorized access attempt to: ${request.nextUrl.pathname}`)
    }
    
    // ダッシュボード関連のパスへの未認証アクセスを特に厳格にチェック
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    // その他のプライベートパスも同様に保護
    if (isAPIRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 管理画面へのアクセス制御
  if (isAdminPath) {
    // 認証済みかつ管理者かチェック
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
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
  // ただし、パスワードリセット関連のパス（/auth/confirm, /auth/update-password）は除外
  const isPasswordResetPath = pathname === '/auth/confirm' || pathname === '/auth/update-password'
  
  if (user && !isPasswordResetPath && (request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/login')) {
    console.log('🔀 [Middleware] 認証済みユーザーを自動リダイレクト', {
      from: request.nextUrl.pathname,
      to: '/dashboard',
      userEmail: user.email,
      timestamp: new Date().toISOString()
    });
    
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const response = NextResponse.redirect(url)
    // 認証状態変更時のキャッシュクリア
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - images and other static assets
     * Feel free to modify this pattern to include more paths.
     */
    // ルートパスと認証が必要なパスを処理、ランディングは引き続きバイパス
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|landing|landing/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
    // ルートパスを明示的に含める
    '/'
  ],
}
