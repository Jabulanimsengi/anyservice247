// src/components/ReportButton.tsx
'use client';

import { useState } from 'react';
import { submitReport } from '@/app/actions';
import { Button } from './ui/Button';
import { Flag } from 'lucide-react';
import { useStore } from '@/lib/store';
import ReportModal from './ReportModal'; // Import the new modal component

interface ReportButtonProps {
  serviceId: number;
  isLoggedIn: boolean;
}

const ReportButton: React.FC<ReportButtonProps> = ({ serviceId, isLoggedIn }) => {
  const { addToast } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReportClick = () => {
    if (!isLoggedIn) {
      addToast('Please sign in to report a service.', 'error');
      return;
    }
    setIsModalOpen(true);
  };

  const handleReportSubmit = async (reason: string) => {
    const result = await submitReport(serviceId, reason);
    if (result.error) {
      addToast(result.error, 'error');
    } else if (result.success) {
      addToast(result.success, 'success');
    }
  };

  return (
    <>
      <Button onClick={handleReportClick} variant="outline" size="lg" className="h-11 px-8">
        <Flag size={18} className="mr-2" />
        Report
      </Button>
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </>
  );
};

export default ReportButton;