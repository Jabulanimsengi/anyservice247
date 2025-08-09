// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import { supabase } from '@/lib/supabase';

type Role = 'user' | 'provider' | 'admin';

type Profile = {
  id: string;
  full_name: string;
  role: Role;
  email: string;
  whatsapp: string;
};

type MessageModalState = {
    isOpen: boolean;
    user: Profile | null;
};

const AdminUsersPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useStore();
  const [newRoles, setNewRoles] = useState<{ [key: string]: Role }>({});
  const [messageModal, setMessageModal] = useState<MessageModalState>({ isOpen: false, user: null });
  const [messageContent, setMessageContent] = useState('');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data.');
      }
      const data: Profile[] = await response.json();
      setProfiles(data);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error fetching profiles:", error.message);
      addToast(error.message || 'An unknown error occurred.', 'error');
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRoleSelection = (userId: string, newRole: Role) => {
    setNewRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to update role.');
        addToast('User role updated successfully!', 'success');
        fetchProfiles();
        setNewRoles(prev => {
            const next = {...prev};
            delete next[userId];
            return next;
        });
      } catch (err: unknown) {
        const error = err as Error;
        addToast(`Error updating role: ${error.message}`, 'error');
      }
    }
  };

  const handleDeleteUser = async (userId: string, fullName: string) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE the user "${fullName}"? This will remove their authentication and profile data.`)) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Authentication error. Please log in again.");

            const response = await supabase.functions.invoke('delete-user', {
                body: { userId },
            });

            if (response.error) throw response.error;
            
            addToast(`User "${fullName}" deleted successfully.`, 'success');
            fetchProfiles(); // Re-fetch the user list
        } catch (err: unknown) {
            const error = err as Error;
            addToast(`Error deleting user: ${error.message}`, 'error');
            console.error(error);
        }
    }
  };

  const handleSendMessage = async () => {
    if (!messageModal.user || !messageContent.trim()) {
        addToast('Please enter a message.', 'error');
        return;
    }

    const { error } = await supabase.from('notifications').insert({
        user_id: messageModal.user.id,
        message: messageContent,
        link: '/account/notifications',
    });

    if (error) {
        addToast(`Failed to send message: ${error.message}`, 'error');
    } else {
        addToast('Message sent successfully!', 'success');
        setMessageModal({ isOpen: false, user: null });
        setMessageContent('');
    }
  };

  return (
    <>
      <ConfirmActionModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ isOpen: false, user: null })}
        onConfirm={handleSendMessage}
        title={`Send Message to ${messageModal.user?.full_name}`}
        confirmButtonText="Send Message"
      >
        <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
        />
      </ConfirmActionModal>

      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">WhatsApp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Current Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.whatsapp || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{profile.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                          <select
                              value={newRoles[profile.id] || profile.role}
                              onChange={(e) => handleRoleSelection(profile.id, e.target.value as Role)}
                              className="block w-32 rounded-md border-gray-300 shadow-sm p-2 text-sm"
                          >
                              <option value="user">User</option>
                              <option value="provider">Provider</option>
                              <option value="admin">Admin</option>
                          </select>
                          <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(profile.id, newRoles[profile.id] || profile.role)}
                              disabled={!newRoles[profile.id] || newRoles[profile.id] === profile.role}
                          >
                              Save
                          </Button>
                          <Button size="sm" onClick={() => setMessageModal({ isOpen: true, user: profile })}>
                              Message
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(profile.id, profile.full_name)}>
                              Delete
                          </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsersPage;