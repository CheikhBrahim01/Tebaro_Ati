// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Layout = ({ children }) => {
//   const { isAuthenticated, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <nav className="bg-blue-600 text-white p-4">
//         <div className="container mx-auto flex justify-between items-center">
//           <div className="text-xl font-bold">
//             <Link to="/">Auth App</Link>
//           </div>
//           <div className="space-x-4">
//             {!isAuthenticated ? (
//               <>
//                 <Link to="/login" className="hover:underline">
//                   Login
//                 </Link>
//                 <Link to="/signup" className="hover:underline">
//                   Sign Up
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <Link to="/dashboard" className="hover:underline">
//                   Dashboard
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
//                 >
//                   Logout
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </nav>

//       <main className="flex-grow container mx-auto px-4 py-6">{children}</main>

//       <footer className="bg-gray-200 p-4 text-center">
//         © 2025 Authentication App
//       </footer>
//     </div>
//   );
// };

// export default Layout;