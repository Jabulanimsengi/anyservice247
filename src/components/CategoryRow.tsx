// src/components/CategoryRow.tsx
'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from './ServiceCard';

type ServiceLocation = {
  province: string;
  city: string;
};

type Service = {
  id: number;
  title: string;
  price: number;
  call_out_fee: number; // Added
  user_id: string;
  image_urls: string[] | null;
  status: string;
  locations: ServiceLocation[] | null;
  provider_name: string;
  average_rating: number;
  review_count: number;
  category: string;
  availability: any; // Added
};

interface CategoryRowProps {
  category: string;
  services: Service[];
}

const CategoryRow: React.FC<CategoryRowProps> = ({ category, services }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 bg-gray-200 p-2 rounded-md">
        <a href={`/search?category=${encodeURIComponent(category)}`} className="text-2xl font-bold hover:underline">{category}</a>
        <a href={`/search?category=${encodeURIComponent(category)}`} className="text-sm text-brand-teal hover:underline font-semibold">View All</a>
      </div>
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white disabled:opacity-0"
        >
          <ChevronLeft size={24} />
        </button>
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
        >
          {services.map((service) => (
            <div key={service.id} className="flex-shrink-0 w-64 sm:w-72">
              <ServiceCard
                id={service.id}
                providerId={service.user_id}
                title={service.title}
                providerName={service.provider_name ?? 'Anonymous'}
                rating={service.average_rating}
                reviewCount={service.review_count}
                price={service.price}
                call_out_fee={service.call_out_fee} // Added this line
                imageUrls={service.image_urls}
                status={service.status}
                locations={service.locations}
                availability={service.availability} // Added this line
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white disabled:opacity-0"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default CategoryRow;