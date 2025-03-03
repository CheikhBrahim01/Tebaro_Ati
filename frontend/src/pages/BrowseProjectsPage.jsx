import React, { useEffect, useState } from 'react';
import axios from '../api/api';
import { Link } from 'react-router-dom';

const BrowseProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Updated color map with cyan as primary color and coordinating cool colors
  const colorMap = {
    'A': '#0891B2', 'B': '#0EA5E9', 'C': '#06B6D4', 'D': '#0E7490', 
    'E': '#0CA5E9', 'F': '#0369A1', 'G': '#0D9488', 'H': '#0E7490',
    'I': '#06B6D4', 'J': '#0891B2', 'K': '#0CA5E9', 'L': '#0369A1',
    'M': '#0D9488', 'N': '#0E7490', 'O': '#06B6D4', 'P': '#0891B2',
    'Q': '#0CA5E9', 'R': '#0369A1', 'S': '#0D9488', 'T': '#0E7490',
    'U': '#06B6D4', 'V': '#0891B2', 'W': '#0CA5E9', 'X': '#0369A1',
    'Y': '#0D9488', 'Z': '#0E7490'
  };

  // Get color based on title's first letter
  const getProjectColor = (title) => {
    const firstLetter = title.charAt(0).toUpperCase();
    return colorMap[firstLetter] || '#06B6D4'; // Default to cyan
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/donations/projects/');
        setProjects(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate progress percentage
  const calculateProgress = (collected, target) => {
    const percentage = (collected / target) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-teal-50">
      {/* Hero Section */}
      <div className="bg-cyan-600 text-white">
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-md">
            Make Dreams Happen
          </h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90 mb-10">
          انضم إلى آلاف الأشخاص الذين يمولون مشاريع إبداعية واجتماعية مفيدة.
          </p>
          <div className="max-w-lg mx-auto relative">
            <input
              type="text"
              placeholder="Search for projects..."
              className="w-full px-6 py-4 text-gray-800 rounded-full shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-3 bg-cyan-700 p-2 rounded-full shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Decorative wave shape */}
        <div className="h-16 bg-cyan-600 relative overflow-hidden">
          <svg className="absolute bottom-0 w-full h-16" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f8fafc" fillOpacity="1" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,112C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        {/* Projects count */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg">
            <span className="font-bold text-cyan-600">{filteredProjects.length}</span> projets trouvé 
            {searchTerm && <span> matching "<span className="font-medium">{searchTerm}</span>"</span>}
          </p>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 mb-8 rounded-lg text-cyan-800 flex items-center shadow-md">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
          </div>
        ) : (
          <>
            {/* Projects grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => {
                  const progressPercentage = calculateProgress(project.collected_amount, project.target_amount);
                  const projectColor = getProjectColor(project.title);
                  
                  return (
                    <div 
                      key={project.id} 
                      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                    >
                      {/* Wrap the project card with Link to navigate to details */}
                      <Link to={`/projects/${project.id}`}>
                        {/* Project image */}
                        <div className="relative h-52">
                          {project.photo ? (
                            <img
                              src={project.photo}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${projectColor}22 0%, ${projectColor}44 100%)` }}
                            >
                              <span className="text-6xl font-bold opacity-30" style={{ color: projectColor }}>
                                {project.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Project badge with initial */}
                          <div 
                            className="absolute -bottom-5 left-6 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center"
                            style={{ backgroundColor: projectColor }}
                          >
                            <span className="text-white text-xl font-bold">
                              {project.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Project details */}
                        <div className="p-6 pt-8">
                          <h2 className="text-xl font-bold text-gray-800 mb-2">
                            {project.title}
                          </h2>
                          
                          
                          
                          <p className="text-gray-700 mb-6 line-clamp-3 h-18">{project.description}</p>
                          
                          {/* Progress bar */}
                          <div className="mb-6">
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                                <div
                                  style={{ 
                                    width: `${progressPercentage}%`,
                                    backgroundColor: projectColor
                                  }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ease-in-out"
                                ></div>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                              <span className="font-medium" style={{ color: projectColor }}>
                                {Math.round(progressPercentage)}% financé
                              </span>
                              <span className="text-gray-600">but: {project.target_amount} MRU</span>
                            </div>
                          </div>
                          
                          {/* Funding info */}
                          <div 
                            className="flex justify-between items-center p-4 rounded-2xl mb-6"
                            style={{ background: `linear-gradient(135deg, ${projectColor}11 0%, ${projectColor}22 100%)` }}
                          >
                            <div>
                              <span className="block text-xl font-bold" style={{ color: projectColor }}>
                                {project.collected_amount}
                              </span>
                              <span className="text-gray-600 text-sm">soulevé</span>
                            </div>
                            
                            <div className="text-right">
                              <span className="block text-xl font-bold text-gray-800">
                                {Math.round(project.target_amount - project.collected_amount)}
                              </span>
                              <span className="text-gray-600 text-sm">aller</span>
                            </div>
                          </div>
                          
                          {/* Optional "View Details" hint */}
                          <div className="text-cyan-500 font-bold hover:underline">
                            Voir les détails &rarr;
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl shadow-md border border-cyan-50">
                <div className="mx-auto w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No projects found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  We couldn't find any projects matching your search. Try adjusting your keywords.
                </p>
                <button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseProjectsPage;
