// src/app/admin/page.tsx
'use client';

import { Users, MessageSquare, Edit, Flag, Server, ThumbsUp, FileText, FileBadge } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import React from 'react';

const AdminCard = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
  <Link href={href}>
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-brand-teal">
      <div className="flex items-center gap-4">
        <div className="bg-gray-100 p-3 rounded-full">
            <Icon className="h-6 w-6 text-brand-teal" />
        </div>
        <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);


const AdminDashboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-8 text-4xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard 
          href="/admin/users" 
          icon={Users} 
          title="Manage Users" 
          description="View, edit roles, and manage all users." 
        />
        <AdminCard 
          href="/admin/services" 
          icon={Server} 
          title="Approve Services" 
          description="Review and approve new service listings." 
        />
        <AdminCard 
          href="/admin/reviews" 
          icon={ThumbsUp} 
          title="Manage Reviews" 
          description="Approve new customer reviews." 
        />
        <AdminCard 
          href="/admin/profile-edits" 
          icon={Edit} 
          title="Profile Edits" 
          description="Approve requests for profile information changes." 
        />
        <AdminCard 
          href="/admin/reports" 
          icon={Flag} 
          title="View Reports" 
          description="Review user reports against services." 
        />
        <AdminCard 
          href="/admin/suggestions" 
          icon={MessageSquare} 
          title="User Suggestions" 
          description="View feedback and suggestions from users." 
        />
        <AdminCard 
          href="/admin/multiple-quote-requests" 
          icon={FileText} 
          title="Multiple Quote Requests" 
          description="Approve and manage multiple quote requests." 
        />
        <AdminCard 
          href="/admin/quotes" 
          icon={FileBadge} 
          title="Manage Quotes" 
          description="View all quotes sent between users and providers." 
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;