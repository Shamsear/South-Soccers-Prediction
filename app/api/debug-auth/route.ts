import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return NextResponse.json({
      authenticated: !!user,
      userId: user?.id,
      email: user?.email,
      error: error?.message,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check auth',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
