// src/app/products/page.tsx
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Suspense } from 'react';
import BackButton from '@/components/BackButton';

export const dynamic = 'force-dynamic';

const ProductGrid = async () => {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      stores ( name )
    `);

  if (error) {
    console.error("Error fetching products:", error.message);
    return <p className="text-center text-red-500">Failed to load products.</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center text-gray-500">No products have been listed yet.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);


const ProductsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">Browse Products</h1>
        <p className="mb-8 text-lg text-gray-600">Find the tools and materials you need for your next job.</p>
        
        {/* New Informational Section */}
        <div className="mb-12 rounded-lg border-2 border-dashed border-brand-blue bg-blue-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-brand-dark">Building a Marketplace for the Pros</h2>
          <p className="mt-4 max-w-3xl mx-auto text-gray-700">
            Our products section is growing! We are actively working to partner with reputable hardware stores and national suppliers to bring you a comprehensive marketplace.
            <br /><br />
            Soon, you'll be able to source high-quality tools and materials directly through our platform, often at exclusive, competitive prices. Our mission is to equip you for success, making it easier and more affordable to run your business and deliver exceptional quality work to your clients.
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
};

export default ProductsPage;