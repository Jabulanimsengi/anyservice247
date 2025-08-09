// src/components/ImageGallery.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
    imageUrls: string[] | null;
    itemName: string;
}

const ImageGallery = ({ imageUrls, itemName }: ImageGalleryProps) => {
    const images = imageUrls && imageUrls.length > 0 ? imageUrls : ['/placeholder.png'];
    const [mainImage, setMainImage] = useState<string>(images[0]);
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
        <div className="flex flex-col-reverse md:flex-row gap-4 items-start w-full group">
            {/* --- THUMBNAILS --- */}
            <div className="relative w-full md:w-auto">
                {/* Left Arrow - Visible only on mobile/hover */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white disabled:opacity-0 md:hidden"
                >
                    <ChevronLeft size={24} />
                </button>

                <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
                    <div className="flex flex-row md:flex-col gap-3 w-max md:w-auto">
                        {images.map((url: string, index: number) => (
                            <div
                                key={index}
                                className={`relative h-20 w-20 flex-shrink-0 cursor-pointer border-2 rounded-md overflow-hidden hover:border-brand-teal
                                            ${mainImage === url ? 'border-brand-teal' : 'border-gray-200'}`}
                                onClick={() => setMainImage(url)}
                            >
                                <Image
                                    src={url}
                                    alt={`${itemName} - image ${index + 1}`}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Arrow - Visible only on mobile/hover */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white disabled:opacity-0 md:hidden"
                >
                    <ChevronRight size={24} />
                </button>
            </div>


            {/* --- MAIN IMAGE --- */}
            <div className="relative flex-1 w-full aspect-square md:aspect-auto md:h-[450px] border rounded-lg overflow-hidden">
                <Image
                    src={mainImage}
                    alt={itemName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
};

export default ImageGallery;