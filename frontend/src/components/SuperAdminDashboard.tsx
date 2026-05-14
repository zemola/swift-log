import { useState, useEffect } from 'react';
import { Truck, Shield, ShieldOff, Plus } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  license_key: string;
  status: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ name: newCompanyName, ownerEmail })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Company created and invitation simulated in logs!');
        setNewCompanyName('');
        setOwnerEmail('');
        fetchCompanies();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create company.');
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{company.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{company.license_key}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
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
    </div>
  );
}
