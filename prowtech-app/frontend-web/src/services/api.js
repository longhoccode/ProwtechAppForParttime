import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.1.8:3001/api' // Your backend API URL
});

// We'll add more configuration here later, like setting the auth token
export default api;