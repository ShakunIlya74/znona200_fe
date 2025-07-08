import axios from 'axios';

axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
axios.defaults.withCredentials = true

// USE THIS FOR PROD IF ENVS DON'T WORK
export const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:1084/api' : 'https://www.znoona200.com.ua/api';

// export const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : process.env.REACT_APP_BACKEND_ENDPOINT + '/api';

const axisInstance = axios.create({
  baseURL : BASE_URL
});

export default axisInstance;