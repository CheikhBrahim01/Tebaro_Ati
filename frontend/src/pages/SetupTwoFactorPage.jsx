import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Validation schema pour la saisie TOTP
const twoFactorSetupSchema = yup.object({
  token: yup
    .string()
    .length(6, 'Verification code must be 6 digits')
    .matches(/^\d{6}$/, 'Verification code must be numeric')
    .required('Verification code is required'),
});

const SetupTwoFactorPage = () => {
  const [qrCode, setQrCode] = useState(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { user, login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(twoFactorSetupSchema),
  });

  useEffect(() => {
    const fetchTwoFactorSetup = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // GET /setup-2fa/ (protégé => le token doit être présent)
        const response = await authService.getTwoFactorSetup();
        setQrCode(response.qr_code);
        setTwoFactorSecret(response.two_factor_secret);
      } catch (err) {
        console.error('2FA setup error:', err);
        setError(
          err?.detail || 'Failed to generate 2FA setup. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTwoFactorSetup();
  }, []);

  const onSubmit = async (data) => {
    try {
      setError(null);
      // POST /setup-2fa/ { token }
      await authService.enableTwoFactor(data.token);

      // Mettez à jour si vous voulez forcer user.is_verified = true localement
      // on peut juste relire le user existant pour le marquer "vérifié"
      // ou rediriger direct
      // ex: login({ ...user, is_verified: true }) => si vous stockez ça

      navigate('/dashboard');
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err?.detail || 'Verification failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p>Setting up Two-Factor Authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Setup Two-Factor Authentication
        </h2>

        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Scan QR Code with Authenticator App
            </h3>
            {qrCode && (
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="2FA QR Code"
                className="mx-auto mb-4 max-w-full h-auto"
              />
            )}
          </div>

          {twoFactorSecret && (
            <div className="mb-4">
              <p className="font-medium">Can't scan? Use this secret key:</p>
              <code className="bg-gray-100 p-2 rounded text-sm block mx-auto max-w-xs">
                {twoFactorSecret}
              </code>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block mb-2">Enter 6-digit Verification Code</label>
              <input
                type="text"
                {...register('token')}
                placeholder="Enter code from Authenticator App"
                className="w-full px-3 py-2 border rounded text-center"
                maxLength="6"
              />
              {errors.token && (
                <p className="text-red-500 text-sm mt-1">{errors.token.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Verify and Complete Setup
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              • Open Google Authenticator or similar app<br />
              • Scan QR code or enter secret key manually<br />
              • Enter the 6-digit code generated by the app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupTwoFactorPage;
