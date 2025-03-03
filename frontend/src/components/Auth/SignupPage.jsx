import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema } from '../../utils/validation';
import authService from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as yup from 'yup';

const totpSchema = yup.object({
  token: yup.string().length(6, 'Verification code must be 6 digits').required('Verification code is required'),
});

const SignupPage = () => {
  const [qrCode, setQrCode] = useState(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState(null);
  const [step, setStep] = useState('signup');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Forms setup
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm({ resolver: yupResolver(signupSchema) });

  const {
    register: registerTOTP,
    handleSubmit: handleTOTPSubmit,
    formState: { errors: totpErrors },
  } = useForm({ resolver: yupResolver(totpSchema) });

  // 1️⃣ Handle Signup
  const onSignupSubmit = async (data) => {
    try {
      setError(null);
      const { user_type, ...filteredData } = data;
      const response = await authService.signup(filteredData);
      const { refresh, access, user, qr_code, two_factor_secret } = response;

      authService.setTokens({ refresh, access });
      localStorage.setItem('user', JSON.stringify(user));
      login(user, { refresh, access });

      // Move to 2FA step
      setQrCode(qr_code);
      setTwoFactorSecret(two_factor_secret);
      setStep('totp');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err?.response?.data || err?.message || 'Signup failed. Please try again.');
    }
  };

  // 2️⃣ Handle 2FA Submission
  const onTOTPSubmit = async ({ token }) => {
    try {
      setError(null);
      await authService.enableTwoFactor(token);
      navigate('/dashboard');
    } catch (err) {
      console.error('TOTP error:', err);
      setError(err?.response?.data?.token || err?.response?.data?.detail || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-300 via-sky-300 to-white">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mt-10">
        {step === 'signup' ? (
          <>
            <h2 className="text-center text-2xl font-bold text-cyan-500">Sign Up</h2>
            <div className="mt-1 mx-auto w-16 h-1 bg-cyan-500 rounded"></div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {JSON.stringify(error)}
              </div>
            )}

            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-4 mt-4">
              {/* Full Name */}
              <div>
                <input
                  {...registerSignup("full_name")}
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-cyan-500"
                />
                {signupErrors.full_name && <p className="text-red-500 text-sm mt-1">{signupErrors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <input
                  {...registerSignup("email")}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-cyan-500"
                />
                {signupErrors.email && <p className="text-red-500 text-sm mt-1">{signupErrors.email.message}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <input
                  {...registerSignup("phone_number")}
                  type="text"
                  placeholder="Phone Number"
                  className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-cyan-500"
                />
                {signupErrors.phone_number && <p className="text-red-500 text-sm mt-1">{signupErrors.phone_number.message}</p>}
              </div>

              {/* Password */}
              <div>
                <input
                  {...registerSignup("password")}
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-cyan-500"
                />
                {signupErrors.password && <p className="text-red-500 text-sm mt-1">{signupErrors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  {...registerSignup("password2")}
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-cyan-500"
                />
                {signupErrors.password2 && <p className="text-red-500 text-sm mt-1">{signupErrors.password2.message}</p>}
              </div>

              <button type="submit" className="w-full bg-cyan-500 text-white font-semibold py-2 rounded-full hover:bg-cyan-600">
                Sign Up
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-center text-2xl font-bold text-cyan-500 mb-2">Two-Factor Authentication</h2>
            <div className="mt-1 mx-auto w-16 h-1 bg-cyan-500 rounded"></div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}

            {/* QR Code Section */}
            {qrCode && (
              <div className="text-center my-4">
                <h3 className="text-lg font-semibold mb-2">Scan the QR Code</h3>
                <img src={`data:image/png;base64,${qrCode}`} alt="2FA QR Code" className="mx-auto mb-2 max-w-full h-auto shadow-lg rounded-lg" />
              </div>
            )}

            {twoFactorSecret && (
              <div className="mb-4 text-center">
                <p className="font-medium">Or use this secret key:</p>
                <code className="bg-gray-200 p-2 rounded text-sm block mx-auto max-w-xs">{twoFactorSecret}</code>
              </div>
            )}

            {/* 2FA Token Input */}
            <form onSubmit={handleTOTPSubmit(onTOTPSubmit)} className="space-y-4">
              <input
                {...registerTOTP('token')}
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-2 border rounded-full text-center focus:ring-2 focus:ring-cyan-500"
              />
              {totpErrors.token && <p className="text-red-500 text-sm mt-1">{totpErrors.token.message}</p>}

              <button type="submit" className="w-full bg-cyan-500 text-white font-semibold py-2 rounded-full hover:bg-cyan-600">
                Verify & Complete
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
