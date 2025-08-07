// src/app/actions.ts
'use server';

import { createClient as createServerClientUtil } from '@/lib/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';

type ProfileUpdateRequest = {
  id: string;
  user_id: string;
  new_data: {
    business_name?: string;
    registration_number?: string;
    office_email?: string;
    whatsapp?: string;
    location?: string;
  };
};

export async function submitReport(serviceId: number, reason: string) {
    const supabase = await createServerClientUtil();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to submit a report.' };
    }

    const { error } = await supabase.from('reports').insert({
        service_id: serviceId,
        reporter_id: user.id,
        reason: reason,
    });

    if (error) {
        return { error: `Failed to submit report: ${error.message}` };
    }

    return { success: 'Report submitted successfully. Thank you for your feedback.' };
}

export async function handleProfileUpdateApproval(request: ProfileUpdateRequest, newStatus: 'approved' | 'rejected') {
    const supabase = await createServerClientUtil();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: 'Authentication error.' };
    }

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') {
        return { error: 'Forbidden: You do not have permission.' };
    }

    if (newStatus === 'approved') {
        const { error: updateError } = await supabase
            .from('profiles')
            .update(request.new_data)
            .eq('id', request.user_id);

        if (updateError) {
            return { error: `Failed to update profile: ${updateError.message}` };
        }
    }

    const { error: requestStatusError } = await supabase
        .from('profile_update_requests')
        .update({ status: newStatus })
        .eq('id', request.id);

    if (requestStatusError) {
        return { error: `Failed to update request status: ${requestStatusError.message}` };
    }

    revalidatePath('/admin/profile-edits');
    return { success: `Request has been ${newStatus}.` };
}

export async function deleteStatus(statusId: number, imageUrls: string[]) {
    const supabase = await createServerClientUtil();

    // 1. Check if the current user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in to perform this action.' };
    }
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (adminProfile?.role !== 'admin') {
        return { error: 'Forbidden: You do not have permission.' };
    }

    // 2. Delete the images from storage
    if (imageUrls && imageUrls.length > 0) {
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const fileNames = imageUrls.map(url => {
            const parts = url.split('/');
            // This logic assumes the file path in storage is the last two segments of the public URL
            return parts.slice(parts.length - 2).join('/'); 
        });
        
        const { error: storageError } = await supabaseAdmin.storage
            .from('status-images') // Make sure this is your correct bucket name
            .remove(fileNames);

        if (storageError) {
            console.error('Storage Error:', storageError.message);
            // We can proceed even if storage deletion fails, to ensure the status is removed from the UI
        }
    }
    
    // 3. Delete the status record from the database
    const { error: dbError } = await supabase
        .from('status_updates')
        .delete()
        .eq('id', statusId);

    if (dbError) {
        return { error: `Failed to delete status: ${dbError.message}` };
    }

    // 4. Revalidate the path to update the UI
    revalidatePath('/admin/statuses');
    return { success: 'Status deleted successfully!' };
}
