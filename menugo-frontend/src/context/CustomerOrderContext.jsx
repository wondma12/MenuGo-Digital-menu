import {createContext, useState} from 'react'

export const CustomerOrderContext = createContext();

export function CustomerOrderProvider({children}) {
  const [orders, setOrders] = useState([]);
  return (
    <CustomerOrderContext.Provider value={{orders, setOrders}}>
      {children}
    </CustomerOrderContext.Provider>
  );
}
