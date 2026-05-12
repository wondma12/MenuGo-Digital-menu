(async () => {
  try {
    const payload = {
      restaurant_id: "demo-restaurant-001",
      items: [
        { menu_item_id: "b4acbee0-865f-47f9-ba2a-95d7360ce9ff", quantity: 2, special_instructions: null, options: [], modifiers: [] }
      ],
      table_number: "5",
      special_instructions: null,
      order_type: "dine_in",
      customer_name: "Test Customer",
      customer_phone: "1234567890",
      customer_email: "",
      delivery_address: null
    };

    const res = await fetch('http://localhost:5003/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log(text);
  } catch (err) {
    console.error('Error:', err);
  }
})();
