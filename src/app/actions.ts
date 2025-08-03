// src/app/actions.ts
'use server';

import { createClient } from '@/lib/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReport(serviceId: number, reason: string) {
  const supabase = await createClient(); // Added await here
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to report a service.' };
  }

  const { error } = await supabase.from('reports').insert({ // This will now work
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