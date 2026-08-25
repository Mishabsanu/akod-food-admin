import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    // Parallel aggregate queries for speed
    const [
      totalOrders,
      ordersAggregate,
      totalCustomers,
      totalProducts,
      totalCategories,
      recentOrders,
      orderStatusCounts,
      last7DaysOrders
    ] = await Promise.all([
      // 1. Total orders count
      Order.countDocuments(),

      // 2. Revenue aggregation (Paid or non-cancelled)
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),

      // 3. Total customers
      Customer.countDocuments(),

      // 4. Total products
      Product.countDocuments(),

      // 5. Total categories
      Category.countDocuments(),

      // 6. Latest 5 orders populated with customer & product info
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email phone')
        .lean(),

      // 7. Order counts by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 8. Past 7 days sales aggregation
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalRevenue = ordersAggregate[0]?.totalRevenue || 0;

    // Status map
    const statusMap: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orderStatusCounts.forEach((s: any) => {
      if (s._id) statusMap[s._id] = s.count;
    });

    // Build complete 7-day timeline even if some days have 0 orders
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timelineData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];

      const match = last7DaysOrders.find((item: any) => item._id === dateStr);
      timelineData.push({
        date: dateStr,
        name: dayName,
        sales: match ? match.sales : 0,
        orders: match ? match.orders : 0
      });
    }

    return sendSuccess({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        totalCategories,
        orderStatus: statusMap,
      },
      chartData: timelineData,
      recentOrders,
    }, 'Dashboard real-time analytics retrieved');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
