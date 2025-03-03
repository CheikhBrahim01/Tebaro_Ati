// src/pages/AdminTransactionsDashboard.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminTransactionsDashboard = () => {
  return (
    <div className="flex min-h-screen">
      {/* Aside Menu */}
      <aside className="w-64 bg-cyan-600 text-white p-6">
        <h2 className="text-xl font-bold mb-4">Transactions</h2>
        <nav className="space-y-2">
          <Link
            to="topup"
            className="block px-4 py-2 rounded hover:underline transition-colors"
          >
            Top-Up Transactions
          </Link>
          <Link
            to="withdrawal"
            className="block px-4 py-2 rounded hover:underline transition-colors"
          >
            Withdrawal Transactions
          </Link>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 ">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminTransactionsDashboard;
