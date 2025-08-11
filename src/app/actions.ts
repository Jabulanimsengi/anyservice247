// src/app/actions.ts
'use server';

import { createClient as createServerClientUtil } from '@/lib/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

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
    
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const { data: status } = await supabase.from('status_updates').select('provider_id').eq('id', statusId).single();

    const isOwner = status?.provider_id === user.id;
    const isAdmin = adminProfile?.role === 'admin';

    if (!isOwner && !isAdmin) {
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
    revalidatePath('/account/provider/statuses');
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

export async function deleteJobPost(postId: string) {
    const supabase = await createServerClientUtil();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to delete a job post.' };
    }

    const { error: proposalError } = await supabase
        .from('job_proposals')
        .delete()
        .eq('post_id', postId);

    if (proposalError) {
        console.error('Error deleting proposals:', proposalError);
        return { error: `Failed to clean up job proposals: ${proposalError.message}` };
    }

    const { error: postError } = await supabase
        .from('job_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

    if (postError) {
        console.error('Error deleting job post:', postError);
        return { error: `Failed to delete job post: ${postError.message}` };
    }
    
    revalidatePath('/account/my-posts');
    redirect('/account/my-posts');
}

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

    const { error: updateError } = await supabase
        .from('job_proposals')
        .update({ status: decision })
        .eq('id', proposalId)
        .eq('post_id', postId);

    if (updateError) {
        console.error('Proposal update error:', updateError);
        return { error: 'Failed to update proposal status.' };
    }

    if (decision === 'approved') {
        await supabase
            .from('job_posts')
            .update({ winning_proposal_id: proposalId, status: 'closed' })
            .eq('id', postId);

        await supabase
            .from('job_proposals')
            .update({ status: 'rejected' })
            .eq('post_id', postId)
            .neq('id', proposalId)
            .eq('status', 'pending');

        await supabase.from('bookings').insert({
            user_id: user.id,
            provider_id: providerId,
            status: 'confirmed',
            quote_description: `Job from post: "${jobTitle}"`,
        });
    }

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

export async function toggleStatusLike(statusId: number) {
    const supabase = await createServerClientUtil();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to like a post.' };
    }

    const { data: existingLike, error: fetchError } = await supabase
        .from('status_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('status_id', statusId)
        .maybeSingle();

    if (fetchError) {
        return { error: 'Database error.' };
    }

    if (existingLike) {
        const { error: deleteError } = await supabase.from('status_likes').delete().eq('id', existingLike.id);
        if (deleteError) return { error: 'Failed to unlike post.' };
        return { success: true, liked: false };
    } else {
        const { error: insertError } = await supabase.from('status_likes').insert({ user_id: user.id, status_id: statusId });
        if (insertError) return { error: 'Failed to like post.' };
        return { success: true, liked: true };
    }
}

export async function updateCoverImage(formData: FormData) {
    const supabase = await createServerClientUtil();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to update your cover image.' };
    }

    const coverImageFile = formData.get('cover_image') as File;

    if (!coverImageFile || coverImageFile.size === 0) {
        return { error: 'No file selected.' };
    }

    const filePath = `${user.id}/cover-${Date.now()}`;

    const { error: uploadError } = await supabase.storage
        .from('cover-images')
        .upload(filePath, coverImageFile);

    if (uploadError) {
        console.error('Cover image upload error:', uploadError);
        return { error: 'Failed to upload image.' };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('cover-images')
        .getPublicUrl(filePath);

    if (!publicUrl) {
        return { error: 'Failed to get public URL for the image.' };
    }

    const { error: dbError } = await supabase
        .from('profiles')
        .update({ cover_image_url: publicUrl })
        .eq('id', user.id);

    if (dbError) {
        console.error('Database update error:', dbError);
        return { error: 'Failed to update profile with new cover image.' };
    }

    revalidatePath(`/mypage/${user.id}`);
    revalidatePath(`/account/provider/edit-profile`);
    return { success: 'Cover image updated successfully!' };
}

export async function createLead(formData: FormData) {
    const supabase = await createServerClientUtil();

    const leadData = {
        service_query: formData.get('service') as string,
        location_province: formData.get('province') as string,
        location_city: formData.get('city') as string,
        contact_number: formData.get('contact_number') as string,
    };

    if (!leadData.service_query) {
        return { error: 'Service query is missing.' };
    }
    
    if (!leadData.contact_number) {
        return { error: 'Contact number is required.' };
    }

    const { error } = await supabase.from('leads').insert(leadData);

    if (error) {
        console.error('Error creating lead:', error);
        return { error: 'Could not save your request. Please try again.' };
    }

    return { success: true };
}