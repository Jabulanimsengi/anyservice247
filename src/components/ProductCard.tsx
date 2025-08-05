// src/components/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const ProductCard = ({ product }: { product: { id: string; image_urls: string[] | null; name: string; stores: { name: string }; price: number } }) => {
  const displayImage = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/placeholder.png';

  return (
    <div className="group relative flex max-w-sm flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-brand-teal">
      <Link href={`/products/${product.id}`} passHref>
        <div className="relative h-48 w-full cursor-pointer overflow-hidden">
          <Image
            src={displayImage}
            alt={`Image for ${product.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="flex flex-grow flex-col p-4">
        <h3 className="text-md font-bold tracking-tight text-gray-900">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-500">
          Business: {product.stores.name}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            from R{Number(product.price).toFixed(2)}
          </span>
          <Link href={`/products/${product.id}`} passHref>
            <Button size="sm">View Product</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;