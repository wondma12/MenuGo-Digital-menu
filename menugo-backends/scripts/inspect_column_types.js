const mysql = require('mysql2/promise');
require('dotenv').config();
(async ()=>{
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'menugo_db',
    waitForConnections: true,
    connectionLimit: 10,
  });
  const conn = await pool.getConnection();
  try{
    const cols = [
      {table:'orders', col:'id'},
      {table:'restaurants', col:'id'},
      {table:'users', col:'id'},
      {table:'menu_items', col:'id'},
      {table:'inventory_items', col:'id'},
      {table:'kitchen_orders', col:'order_id'},
      {table:'kitchen_orders', col:'restaurant_id'},
      {table:'kitchen_orders', col:'waiter_id'},
      {table:'kitchen_order_items', col:'item_id'},
      {table:'kitchen_inventory_alerts', col:'item_id'},
    ];
    for(const c of cols){
      const [rows] = await conn.execute(
        `SELECT column_name, column_type, character_set_name, collation_name, is_nullable FROM information_schema.COLUMNS WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
        [process.env.DB_NAME, c.table, c.col]
      );
      console.log(`${c.table}.${c.col}:`, rows[0] || 'missing');
    }
  }catch(e){
    console.error(e.message);
  }finally{ conn.release(); pool.end(); }
})();
