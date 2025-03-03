import React, { useEffect, useState } from 'react';
import axios from '../api/api'; // ou le chemin vers votre instance axios

const BrowseProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError(null);
        const response = await axios.get('/donations/projects/');
        setProjects(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch projects');
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">All Projects</h1>
      
      {error && (
        <div className="bg-red-100 p-4 mb-4 rounded text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white shadow p-4 rounded">
            <h2 className="text-xl font-bold">{project.title}</h2>
            <p className="text-sm text-gray-600 mb-2">
              Beneficiary: {project.beneficiary}
            </p>
            <p>{project.description}</p>
            <p className="mt-2">
              Target: {project.target_amount} | Collected: {project.collected_amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseProjectsPage;
