import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/api';

const ForgotPasswordPage = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // Appel à l'endpoint de demande d'OTP pour réinitialiser le mot de passe
      const res = await axios.post('/users/request-reset/', { phone_number: phone });
      setMessage(res.data.message);
      // Rediriger vers la page de réinitialisation du mot de passe en passant le numéro de téléphone
      navigate('/reset-password', { state: { phone_number: phone } });
    } catch (err) {
      setError(err.response?.data.error || "Erreur lors de la demande d'OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-300 via-sky-300 to-white">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md mt-16 relative">
        <h2 className="text-center text-2xl font-bold text-cyan-500">
          Mot de passe oublié
        </h2>
        <div className="mt-1 mx-auto w-16 h-1 bg-cyan-500 rounded absolute left-1/2 transform -translate-x-1/2"></div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative">
            {message}
          </div>
        )}

        <form
          onSubmit={handleRequestReset}
          className="space-y-4 mt-6"
          autoComplete="off"
        >
          <div>
            <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 focus-within:ring-2 focus-within:ring-cyan-500">
              <i className="bi bi-telephone-fill text-gray-500 ml-2"></i>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Entrez votre numéro de téléphone"
                className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none rounded-full text-center"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-cyan-500 text-white font-semibold rounded-full shadow-md hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-400"
            >
              Demander l'OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
