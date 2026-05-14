import { useState, useEffect } from 'react';
import { Plus, Eye, Shield, ShieldOff, Loader } from 'lucide-react';
import { showToast } from '../utils/toast';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<any>(null);

  // Form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_URL}/api/superadmin/companies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCompanies(data.data);
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch businesses.', 'error');
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newCompanyName, ownerEmail, expiresAt })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Business created and invitation sent!', 'success');
        setNewCompanyName('');
        setOwnerEmail('');
        setExpiresAt('');
        setShowCreateModal(false);
        fetchCompanies();
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to create business.', 'error');
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`Business status updated to ${newStatus}`, 'success');
        fetchCompanies();
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update status.', 'error');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/superadmin/companies/${id}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Company Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create Business
        </button>
      </div>

      {/* Business List */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Registered Businesses</h2>
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
                      className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Onboard New Business</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
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
                {loading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Create & Send Invitation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCompanyDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20">
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
              <div className="p-4 bg-white/50 rounded-xl border border-white/20">
                <p className="text-xs text-slate-500 uppercase font-medium">License Key</p>
                <p className="font-mono text-sm font-bold text-slate-900 mt-1">{selectedCompanyDetails.company.license_key}</p>
              </div>
              <div className="p-4 bg-white/50 rounded-xl border border-white/20">
                <p className="text-xs text-slate-500 uppercase font-medium">Status</p>
                <p className="font-bold text-sm text-slate-900 capitalize mt-1">{selectedCompanyDetails.company.status}</p>
              </div>
              <div className="p-4 bg-white/50 rounded-xl border border-white/20">
                <p className="text-xs text-slate-500 uppercase font-medium">Total Orders</p>
                <p className="font-bold text-2xl text-purple-600 mt-1">{selectedCompanyDetails.stats.totalOrders}</p>
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
