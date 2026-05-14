import { useState, useEffect } from 'react';
import { Truck, Plus, Filter, Loader, Clipboard, FileText } from 'lucide-react';
import { showToast } from '../utils/toast';
import CreateOrder from './CreateOrder';
import PasteAndParse from './PasteAndParse';

export default function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [orderType, setOrderType] = useState<'single' | 'bulk' | 'parse' | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const tenantId = localStorage.getItem('tenantId');

  useEffect(() => {
    if (tenantId) {
      fetchOrders();
    }
  }, [tenantId]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': tenantId || ''
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreated = () => {
    setShowAddModal(false);
    setOrderType(null);
    fetchOrders();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-8 h-8 text-purple-600" />
            Order Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your orders</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Order
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Orders</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Delivered</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {orders.filter(o => o.status === 'delivered' || o.status === 'Delivered').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Pending</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {orders.filter(o => o.status === 'pending' || o.status === 'assigned' || o.status === 'Pending').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {orders.filter(o => o.status === 'rejected' || o.status === 'Rejected').length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Order List</h2>
          <button className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="animate-spin h-6 w-6 text-purple-600" />
          </div>
        ) : (
          <>
            {/* Cards for Mobile */}
            <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-900">#{order.id.substring(0, 8)}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'delivered' || order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' || order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'rejected' || order.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-500">
                  <p><span className="font-medium text-slate-700">Customer:</span> {order.customer_name}</p>
                  <p><span className="font-medium text-slate-700">Created:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-4 text-slate-400">No orders found.</div>
            )}
          </div>
          
          {/* Table for Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{order.id.substring(0, 8)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{order.customer_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' || order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' || order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'rejected' || order.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add New Order</h3>
              <button 
                onClick={() => { setShowAddModal(false); setOrderType(null); }} 
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {!orderType ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setOrderType('single')}
                  className="p-6 border border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center flex flex-col items-center gap-3"
                >
                  <FileText className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-bold text-slate-900">Single Order</p>
                    <p className="text-xs text-slate-500 mt-1">Fill a form manually</p>
                  </div>
                </button>

                <button
                  onClick={() => setOrderType('parse')}
                  className="p-6 border border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center flex flex-col items-center gap-3"
                >
                  <Clipboard className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-bold text-slate-900">Paste & Parse</p>
                    <p className="text-xs text-slate-500 mt-1">Extract from text</p>
                  </div>
                </button>

                <button
                  onClick={() => showToast('Bulk upload coming soon!', 'info')}
                  className="p-6 border border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center flex flex-col items-center gap-3 opacity-60"
                >
                  <Truck className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-bold text-slate-900">Bulk Upload</p>
                    <p className="text-xs text-slate-500 mt-1">Upload CSV/Excel</p>
                  </div>
                </button>
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => setOrderType(null)}
                  className="mb-4 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  ← Back to options
                </button>
                
                {orderType === 'single' && (
                  <CreateOrder onOrderCreated={handleOrderCreated} />
                )}
                
                {orderType === 'parse' && (
                  <PasteAndParse onOrderCreated={handleOrderCreated} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
