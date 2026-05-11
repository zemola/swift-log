import { useState } from 'react';
import { Truck, User, CheckCircle2 } from 'lucide-react';

export default function Onboarding() {
  const [companyName, setCompanyName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('Dispatcher');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const tenantId = localStorage.getItem('tenantId') || '81a2a454-3aeb-4b3e-8028-f9a3a7fcbcac';

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Company created! License Key: ${data.data.license_key}`);
        setCompanyName('');
        // Save tenant ID to local storage to simulate "logging in" as that company
        localStorage.setItem('tenantId', data.data.id);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ email: userEmail, password: userPassword, role: userRole })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`User created successfully!`);
        setUserEmail('');
        setUserPassword('');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Create Company */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Truck className="w-6 h-6 text-indigo-600" />
          Onboard Business
        </h2>
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Company Name</label>
            <input
              type="text"
              className="input-field mt-1"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            Create Company
          </button>
        </form>
      </div>

      {/* Create User */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
          <User className="w-6 h-6 text-indigo-600" />
          Onboard Staff
        </h2>
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
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}
