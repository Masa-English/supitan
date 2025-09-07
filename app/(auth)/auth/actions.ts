'use server'

import { createClient as createServerClient } from '@/lib/api/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createServerClient()

  // type-cast since we know these exist
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth/error')
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createServerClient()

  // type-cast since we know these exist
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth/error')
  }

  redirect('/auth/sign-up-success')
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/')
} 