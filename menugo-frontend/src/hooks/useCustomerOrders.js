import {useState} from 'react';

export default function useCustomerOrders() {
  const [orders, setOrders] = useState([]);
  return {orders, setOrders};
}
