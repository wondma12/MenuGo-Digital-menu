const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const upload = async () => {
  try {
    const filePath = path.join(__dirname, '..', 'tmp', 'sample-license.pdf');
    const stream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('file', stream, { filename: 'sample-license.pdf', contentType: 'application/pdf' });
    form.append('folder', 'menugo/business_licenses');

    const res = await axios.post('http://localhost:5005/api/upload', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    console.log('Upload response:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Upload failed:', err.response.status, err.response.data);
    } else {
      console.error('Upload error:', err.message);
    }
    process.exit(1);
  }
};

upload();
