import { useState, useEffect } from 'react';
import { Package, Truck, User, CheckCircle2 } from 'lucide-react';

interface Order {
  id: string;
  item_desc: string;
  price: string;
  pickup_addr: string;
  dropoff_addr: string;
  payment_mode: string;
  status: string;
  rider_id?: string;
}

interface Rider {
  id: string;
  email: string;
  role: string;
}

export default function DispatcherDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRider, setSelectedRider] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tenantId = localStorage.getItem('tenantId') || '81a2a454-3aeb-4b3e-8028-f9a3a7fcbcac';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const getHeaders = () => {
    const headers: HeadersInit = { 'x-tenant-id': tenantId };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Orders
      const ordersRes = await fetch(`${API_URL}/api/orders`, {
        headers: getHeaders()
      });
      const ordersData = await ordersRes.json();
      setOrders(ordersData.data || []);

      // Fetch Riders
      const ridersRes = await fetch(`${API_URL}/api/riders`, {
        headers: getHeaders()
      });
      const ridersData = await ridersRes.json();
      setRiders(ridersData.data || []);
    } catch (err) {
      setError('Failed to fetch data from backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (orderId: string) => {
    const riderId = selectedRider[orderId];
    if (!riderId) {
      alert('Please select a rider first.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rider_id: riderId })
      });

      if (res.ok) {
        alert('Order assigned successfully!');
        fetchData(); // Refresh data
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to assign order.');
    }
  };

  const handleRiderChange = (orderId: string, riderId: string) => {
    setSelectedRider(prev => ({ ...prev, [orderId]: riderId }));
  };

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Truck className="w-8 h-8 text-brand-600" />
          Dispatcher Dashboard
        </h1>
        <p className="text-slate-500 mt-2">Manage and assign orders to riders.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Pending Orders</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Addresses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assign Rider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{order.item_desc}</div>
                      <div className="text-sm text-slate-500">₦{order.price}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm"><span className="font-medium">Pick:</span> {order.pickup_addr}</div>
                      <div className="text-sm"><span className="font-medium">Drop:</span> {order.dropoff_addr}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'Assigned' ? (
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {riders.find(r => r.id === order.rider_id)?.email || 'Assigned'}
                        </div>
                      ) : (
                        <select
                          className="input-field text-sm py-1"
                          value={selectedRider[order.id] || ''}
                          onChange={(e) => handleRiderChange(order.id, e.target.value)}
                        >
                          <option value="">Select Rider</option>
                          {riders.map(rider => (
                            <option key={rider.id} value={rider.id}>{rider.email}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.status !== 'Assigned' && (
                        <button
                          onClick={() => handleAssign(order.id)}
                          className="btn-primary py-1 px-3 text-sm flex items-center gap-1"
                          disabled={!selectedRider[order.id]}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
