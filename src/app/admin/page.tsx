// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';

type Profile = {
  id: string;
  full_name: string;
  role: string;
  email: string;
  whatsapp: string;
};

const AdminUsersPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useStore();

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    
    const { data, error } = await supabase.rpc('get_all_users_with_details');

    // Updated error handling to be more specific
    if (error) {
        console.error("Error fetching profiles:", error);
        addToast(error.message || 'An unknown error occurred.', 'error');
    } else {
        setProfiles(data || []);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) {
        addToast(`Error updating role: ${error.message}`, 'error');
      } else {
        addToast('User role updated successfully!', 'success');
        fetchProfiles();
      }
    }
  };

  const handleDeleteUser = async (userId: string, fullName: string) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE the user "${fullName}"? This will also delete all of their services, bookings, and reviews. This action cannot be undone.`)) {
      addToast("User deletion should be handled via a secure server-side function.", 'error');
      console.log(`Request to delete user: ${userId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">WhatsApp</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.whatsapp || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {profile.role === 'user' ? (
                      <Button size="sm" variant="outline" onClick={() => handleRoleChange(profile.id, 'admin')}>
                        Make Admin
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleRoleChange(profile.id, 'user')}>
                        Make User
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(profile.id, profile.full_name)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;