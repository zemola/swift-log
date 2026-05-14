import { useState, useEffect } from 'react';
import { BarChart3, Loader, Calendar, TrendingUp, Users, Truck } from 'lucide-react';
import { showToast } from '../utils/toast';

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const tenantId = localStorage.getItem('tenantId');

  useEffect(() => {
    if (tenantId) {
      fetchTelemetry();
    }
  }, [tenantId, startDate, endDate]);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/admin/telemetry`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
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
      showToast('Failed to fetch telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor your business performance</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/70 backdrop-blur-md border border-white/20 p-2 rounded-xl shadow-sm w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="date"
              className="text-sm border-0 bg-transparent focus:ring-0 text-slate-700 w-full sm:w-auto"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <span className="text-slate-400 hidden sm:inline">to</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 sm:hidden">To:</span>
            <input
              type="date"
              className="text-sm border-0 bg-transparent focus:ring-0 text-slate-700 w-full sm:w-auto"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-purple-600" />
        </div>
      ) : (
        <>
          {/* Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Total Staff</p>
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

            <div className="card flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Active Riders</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{telemetry?.activeRiders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="card p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Orders Processed</h2>
                <p className="text-xs text-slate-500">Last 6 Months</p>
              </div>
              
              <div className="h-48 flex items-end justify-between gap-4 px-4">
                {telemetry?.chartData?.map((item: any, index: number) => {
                  const maxCount = Math.max(...telemetry.chartData.map((d: any) => d.count), 1);
                  const heightPercentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-500 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-purple-700 relative group"
                        style={{ height: `${heightPercentage}%`, minHeight: '10%' }}
                      >
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

            {/* Pie Chart (Mocked with CSS) */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Status</h2>
              <div className="flex flex-col items-center justify-center h-48">
                <div className="relative w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-8 border-purple-600" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 70%)' }}></div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">70%</p>
                    <p className="text-xs text-slate-500">Delivered</p>
                  </div>
                </div>
                
                <div className="flex justify-between w-full mt-4 text-xs font-medium">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span>Delivered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                    <span>Other</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
