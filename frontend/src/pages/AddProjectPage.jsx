import React, { useState } from 'react';
import axios from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AddProjectPage = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);  // Store file object
  const [targetAmount, setTargetAmount] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const navigate = useNavigate();

  // Only Beneficiaries can add projects.
  if (user?.user_type !== 'beneficiary') {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 p-4 rounded text-red-700">
          Sorry, only Beneficiaries can add projects.
        </div>
      </div>
    );
  }

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMsg(null);

      // Create a FormData object
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('target_amount', targetAmount);
      if (photo) {
        formData.append('photo', photo);
      }

      // Make API request
      await axios.post('/donations/projects/', formData, {
        headers: {
          Authorization: `Bearer ${authService.getTokens().access}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg('Project added successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setPhoto(null);
      setTargetAmount('');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data || 'Failed to create project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-cyan-600 py-6 px-8">
            <h1 className="text-3xl text-white font-bold">Add New Project</h1>
            <p className="mt-2 text-cyan-100">
              Bring your vision to life by creating a new project.
            </p>
          </div>
          <div className="p-8">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {JSON.stringify(error)}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                {successMsg}
              </div>
            )}
            <form
              onSubmit={handleAddProject}
              encType="multipart/form-data"
              className="space-y-6"
            >
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Project Title
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Photo
                </label>
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Target Amount
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded font-semibold transition-colors duration-200"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectPage;
