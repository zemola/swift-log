import { useState, useEffect } from 'react';
import { Shield, ShieldOff, Plus, Eye } from 'lucide-react';
import { showToast } from '../utils/toast';

interface Company {
  id: string;
  name: string;
  license_key: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_URL}/api/superadmin/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCompanies(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/superadmin/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCompanyName, ownerEmail, expiresAt })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Company created and invitation simulated in logs!', 'success');
        setNewCompanyName('');
        setOwnerEmail('');
        fetchCompanies();
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to create company.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`${API_URL}/api/superadmin/companies/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/superadmin/companies/${id}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedCompanyDetails(data.data);
        setShowDetailsModal(true);
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch details.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
        <Shield className="w-8 h-8 text-indigo-600" />
        Super Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Onboard New Business */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-indigo-600" />
              Onboard New Business
            </h2>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Company Name</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Owner Email</label>
                <input
                  type="email"
                  className="input-field mt-1"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Expiration Date</label>
                <input
                  type="date"
                  className="input-field mt-1"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                Create & Send Invitation
              </button>
            </form>
          </div>
        </div>

        {/* Business List */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Registered Businesses</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">License Key</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expires At</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{company.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{company.license_key}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                        {company.expires_at ? new Date(company.expires_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 flex gap-3">
                        <button
                          onClick={() => handleViewDetails(company.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(company.id, company.status)}
                          className={`flex items-center gap-1 font-medium ${
                            company.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {company.status === 'active' ? (
                            <><ShieldOff className="w-4 h-4" /> Revoke</>
                          ) : (
                            <><Shield className="w-4 h-4" /> Restore</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCompanyDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Business Details: {selectedCompanyDetails.company.name}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">License Key</p>
                <p className="font-mono text-sm font-bold text-slate-900">{selectedCompanyDetails.company.license_key}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-bold text-sm text-slate-900 capitalize">{selectedCompanyDetails.company.status}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="font-bold text-xl text-indigo-600">{selectedCompanyDetails.stats.totalOrders}</p>
              </div>
            </div>

            <h4 className="text-lg font-bold text-slate-900 mb-4">Staff Members</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedCompanyDetails.users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-sm text-slate-900">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
