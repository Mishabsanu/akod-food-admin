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
    ArrowRight,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Printer
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [shipmentData, setShipmentData] = useState({
        trackingId: '',
        courierName: ''
    });

    useEffect(() => {
        fetchOrderDetails();
    }, [params.id]);

    const fetchOrderDetails = async () => {
        try {
            const res = await adminApi.getOrders();
            const found = res.data.data.find((o: any) => o._id === params.id);
            setOrder(found);
            if (found?.shipment) {
                setShipmentData({
                    trackingId: found.shipment.trackingId || '',
                    courierName: found.shipment.courierName || ''
                });
            }
        } catch (error) {
            toast.error("Failed to load order details");
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
                    <title>Shipping Label - ${order._id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; }
                        .label-card { 
                            border: 2px solid #000; 
                            padding: 30px; 
                            max-width: 500px; 
                            margin: 0 auto;
                        }
                        .header { border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px; }
                        .brand { font-size: 24px; font-weight: bold; color: #5f7161; }
                        .to-label { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 5px; }
                        .name { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                        .address { font-size: 16px; line-height: 1.5; margin-bottom: 15px; }
                        .phone { font-size: 14px; font-weight: bold; border-top: 1px dashed #ccc; padding-top: 10px; }
                        .order-ref { margin-top: 30px; font-size: 10px; color: #999; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="label-card">
                        <div class="header">
                            <div class="brand">AKOD FOOD</div>
                            <div style="font-size: 10px; color: #999;">ARTISAN HERITAGE SNACKS</div>
                        </div>
                        <div class="to-label">SHIP TO:</div>
                        <div class="name">${order.customer?.name}</div>
                        <div class="address">${order.shippingAddress}</div>
                        <div class="phone">CONTACT: ${order.customer?.phone || 'N/A'}</div>
                        
                        <div class="order-ref">
                            ORDER ID: #AKD-${order._id.toUpperCase()}<br/>
                            DATE: ${new Date(order.createdAt).toLocaleDateString()}
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
        try {
            await adminApi.updateShipment(params.id as string, shipmentData);
            toast.success("Shipment details updated");
            fetchOrderDetails();
        } catch (error) {
            toast.error("Failed to update shipment");
        }
    };

    const handleUpdateStatus = async (status: string) => {
        try {
            await adminApi.updateOrder(params.id as string, status);
            toast.success(`Status updated to ${status}`);
            fetchOrderDetails();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
            <Loader2 className="w-12 h-12 animate-spin text-gray-300" strokeWidth={1} />
        </div>
    );

    if (!order) return <div className="p-20 text-center">Order not discovered in logs.</div>;

    return (
        <AdminWorkspace>
            <div className="max-w-6xl mx-auto px-6 py-12 font-sans">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors border border-gray-100 shadow-sm group">
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-serif text-gray-900 font-light">Order Details.</h1>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mt-2 font-black">Ref: #{order._id.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className={`px-5 py-2 rounded-sm border text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                        {order.status === 'delivered' ? <CheckCircle2 size={14} /> : order.status === 'cancelled' ? <XCircle size={14} /> : <Clock size={14} />}
                        {order.status}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Column: Order Items & Shipping info */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Section: Items */}
                        <section className="bg-white border border-gray-100 p-10 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <Package size={20} className="text-gray-400" />
                                <h2 className="text-lg font-serif font-light text-gray-900">Ordered Assets</h2>
                            </div>
                            <div className="space-y-6">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-6 items-center border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                        <div className="w-20 h-20 bg-[#faf9f6] flex-shrink-0 p-2 overflow-hidden border border-gray-50">
                                            <img src={item.product?.images?.[0] || "/placeholder.png"} className="w-full h-full object-contain" alt="" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.product?.name}</h4>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-medium">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900 tracking-tighter">₹{item.price * item.quantity}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">₹{item.price} ea</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section: Logistics/Address */}
                        <section className="bg-white border border-gray-100 p-10 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <MapPin size={20} className="text-gray-400" />
                                    <h2 className="text-lg font-serif font-light text-gray-900">Logistics Destination</h2>
                                </div>
                                <button 
                                    onClick={handlePrintLabel}
                                    className="flex items-center gap-2 px-4 py-2 border border-[#5f7161] text-[#5f7161] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#5f7161] hover:text-white transition-all rounded-sm shadow-sm"
                                >
                                    <Printer size={12} /> Print Box Label
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                {order.shippingAddress}
                            </p>
                        </section>

                        {/* Section: Update Shipment Tracking */}
                        <section className="bg-[#5f7161] p-10 text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <Truck size={20} />
                                    <h2 className="text-lg font-serif font-light">Manage Shipment</h2>
                                </div>
                                
                                <form onSubmit={handleUpdateShipment} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <div>
                                        <label className="text-[9px] uppercase tracking-[0.3em] font-black block mb-3 opacity-70">Courier Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="E.g. Delhivery, BlueDart"
                                            className="w-full bg-white/10 border border-white/20 py-4 px-5 text-xs outline-none focus:bg-white/20 transition-all placeholder:text-white/30 uppercase tracking-widest"
                                            value={shipmentData.courierName}
                                            onChange={e => setShipmentData({...shipmentData, courierName: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] uppercase tracking-[0.3em] font-black block mb-3 opacity-70">Tracking Identification</label>
                                        <input 
                                            type="text" 
                                            placeholder="TRACKING ID"
                                            className="w-full bg-white/10 border border-white/20 py-4 px-5 text-xs outline-none focus:bg-white/20 transition-all placeholder:text-white/30 uppercase tracking-widest"
                                            value={shipmentData.trackingId}
                                            onChange={e => setShipmentData({...shipmentData, trackingId: e.target.value})}
                                        />
                                    </div>
                                    <div className="md:col-span-2 mt-4">
                                        <button 
                                            type="submit"
                                            className="w-full bg-white text-[#5f7161] py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-primary hover:text-white transition-all shadow-xl"
                                        >
                                            Confirm Logistics Shipment
                                        </button>
                                    </div>
                                </form>
                            </div>
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                        </section>
                    </div>

                    {/* Right Column: Customer & Summary */}
                    <div className="lg:col-span-4 space-y-10">
                        
                        {/* Section: Customer */}
                        <section className="bg-white border border-gray-100 p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <User size={20} className="text-gray-400" />
                                <h2 className="text-lg font-serif font-light text-gray-900">Client Identity</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-black mb-1">Entity Name</p>
                                    <p className="text-sm font-black text-gray-900 uppercase">{order.customer?.name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-black mb-1">Digital Address</p>
                                    <p className="text-sm font-medium text-gray-500">{order.customer?.email}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-black mb-1">Secure Mobile</p>
                                    <p className="text-sm font-medium text-gray-500">{order.customer?.phone || 'Not Logged'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Section: Financial Summary */}
                        <section className="bg-white border border-gray-100 p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <CreditCard size={20} className="text-gray-400" />
                                <h2 className="text-lg font-serif font-light text-gray-900">Financial Log</h2>
                            </div>
                            <div className="space-y-4 mb-8 pb-8 border-b border-gray-50">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 uppercase tracking-widest font-black">Asset Total</span>
                                    <span className="text-gray-900 font-black">₹{order.totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-xs text-emerald-500">
                                    <span className="uppercase tracking-widest font-black">Logistics Fee</span>
                                    <span className="font-black">COMPLIMENTARY</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Net Value</span>
                                <span className="text-3xl font-serif text-gray-900 font-light tracking-tighter">₹{order.totalAmount}</span>
                            </div>
                        </section>

                        {/* Section: Action Hub */}
                        <section className="space-y-4 pt-4">
                            <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-black px-2">Workflow Actions</h3>
                            <button 
                                onClick={() => handleUpdateStatus('processing')}
                                className="w-full bg-white border border-gray-100 py-5 text-[9px] uppercase tracking-[0.3em] font-black text-gray-500 hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center gap-3"
                            >
                                <Clock size={14} /> Begin Processing
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus('delivered')}
                                className="w-full bg-white border border-gray-100 py-5 text-[9px] uppercase tracking-[0.3em] font-black text-gray-500 hover:border-emerald-200 hover:text-emerald-500 transition-all flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={14} /> Finalize Delivery
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus('cancelled')}
                                className="w-full bg-rose-500 text-white py-5 text-[9px] uppercase tracking-[0.4em] font-black hover:bg-rose-600 transition-all shadow-lg flex items-center justify-center gap-3"
                            >
                                <XCircle size={14} /> Abort Purchase Node
                            </button>
                        </section>
                    </div>

                </div>
            </div>
        </AdminWorkspace>
    );
}
