// src/components/ExpandableSection.tsx
'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-lg"
      >
        <span>{title}</span>
        {isOpen ? <Minus size={20} /> : <Plus size={20} />}
      </button>
      {isOpen && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableSection;