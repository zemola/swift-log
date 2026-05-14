import { useState, useEffect } from 'react';
import { Shield, Users, Truck, BarChart3, Loader } from 'lucide-react';
import { showToast } from '../utils/toast';

export default function SuperAdminDashboard() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${API_URL}/api/superadmin/telemetry`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTelemetry(data.data);
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch telemetry.', 'error');
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
        <Shield className="w-8 h-8 text-purple-600" />
        Super Admin Dashboard
      </h1>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center justify-between p-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Businesses</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{telemetry?.totalCompanies || 0}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>
        
        <div className="card flex items-center justify-between p-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Users</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{telemetry?.totalUsers || 0}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <Users className="w-6 h-6" />
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

      {/* Chart Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Business Growth</h2>
          <p className="text-xs text-slate-500">Last 6 Months</p>
        </div>
        
        {/* Custom CSS Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-4 px-4">
          {telemetry?.chartData?.map((item: any, index: number) => {
            const maxCount = Math.max(...telemetry.chartData.map((d: any) => d.count), 1);
            const heightPercentage = (item.count / maxCount) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-purple-700 relative group"
                  style={{ height: `${heightPercentage}%`, minHeight: '10%' }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-600">{item.month}</p>
              </div>
            );
          })}
          
          {(!telemetry?.chartData || telemetry.chartData.length === 0) && (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
