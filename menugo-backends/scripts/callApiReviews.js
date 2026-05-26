const axios = require('axios');
(async ()=>{
  try{
    const slug = 'haymanotwondmagegn-1778137307965';
    const res = await axios.get(`http://localhost:5002/api/restaurants/${slug}/reviews`);
    console.log(JSON.stringify(res.data, null, 2));
  }catch(e){
    console.error(e.message || e);
    if (e.response) console.error(JSON.stringify(e.response.data, null,2));
  }
})();