// src/app/admin/reports/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

type Report = {
  id: number;
  created_at: string;
  reason: string;
  reporter_id: string;
  service_id: number;
  services: {
    title: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
};

const AdminReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        created_at,
        reason,
        reporter_id,
        service_id,
        services (title),
        profiles (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
    } else {
      setReports(data as any[] || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Reports</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Reported by: <span className="font-medium text-gray-700">{report.profiles?.full_name ?? 'Anonymous'}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Service: <Link href={`/service/${report.service_id}`} className="font-medium text-blue-600 hover:underline">{report.services?.title ?? 'N/A'}</Link>
                  </p>
                  <p className="text-xs text-gray-400">{new Date(report.created_at).toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-3 text-gray-700">{report.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;