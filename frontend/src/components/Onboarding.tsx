import { useState, useEffect } from 'react';
import { User, Users, BarChart3, Loader, Plus, Shield, ShieldOff, Lock } from 'lucide-react';
import { showToast } from '../utils/toast';

export default function Onboarding() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form state
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('Dispatcher');
  const [newPassword, setNewPassword] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const tenantId = localStorage.getItem('tenantId');

  useEffect(() => {
    if (tenantId) {
      fetchTelemetry();
      fetchUsers();
    }
  }, [tenantId]);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/telemetry`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': tenantId || ''
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTelemetry(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': tenantId || ''
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId || '',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ email: userEmail, password: userPassword, role: userRole })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`User created successfully!`, 'success');
        setUserEmail('');
        setUserPassword('');
        setShowCreateModal(false);
        fetchUsers();
        fetchTelemetry(); // Refresh counts
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to create user.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': tenantId || ''
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`User status updated to ${newStatus}`, 'success');
        fetchUsers();
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update status.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': tenantId || ''
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (res.ok) {
        showToast('Password updated successfully!', 'success');
        setNewPassword('');
        setShowPasswordModal(false);
        setSelectedUser(null);
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update password.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-8 h-8 text-purple-600" />
          Staff Management
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Onboard Staff
        </button>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card flex items-center justify-between p-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Staff</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{telemetry?.totalUsers || 0}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="card flex items-center justify-between p-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Orders</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{telemetry?.totalOrders || 0}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Onboarded Staff</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus(user.id, user.status || 'active')}
                      className={`flex items-center gap-1 font-medium ${
                        (user.status || 'active') === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {(user.status || 'active') === 'active' ? (
                        <><ShieldOff className="w-4 h-4" /> Revoke</>
                      ) : (
                        <><Shield className="w-4 h-4" /> Restore</>
                      )}
                    </button>
                    <button
                      onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                      className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                    >
                      <Lock className="w-4 h-4" /> Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Onboard Staff</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className="input-field mt-1"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  className="input-field mt-1"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <select
                  className="input-field mt-1"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Rider">Rider</option>
                  <option value="Admin">Admin</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={actionLoading}>
                {actionLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setSelectedUser(null); }} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Set a new password for <strong>{selectedUser.email}</strong></p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">New Password</label>
                <input
                  type="password"
                  className="input-field mt-1"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={actionLoading}>
                {actionLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
