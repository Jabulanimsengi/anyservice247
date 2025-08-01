// src/components/ui/Spinner.tsx

const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div
      className="w-8 h-8 border-4 border-gray-200 border-t-brand-teal rounded-full animate-spin"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

export default Spinner;