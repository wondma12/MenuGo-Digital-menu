import {createContext, useState} from 'react'

export const RestaurantContext = createContext();

export function RestaurantProvider({children}) {
  const [restaurant, setRestaurant] = useState(null);
  return (
    <RestaurantContext.Provider value={{restaurant, setRestaurant}}>
      {children}
    </RestaurantContext.Provider>
  );
}
