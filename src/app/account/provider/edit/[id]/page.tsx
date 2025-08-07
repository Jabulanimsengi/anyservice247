// src/app/account/provider/edit/[id]/page.tsx

import { createClient } from '@/lib/utils/supabase/server';
import { notFound } from 'next/navigation';
import EditServiceForm from '@/components/EditServiceForm';

// Define the props for the Server Component page
interface EditServicePageProps {
  params: { id: string };
}

// This is an async Server Component that fetches data.
export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = params;
  const supabase = await createClient();

  // Fetch the service data on the server
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  // Handle cases where the service is not found
  if (error || !service) {
    notFound();
  }

  // Render the Client Component and pass the fetched data as a prop.
  return <EditServiceForm initialData={service} />;
}