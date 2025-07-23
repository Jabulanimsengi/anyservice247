// src/components/ServiceCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge'; // Corrected import path

interface ServiceCardProps {
  id: number;
  providerId: string;
  imageUrl: string | null;
  title: string;
  providerName: string;
  rating: number;
  reviewCount: number;
  price: number;
  is_approved: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  providerId,
  imageUrl,
  title,
  providerName,
  rating,
  reviewCount,
  price,
  is_approved,
}) => {
  return (
    <div className="flex max-w-sm flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <Link href={`/service/${id}`} passHref>
        <div className="relative h-48 w-full cursor-pointer">
          <Image
            src={imageUrl || '/placeholder.png'}
            alt={`Image for ${title}`}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </Link>
      <div className="flex flex-grow flex-col p-5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold tracking-tight text-gray-900">
            <Link href={`/service/${id}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          {is_approved && <VerifiedBadge />}
        </div>
        
        <Link href={`/provider/${providerId}`} passHref>
          <p className="cursor-pointer text-sm text-blue-500 hover:underline">
            by {providerName}
          </p>
        </Link>

        <div className="mt-2.5 mb-5 flex items-center">
          <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
          <span className="ml-1 mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            {rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            R{Number(price).toFixed(2)}
          </span>
          <Link href={`/service/${id}`} passHref>
            <Button size="sm">View Service</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;