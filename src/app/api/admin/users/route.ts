// src/app/api/admin/users/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
    );

    // Fetch all users from the auth schema
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({ error: 'Failed to fetch users from auth: ' + authError.message }, { status: 500 });
    }

    // Fetch all profiles from the public schema
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profiles: ' + profileError.message }, { status: 500 });
    }

    const users = authData?.users || [];
    const profileList = profiles || [];

    // Combine the user and profile data
    const combinedData = users.map(user => {
      const profile = profileList.find(p => p.id === user.id);
      return {
        id: user.id,
        full_name: profile?.full_name || 'N/A',
        email: user.email,
        whatsapp: profile?.whatsapp || 'N/A',
        role: profile?.role || 'user',
      };
    });

    return NextResponse.json(combinedData);

  } catch (err: unknown) {
    const error = err as Error;
    // This outer catch is still useful for any completely unexpected errors
    console.error('An unexpected error occurred in the /api/admin/users route:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}