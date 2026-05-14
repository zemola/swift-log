import { useState } from 'react';
import { Package, User, Phone, MapPin, DollarSign, CheckCircle2, Loader } from 'lucide-react';
import { showToast } from '../utils/toast';

interface CreateOrderProps {
  onOrderCreated?: () => void;
}

export default function CreateOrder({ onOrderCreated }: CreateOrderProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [price, setPrice] = useState('');
  const [pickupAddr, setPickupAddr] = useState('Central Hub'); // Default
  const [dropoffAddr, setDropoffAddr] = useState('');
  const [paymentMode, setPaymentMode] = useState('COD');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const tenantId = localStorage.getItem('tenantId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      item_desc: itemDesc,
      price: parseFloat(price) || 0,
      pickup_addr: pickupAddr,
      dropoff_addr: dropoffAddr,
      payment_mode: paymentMode,
      status: 'Pending'
    };

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId || '',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        showToast('Order created successfully!', 'success');
        setCustomerName('');
        setCustomerPhone('');
        setItemDesc('');
        setPrice('');
        setDropoffAddr('');
        if (onOrderCreated) onOrderCreated();
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to create order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <Package className="w-7 h-7 text-purple-600" />
        Create Single Order
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <User className="w-4 h-4" /> Customer Name
            </label>
            <input
              type="text"
              className="input-field mt-1"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Phone className="w-4 h-4" /> Customer Phone
            </label>
            <input
              type="text"
              className="input-field mt-1"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
            <Package className="w-4 h-4" /> Item Description
          </label>
          <input
            type="text"
            className="input-field mt-1"
            value={itemDesc}
            onChange={(e) => setItemDesc(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Price
            </label>
            <input
              type="number"
              className="input-field mt-1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Payment Mode</label>
            <select
              className="input-field mt-1"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="Prepaid">Prepaid</option>
              <option value="Pay_on_Pickup">Pay on Pickup</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Pickup Address
          </label>
          <input
            type="text"
            className="input-field mt-1"
            value={pickupAddr}
            onChange={(e) => setPickupAddr(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Dropoff Address
          </label>
          <input
            type="text"
            className="input-field mt-1"
            value={dropoffAddr}
            onChange={(e) => setDropoffAddr(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full py-3 text-base flex justify-center items-center gap-2" disabled={loading}>
          {loading ? <Loader className="animate-spin h-5 w-5" /> : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Create Order
            </>
          )}
        </button>
      </form>
    </div>
  );
}
