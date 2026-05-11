import { useState, useEffect, useRef } from 'react';
import { Package, MapPin, CheckCircle, AlertCircle, Wifi, WifiOff, User, Phone } from 'lucide-react';
import localforage from 'localforage';

interface Order {
  id: string;
  item_desc: string;
  price: string;
  pickup_addr: string;
  dropoff_addr: string;
  status: string;
  customer_name?: string;
  customer_phone?: string;
}

const SignaturePad = ({ onSave }: { onSave: (data: string) => void }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSave('');
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-slate-700 mb-1">Receiver Signature</label>
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="border border-slate-300 rounded-lg bg-white w-full"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />
      <button type="button" onClick={clear} className="text-xs text-red-500 mt-1">Clear Signature</button>
    </div>
  );
};

export default function RiderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeOrderForSignature, setActiveOrderForSignature] = useState<string | null>(null);
  const [currentSignature, setCurrentSignature] = useState('');

  const tenantId = localStorage.getItem('tenantId') || '81a2a454-3aeb-4b3e-8028-f9a3a7fcbcac';
  const riderId = localStorage.getItem('riderId') || '4a84501d-bcc4-46c0-9d24-a4b9f1118262';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getHeaders = () => {
    const headers: HeadersInit = { 'x-tenant-id': tenantId };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    
    fetchOrders();
    
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncOfflineUpdates();
    }
  }, [isOnline]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const res = await fetch(`${API_URL}/api/riders/${riderId}/orders`, {
          headers: getHeaders()
        });
        const data = await res.json();
        const fetchedOrders = data.data || [];
        setOrders(fetchedOrders);
        // Cache for offline
        await localforage.setItem(`orders_${riderId}`, fetchedOrders);
      } else {
        const cached = await localforage.getItem<Order[]>(`orders_${riderId}`);
        if (cached) setOrders(cached);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load orders.');
      const cached = await localforage.getItem<Order[]>(`orders_${riderId}`);
      if (cached) setOrders(cached);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, signatureData?: string) => {
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    await localforage.setItem(`orders_${riderId}`, updatedOrders);

    if (navigator.onLine) {
      try {
        await fetch(`${API_URL}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus, signature_data: signatureData })
        });
      } catch (err) {
        console.error('Failed to sync status update, queueing', err);
        queueUpdate(orderId, newStatus);
      }
    } else {
      queueUpdate(orderId, newStatus);
    }
    
    // Reset signature state
    setActiveOrderForSignature(null);
    setCurrentSignature('');
  };

  const queueUpdate = async (orderId: string, status: string) => {
    const queue = await localforage.getItem<{orderId: string, status: string}[]>('updateQueue') || [];
    queue.push({ orderId, status });
    await localforage.setItem('updateQueue', queue);
  };

  const syncOfflineUpdates = async () => {
    const queue = await localforage.getItem<{orderId: string, status: string}[]>('updateQueue') || [];
    if (queue.length === 0) return;

    console.log('Syncing offline updates...');
    const failedUpdates: {orderId: string, status: string}[] = [];

    for (const update of queue) {
      try {
        const res = await fetch(`${API_URL}/api/orders/${update.orderId}`, {
          method: 'PUT',
          headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: update.status })
        });
        
        if (!res.ok) {
          console.error(`Server rejected update for order ${update.orderId}`);
          failedUpdates.push(update);
        }
      } catch (err) {
        console.error(`Failed to sync update for order ${update.orderId}`, err);
        failedUpdates.push(update);
      }
    }
    
    await localforage.setItem('updateQueue', failedUpdates);
    console.log(`Sync completed. ${queue.length - failedUpdates.length} succeeded, ${failedUpdates.length} failed.`);
  };

  if (loading) return <div className="text-center py-10">Loading orders...</div>;

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Deliveries</h1>
          <p className="text-sm text-slate-500">Rider App</p>
        </div>
        <div>
          {isOnline ? (
            <span className="text-emerald-500 flex items-center gap-1 text-sm font-medium">
              <Wifi className="w-4 h-4" /> Online
            </span>
          ) : (
            <span className="text-orange-500 flex items-center gap-1 text-sm font-medium">
              <WifiOff className="w-4 h-4" /> Offline Mode
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No assigned orders found.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-slate-900">{order.item_desc}</div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  order.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'In_Transit' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="text-sm text-slate-600 space-y-1 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span><span className="font-medium">Pick:</span> {order.pickup_addr}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span><span className="font-medium">Drop:</span> {order.dropoff_addr}</span>
                </div>
                {order.customer_name && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <span><span className="font-medium">Cust:</span> {order.customer_name}</span>
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span><span className="font-medium">Phone:</span> {order.customer_phone}</span>
                    <a href={`tel:${order.customer_phone}`} className="ml-2 text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-medium">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {order.status === 'Assigned' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'In_Transit')}
                    className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Start Delivery
                  </button>
                )}
                
                {order.status === 'In_Transit' && activeOrderForSignature !== order.id && (
                  <button
                    onClick={() => setActiveOrderForSignature(order.id)}
                    className="w-full bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Delivery
                  </button>
                )}

                {activeOrderForSignature === order.id && (
                  <div className="border-t pt-2 mt-2">
                    <SignaturePad onSave={setCurrentSignature} />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setActiveOrderForSignature(null);
                          setCurrentSignature('');
                        }}
                        className="flex-1 bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Delivered', currentSignature)}
                        className="flex-1 bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                        disabled={!currentSignature}
                      >
                        Confirm Delivery
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
