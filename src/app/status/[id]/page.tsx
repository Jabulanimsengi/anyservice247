// src/app/status/[id]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import BackButton from '@/components/BackButton';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface StatusPageProps {
  params: Promise<{ id: string }>; // The type indicates params is a Promise
}

const StatusPage = async ({ params }: StatusPageProps) => {
  const { id } = await params; // Correctly await the params object here
  if (!id) notFound();

  const supabase = await createClient();
  const { data: status, error } = await supabase
    .from('status_updates')
    .select('*, profiles(full_name, id)')
    .eq('id', id)
    .single();

  if (error || !status) {
    notFound();
  }

  const provider = status.profiles as any;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BackButton />
      <div className="mt-4">
        <div className="mb-6">
            <Link href={`/provider/${provider.id}`}>
                <h1 className="text-2xl font-bold hover:underline">{provider.full_name}'s Work</h1>
            </Link>
            <p className="text-sm text-gray-500">
                Posted on {new Date(status.created_at).toLocaleDateString()}
            </p>
        </div>

        {status.caption && (
            <p className="mb-6 text-gray-700 whitespace-pre-wrap">{status.caption}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(status.image_urls as string[]).map((url, index) => (
                <div key={index} className="relative aspect-square w-full overflow-hidden rounded-lg border">
                    <Image
                        src={url}
                        alt={`Status image ${index + 1}`}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                    />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StatusPage;