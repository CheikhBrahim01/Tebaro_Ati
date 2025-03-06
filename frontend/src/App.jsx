import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './AdminRoute';
import Home from './components/Home';
import BrowseProjectsPage from './pages/BrowseProjectsPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SetupTwoFactorPage from './pages/SetupTwoFactorPage';
import AddProjectPage from './pages/AddProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import WalletPage from './pages/WalletPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminTransaction from './pages/AdminTransactions';
import MyProjectsPage from './pages/MyProjectsPage';
import AdminTransactionsDashboard from './pages/AdminTransactionsDashboard';
import AdminTransactionTopupPage from './pages/AdminTransactionTopupPage';
import AdminTransactionWithdrawalPage from './pages/AdminTransactionWithdrawalPage';

function AppContent() {
  const location = useLocation();

  const noNavbarPaths = ['/login', '/register', '/setup-2fa', '/forgot-password', '/reset-password'];
  const shouldShowNavbar = !noNavbarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className={`flex-grow ${shouldShowNavbar ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<BrowseProjectsPage />} />
          <Route path="/admin/transactions" element={<AdminTransactionsDashboard />}>
          <Route path="topup" element={<AdminTransactionTopupPage />} />
          <Route path="withdrawal" element={<AdminTransactionWithdrawalPage />} />
        </Route>
          <Route path="/projects/:projectId" element= {
            <PrivateRoute>
            <ProjectDetailPage /> </PrivateRoute>
            } />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route
            path="/setup-2fa"
            element={
              <PrivateRoute>
                <SetupTwoFactorPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-project"
            element={
              <PrivateRoute>
                <AddProjectPage />
              </PrivateRoute>
            }
          />
          {/* Admin-only route */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <AdminRoute>
                <AdminTransaction/>
              </AdminRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;




// import React from 'react';
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useLocation
// } from 'react-router-dom';

// import Navbar from './components/Navbar';
// import { AuthProvider } from './context/AuthContext';
// import PrivateRoute from './components/PrivateRoute';
// import BrowseProjectsPage from './pages/BrowseProjectsPage';
// import SignupPage from './pages/SignupPage';
// import LoginPage from './pages/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import SetupTwoFactorPage from './pages/SetupTwoFactorPage';
// import Home from './components/Home';
// import AddProjectPage from './pages/AddProjectPage';
// import ProjectDetailPage from './pages/ProjectDetailPage';
// import WalletPage from './pages/WalletPage';
// import AdminRoute from './AdminRoute';
// import AdminDashboard from './pages/AdminDashboard';

// // This component handles showing or hiding the Navbar
// function AppContent() {
//   const location = useLocation();

//   // List of paths where you DON'T want the Navbar to appear
//   const noNavbarPaths = [
//     '/login',
//     '/register',
//     "/setup-2fa"
//   ];

//   // If current path is in noNavbarPaths, we hide the Navbar
//   const shouldShowNavbar = !noNavbarPaths.some((path) =>
//     location.pathname.startsWith(path)
//   );

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Conditionally render Navbar */}
//       {shouldShowNavbar && <Navbar />}

//       {/* If you show the Navbar, you might add top padding so content isn't hidden behind it */}
//       <main className={`flex-grow ${shouldShowNavbar ? 'pt-16' : ''}`}>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/projects" element={<BrowseProjectsPage />} />

//           <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
//           <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
//           <Route path="/wallet" element={<WalletPage />} />

//           {/* Route protégée => seulement utilisateur connecté */}
//           <Route
//             path="/add-project"
//             element={
//               <PrivateRoute>
//                 <AddProjectPage />
//               </PrivateRoute>
//             }
//             />

//           <Route path="/register" element={<SignupPage />} />
//           <Route path="/login" element={<LoginPage />} />

//           {/* Protected routes */}
//           <Route
//             path="/setup-2fa"
//             element={
//               <PrivateRoute>
//                 <SetupTwoFactorPage />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/dashboard"
//             element={
//               <PrivateRoute>
//                 <DashboardPage />
//               </PrivateRoute>
//             }
//           />

//           {/* ADMIN ROUTES */}
//             <Route
//               path="/admin-dashboard"
//               element={
//                 <AdminRoute>
//                   <AdminDashboard />
//                 </AdminRoute>
//               }
//             />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppContent />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
