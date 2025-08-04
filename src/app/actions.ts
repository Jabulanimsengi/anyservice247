// src/app/actions.ts
'use server';

import { createClient as createServerClientUtil } from '@/lib/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function submitReport(serviceId: number, reason: string) {
  const supabase = await createServerClientUtil();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to report a service.' };
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    service_id: serviceId,
    reason: reason,
  });

  if (error) {
    return { error: 'Failed to submit report. Please try again.' };
  }

  revalidatePath(`/service/${serviceId}`);
  return { success: 'Report submitted successfully!' };
}

interface ProfileUpdateRequest {
    id: string;
    user_id: string;
    new_data: Record<string, unknown>;
}

export async function handleProfileUpdateApproval(request: ProfileUpdateRequest, newStatus: 'approved' | 'rejected') {
    // This client is for checking the current user's permissions
    const supabase = await createServerClientUtil();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in to perform this action.' };
    }

    const { data: adminProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (profileError || adminProfile?.role !== 'admin') {
        return { error: 'Forbidden: You do not have permission.' };
    }

    // Create a privileged admin client to bypass RLS for the update
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    // 1. If approved, update the main profiles table using the admin client
    if (newStatus === 'approved') {
        const { error: updateProfileError } = await supabaseAdmin
            .from('profiles')
            .update(request.new_data)
            .eq('id', request.user_id);
        
        if (updateProfileError) {
            return { error: `Error updating profile: ${updateProfileError.message}` };
        }
    }

    // 2. Update the status of the request itself
    const { error: updateRequestError } = await supabaseAdmin
        .from('profile_update_requests')
        .update({ status: newStatus })
        .eq('id', request.id);

    if (updateRequestError) {
        return { error: `Error updating request status: ${updateRequestError.message}` };
    }

    // 3. Send notification to the user
    const { error: notificationError } = await supabaseAdmin.from('notifications').insert({
        user_id: request.user_id,
        message: `Your profile update request has been ${newStatus}.`,
        link: '/account/provider/edit-profile',
    });

    if (notificationError) {
        // Log this error but don't block the success response
        console.error("Failed to send notification:", notificationError.message);
    }
    
    // 4. Revalidate paths to show updated data across the site
    if (newStatus === 'approved') {
        revalidatePath('/');
        revalidatePath('/explore');
        revalidatePath('/search');
        revalidatePath('/likes');
        revalidatePath(`/provider/${request.user_id}`);
    }

    return { success: `Profile changes have been ${newStatus}.` };
}