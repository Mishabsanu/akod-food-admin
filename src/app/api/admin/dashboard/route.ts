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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfThisMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    // Parallel aggregate queries for speed & deep telemetry
    const [
      totalOrders,
      ordersAggregate,
      todayOrdersAggregate,
      thisMonthOrdersAggregate,
      totalCustomers,
      totalProducts,
      totalCategories,
      recentOrders,
      orderStatusCounts,
      paymentStatusCounts,
      paymentMethodCounts,
      last7DaysOrders,
      allProducts,
      allCategories,
      topSellingAggregate
    ] = await Promise.all([
      // 1. Total orders count
      Order.countDocuments(),

      // 2. Lifetime Revenue aggregation (Paid or non-cancelled)
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),

      // 3. Today's Revenue & Orders
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startOfToday },
            status: { $ne: 'cancelled' }
          } 
        },
        { 
          $group: { 
            _id: null, 
            todayRevenue: { $sum: '$totalAmount' },
            todayOrders: { $sum: 1 }
          } 
        }
      ]),

      // 4. This Month's Revenue
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startOfThisMonth },
            status: { $ne: 'cancelled' }
          } 
        },
        { 
          $group: { 
            _id: null, 
            monthRevenue: { $sum: '$totalAmount' },
            monthOrders: { $sum: 1 }
          } 
        }
      ]),

      // 5. Total customers
      Customer.countDocuments(),

      // 6. Total products
      Product.countDocuments(),

      // 7. Total categories
      Category.countDocuments(),

      // 8. Latest 8 orders populated with customer & product info
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('customer', 'name email phone')
        .lean(),

      // 9. Order counts by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 10. Payment status breakdown (paid vs pending)
      Order.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
      ]),

      // 11. Payment method breakdown (cod vs online/upi)
      Order.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
      ]),

      // 12. Past 7 days sales aggregation
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
      ]),

      // 13. All products with category details for stock & catalog analysis
      Product.find()
        .select('name images variants stock category price rating reviewsCount status sku')
        .populate('category', 'name slug')
        .lean(),

      // 14. All categories
      Category.find().select('name slug image').lean(),

      // 15. Real Top Selling Products from completed orders
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            unitsSold: { $sum: '$items.quantity' },
            revenueGenerated: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            ordersCount: { $sum: 1 }
          }
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 6 }
      ])
    ]);

    const totalRevenue = ordersAggregate[0]?.totalRevenue || 0;
    const todayRevenue = todayOrdersAggregate[0]?.todayRevenue || 0;
    const todayOrdersCount = todayOrdersAggregate[0]?.todayOrders || 0;
    const monthRevenue = thisMonthOrdersAggregate[0]?.monthRevenue || 0;
    const monthOrdersCount = thisMonthOrdersAggregate[0]?.monthOrders || 0;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

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

    // Payment maps
    const paymentStatusMap = {
      paidCount: 0,
      paidAmount: 0,
      pendingCount: 0,
      pendingAmount: 0
    };
    paymentStatusCounts.forEach((p: any) => {
      if (p._id === 'paid') {
        paymentStatusMap.paidCount = p.count;
        paymentStatusMap.paidAmount = p.total;
      } else {
        paymentStatusMap.pendingCount += p.count;
        paymentStatusMap.pendingAmount += p.total;
      }
    });

    // Detect Limited Stock & Low Stock items across all products & variants
    const limitedStockItems: any[] = [];
    let outOfStockCount = 0;
    let lowStockCount = 0;

    allProducts.forEach((p: any) => {
      const categoryName = (p.category as any)?.name || 'General';
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          const variantStock = Number(v.stock || 0);
          const threshold = Number(v.minStockAlert || 10);
          
          if (variantStock <= 0) {
            outOfStockCount++;
            limitedStockItems.push({
              productId: p._id,
              name: p.name,
              sku: v.sku || p.sku || 'SKU-VAR',
              variant: `${v.name}${v.unit || 'g'}`,
              stock: variantStock,
              threshold,
              status: 'out_of_stock',
              price: v.sellingPrice || v.offerPrice || p.price || 0,
              image: p.images?.[0],
              category: categoryName
            });
          } else if (variantStock <= threshold) {
            lowStockCount++;
            limitedStockItems.push({
              productId: p._id,
              name: p.name,
              sku: v.sku || p.sku || 'SKU-VAR',
              variant: `${v.name}${v.unit || 'g'}`,
              stock: variantStock,
              threshold,
              status: variantStock <= 3 ? 'critical' : 'low',
              price: v.sellingPrice || v.offerPrice || p.price || 0,
              image: p.images?.[0],
              category: categoryName
            });
          }
        });
      } else {
        const prodStock = Number(p.stock || 0);
        if (prodStock <= 0) {
          outOfStockCount++;
          limitedStockItems.push({
            productId: p._id,
            name: p.name,
            sku: p.sku || 'SKU-STD',
            variant: 'Standard',
            stock: prodStock,
            threshold: 10,
            status: 'out_of_stock',
            price: p.price || 0,
            image: p.images?.[0],
            category: categoryName
          });
        } else if (prodStock <= 10) {
          lowStockCount++;
          limitedStockItems.push({
            productId: p._id,
            name: p.name,
            sku: p.sku || 'SKU-STD',
            variant: 'Standard',
            stock: prodStock,
            threshold: 10,
            status: prodStock <= 3 ? 'critical' : 'low',
            price: p.price || 0,
            image: p.images?.[0],
            category: categoryName
          });
        }
      }
    });

    // Sort limited stock items by stock level ascending (0 stock first, then 1, 2, 3...)
    limitedStockItems.sort((a, b) => a.stock - b.stock);

    // Map Top Selling Products with catalog details
    const productMap = new Map<string, any>();
    allProducts.forEach((p: any) => {
      productMap.set(String(p._id), p);
    });

    let topSellingProducts: any[] = [];
    if (topSellingAggregate.length > 0) {
      topSellingProducts = topSellingAggregate.map((item: any, rank: number) => {
        const prod = productMap.get(String(item._id));
        const totalStock = prod?.variants?.length > 0 
          ? prod.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
          : Number(prod?.stock || 0);

        return {
          rank: rank + 1,
          productId: item._id,
          name: prod?.name || 'Artisan Chips SKU',
          category: (prod?.category as any)?.name || 'Banana Chips',
          image: prod?.images?.[0] || null,
          price: prod?.variants?.[0]?.sellingPrice || prod?.price || 0,
          unitsSold: item.unitsSold || 0,
          revenueGenerated: item.revenueGenerated || 0,
          ordersCount: item.ordersCount || 0,
          stockRemaining: totalStock,
          rating: prod?.rating || 5,
          reviewsCount: prod?.reviewsCount || 0
        };
      });
    }

    // Fallback: If store has few orders, display top catalog items with sales potential
    if (topSellingProducts.length < 5) {
      const existingIds = new Set(topSellingProducts.map(t => String(t.productId)));
      allProducts.forEach((p: any) => {
        if (!existingIds.has(String(p._id)) && topSellingProducts.length < 6) {
          const totalStock = p.variants?.length > 0 
            ? p.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
            : Number(p.stock || 0);

          topSellingProducts.push({
            rank: topSellingProducts.length + 1,
            productId: p._id,
            name: p.name,
            category: (p.category as any)?.name || 'Artisan Special',
            image: p.images?.[0] || null,
            price: p.variants?.[0]?.sellingPrice || p.price || 0,
            unitsSold: 0,
            revenueGenerated: 0,
            ordersCount: 0,
            stockRemaining: totalStock,
            rating: p.rating || 5,
            reviewsCount: p.reviewsCount || 0
          });
        }
      });
    }

    // Category Distribution breakdown
    const categoryDistribution = allCategories.map((c: any) => {
      const prodsInCategory = allProducts.filter((p: any) => {
        const catId = p.category?._id || p.category;
        return String(catId) === String(c._id);
      });
      return {
        id: c._id,
        name: c.name,
        slug: c.slug,
        productCount: prodsInCategory.length,
        image: c.image
      };
    }).sort((a, b) => b.productCount - a.productCount);

    // Past 7 Days timeline
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

    // Fulfillment Rate
    const nonCancelledOrders = totalOrders - statusMap.cancelled;
    const fulfillmentRate = nonCancelledOrders > 0 
      ? Math.round((statusMap.delivered / nonCancelledOrders) * 100) 
      : 100;

    return sendSuccess({
      stats: {
        totalRevenue,
        todayRevenue,
        todayOrdersCount,
        monthRevenue,
        monthOrdersCount,
        averageOrderValue,
        totalOrders,
        totalCustomers,
        totalProducts,
        totalCategories,
        fulfillmentRate,
        outOfStockCount,
        lowStockCount,
        orderStatus: statusMap,
        paymentStatus: paymentStatusMap,
        paymentMethods: paymentMethodCounts
      },
      chartData: timelineData,
      recentOrders,
      limitedStockItems: limitedStockItems.slice(0, 8),
      totalLimitedStockCount: limitedStockItems.length,
      topSellingProducts,
      categoryDistribution
    }, 'Comprehensive executive dashboard telemetry retrieved');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
