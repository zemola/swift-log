import { useState } from 'react';
import { Package, MapPin, Phone, User, CheckCircle2, ClipboardPaste, Loader } from 'lucide-react';
import { showToast } from '../utils/toast';

interface ParsedOrder {
  id: string;
  name: string;
  phone: string;
  item: string;
  dropoff: string;
}

interface PasteAndParseProps {
  onOrderCreated?: () => void;
}

export default function PasteAndParse({ onOrderCreated }: PasteAndParseProps) {
  const [rawText, setRawText] = useState('');
  const [parsedOrders, setParsedOrders] = useState<ParsedOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    const blocks = rawText.split(/\n\s*\n/);
    const orders: ParsedOrder[] = [];

    const regex = /Name:\s*(.*)\nPhone:\s*(.*)\nItem:\s*(.*)\nDropoff:\s*(.*)/i;

    blocks.forEach((block, index) => {
      const match = block.match(regex);
      if (match) {
        orders.push({
          id: `temp-${Date.now()}-${index}`,
          name: match[1].trim(),
          phone: match[2].trim(),
          item: match[3].trim(),
          dropoff: match[4].trim(),
        });
      }
    });

    setParsedOrders(orders);
    if (orders.length > 0) {
      showToast(`Parsed ${orders.length} orders!`, 'success');
    } else {
      showToast('No orders found in the text.', 'warning');
    }
  };

  const handleConfirm = async () => {
    if (parsedOrders.length === 0) return;
    
    setLoading(true);
    const tenantId = localStorage.getItem('tenantId');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const token = localStorage.getItem('token');
    const headers: HeadersInit = { 
      'x-tenant-id': tenantId || '',
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const ordersToSync = parsedOrders.map(order => ({
      item_desc: order.item,
      price: 0,
      pickup_addr: 'Central Hub',
      dropoff_addr: order.dropoff,
      payment_mode: 'Cash',
      status: 'Pending',
      customer_name: order.name,
      customer_phone: order.phone
    }));

    try {
      const res = await fetch(`${API_URL}/api/orders/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ orders: ordersToSync })
      });

      if (res.ok) {
        showToast(`Successfully created ${parsedOrders.length} orders!`, 'success');
        setRawText('');
        setParsedOrders([]);
        if (onOrderCreated) onOrderCreated();
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to upload orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <ClipboardPaste className="w-7 h-7 text-purple-600" />
          Bulk Order Ingestion
        </h1>
        <p className="text-slate-500 mt-2 text-sm">Paste raw text from WhatsApp to automatically parse and stage orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold mb-3 text-slate-800">Raw Input</h2>
            <textarea
              className="input-field h-48 font-mono text-xs resize-none mb-4"
              placeholder={`Name: John Doe\nPhone: 08012345678\nItem: Macbook Pro\nDropoff: 123 Tech Lane, Lagos\n\nName: Jane Smith...`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <button 
              onClick={handleParse}
              className="btn-primary w-full flex justify-center items-center gap-2 text-sm"
              disabled={!rawText.trim()}
            >
              Parse Text
            </button>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-2">
          <div className="card h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Parsed Preview
                {parsedOrders.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-purple-700 bg-purple-100 rounded-full">
                    {parsedOrders.length} found
                  </span>
                )}
              </h2>
            </div>

            {parsedOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
                <Package className="w-12 h-12 mb-2 text-slate-200" />
                <p className="text-sm">No orders parsed yet.</p>
                <p className="text-xs">Paste text and click Parse to preview.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Dropoff</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {parsedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-900">{order.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{order.phone}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{order.item}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[150px]" title={order.dropoff}>{order.dropoff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={handleConfirm}
                    className="bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-emerald-700 hover:shadow transition-all text-xs flex items-center gap-1"
                    disabled={loading}
                  >
                    {loading ? <Loader className="animate-spin h-4 w-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirm Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
