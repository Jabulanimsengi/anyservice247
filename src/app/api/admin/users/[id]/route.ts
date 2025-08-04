// src/app/api/admin/users/[id]/route.ts

import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const targetUserId = params.id;
  const { role: newRole } = await request.json();

  if (!targetUserId || !newRole) {
    return NextResponse.json({ error: 'User ID and new role are required.' }, { status: 400 });
  }

  // 1. Create a Supabase client to check the current user's session and role
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  if (!adminUser) {
    return NextResponse.json({ error: 'You must be logged in to perform this action.' }, { status: 401 });
  }

  // 2. Verify the current user is an admin
  const { data: adminProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminUser.id)
    .single();

  if (profileError || adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: You do not have permission.' }, { status: 403 });
  }

  // 3. Use a privileged client with the service_role key to perform the update
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId);

  if (updateError) {
    return NextResponse.json({ error: `Failed to update role: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: 'User role updated successfully.' });
}