// src/components/MyPageFeed.tsx
'use client';

import { useState, useEffect } from 'react';
import { toggleStatusLike } from '@/app/actions';
import { Heart, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

type Status = { 
    id: number; 
    created_at: string; 
    image_urls: string[]; 
    caption: string | null; 
};
type Profile = { 
    business_name: string | null; 
    full_name: string; 
};
type LikeInfo = { 
    likeCount: number; 
    isLiked: boolean; 
};

// A new sub-component to handle the image carousel
const StatusImageCarousel = ({ imageUrls }: { imageUrls: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? imageUrls.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === imageUrls.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    if (!imageUrls || imageUrls.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full aspect-square bg-gray-100">
            {imageUrls.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={goToNext} className="absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {currentIndex + 1} / {imageUrls.length}
                    </div>
                </>
            )}
            <Image 
                src={imageUrls[currentIndex]}
                alt={'Status update image'}
                fill
                className="object-contain" // Changed from object-cover to prevent zooming
            />
        </div>
    );
};


export default function MyPageFeed({ statuses, profile, initialLikes }: { statuses: Status[], profile: Profile, initialLikes: Record<number, LikeInfo> }) {
    const [likes, setLikes] = useState(initialLikes);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLike = async (statusId: number) => {
        setLikes(currentLikes => {
            const current = currentLikes[statusId] || { likeCount: 0, isLiked: false };
            return {
                ...currentLikes,
                [statusId]: {
                    likeCount: current.isLiked ? current.likeCount - 1 : current.likeCount + 1,
                    isLiked: !current.isLiked
                }
            };
        });

        await toggleStatusLike(statusId);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {statuses.length > 0 ? (
                statuses.map(status => {
                    const likeInfo = likes[status.id] || { likeCount: 0, isLiked: false };
                    return (
                        <div key={status.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                            <div className="p-4 border-b">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                                    <div>
                                        <p className="font-bold text-gray-900">{profile.business_name || profile.full_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {isClient ? new Date(status.created_at).toLocaleString() : ''}
                                        </p>
                                    </div>
                                </div>
                                {status.caption && <p className="mt-3 text-gray-700">{status.caption}</p>}
                            </div>
                            
                            <StatusImageCarousel imageUrls={status.image_urls} />

                            <div className="flex justify-around p-2 border-t text-gray-600">
                                <button
                                    onClick={() => handleLike(status.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Heart size={20} className={likeInfo.isLiked ? 'text-red-500 fill-current' : ''} />
                                    <span className="text-sm">{likeInfo.likeCount} Likes</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <MessageSquare size={20} />
                                    <span className="text-sm">Comment</span>
                                </button>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-md border">
                    <p className="text-gray-500">This provider hasn't posted any work yet.</p>
                </div>
            )}
        </div>
    );
}