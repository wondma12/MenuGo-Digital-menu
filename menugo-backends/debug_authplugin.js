const mysql = require('mysql2');
const names = ['caching_sha2_password','mysql_clear_password','sha256_password','mysql_native_password'];
for (const name of names) {
  const fn = mysql.authPlugins[name];
  console.log('---', name, typeof fn, fn && fn.name);
  if (fn) {
    console.log(fn.toString().split('\n').slice(0, 20).join('\n'));
    console.log('bind len', fn.bind.length);
  }
}
