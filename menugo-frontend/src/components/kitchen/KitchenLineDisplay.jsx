// src/components/kitchen/KitchenLineDisplay.jsx
import {useState, useEffect} from 'react'

const KitchenLineDisplay = ({ orders, onComplete }) => {
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    // Create a map of order id -> sequential display number (per-list)
    const orderIndexMap = orders.reduce((m, o, i) => {
      m[o.id] = (o.displayNumber != null) ? o.displayNumber : i + 1;
      return m;
    }, {});

    // Group orders by station and attach a friendly display number
    const grouped = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const station = item.station || 'main';
        if (!acc[station]) acc[station] = [];
        acc[station].push({
          ...item,
          orderNumber: orderIndexMap[order.id] || order.orderNumber,
          tableNumber: order.tableNumber,
          orderId: order.id
        });
      });
      return acc;
    }, {});

    setLineItems(grouped);
  }, [orders]);

  const stations = ['grill', 'pizza', 'salad', 'dessert', 'main'];

  return (
    <div className="kitchen-line-display">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stations.map(station => (
          <div key={station} className="bg-gray-50 rounded-lg p-3">
            <div className="font-bold text-lg mb-3 capitalize text-center">
              {station} Station
              <span className="ml-2 text-sm text-gray-500">
                ({lineItems[station]?.length || 0})
              </span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lineItems[station]?.map((item, idx) => (
                <div key={idx} className="bg-white rounded p-2 shadow-sm border-l-4 border-orange-500">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">{item.quantity}x</span>
                    <span className="text-gray-500">#{item.orderNumber}</span>
                  </div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">Table {item.tableNumber}</div>
                  {item.specialInstructions && (
                    <div className="text-xs text-orange-600 mt-1">
                      📝 {item.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
              
              {(!lineItems[station] || lineItems[station].length === 0) && (
                <div className="text-center text-gray-400 text-sm py-4">
                  No active orders
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenLineDisplay;