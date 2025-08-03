// src/components/ReportButton.tsx
'use client';

import { submitReport } from '@/app/actions';
import { Button } from './ui/Button';
import { Flag } from 'lucide-react';
import { useStore } from '@/lib/store';

interface ReportButtonProps {
  serviceId: number;
  isLoggedIn: boolean;
}

const ReportButton: React.FC<ReportButtonProps> = ({ serviceId, isLoggedIn }) => {
  const { addToast } = useStore();

  const handleReportClick = async () => {
    if (!isLoggedIn) {
      addToast('Please sign in to report a service.', 'error');
      return;
    }
    
    const reason = prompt("Please provide a reason for reporting this service:");
    if (reason) {
      const result = await submitReport(serviceId, reason);
      if (result.error) {
        addToast(result.error, 'error');
      } else if (result.success) {
        addToast(result.success, 'success');
      }
    }
  };

  return (
    <Button onClick={handleReportClick} variant="outline" size="lg" className="h-11 px-8">
      <Flag size={18} className="mr-2" />
      Report
    </Button>
  );
};

export default ReportButton;