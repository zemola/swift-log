import { useState, useEffect } from 'react';
import { DollarSign, PieChart, TrendingUp, Clock } from 'lucide-react';

interface SummaryData {
  total_delivered: number;
  pending_revenue: number;
  breakdown: { payment_mode: string; total: string }[];
}

export default function Finance() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const tenantId = localStorage.getItem('tenantId') || '81a2a454-3aeb-4b3e-8028-f9a3a7fcbcac';

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/finance/summary`, {
        headers: {
          'x-tenant-id': tenantId,
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load finance summary.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading finance data...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!summary) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <DollarSign className="w-8 h-8 text-emerald-600" />
        Finance Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Delivered */}
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Earnings (Delivered)</p>
            <p className="text-2xl font-bold text-slate-900">${summary.total_delivered.toFixed(2)}</p>
          </div>
        </div>

        {/* Pending Revenue */}
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Pending Revenue (In Transit)</p>
            <p className="text-2xl font-bold text-slate-900">${summary.pending_revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
          <PieChart className="w-6 h-6 text-indigo-600" />
          Payment Mode Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {summary.breakdown.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.payment_mode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${parseFloat(item.total).toFixed(2)}</td>
                </tr>
              ))}
              {summary.breakdown.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-slate-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
