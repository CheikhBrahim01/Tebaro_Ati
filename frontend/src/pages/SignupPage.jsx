import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema } from '../utils/validation';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as yup from 'yup';

const totpSchema = yup.object({
  token: yup
    .string()
    .length(6, 'Verification code must be 6 digits')
    .required('Verification code is required'),
});

const SignupPage = () => {
  // State for controlling signup / 2FA steps
  const [qrCode, setQrCode] = useState(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState(null);
  const [step, setStep] = useState('signup'); // "signup" | "totp"
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Form for signup
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm({ resolver: yupResolver(signupSchema) });

  // Form for TOTP
  const {
    register: registerTOTP,
    handleSubmit: handleTOTPSubmit,
    formState: { errors: totpErrors },
  } = useForm({ resolver: yupResolver(totpSchema) });

  // 1. Submit Signup
  const onSignupSubmit = async (data) => {
    try {
      setError(null);

      // Remove user_type if present
      const { user_type, ...filteredData } = data;
      const response = await authService.signup(filteredData);

      const { refresh, access, user, qr_code, two_factor_secret } = response;

      // Save tokens & user to local state / context
      authService.setTokens({ refresh, access });
      localStorage.setItem('user', JSON.stringify(user));
      login(user, { refresh, access });

      // Setup 2FA
      setQrCode(qr_code);
      setTwoFactorSecret(two_factor_secret);
      setStep('totp');
    } catch (err) {
      console.error('Signup error:', err);
      setError(
        err?.response?.data ||
          err?.message ||
          'Signup failed. Please try again.'
      );
    }
  };

  // 2. Submit 2FA Code
  const onTOTPSubmit = async ({ token }) => {
    try {
      setError(null);
      // POST to /setup-2fa/ to enable two factor
      await authService.enableTwoFactor(token);
      // If successful, go to the dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('TOTP error:', err);
      setError(
        err?.response?.data?.token ||
          err?.response?.data?.detail ||
          'Verification failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-300 via-sky-300 to-white">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md mt-16 relative">
        <h2 className="text-center text-2xl font-bold text-cyan-500">
          {step === 'signup' ? 'Sign Up' : 'Two-Factor Authentication'}
        </h2>
        <div className="mt-1 mx-auto w-16 h-1 bg-cyan-500 rounded absolute left-1/2 transform -translate-x-1/2"></div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
            {JSON.stringify(error)}
          </div>
        )}

        {/* Step 1: Signup Form */}
        {step === 'signup' && (
          <form
            onSubmit={handleSignupSubmit(onSignupSubmit)}
            className="space-y-4 mt-6"
          >
            {/* Phone Number */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 
                              focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-telephone-fill text-gray-500 ml-2"></i>
                <input
                  {...registerSignup('phone_number')}
                  type="text"
                  placeholder="Phone Number"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 
                                 text-gray-900 placeholder-gray-500 focus:bg-gray-200 
                                 focus:outline-none rounded-full"
                />
              </div>
              {signupErrors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.phone_number.message}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 
                              focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-person-fill text-gray-500 ml-2"></i>
                <input
                  {...registerSignup('full_name')}
                  type="text"
                  placeholder="Full Name"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 
                                 text-gray-900 placeholder-gray-500 focus:bg-gray-200 
                                 focus:outline-none rounded-full"
                />
              </div>
              {signupErrors.full_name && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 
                              focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-envelope-fill text-gray-500 ml-2"></i>
                <input
                  {...registerSignup('email')}
                  type="email"
                  placeholder="Email"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 
                                 text-gray-900 placeholder-gray-500 focus:bg-gray-200 
                                 focus:outline-none rounded-full"
                />
              </div>
              {signupErrors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 
                              focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-lock-fill text-gray-500 ml-2"></i>
                <input
                  {...registerSignup('password')}
                  type="password"
                  placeholder="Password"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 
                                 text-gray-900 placeholder-gray-500 focus:bg-gray-200 
                                 focus:outline-none rounded-full"
                />
              </div>
              {signupErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 
                              focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-lock-fill text-gray-500 ml-2"></i>
                <input
                  {...registerSignup('password2')}
                  type="password"
                  placeholder="Confirm Password"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 
                                 text-gray-900 placeholder-gray-500 focus:bg-gray-200 
                                 focus:outline-none rounded-full"
                />
              </div>
              {signupErrors.password2 && (
                <p className="text-red-500 text-sm mt-1">
                  {signupErrors.password2.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-500 text-white font-semibold 
                           rounded-full shadow-md hover:bg-cyan-400 
                           focus:ring-2 focus:ring-cyan-400"
              >
                Sign Up
              </button>
            </div>

            {/* Already have an account? Go to Login */}
            <div className="text-center mt-4">
              <p>
                Already have an account?{' '}
                <span
                  onClick={() => navigate('/login')}
                  className="text-cyan-500 hover:underline cursor-pointer"
                >
                  Login
                </span>
              </p>
            </div>
          </form>
        )}


        

        {/* Step 2: TOTP Form */}
        {step === 'totp' && (
          <form
            onSubmit={handleTOTPSubmit(onTOTPSubmit)}
            className="space-y-1 "
          >
           
        

            <div className="text-center mt-4">
              {/* QR Code */}
              {qrCode && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Scan the QR Code</h3>
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="2FA QR Code"
                    className="mx-auto mb-4 w-60 h-60"
                  />
                </div>
              )}

              {/* Secret Key */}
              {twoFactorSecret && (
                <div className="mb-2">
                  <p className="font-medium">Or use this secret key:</p>
                  <code className="bg-gray-100 p-2 rounded text-sm block mx-auto max-w-xs">
                    {twoFactorSecret}
                  </code>
                </div>
              )}
            </div>

            {/* 2FA Token */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3
                              focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-shield-lock text-gray-500 ml-2"></i>
                <input
                  {...registerTOTP('token')}
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 
                                 text-gray-900 placeholder-gray-500 focus:bg-gray-200 
                                 focus:outline-none rounded-full text-center"
                />
              </div>
              {totpErrors.token && (
                <p className="text-red-500 text-sm mt-2">
                  {totpErrors.token.message}
                </p>
              )}
            </div>

            {/* Verify Button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-500 text-white font-semibold 
                           rounded-full shadow-md hover:bg-cyan-400 
                           focus:ring-2 focus:ring-cyan-400"
              >
                Verify & Complete
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
