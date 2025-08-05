// src/app/status/[id]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { notFound } from 'next/navigation';
import StatusViewer from '@/components/StatusViewer';
import { Suspense } from 'react';
import Spinner from '@/components/ui/Spinner';

interface StatusPageProps {
  params: { id: string };
}

// This is now an async Server Component
const StatusPage = async ({ params }: StatusPageProps) => {
  const { id } = params;
  if (!id) {
    notFound();
  }

  const supabase = await createClient();
  const { data: status, error } = await supabase
    .from('status_updates')
    .select('*, profiles(full_name, id, business_name)')
    .eq('id', id)
    .single();

  if (error || !status) {
    notFound();
  }

  return (
    // Suspense can be used here for more granular loading states if needed
    <Suspense fallback={
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <Spinner />
        </div>
    }>
      <StatusViewer status={status} />
    </Suspense>
  );
};

export default StatusPage;