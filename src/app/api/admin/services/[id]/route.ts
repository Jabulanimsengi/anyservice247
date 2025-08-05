// src/app/api/admin/services/[id]/route.ts

import { createClient } from '@/lib/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;
    const { status, rejection_reason } = await request.json();

    if (!serviceId || !status) {
      return NextResponse.json({ error: 'Service ID and status are required.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser();

    if (userError || !adminUser) {
      return NextResponse.json({ error: 'Authentication failed. Please log in again.' }, { status: 401 });
    }

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single();

    if (profileError || adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to perform this action.' }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updateData: { status: string; rejection_reason?: string | null } = { status };
    if (status === 'rejected') {
        updateData.rejection_reason = rejection_reason;
    }

    const { error: updateError } = await supabaseAdmin
      .from('services')
      .update(updateData)
      .eq('id', serviceId);

    if (updateError) {
      return NextResponse.json({ error: `Database update failed: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Service status updated successfully.' });

  } catch (err: unknown) {
    const error = err as Error;
    console.error("Critical error in PATCH /api/admin/services/[id]:", error);
    return NextResponse.json({ error: 'An unexpected server error occurred.', details: error.message }, { status: 500 });
  }
}