// src/components/ProductCardSkeleton.tsx
const ProductCardSkeleton = () => {
    return (
      <div className="max-w-sm rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="relative h-48 w-full animate-pulse bg-gray-200"></div>
        <div className="p-4">
          <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
          <div className="flex items-center justify-between">
            <div className="h-7 w-1/3 animate-pulse rounded bg-gray-200"></div>
            <div className="h-9 w-1/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProductCardSkeleton;