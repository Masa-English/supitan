import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/api/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // パスワードリセット（recovery）の場合は専用ページにリダイレクト
      // ユーザーは既に認証済みなので、パスワード更新フォームを表示
      if (type === 'recovery') {
        redirect('/auth/update-password')
      }
      // その他の認証タイプ（email確認など）は指定されたページへ
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/auth/error')
}
