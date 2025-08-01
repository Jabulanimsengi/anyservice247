// src/app/products/page.tsx
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Suspense } from 'react';

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
      <h1 className="mb-6 text-3xl font-bold">Browse Products</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
};

export default ProductsPage;