// src/components/ui/VerifiedBadge.tsx
import { ShieldCheck } from 'lucide-react';

const VerifiedBadge = () => {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-brand-blue">
      <ShieldCheck size={14} />
      <span>Verified</span>
    </div>
  );
};

export default VerifiedBadge;