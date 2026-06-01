(async ()=>{
  try{
    process.env.SQLITE_DEV_FALLBACK='true';
    const KitchenOrder = require('./src/models/KitchenOrder');
    const res = await KitchenOrder.getDashboardData('8abe8e86-c4fc-4f55-b85a-b346432569d3');
    console.log('ok', JSON.stringify(res, null, 2));
  }catch(e){
    console.error('err', e && e.message ? e.message : e);
  }
  process.exit(0);
})();