import {useState, useEffect} from 'react';

export default function useCustomerCart() {
  const [cart, setCart] = useState([]);
  useEffect(() => {
    // placeholder: hydrate from localStorage or API
  }, []);
  return {cart, setCart};
}
