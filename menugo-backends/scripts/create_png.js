const fs = require('fs');
const path = require('path');
const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
const buf = Buffer.from(base64, 'base64');
const out = path.join(__dirname, '..', 'tmp', 'sample-license.png');
fs.writeFileSync(out, buf);
console.log('Wrote', out);
