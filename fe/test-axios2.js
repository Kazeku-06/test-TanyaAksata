const axios = require('axios');
const FormData = require('form-data');

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    "Content-Type": "application/json",
  },
});

async function run() {
  const form = new FormData();
  form.append('name', 'test');
  form.append('avatar', Buffer.from('hello'), { filename: 'test.jpg' });

  await api.post('/', form, {
    transformRequest: [
      (data, headers) => {
        delete headers['Content-Type'];
        delete headers.post?.['Content-Type'];
        // Node's form-data requires headers, so we set them manually just for the test
        Object.assign(headers, form.getHeaders());
        return data;
      }
    ]
  });
}
run();
