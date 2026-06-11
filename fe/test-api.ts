import axios from 'axios';

async function test() {
  try {
    console.log("Fetching without token...");
    let res = await axios.get("https://api-ta.neverland.my.id/api/v1/posts?page=1");
    console.log("No token:", res.data.data.data.length, "posts");

    // Let's login first to get a token
    console.log("Logging in...");
    let loginRes = await axios.post("https://api-ta.neverland.my.id/api/v1/auth/login", {
      email: "test@example.com", // Assume this user exists or we can register one
      password: "password"
    });
    
    // If login fails, let's just print it
    let token = loginRes.data?.data?.token;
    console.log("Token:", token);

    if (token) {
      console.log("Fetching with token...");
      let resWithToken = await axios.get("https://api-ta.neverland.my.id/api/v1/posts?page=1", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("With token:", resWithToken.data.data.data.length, "posts");
    }
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message);
  }
}

test();
