import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

// Edge Runtime対応のため、Node.js固有のAPIを使用しない
export const runtime = 'edge';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Allow access to public pages even without env vars
  const publicPaths = [
    "/landing",
    "/contact",
    "/auth/login",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/sign-up-success",
    "/auth/update-password",
    "/auth/confirm",
    "/auth/error",
    "/api/health",
    "/api/static-data"
  ];

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If the env vars are not set, only allow public paths
  if (!hasEnvVars) {
    if (!isPublicPath && request.nextUrl.pathname !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/landing";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  try {
    // セッションを確認（セキュリティ上の理由でgetUser()を使用）
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // refresh_token_not_foundエラーは一般的で、ログに出力しない
      if (error.message?.includes('Refresh Token Not Found') || error.code === 'refresh_token_not_found') {
        // エラーが発生した場合でも、パブリックパスは許可
        if (isPublicPath || request.nextUrl.pathname === "/") {
          return supabaseResponse;
        }
        // プライベートパスの場合はログインページにリダイレクト
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
      }
      
      // その他のエラーは開発環境でのみログ出力
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Session check error:', error);
      }
      
      // エラーが発生した場合でも、パブリックパスは許可
      if (isPublicPath || request.nextUrl.pathname === "/") {
        return supabaseResponse;
      }
      // プライベートパスの場合はログインページにリダイレクト
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    if (
      request.nextUrl.pathname !== "/" &&
      !user &&
      !isPublicPath
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

  } catch (error) {
    // 開発環境でのみログ出力
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Middleware error:', error);
    }
    
    // エラーが発生した場合でも、パブリックパスは許可
    if (isPublicPath || request.nextUrl.pathname === "/") {
      return supabaseResponse;
    }
    // プライベートパスの場合はログインページにリダイレクト
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
