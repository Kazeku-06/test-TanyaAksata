const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

async function run() {
  const form = new FormData();
  form.append('name', 'test');
  form.append('avatar', Buffer.from('hello'), { filename: 'test.jpg' });

  await api.post('/', form);
  
  // also test with the headers: { "Content-Type": "multipart/form-data" }
  await api.post('/', form, { headers: { "Content-Type": "multipart/form-data" } });
}
run();
