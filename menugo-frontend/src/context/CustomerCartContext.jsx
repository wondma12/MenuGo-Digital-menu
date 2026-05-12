import React, {createContext, useState} from 'react';

export const CustomerCartContext = createContext();

export function CustomerCartProvider({children}) {
  const [cart, setCart] = useState([]);
  return (
    <CustomerCartContext.Provider value={{cart, setCart}}>
      {children}
    </CustomerCartContext.Provider>
  );
}
