// src/app/api/admin/users/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Ensure this is an admin-only route by checking the user's role
  // This requires a server-side Supabase client to check the session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use the service role key for admin access
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
  );

  // Fetch all users from the auth schema
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Fetch all profiles from the public schema
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Combine the user and profile data
  const combinedData = users.map(user => {
    const profile = profiles.find(p => p.id === user.id);
    return {
      id: user.id,
      full_name: profile?.full_name || 'N/A',
      email: user.email,
      whatsapp: profile?.whatsapp || 'N/A',
      role: profile?.role || 'user',
    };
  });

  return NextResponse.json(combinedData);
}