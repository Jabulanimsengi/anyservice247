// src/components/StatusFeed.tsx
import { createClient } from '@/lib/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

const StatusFeed = async () => {
  const supabase = await createClient(); // Correctly await the client
  const { data: statuses, error } = await supabase
    .from('status_updates')
    .select('*, profiles(full_name, id)')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error || !statuses || statuses.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Recent Work</h2>
        <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            {statuses.map((status: any) => (
                <Link key={status.id} href={`/status/${status.id}`}>
                    <div className="flex-shrink-0 w-24 text-center cursor-pointer group">
                        <div className="relative h-24 w-24 rounded-full border-2 border-brand-teal p-1 transition-transform group-hover:scale-105">
                            {status.image_urls && status.image_urls.length > 0 && (
                                <Image
                                    src={status.image_urls[0]}
                                    alt={status.caption || 'Status update'}
                                    fill
                                    sizes="96px"
                                    className="object-cover rounded-full"
                                />
                            )}
                        </div>
                        <p className="text-xs mt-2 font-semibold truncate group-hover:underline">{status.profiles.full_name}</p>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  );
};

export default StatusFeed;