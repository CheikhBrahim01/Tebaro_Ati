import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;



// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function PrivateRoute({ children }) {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return isAuthenticated ? children : <Navigate to="/login" />;
// }