import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api/donations/projects/',
});

// Intercepteur pour injecter le token dans le header
instance.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (tokens && tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class ProjetService {


    createProjet(data){
        instance.post('/donations/projects/',data)
        return "added successfully"
    }
}


export default new ProjetService();
