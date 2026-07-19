const axios = require('axios');
const db = require('../src/models');

(async ()=>{
  try{
    // First, fetch a valid restaurant from the database
    const Restaurant = db.Restaurant;
    const validRestaurant = await Restaurant.findOne({
      where: { is_verified: true, is_active: true },
    });
    
    if (!validRestaurant) {
      console.log('No verified active restaurants found in database');
      return;
    }
    
    const slug = validRestaurant.restaurant_slug;
    console.log(`Fetching reviews for restaurant: ${slug}`);
    
    const res = await axios.get(`http://localhost:5002/api/menu/restaurant/${slug}/reviews`);
    console.log(JSON.stringify(res.data, null, 2));
  }catch(e){
    console.error(e.message || e);
    if (e.response) console.error(JSON.stringify(e.response.data, null, 2));
  }
})();