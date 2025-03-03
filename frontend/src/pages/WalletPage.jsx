import React, { useState, useEffect } from 'react';
import axios from '../api/api';
import authService from '../services/authService';

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [actionType, setActionType] = useState('topup'); // 'topup', 'withdrawal', or 'history'
  
  // Top-up states
  const [topupAmount, setTopupAmount] = useState('');
  const [topupTransactionNum, setTopupTransactionNum] = useState('');
  const [topupPhoto, setTopupPhoto] = useState(null);
  const [topupPhoneNumber, setTopupPhoneNumber] = useState('');
  
  // Withdrawal states
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalPhone, setWithdrawalPhone] = useState('');
  const [withdrawalBankApp, setWithdrawalBankApp] = useState('');
  
  // Feedback modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success'); // 'success' or 'error'
  const [modalMessage, setModalMessage] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch wallet details from the server
  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/donations/wallet/', {
        headers: {
          Authorization: `Bearer ${authService.getTokens().access}`,
        },
      });
      setWallet(res.data);
    } catch (err) {
      showErrorModal('Échec du chargement des informations du portefeuille');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/donations/wallet/transactions/', {
        headers: {
          Authorization: `Bearer ${authService.getTokens().access}`,
        },
      });
      setTransactions(res.data);
    } catch (err) {
      showErrorModal("Échec du chargement de l'historique des transactions");
    } finally {
      setLoading(false);
    }
  };

  // Display success modal
  const showSuccessModal = (message) => {
    setModalType('success');
    setModalMessage(message);
    setShowModal(true);
  };

  // Display error modal
  const showErrorModal = (message) => {
    setModalType('error');
    setModalMessage(message);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  // Validate the top-up form
  const validateTopupForm = () => {
    if (!topupAmount || isNaN(topupAmount) || parseInt(topupAmount) <= 0) {
      showErrorModal('Veuillez entrer un montant valide');
      return false;
    }
    if (!topupPhoneNumber) {
      showErrorModal('Veuillez entrer un numéro de téléphone');
      return false;
    }
    return true;
  };

  // Validate the withdrawal form
  const validateWithdrawalForm = () => {
    if (!withdrawalAmount || isNaN(withdrawalAmount) || parseInt(withdrawalAmount) <= 0) {
      showErrorModal('Veuillez entrer un montant valide');
      return false;
    }
    if (!withdrawalPhone) {
      showErrorModal('Veuillez entrer un numéro de téléphone');
      return false;
    }
    if (!withdrawalBankApp) {
      showErrorModal('Veuillez sélectionner une application bancaire');
      return false;
    }
    if (wallet && parseInt(withdrawalAmount) > wallet.balance) {
      showErrorModal('Le montant demandé dépasse votre solde disponible');
      return false;
    }
    return true;
  };

  // Handle Top-Up Submission
  const handleTopup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateTopupForm()) return;
    
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('amount', topupAmount);
      formData.append('phone_number', topupPhoneNumber);
      if (topupTransactionNum) {
        formData.append('transaction_num', topupTransactionNum);
      }
      if (topupPhoto) {
        formData.append('photo', topupPhoto);
      }

      const res = await axios.post('/donations/wallet/topup/', formData, {
        headers: {
          Authorization: `Bearer ${authService.getTokens().access}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccessModal(res.data.message || 'Demande de recharge soumise, en attente d\'approbation par l\'administrateur !');
      
      // Refresh wallet and transaction data
      fetchWallet();
      fetchTransactions();

      // Reset form
      setTopupAmount('');
      setTopupTransactionNum('');
      setTopupPhoto(null);
      setTopupPhoneNumber('');
    } catch (err) {
      showErrorModal(err.response?.data.error || 'La demande de recharge a échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Withdrawal Submission
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateWithdrawalForm()) return;
    
    try {
      setSubmitting(true);
      const payload = {
        phone_number: parseInt(withdrawalPhone, 10),
        amount: parseInt(withdrawalAmount, 10),
        bank_app: withdrawalBankApp
      };
      
      const res = await axios.post('/donations/withdraw/', payload, {
        headers: {
          Authorization: `Bearer ${authService.getTokens().access}`,
          'Content-Type': 'application/json',
        },
      });
      showSuccessModal(res.data.message || 'Demande de retrait soumise, en attente d\'approbation par l\'administrateur !');
      
      // Refresh wallet and transaction data
      fetchWallet();
      fetchTransactions();

      // Reset form
      setWithdrawalAmount('');
      setWithdrawalPhone('');
      setWithdrawalBankApp('');
    } catch (err) {
      showErrorModal(err.response?.data.error || 'La demande de retrait a échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'text-gray-800',
      approved: 'text-gray-800',
      rejected: 'text-gray-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };
  
  

  // Get transaction type text
  const getTransactionTypeText = (type) => {
    const typeMap = {
      'topup': 'Recharge',
      'withdrawal': 'Retrait'
    };
    return typeMap[type] || type;
  };

  // Modal component
  const FeedbackModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
          
          {/* Modal panel */}
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {modalType === 'success' ? (
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {modalType === 'success' ? 'Succès' : 'Erreur'}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {modalMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${modalType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${modalType === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'} sm:ml-3 sm:w-auto sm:text-sm`}
                onClick={closeModal}
              >
                {modalType === 'success' ? 'Continuer' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !wallet && !transactions.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Feedback Modal */}
        <FeedbackModal />
        
        <h1 className="text-3xl font-bold text-center mb-8">Portefeuille</h1>
        
        {/* Wallet balance card */}
        {wallet && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-1">SOLDE</h2>
                <p className="text-3xl font-bold text-cyan-600">{wallet.balance} MRU</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-600">
                  Dernière mise à jour:<br />
                  {formatDate(wallet.last_updated)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Type Toggle */}
        <div className="flex justify-center mb-6 space-x-2 sm:space-x-4">
          <button
            onClick={() => setActionType('topup')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base transition-colors ${actionType === 'topup' ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Recharger
          </button>
          <button
            onClick={() => setActionType('withdrawal')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base transition-colors ${actionType === 'withdrawal' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Retirer
          </button>
          <button
            onClick={() => setActionType('history')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base transition-colors ${actionType === 'history' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Historique
          </button>
        </div>
        
        {/* Render the appropriate form or transaction history */}
        {actionType === 'topup' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-center text-2xl font-bold text-black mb-4">Demande de recharge</h3>
            <p className="text-center text-md font-bold text-black mb-6">Vous devez envoyer le montant à <span className="text-cyan-600">27789897</span></p>
            <div className="mt-1 mx-auto w-16 h-1 bg-black rounded mb-6"></div>
            
            <form onSubmit={handleTopup}>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Montant <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="Le montant que vous voulez recharger dans votre portefeuille"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  required
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Numéro de téléphone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={topupPhoneNumber}
                  onChange={(e) => setTopupPhoneNumber(e.target.value)}
                  placeholder="Numéro de téléphone à partir duquel la recharge a été effectuée"
                  required
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Numéro de transaction</label>
                <input
                  type="tel"
                  placeholder="Numéro de transaction de l'opération"
                  value={topupTransactionNum}
                  onChange={(e) => setTopupTransactionNum(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 font-semibold">Capture d'écran de la transaction</label>
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTopupPhoto(e.target.files[0])}
                    className="w-full"
                    id="topupPhotoInput"
                    hidden
                  />
                  <label htmlFor="topupPhotoInput" className="cursor-pointer flex flex-col items-center justify-center">
                    <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500">
                      {topupPhoto ? topupPhoto.name : "Cliquez pour télécharger une image"}
                    </p>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Optionnel, mais recommandé pour accélérer la vérification</p>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className={`w-full ${submitting ? 'bg-cyan-400' : 'bg-cyan-500 hover:bg-cyan-600'} text-white py-3 rounded-md font-semibold transition-colors flex justify-center items-center`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </>
                ) : (
                  'Soumettre la recharge'
                )}
              </button>
            </form>
          </div>
        )}
        
        {actionType === 'withdrawal' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-center text-2xl font-bold text-black mb-4">Demande de retrait</h3>
            <div className="mt-1 mx-auto w-16 h-1 bg-black rounded mb-6"></div>
            
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Montant <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="Le montant que vous voulez retirer de votre portefeuille"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  required
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {wallet && (
                  <p className="text-xs text-gray-500 mt-1">
                    Solde disponible: <span className="font-medium">{wallet.balance} MRU</span>
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Numéro de téléphone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={withdrawalPhone}
                  placeholder="Numéro de téléphone sur lequel vous souhaitez recevoir le montant"
                  onChange={(e) => setWithdrawalPhone(e.target.value)}
                  required
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 font-semibold">Application bancaire <span className="text-red-500">*</span></label>
                <select
                  value={withdrawalBankApp}
                  onChange={(e) => setWithdrawalBankApp(e.target.value)}
                  required
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Sélectionnez l'application bancaire</option>
                  <option value="paypal">PayPal</option>
                  <option value="venmo">Venmo</option>
                  <option value="revolut">Revolut</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className={`w-full ${submitting ? 'bg-amber-400' : 'bg-amber-500 hover:bg-amber-600'} text-white py-3 rounded-md font-semibold transition-colors flex justify-center items-center`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </>
                ) : (
                  'Soumettre le retrait'
                )}
              </button>
            </form>
          </div>
        )}
        
        {actionType === 'history' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-center text-2xl font-bold text-black mb-6">
            Historique des transactions
          </h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucune transaction
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore effectué de transactions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getTransactionTypeText(transaction.transaction_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.amount} MRU
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                        {transaction.status === 'pending' && 'En attente'}
                        {transaction.status === 'approved' && 'Approuvé'}
                        {transaction.status === 'rejected' && 'Rejeté'}
                      </span>
                    </td>
                    {console.log("Transaction status:", transaction.status)}


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      </div>
    </div>
  );
};

export default WalletPage;