"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Send,
  Phone,
  Mail,
  Receipt
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import LogoLoader from '@/components/LogoLoader';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingShipment, setUpdatingShipment] = useState(false);
  const [shipmentData, setShipmentData] = useState({
    trackingId: '',
    courierName: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrder(params.id as string);
      const data = res.data?.data;
      if (data) {
        setOrder(data);
        if (data.shipment) {
          setShipmentData({
            trackingId: data.shipment.trackingId || '',
            courierName: data.shipment.courierName || ''
          });
        }
      } else {
        setOrder(null);
      }
    } catch (error) {
      toast.error("Failed to load order details");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelContent = `
      <html>
        <head>
          <title>Shipping Label - ${order?._id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; margin: 0; }
            .label-card { 
              border: 2px solid #000; 
              padding: 24px; 
              max-width: 520px; 
              margin: 0 auto;
            }
            .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 24px; font-weight: 900; color: #546b5a; }
            .badge { font-size: 10px; font-weight: bold; background: #eee; padding: 3px 6px; }
            .to-label { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 4px; }
            .name { font-size: 20px; font-weight: bold; margin-bottom: 6px; }
            .address { font-size: 14px; line-height: 1.5; margin-bottom: 14px; }
            .phone { font-size: 13px; font-weight: bold; border-top: 1px dashed #ccc; padding-top: 10px; }
            .order-ref { margin-top: 20px; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 10px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">
              <div>
                <div class="brand">AKOD FOOD</div>
                <div style="font-size: 10px; color: #666; font-weight: bold; margin-top: 2px;">AUTHENTIC KERALA CHIPS</div>
              </div>
              <div class="badge">PRIORITY DISPATCH</div>
            </div>
            <div class="to-label">DELIVER TO:</div>
            <div class="name">${order?.customer?.name || 'Customer'}</div>
            <div class="address">${order?.shippingAddress || 'Address on file'}</div>
            <div class="phone">CONTACT: ${order?.customer?.phone || 'N/A'}</div>
            
            <div class="order-ref">
              <span>ORDER: #ORD-2026-${String(order?._id).slice(-4).toUpperCase()}</span>
              <span>DATE: ${new Date(order?.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(labelContent);
    printWindow.document.close();
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingShipment(true);
    try {
      await adminApi.updateShipment(params.id as string, shipmentData);
      toast.success("Shipment tracking details updated");
      fetchOrderDetails();
    } catch (error) {
      toast.error("Failed to update shipment details");
    } finally {
      setUpdatingShipment(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await adminApi.updateOrder(params.id as string, status);
      toast.success(`Order status updated to "${status.toUpperCase()}"`);
      fetchOrderDetails();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LogoLoader text="Loading Order Details..." size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <AdminWorkspace>
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-md mx-auto my-12 shadow-2xs">
          <div className="w-24 h-24 mx-auto mb-3 p-2 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/30 border border-slate-100 flex items-center justify-center">
            <img src="/empty-state.png" alt="Order Not Found" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Order Record Not Found</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-5">
            The requested transaction record could not be found or may have been deleted.
          </p>
          <button 
            onClick={() => router.push('/orders')} 
            className="btn-primary"
          >
            &larr; Back to Orders Register
          </button>
        </div>
      </AdminWorkspace>
    );
  }

  return (
    <AdminWorkspace>
      <div className="max-w-6xl mx-auto space-y-5 pb-14 animate-in fade-in duration-200">
        
        {/* Header Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-2 bg-white border border-slate-300 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
              title="Back"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Order Telemetry
                </h1>
                <span className="font-mono text-xs font-bold text-[#546b5a] bg-[#eff4f0] border border-[#9cb5a2] px-2 py-0.5 rounded-sm">
                  ORD-2026-{String(order._id).slice(-4).toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Reported on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              order.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
              order.status === 'shipped' ? 'bg-purple-50 text-purple-800 border-purple-200' :
              order.status === 'processing' ? 'bg-teal-50 text-teal-800 border-teal-200' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              {order.status === 'delivered' ? <CheckCircle2 size={13} /> : order.status === 'cancelled' ? <XCircle size={13} /> : <Clock size={13} />}
              <span>{order.status || 'Pending'}</span>
            </span>

            <button 
              onClick={handlePrintLabel}
              className="btn-secondary"
            >
              <Printer size={13} />
              <span>Print Label</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Ordered Items, Delivery Address & Courier Dispatch */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Ordered Products */}
            <div className="admin-card p-4 space-y-4 rounded-lg">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-[#eff4f0] text-[#546b5a] flex items-center justify-center font-bold border border-[#9cb5a2]">
                  <ShoppingBag size={14} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Ordered Banana Chips Products</h2>
                  <p className="text-[10px] text-slate-500">Items and quantity packages in this consignment</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, idx: number) => {
                    const prod = item.product || {};
                    const img = prod.images?.[0] || null;
                    return (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-md border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          {img ? (
                            <img 
                              src={img} 
                              className="w-full h-full object-cover" 
                              alt={prod.name || 'Product'} 
                            />
                          ) : (
                            <Package size={20} className="text-slate-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {prod.name || 'Artisan Banana Chips SKU'}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Quantity: <span className="font-bold text-slate-800">{item.quantity} packet{item.quantity > 1 ? 's' : ''}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">
                            ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ₹{item.price} each
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-3">No product items details recorded.</p>
                )}
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="admin-card p-4 space-y-3 rounded-lg">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-800 flex items-center justify-center font-bold border border-amber-200">
                  <MapPin size={14} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Delivery Address</h2>
                  <p className="text-[10px] text-slate-500">Shipping destination specified by buyer</p>
                </div>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-md border border-slate-200">
                {order.shippingAddress || (order.customer?.address ? `${order.customer.address}` : 'No shipping address provided.')}
              </p>
            </div>

            {/* Courier Dispatch Tracker */}
            <div className="admin-card p-4 bg-[#07170f] text-white space-y-4 rounded-lg border border-[#19422d]">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <div className="w-6 h-6 rounded-md bg-white/10 text-emerald-300 flex items-center justify-center font-bold">
                  <Truck size={14} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wide">Courier & Dispatch Tracking</h2>
                  <p className="text-[10px] text-slate-300">Set AWB tracking number for real-time customer tracking</p>
                </div>
              </div>

              <form onSubmit={handleUpdateShipment} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Courier Partner</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Delhivery, BlueDart, DTDC, IndiaPost"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-xs font-semibold text-white placeholder:text-white/40 outline-none focus:border-white transition-all"
                    value={shipmentData.courierName}
                    onChange={e => setShipmentData({...shipmentData, courierName: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Tracking / AWB Number</label>
                  <input 
                    type="text" 
                    placeholder="AWB123456789"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-xs font-semibold text-white placeholder:text-white/40 outline-none focus:border-white transition-all font-mono"
                    value={shipmentData.trackingId}
                    onChange={e => setShipmentData({...shipmentData, trackingId: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 pt-1">
                  <button 
                    type="submit" 
                    disabled={updatingShipment}
                    className="w-full bg-white text-[#546b5a] py-2 rounded-md text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {updatingShipment ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                    <span>Save Shipment AWB Details</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Column: Customer Profile, Payment Ledger & Lifecycle Actions */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Customer Profile */}
            <div className="admin-card p-4 space-y-3 rounded-lg">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-[#eff4f0] text-[#546b5a] flex items-center justify-center font-bold border border-[#9cb5a2]">
                  <User size={14} />
                </div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Customer Profile</h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Name</p>
                  <p className="font-bold text-slate-900 mt-0.5">{order.customer?.name || 'Storefront Customer'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="font-medium text-slate-700 mt-0.5 truncate">{order.customer?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="font-medium text-slate-700 mt-0.5 font-mono">{order.customer?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Payment Ledger Breakdown */}
            <div className="admin-card p-4 space-y-3 rounded-lg">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
                  <CreditCard size={14} />
                </div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Payment Ledger</h2>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Method</span>
                  <span className="font-bold text-slate-800 uppercase text-[10px]">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online / UPI Gateway'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Status</span>
                  <span className={`px-1.5 py-0.2 rounded-sm text-[9px] font-bold uppercase ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {order.paymentStatus || 'pending'}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-800">Total Charged</span>
                  <span className="text-lg font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>
            </div>

            {/* Order Lifecycle Actions */}
            <div className="admin-card p-4 space-y-2 rounded-lg">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Order Lifecycle Actions
              </h3>

              <button 
                onClick={() => handleUpdateStatus('processing')}
                className="w-full py-1.5 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Clock size={13} className="text-teal-600" />
                <span>Mark as In Kitchen / Processing</span>
              </button>

              <button 
                onClick={() => handleUpdateStatus('shipped')}
                className="w-full py-1.5 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Truck size={13} className="text-purple-600" />
                <span>Mark as Shipped / In Transit</span>
              </button>

              <button 
                onClick={() => handleUpdateStatus('delivered')}
                className="w-full py-1.5 px-3 bg-[#546b5a] hover:bg-[#415446] text-white text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 size={13} />
                <span>Mark as Delivered</span>
              </button>

              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this order?")) {
                    handleUpdateStatus('cancelled');
                  }
                }}
                className="w-full py-1.5 px-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <XCircle size={13} />
                <span>Cancel Order</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </AdminWorkspace>
  );
}
