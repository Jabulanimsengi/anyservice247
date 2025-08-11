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

    if (imageUrls && imageUrls.length > 0) {
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const fileNames = imageUrls.map(url => {
            const parts = url.split('/');
            return parts.slice(parts.length - 2).join('/'); 
        });
        
        const { error: storageError } = await supabaseAdmin.storage
            .from('status-images')
            .remove(fileNames);

        if (storageError) {
            console.error('Storage Error:', storageError.message);
        }
    }
    
    const { error: dbError } = await supabase
        .from('status_updates')
        .delete()
        .eq('id', statusId);

    if (dbError) {
        return { error: `Failed to delete status: ${dbError.message}` };
    }

    revalidatePath('/admin/statuses');
    return { success: 'Status deleted successfully!' };
}

export async function deleteService(serviceId: number, imageUrls: string[] | null) {
    const supabase = await createServerClientUtil();

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

    if (imageUrls && imageUrls.length > 0) {
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const filePaths = imageUrls.map(url => {
            const parts = url.split('/service-images/');
            return parts.length > 1 ? parts[1] : '';
        }).filter(path => path);

        if (filePaths.length > 0) {
            const { error: storageError } = await supabaseAdmin.storage
                .from('service-images')
                .remove(filePaths);

            if (storageError) {
                console.error('Storage Error:', storageError.message);
            }
        }
    }
    
    const { error: dbError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

    if (dbError) {
        return { error: `Failed to delete service: ${dbError.message}` };
    }

    revalidatePath('/admin/services');
    return { success: 'Service deleted successfully!' };
}

// --- NEW ROBUST ACTION FOR HANDLING QUOTE DECISIONS ---
export async function handleQuoteDecisionAction(formData: FormData) {
    'use server';
    const proposalId = formData.get('proposalId') as string;
    const decision = formData.get('decision') as 'approved' | 'rejected';
    const providerId = formData.get('providerId') as string;
    const postId = formData.get('postId') as string;
    const jobTitle = formData.get('jobTitle') as string;

    const supabase = await createServerClientUtil();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in.');
    }

    // 1. Update the status of the specific proposal
    const { error: updateError } = await supabase
        .from('job_proposals')
        .update({ status: decision })
        .eq('id', proposalId)
        .eq('post_id', postId);

    if (updateError) {
        console.error('Proposal update error:', updateError);
        return { error: 'Failed to update proposal status.' };
    }

    // 2. If approved, update the main job post and reject others
    if (decision === 'approved') {
        // Mark the winning proposal on the job post
        await supabase
            .from('job_posts')
            .update({ winning_proposal_id: proposalId, status: 'closed' })
            .eq('id', postId);

        // Reject all other pending proposals for this job
        await supabase
            .from('job_proposals')
            .update({ status: 'rejected' })
            .eq('post_id', postId)
            .neq('id', proposalId)
            .eq('status', 'pending');
    }

    // 3. Send a notification to the provider
    let notificationMessage = `Your quote for "${jobTitle}" has been ${decision}.`;
    if (decision === 'approved') {
        notificationMessage += ' Please contact the user via Messages to arrange a final assessment.';
    }

    await supabase.from('notifications').insert({
        user_id: providerId,
        message: notificationMessage,
        link: `/jobs/${postId}`
    });
    
    revalidatePath(`/account/my-posts/${postId}`);
    return { success: `Proposal has been ${decision}.` };
}