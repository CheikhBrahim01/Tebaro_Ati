import React, { useState, useEffect } from 'react';
import axios from '../api/api';
import authService from '../services/authService';

const AdminTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch transactions from the API (backend orders by updated_at descending)
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('donations/admin/transactions/', {
        headers: {
          Authorization: `Bearer ${authService.getTokens().access}`,
        },
      });
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Open modal with selected transaction details
  const openModal = (tx) => {
    setSelectedTx(tx);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTx(null);
    setModalOpen(false);
  };

  // Update transaction status with a status string ("approved" or "rejected")
  const updateStatus = async (newStatus) => {
    if (!selectedTx) return;
    try {
      await axios.patch(
        `donations/admin/transactions/${selectedTx.id}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${authService.getTokens().access}`,
            'Content-Type': 'application/json',
          },
        }
      );
      fetchTransactions();
      closeModal();
    } catch (err) {
      alert('Failed to update transaction status.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      
      <h1 className="text-3xl font-bold text-center mb-8">Admin Transactions</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Type</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Txn Num</th>
            <th className="px-4 py-2 border">Phone</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-4 py-2 border">{tx.transaction_type}</td>
              <td className="px-4 py-2 border">${tx.amount}</td>
              <td className="px-4 py-2 border">{tx.transaction_num}</td>
              <td className="px-4 py-2 border">{tx.phone_number}</td>
              <td className="px-4 py-2 border">
                {tx.status === 'approved'
                  ? 'Valid'
                  : tx.status === 'rejected'
                  ? 'Not Valid'
                  : tx.status}
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => openModal(tx)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for transaction details */}
      {modalOpen && selectedTx && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {selectedTx.id}
              </p>
              <p>
                <strong>Type:</strong> {selectedTx.transaction_type}
              </p>
              <p>
                <strong>Amount:</strong> ${selectedTx.amount}
              </p>
              <p>
                <strong>Transaction Number:</strong> {selectedTx.transaction_num}
              </p>
              <p>
                <strong>Phone Number:</strong> {selectedTx.phone_number}
              </p>
              <p>
                <strong>Status:</strong> {selectedTx.status === 'approved' ? 'Valid' : selectedTx.status === 'rejected' ? 'Not Valid' : selectedTx.status}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date(selectedTx.timestamp).toLocaleString()}
              </p>
              {selectedTx.photo && (
                <div className="mt-2">
                  <p className="font-semibold">Screenshot:</p>
                  <img
                    src={selectedTx.photo}
                    alt="Transaction Screenshot"
                    className="mt-2 max-h-60 object-contain"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => updateStatus('approved')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Validate
              </button>
              <button
                onClick={() => updateStatus('rejected')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Not Valid
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransaction;
