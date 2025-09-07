import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const headersList = await headers();
    
    // リクエストボディを取得
    const body = await request.json();
    const { name, email, subject, message, category } = body;

    // バリデーション
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'お名前は必須です' },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'メールアドレスは必須です' },
        { status: 400 }
      );
    }

    if (!subject?.trim()) {
      return NextResponse.json(
        { error: '件名は必須です' },
        { status: 400 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'メッセージは必須です' },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: 'メッセージは10文字以上で入力してください' },
        { status: 400 }
      );
    }

    if (!category || !['general', 'bug_report', 'feature_request', 'support', 'other'].includes(category)) {
      return NextResponse.json(
        { error: '有効なカテゴリーを選択してください' },
        { status: 400 }
      );
    }

    // ユーザー情報を取得（エラーハンドリング付き）
    let user = null;
    try {
      const { data: { user: userData }, error } = await supabase.auth.getUser();
      if (!error && userData) {
        user = userData;
      }
           } catch {
         // セッションエラーは静かに処理
         console.debug('Session check skipped for contact POST API');
       }

    // IPアドレスを取得
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // ユーザーエージェントを取得
    const userAgent = headersList.get('user-agent') || 'unknown';

    // お問い合わせをデータベースに保存
    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        category,
        user_id: user?.id || null,
        priority: category === 'bug_report' ? 'high' : 'normal',
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('お問い合わせ保存エラー:', error);
      return NextResponse.json(
        { error: 'お問い合わせの保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'お問い合わせを送信しました',
        id: data.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('お問い合わせAPIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // 認証チェック（エラーハンドリング付き）
    let user = null;
    try {
      const { data: { user: userData }, error: authError } = await supabase.auth.getUser();
      if (!authError && userData) {
        user = userData;
      }
           } catch {
         // セッションエラーは静かに処理
         console.debug('Session check skipped for contact API');
       }
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 管理者権限チェック（adminsテーブル基準）
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // クエリを構築
    let query = supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('お問い合わせ取得エラー:', error);
      return NextResponse.json(
        { error: 'お問い合わせの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('お問い合わせ取得APIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 