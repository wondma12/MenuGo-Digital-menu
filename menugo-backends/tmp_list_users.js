(async()=>{
  try{
    const { User } = require('./src/models');
    const users = await User.findAll({ attributes: ['email','full_name'] });
    console.log(users.map(u=>u.get({plain:true})));
  } catch(e){
    console.error('Error:', e.message);
  }
  process.exit(0);
})();
