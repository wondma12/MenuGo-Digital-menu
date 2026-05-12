// src/components/kitchen/KitchenOrderDetails.jsx
import React from 'react';
import Modal from '../common/Modal';
import KitchenStatusBadge from './KitchenStatusBadge';

const KitchenOrderDetails = ({ order, displayNumber, onClose, onUpdateStatus }) => {
  const totalPrepTime = order.items.reduce((total, item) => {
    return total + (item.preparationTime || 5) * item.quantity;
  }, 0);

  const titleNumber = displayNumber ?? order.orderNumber;

  return (
    <Modal isOpen={true} onClose={onClose} title={`Order #${titleNumber}`} size="large">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <div className="text-sm text-gray-500">Table</div>
            <div className="font-medium text-lg">{order.tableNumber}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <KitchenStatusBadge status={order.status} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Order Time</div>
            <div className="font-medium">{new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Est. Preparation Time</div>
            <div className="font-medium">{totalPrepTime} minutes</div>
          </div>
          {order.waiterName && (
            <div>
              <div className="text-sm text-gray-500">Waiter</div>
              <div className="font-medium">{order.waiterName}</div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <div className="font-medium">
                    {item.quantity}x {item.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Est: {item.preparationTime || 5} min
                  </div>
                </div>
                {item.specialInstructions && (
                  <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    📝 Special: {item.specialInstructions}
                  </div>
                )}
                {item.modifiers?.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Modifiers: {item.modifiers.map(m => m.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Close
          </button>
          {order.status === 'pending' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'preparing');
                onClose();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Start Preparation
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'ready');
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Mark as Ready
            </button>
          )}
          {order.status === 'ready' && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, 'completed');
                onClose();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default KitchenOrderDetails;