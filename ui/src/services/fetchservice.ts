import Axios from 'axios';

const BACKEND_BASE_URL =
  process.env.REACT_APP_QUERY_GEN_BACKEND_URL || 'http://localhost:3001'

const fetchService = () => {
    return Axios.create({
      baseURL: BACKEND_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
};

export default fetchService