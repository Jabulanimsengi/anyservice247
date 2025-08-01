// src/app/products/[id]/page.tsx
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import ImageGallery from '@/components/ImageGallery'; // Use the new reusable component
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { id: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { id } = params;

  const { data: product, error } = await supabase
    .from('products')
    .select(`*, stores ( * )`)
    .eq('id', id)
    .single();

  if (error || !product) {
    return <div className="text-center py-12">Product not found.</div>;
  }
  
  const store = product.stores;

  return (
    <div className="bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-8">
        <BackButton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-4">
            
            <ImageGallery imageUrls={product.image_urls} itemName={product.name} />

            <div className="flex flex-col">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{product.name}</h1>
                
                {store && (
                    <Link href={`/provider/${store.user_id}`} className="text-lg text-blue-600 hover:underline mt-1">
                        Sold by {store.name}
                    </Link>
                )}
                
                <div className="my-6 border-t"></div>
                
                <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold">About this product</h2>
                    <p>{product.description || 'No description provided.'}</p>
                </div>

                <div className="mt-auto pt-8">
                     <p className="text-lg text-gray-500">
                        from <span className="text-4xl font-bold text-gray-900">R{Number(product.price).toFixed(2)}</span>
                    </p>
                    <Button size="lg" className="w-full mt-4">Add to Cart</Button>
                </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default ProductPage;