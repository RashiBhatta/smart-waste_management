import api from './services/api';

const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/health');
    console.log('API connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('API connection failed:', error.message);
    return false;
  }
};

export default testAPI;