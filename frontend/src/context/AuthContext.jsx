import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On mount, check for stored tokens and user info
    const tokens = authService.getTokens();
    if (tokens && tokens.access) {
      setIsAuthenticated(true);
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, tokens) => {
    if (tokens) {
      authService.setTokens(tokens);
    }
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



//  import React, { createContext, useState, useContext, useEffect } from 'react';
// import authService from '../services/authService';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Au montage, on check juste si on a un access token
//     const tokens = authService.getTokens();
//     if (tokens && tokens.access) {
//       setIsAuthenticated(true);
//       // On peut charger user depuis localStorage si vous le stockez
//       const storedUser = JSON.parse(localStorage.getItem('user'));
//       if (storedUser) {
//         setUser(storedUser);
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   const login = (userData, tokens) => {
//     // Lorsqu'on se connecte, stocker user + tokens
//     if (tokens) {
//       authService.setTokens(tokens);
//     }
//     setIsAuthenticated(true);
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const logout = () => {
//     authService.logout();
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         isLoading,
//         user,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


// src/context/AuthContext.jsx
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import authService from '../services/authService';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [authenticated, setAuthenticated] = useState(false);
//   // RENAMED isLoading to loading
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // On mount, check if we have stored tokens
//     const tokens = authService.getTokens();
//     if (tokens && tokens.access) {
//       setAuthenticated(true);
//       // If we stored user, load it
//       const storedUser = authService.getUser();
//       if (storedUser) {
//         setUser(storedUser); // e.g. user_type = 'administrator'
//       }
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData, tokens) => {
//     if (tokens) {
//       authService.setTokens(tokens);
//     }
//     setAuthenticated(true);
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const logout = () => {
//     authService.logout();
//     setAuthenticated(false);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         authenticated,
//         loading, // Use 'loading' instead of 'isLoading'
//         user,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

