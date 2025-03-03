import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api/users/',
});

// Interceptor for injecting the token into request headers
instance.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (tokens && tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

class AuthService {
  signup(userData) {
    return instance.post('signup/', userData).then((res) => res.data);
  }

  login(credentials) {
    return instance.post('login/', credentials).then((res) => res.data);
  }

  verifyTwoFactor(data) {
    return instance.post('verify-2fa/', data).then((res) => res.data);
  }

  enableTwoFactor(token) {
    return instance.post('setup-2fa/', { token }).then((res) => res.data);
  }

  setTokens(tokens) {
    localStorage.setItem('tokens', JSON.stringify(tokens));
  }

  getTokens() {
    return JSON.parse(localStorage.getItem('tokens'));
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  logout() {
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
  }
}

export default new AuthService();


// // src/services/authService.js

// import axios from 'axios';

// const instance = axios.create({
//   baseURL: 'http://localhost:8000/api/users/',
// });

// // Intercepteur pour injecter le token dans le header
// instance.interceptors.request.use(
//   (config) => {
//     const tokens = JSON.parse(localStorage.getItem('tokens'));
//     if (tokens && tokens.access) {
//       config.headers.Authorization = `Bearer ${tokens.access}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// class AuthService {
//   // ======== SIGN UP ========
//   signup(userData) {
//     // POST /signup/
//     return instance.post('signup/', userData).then((res) => res.data);
//   }

//   // ======== LOGIN ========
//   login(credentials) {
//     // POST /login/
//     // Par défaut le backend répond { refresh, access, user } 
//     // ou { two_factor_required, user_id, ... }
//     return instance.post('login/', credentials).then((res) => res.data);
//   }

//   // ======== VÉRIFICATION 2FA LORS DU LOGIN ========
//   verifyTwoFactor(data) {
//     // POST /verify-2fa/
//     // Exemple de data = { user_id: ..., token: ... }
//     return instance.post('verify-2fa/', data).then((res) => res.data);
//   }

//   // ======== ACTIVATION 2FA (Setup) ========
//   enableTwoFactor(token) {
//     // POST /setup-2fa/
//     return instance.post('setup-2fa/', { token }).then((res) => res.data);
//   }

//   // ======== GESTION DES TOKENS ========
//   setTokens(tokens) {
//     localStorage.setItem('tokens', JSON.stringify(tokens));
//   }

//   getTokens() {
//     return JSON.parse(localStorage.getItem('tokens'));
//   }
//   getUser(){
//     return JSON.parse(localStorage.getItem('user'));

//   }

//   logout() {
//     localStorage.removeItem('tokens');
//     localStorage.removeItem('user');
//   }
// }

// export default new AuthService();


// src/services/authService.js

// import axios from 'axios';

// const instance = axios.create({
//   baseURL: 'http://localhost:8000/api/users/',
// });

// // Interceptor for injecting the token into request headers
// instance.interceptors.request.use(
//   (config) => {
//     const tokens = JSON.parse(localStorage.getItem('tokens'));
//     if (tokens && tokens.access) {
//       config.headers.Authorization = `Bearer ${tokens.access}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// class AuthService {
//   // ======== SIGN UP ========
//   signup(userData) {
//     // POST /signup/
//     return instance.post('signup/', userData).then((res) => res.data);
//   }

//   // ======== LOGIN ========
//   // By default the backend responds with { refresh, access, user }
//   // or { two_factor_required, user_id, ... }
//   // We'll store both tokens & user data in localStorage upon success
//   async login(credentials) {
//     const res = await instance.post('login/', credentials);
//     const data = res.data;
//     // If data includes refresh, access, and user, store them
//     if (data.refresh && data.access && data.user) {
//       this.setTokens({ refresh: data.refresh, access: data.access });
//       // Store the user object in localStorage
//       localStorage.setItem('user', JSON.stringify(data.user));
//     }
//     // Return the entire response object
//     return data;
//   }

//   // ======== 2FA Login Verification ========
//   // Example of data = { user_id: ..., token: ... }
//   async verifyTwoFactor(data) {
//     const res = await instance.post('verify-2fa/', data);
//     return res.data;
//   }

//   // ======== 2FA Setup (Activation) ========
//   async enableTwoFactor(token) {
//     const res = await instance.post('setup-2fa/', { token });
//     return res.data;
//   }

//   // ======== Token Management ========
//   setTokens(tokens) {
//     localStorage.setItem('tokens', JSON.stringify(tokens));
//   }

//   getTokens() {
//     return JSON.parse(localStorage.getItem('tokens'));
//   }

//   // Retrieve user from localStorage
//   getUser() {
//     return JSON.parse(localStorage.getItem('user'));
//   }

//   // Logout clears both tokens & user
//   logout() {
//     localStorage.removeItem('tokens');
//     localStorage.removeItem('user');
//   }
// }

// export default new AuthService();

