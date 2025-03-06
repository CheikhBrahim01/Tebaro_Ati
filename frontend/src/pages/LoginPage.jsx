import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, twoFactorSchema } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';


// Icons (from Bootstrap Icons, for example)
// Make sure you have <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css" />
// or use your own preferred icon set.

const LoginPage = () => {
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form for initial login
  const loginForm = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      phone_number: '',
      password: '',
    },
  });

  // Form for 2FA token
  const twoFactorForm = useForm({
    resolver: yupResolver(twoFactorSchema),
    defaultValues: {
      token: '',
    },
  });

  // --- Submit: Login credentials ---
  const onLoginSubmit = async (data) => {
    try {
      setError(null);
      const response = await authService.login(data); // POST /users/login/

      if (response.two_factor_required) {
        // 2FA is enabled; show TOTP input
        setTwoFactorRequired(true);
        setUserId(response.user_id);
        twoFactorForm.reset({ token: '' });
      } else {
        // No 2FA yet: store tokens/user and redirect to set up 2FA
        const { refresh, access, user } = response;
        login(user, { refresh, access });
        navigate('/setup-2fa');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err?.error ||
        err?.detail ||
        'Login failed. Please check your credentials.'
      );
    }
  };

  // --- Submit: 2FA Token ---
  const onTwoFactorSubmit = async (data) => {
    try {
      setError(null);
      const response = await authService.verifyTwoFactor({
        user_id: userId,
        token: data.token,
      });
      // Store tokens/user in context or localStorage
      const { refresh, access, user } = response;
      login(user, { refresh, access });

      // Navigate to user dashboard
      user.user_type == 'beneficiary' ? navigate('/dashboard') : navigate('/admin-dashboard') ;
    } catch (err) {
      console.error('2FA error:', err);
      setError(
        err?.error ||
        err?.detail ||
        '2FA verification failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-300 via-sky-300 to-white">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md mt-16 relative">
        <h2 className="text-center text-2xl font-bold text-cyan-500">
          {twoFactorRequired ? 'Two-Factor Authentication' : 'Se connecter'}
        </h2>
        <div className="mt-1 mx-auto w-16 h-1 bg-cyan-500 rounded absolute left-1/2 transform -translate-x-1/2"></div>

        {/* Error display */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
            {error}
          </div>
        )}

        {twoFactorRequired ? (
          // -----------------------------------
          // 2FA Form
          // -----------------------------------
          <form
            onSubmit={twoFactorForm.handleSubmit(onTwoFactorSubmit)}
            className="space-y-4 mt-6"
            autoComplete="off"
          >
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-shield-lock text-gray-500 ml-2"></i>
                <input
                  type="text"
                  {...twoFactorForm.register('token')}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none rounded-full text-center"
                  autoComplete="off"
                />
              </div>
              {twoFactorForm.formState.errors.token && (
                <p className="text-red-500 text-sm mt-1">
                  {twoFactorForm.formState.errors.token.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-500 text-white font-semibold rounded-full shadow-md hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-400"
              >
                Verify
              </button>
            </div>
          </form>
        ) : (
          // -----------------------------------
          // Initial Login Form
          // -----------------------------------
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-4 mt-6"
            autoComplete="off"
          >
            {/* Phone Number */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-telephone-fill text-gray-500 ml-2"></i>
                <input
                  type="text"
                  {...loginForm.register('phone_number')}
                  placeholder="numéro de téléphone"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none rounded-full"
                />
              </div>
              {loginForm.formState.errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {loginForm.formState.errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-lock-fill text-gray-500 ml-2"></i>
                <input
                  type="password"
                  {...loginForm.register('password')}
                  placeholder="mot de passe"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none rounded-full"
                />
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-500 text-white font-semibold rounded-full shadow-md hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-400"
              >
                CONNEXION
              </button>
            </div>

            {/* Optionally add "Forgot password?" or "Sign Up" links */}
            <div className="text-center mt-4">
              <p>
                Nouvel utilisateur?{' '}
                <span
                  onClick={() => navigate('/register')}
                  className="text-cyan-500 hover:underline cursor-pointer"
                >
                  S'inscrire
                </span>
              </p>
            </div>

            <div className="text-center mt-4">
              <p>
                
                <span
                  onClick={() => navigate('/forgot-password')}
                  className="text-cyan-500 hover:underline cursor-pointer"
                >
                  Mot de passe oublié?
                </span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
