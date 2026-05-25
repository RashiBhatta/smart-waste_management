import api from './src/services/api.js';

const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/health');
    console.log('API connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('API connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

testAPI();