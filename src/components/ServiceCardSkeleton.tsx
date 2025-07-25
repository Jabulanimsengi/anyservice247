// src/components/ServiceCardSkeleton.tsx

const ServiceCardSkeleton = () => {
  return (
    <div className="max-w-sm rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="relative h-48 w-full bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        {/* Title Placeholder */}
        <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse mb-2"></div>
        {/* Provider Name Placeholder */}
        <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse mb-4"></div>
        {/* Rating Placeholder */}
        <div className="flex items-center mb-4">
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse"></div>
        </div>
        {/* Price and Button Placeholder */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-1/3 rounded bg-gray-200 animate-pulse"></div>
          <div className="h-9 w-1/4 rounded bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCardSkeleton;