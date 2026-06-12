import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

async function testReport() {
    try {
        // We need a token. I'll assume I can't easily get one without a real user.
        // But I can check if the route exists by sending a request and seeing the error.
        // If it's 401, the route exists but needs auth.
        // If it's 404, the route doesn't exist.
        const response = await axios.post(`${API_URL}/reports`, {
            target_type: 'post',
            target_id: 'some-uuid',
            reason: 'Test reason'
        });
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testReport();
