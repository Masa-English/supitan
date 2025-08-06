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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // パブリックパスの定義
  const publicPaths = [
    '/auth',
    '/landing',
    '/contact',
    '/faq',
    '/',
    '/api/health',
    '/api/static-data',
    '/api/data',
    '/api/audio',
    '/api/revalidate',
    '/api/contact',
    '/favicon.ico',
    '/manifest.json',
  ]

  // 現在のパスがパブリックパスかどうかをチェック
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path) || 
    request.nextUrl.pathname === path
  )

  // デバッグ用ログ（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${request.nextUrl.pathname}`)
    console.log(`[Middleware] User: ${user ? 'authenticated' : 'not authenticated'}`)
    console.log(`[Middleware] IsPublicPath: ${isPublicPath}`)
    if (error) {
      console.log(`[Middleware] Auth error:`, error)
    }
  }

  // 認証エラーがある場合の処理
  if (error) {
    console.error('Middleware auth error:', error)
    
    // パブリックパスでない場合はランディングページにリダイレクト
    if (!isPublicPath) {
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
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return NextResponse.redirect(url)
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
