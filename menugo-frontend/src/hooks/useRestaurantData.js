import {useState, useEffect} from 'react';

export default function useRestaurantData() {
  const [restaurant, setRestaurant] = useState(null);
  useEffect(() => {
    // fetch placeholder
  }, []);
  return {restaurant, setRestaurant};
}
