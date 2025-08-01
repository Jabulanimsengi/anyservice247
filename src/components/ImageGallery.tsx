// src/components/ImageGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    imageUrls: string[] | null;
    itemName: string;
}

const ImageGallery = ({ imageUrls, itemName }: ImageGalleryProps) => {
    const images = imageUrls && imageUrls.length > 0 ? imageUrls : ['/placeholder.png'];
    const [mainImage, setMainImage] = useState<string>(images[0]);

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
            {/* Thumbnails */}
            <div className="flex flex-row md:flex-col gap-3">
                {images.map((url: string, index: number) => (
                    <div 
                        key={index} 
                        className={`relative h-16 w-16 cursor-pointer border-2 rounded-md overflow-hidden hover:border-brand-teal
                                    ${mainImage === url ? 'border-brand-teal' : 'border-gray-200'}`} 
                        onClick={() => setMainImage(url)}
                    >
                        <Image
                            src={url}
                            alt={`${itemName} thumbnail ${index + 1}`}
                            fill
                            sizes="64px"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
            {/* Main Image */}
            <div className="relative flex-1 w-full h-80 md:h-[450px] border rounded-lg overflow-hidden">
                <Image
                    src={mainImage}
                    alt={itemName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                />
            </div>
        </div>
    );
};

export default ImageGallery;