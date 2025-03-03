
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  // Only allow if a user exists and user_type is "administrator"
  if (!user || user.user_type !== 'administrator') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;

// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';

// const AdminRoute = ({ children }) => {
//   const { user, loading } = useAuth();

//   // Show a loading spinner while rehydrating user info
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
//       </div>
//     );
//   }

//   // Adjust this check based on the actual value for admin users (e.g., 'admin' vs 'administrator')
//   if (!user || user.user_type !== 'administrator') {
//     return <Navigate to="/login" replace />;
//   }
  
//   return children;
// };

// export default AdminRoute;

// // src/AdminRoute.jsx
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';

// const AdminRoute = ({ children }) => {
//   const { user, loading } = useAuth();

//   // Wait for loading to finish rehydrating user
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
//       </div>
//     );
//   }

//   // Check if user is admin
//   if (!user || user.user_type !== 'administrator') {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default AdminRoute;
