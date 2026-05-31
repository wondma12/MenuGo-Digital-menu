

    // src/components/kitchen/KitchenCompletedOrders.jsx
import React, { useState, useEffect } from 'react';
import kitchenService from '../../services/kitchenService';
import { useWebSocket } from '../../hooks/useWebSocket';
import Pagination from '../common/Pagination';

// KitchenCompletedOrders can be used in two ways:
// 1. Parent supplies `orders` (array) and this component simply renders them.
// 2. Parent supplies `restaurantId` and this component will fetch paginated completed orders from the API.
// The component also supports controlled pagination/dateRange via props.
const KitchenCompletedOrders = ({
  restaurantId,
  orders: propOrders = null,
  page: pageProp,
  limit: limitProp,
  dateRange: dateRangeProp,
  onPageChange,
  onDateRangeChange,
  onPaginationChange,
  showTitle = true,
}) => {
  const toLocalDateString = (value) => {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 10)
  }

  const [orders, setOrders] = useState(Array.isArray(propOrders) ? propOrders : []);
  const [loading, setLoading] = useState(!Array.isArray(propOrders));
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  // default to today range (YYYY-MM-DD) so backend DATE(completed_at) comparisons work
  const today = new Date();
  const todayStr = toLocalDateString(today);
  const [dateRange, setDateRange] = useState({ start: todayStr, end: todayStr });

  // If parent passed orders, keep them in sync and don't call the API
  useEffect(() => {
    if (Array.isArray(propOrders)) {
      setOrders(propOrders);
      setLoading(false);
    }
  }, [propOrders]);

  // Controlled vs uncontrolled behavior
  const isPageControlled = typeof pageProp === 'number';
  const isDateControlled = !!dateRangeProp && (!!dateRangeProp.start || !!dateRangeProp.end);

  const currentPage = isPageControlled ? pageProp : pagination.page;
  const currentLimit = typeof limitProp === 'number' ? limitProp : pagination.limit;
  // If parent passed an empty dateRange (''), fall back to internal default (today)
  const currentDateRange = (isDateControlled ? dateRangeProp : dateRange) || dateRange;

  // Only fetch from API when we have a restaurantId and no propOrders were provided
  useEffect(() => {
    if (!restaurantId || Array.isArray(propOrders)) return;
    fetchCompletedOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, currentPage, currentLimit, currentDateRange.start, currentDateRange.end]);

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      // API expects date-only strings (YYYY-MM-DD) for DATE() comparisons in SQL
      const params = {
        page: currentPage,
        limit: currentLimit,
      };
      if (currentDateRange && currentDateRange.start) params.startDate = toLocalDateString(currentDateRange.start);
      if (currentDateRange && currentDateRange.end) params.endDate = toLocalDateString(currentDateRange.end);

      const response = await kitchenService.getCompletedOrders(restaurantId, params);

      // Normalize response shape
      const payload = response?.data?.data || response?.data || {};
      const fetchedOrders = payload.orders || payload.items || [];
      const fetchedPagination = payload.pagination || payload.meta || { page: pagination.page, limit: pagination.limit, total: fetchedOrders.length };

      setOrders(fetchedOrders);
      const normalized = { ...pagination, ...fetchedPagination };
      normalized.pages = fetchedPagination.pages || Math.ceil((fetchedPagination.total || 0) / (fetchedPagination.limit || currentLimit));

      // Notify parent of pagination meta when requested
      if (typeof onPaginationChange === 'function') {
        onPaginationChange(normalized);
      } else {
        setPagination(normalized);
      }
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to socket events so completed list refreshes when kitchen updates occur
  const { onEvent } = useWebSocket();

  useEffect(() => {
    if (!restaurantId) return;

    const handler = (payload) => {
      try {
        // payload may include status or updatedOrder/order
        const status = payload && (payload.status || payload.updatedOrder?.status || payload.order?.status);
        // Refresh when an order becomes completed or on bulk updates
        if (status === 'completed' || payload?.status === 'completed' || payload?.action === 'status_update') {
          fetchCompletedOrders();
        }
        // Also refresh for general kitchen updates
        if (!status && (payload && (payload.order || payload.order_id || payload.orderId))) {
          fetchCompletedOrders();
        }
      } catch (e) {
        console.error('Error handling socket update in CompletedOrders', e);
      }
    };

    const unsub1 = onEvent('kitchen_order_updated', handler);
    const unsub2 = onEvent('kitchen-order-updated', handler);
    const unsub3 = onEvent('kitchen_updated', handler);
    const unsub4 = onEvent('kitchen-bulk-update', handler);

    return () => {
      unsub1(); unsub2(); unsub3(); unsub4();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString();
  };

  const setPredefinedRange = (rangeKey) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (rangeKey) {
      case 'today':
        start = new Date(); start.setHours(0,0,0,0);
        break;
      case 'weekly':
        start = new Date(); start.setDate(now.getDate() - 6); start.setHours(0,0,0,0);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1); start.setHours(0,0,0,0);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1); start.setHours(0,0,0,0);
        break;
      default:
        start = new Date(); start.setHours(0,0,0,0);
    }

    const startStr = toLocalDateString(start);
    const endStr = toLocalDateString(end);
    setDateRange({ start: startStr, end: endStr });
    if (typeof onDateRangeChange === 'function') onDateRangeChange({ start: startStr, end: endStr });
  };

  if (loading) {
    return <div className="rounded-2xl border border-gray-100 bg-white/90 py-10 text-center text-gray-600 shadow-sm">Loading...</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-blue-50 p-5">
        {showTitle && (
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Completed Orders</h2>
              <p className="text-sm text-gray-500">Review completed orders and historical reports</p>
            </div>
            <div className="flex items-center space-x-2">
              {['today','weekly','monthly','yearly'].map(key => (
                <button
                  key={key}
                  onClick={() => setPredefinedRange(key)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    key === 'today'
                      ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Table</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Menu</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Items</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Prep Time</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Completed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.map((order, idx) => {
              // compute display number taking pagination into account (use controlled values when provided)
              const base = ((currentPage || 1) - 1) * (currentLimit || 1);
              const displayNumber = base + idx + 1;
              // Support backend API snake_case and frontend camelCase shapes
              const orderNumber = order.order_number || order.orderNumber || order.id;
              const table = order.table_number || order.tableNumber || order.table || '-';
              const customer = order.customer_name || order.customerName || order.customer || 'Guest';
              const itemCount = order.item_count || order.itemCount || (order.items ? order.items.length : 0);
              // derive menu image/name from first item when available
              const firstItem = (order.items && order.items.length) ? order.items[0] : (order.menu ? order.menu : null);
              const menuImage = firstItem?.image || firstItem?.menu_image || firstItem?.imageUrl || firstItem?.image_url || null;
              const menuName = firstItem?.name || firstItem?.menu_name || firstItem?.title || (order.menu && order.menu.name) || '';
              const prepTime = order.prep_time || order.prepTime || order.estimatedPreparationTime || order.totalPrepTime || '-';
              const completedAt = order.completed_at || order.completedAt || order.updatedAt || order.completed_at;

              return (
                <tr key={order.id || orderNumber} className="transition-colors hover:bg-orange-50/60">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">#{displayNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Table {table}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{itemCount} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {menuImage ? (
                      <img src={menuImage} alt={menuName} className="inline-block h-8 w-12 rounded-lg object-cover ring-1 ring-gray-100 mr-2" />
                    ) : (
                      <div className="inline-block h-8 w-12 rounded-lg bg-gray-100 mr-2" />
                    )}
                    <span className="align-middle text-gray-700">{menuName || '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{prepTime} {prepTime !== '-' ? 'min' : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatTime(completedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No completed orders found
        </div>
      )}
      
      <div className="p-4 border-t">
        {!Array.isArray(propOrders) && !isPageControlled && typeof pagination.pages === 'number' && pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => setPagination({ ...pagination, page })}
          />
        )}
      </div>
    </div>
  );
};

export default KitchenCompletedOrders;