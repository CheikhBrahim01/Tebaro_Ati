import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Profile
          </h2>

          {user ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-blue-800">
                  Information Personalles 
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Nom:</p>
                    <p className="font-medium">{user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Numero de téLéphone:</p>
                    <p className="font-medium">{user.phone_number}</p>
                  </div>
                  
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-800">
                   Status du compte
                </h3>
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg 
                      className="w-6 h-6 text-green-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </span>
                  <p className="text-green-800">
                    Active et Verifié
                  </p>
                </div>
              </div>

              {/* {user.user_type === 'donor' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 text-purple-800">
                    Donor Information
                  </h3>
                  <p>Additional donor-specific details would be displayed here.</p>
                </div>
              )} */}

              {/* {user.user_type === 'beneficiary' && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2 text-orange-800">
                    <Link to="/wallet">Check your wallet information </Link>
                  </h3>
                </div>
              )} */}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">Loading user information...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mt-4"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;