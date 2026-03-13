const API_CONFIG = {
  baseURL: 'http://localhost:5000/api',
  socketURL: 'http://localhost:5000',
  timeout: 30000,
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'
};

export default API_CONFIG;