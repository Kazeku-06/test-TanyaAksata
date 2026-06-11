const FormData = require('form-data');
const axios = require('axios');

async function test() {
  const form = new FormData();
  form.append('name', 'Nopal');
  // simulate an empty file, or just a buffer
  form.append('avatar', Buffer.from('fake image data'), {
    filename: 'test.jpg',
    contentType: 'image/jpeg',
  });
  form.append('_method', 'PATCH');

  try {
    const res = await axios.post('https://api-ta.neverland.my.id/api/v1/profile', form, {
      headers: {
        ...form.getHeaders(),
        // Needs authorization to test actually, so we can't test external API without token.
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data);
  }
}
test();
