import Axios from 'axios';

const BACKEND_BASE_URL =
  process.env.QUERY_GEN_BACKEND_URL || 'https://query-gen.dev.rudderlabs.com';

const fetchService = () => {
    return Axios.create({
      baseURL: BACKEND_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
};

export default fetchService