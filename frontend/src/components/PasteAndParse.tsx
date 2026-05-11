import { useState } from 'react';
import { Package, MapPin, Phone, User, CheckCircle2, ClipboardPaste } from 'lucide-react';

interface ParsedOrder {
  id: string;
  name: string;
  phone: string;
  item: string;
  dropoff: string;
}

export default function PasteAndParse() {
  const [rawText, setRawText] = useState('');
  const [parsedOrders, setParsedOrders] = useState<ParsedOrder[]>([]);

  const handleParse = () => {
    // Expected pattern per order block
    // Name: (.*)
    // Phone: (.*)
    // Item: (.*)
    // Dropoff: (.*)
    
    // We split by double newlines assuming multiple orders might be pasted
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
  };

  const handleConfirm = async () => {
    if (parsedOrders.length === 0) return;
    
    const tenantId = localStorage.getItem('tenantId') || '81a2a454-3aeb-4b3e-8028-f9a3a7fcbcac';
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const getHeaders = () => {
      const headers: HeadersInit = { 'x-tenant-id': tenantId };
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return headers;
    };
    
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
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orders: ordersToSync })
      });

      if (res.ok) {
        alert(`Successfully created ${parsedOrders.length} orders!`);
        setRawText('');
        setParsedOrders([]);
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload orders.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ClipboardPaste className="w-8 h-8 text-brand-600" />
          Bulk Order Ingestion
        </h1>
        <p className="text-slate-500 mt-2">Paste raw text from WhatsApp to automatically parse and stage orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Raw Input</h2>
            <textarea
              className="input-field h-64 font-mono text-sm resize-none mb-4"
              placeholder={`Name: John Doe\nPhone: 08012345678\nItem: Macbook Pro\nDropoff: 123 Tech Lane, Lagos\n\nName: Jane Smith...`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <button 
              onClick={handleParse}
              className="btn-primary w-full flex justify-center items-center gap-2"
              disabled={!rawText.trim()}
            >
              Parse Text
            </button>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-2">
          <div className="card h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Parsed Preview
                {parsedOrders.length > 0 && (
                  <span className="ml-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-brand-700 bg-brand-100 rounded-full">
                    {parsedOrders.length} found
                  </span>
                )}
              </h2>
            </div>

            {parsedOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                <Package className="w-16 h-16 mb-4 text-slate-200" />
                <p>No orders parsed yet.</p>
                <p className="text-sm">Paste text and click Parse to preview.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dropoff</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {parsedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900">{order.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-slate-400" />
                              <span className="text-sm text-slate-600">{order.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Package className="w-4 h-4 mr-2 text-slate-400" />
                              <span className="text-sm text-slate-600">{order.item}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 line-clamp-1" title={order.dropoff}>{order.dropoff}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleConfirm}
                    className="bg-emerald-600 text-white font-medium py-2 px-6 rounded-lg shadow-sm hover:bg-emerald-700 hover:shadow transition-all duration-200 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Review & Confirm Upload
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
