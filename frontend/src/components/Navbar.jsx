import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  // Déterminer le lien du logo : pour les admin, on renvoie vers /admin-dashboard, sinon vers /
  const logoLink = user?.user_type === 'administrator' ? '/admin-dashboard' : '/';

  return (
    <nav className="bg-cyan-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={logoLink} className="flex items-center space-x-3">
            <span className="font-bold text-xl">Tebaro_ati</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {user.user_type !== 'administrator' && (
                <Link to="/wallet" className="hover:text-indigo-200 transition">
                  Mon Portfeuille
                </Link>
                )}
                {user.user_type !== 'administrator' && (
                  <Link to="/my-projects" className="hover:text-indigo-200 transition">
                    Mes Projets
                  </Link>

                  
                )}
                {/* Bouton dropdown avec nom d'utilisateur et icône */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 hover:text-indigo-200 transition bg-cyan-700 px-3 py-1 rounded-md"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 10a4 4 0 100-8 4 4 0 000 8z" />
                      <path fillRule="evenodd" d="M.458 16.042A9.956 9.956 0 0010 18a9.956 9.956 0 009.542-1.958A9.967 9.967 0 0010 12a9.967 9.967 0 00-9.542 4.042z" clipRule="evenodd" />
                    </svg>
                    <span>{user.full_name}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Voir profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="hover:text-indigo-200 transition">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-cyan-700`}>
        <div className="px-4 pt-2 pb-3 space-y-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="block text-white py-2 px-4 hover:bg-cyan-500"
              >
                Dashboard
              </Link>
              {user.user_type !== 'administrator' && (
                <Link
                  to="/my-projects"
                  className="block text-white py-2 px-4 hover:bg-cyan-500"
                >
                  Mes Projets
                </Link>
              )}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="block text-white py-2 px-4 w-full text-left hover:bg-red-500 bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="block text-white py-2 px-4 hover:bg-cyan-500">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white text-black rounded-lg shadow-lg p-6 z-10 max-w-sm mx-auto text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-around">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
