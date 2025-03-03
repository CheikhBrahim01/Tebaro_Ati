import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/api';
import { useAuth } from '../context/AuthContext';
import AdminTransactions from './AdminTransactions';
import authService from '../services/authService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDonations: 0,
    totalUsers: 0,
    totalWallets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Replace the endpoint below with your actual admin stats endpoint.
        const response = await axios.get('donations/admin/stats/', {
          headers: {
            Authorization: `Bearer ${authService.getTokens().access}`, // Adjust if you store token differently.
          },
        });
        setStats(response.data);
      } catch (err) {
        // Fallback dummy data if API call fails.
        setStats({
          totalProjects: 25,
          totalDonations: 320,
          totalUsers: 150,
          totalWallets: 140,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-cyan-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link to="/admin-dashboard" className="hover:underline">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/projects" className="hover:underline">
                Manage Projects
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="hover:underline">
                Manage Users
              </Link>
            </li>
            <li>
              <Link to="/admin/transactions" className="hover:underline">
                Transactions
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user?.full_name || 'Admin'}</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Total Projects</h2>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.totalProjects}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Total Donations</h2>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.totalDonations}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">Total Wallets</h2>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.totalWallets}</p>
            </div>
          </div>
        )}

        {/* Recent Activity Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          {/* <AdminTransactions></AdminTransactions> */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
