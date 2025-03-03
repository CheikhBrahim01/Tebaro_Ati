import React, { useState, useEffect } from 'react';
import axios from '../api/api';
import authService from '../services/authService';
import { Link } from 'react-router-dom';

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/donations/my-projects/', {
          headers: {
            Authorization: `Bearer ${authService.getTokens().access}`,
          },
        });
        setProjects(res.data);
      } catch (err) {
        setError('Failed to fetch your projects.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-600 border-b-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 p-4 rounded-lg text-red-700 shadow-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">Mes Projets</h1>
      <p className="text-center text-gray-600 mb-10">Gérez vos projets de collecte de fonds</p>
      
      <div className="text-center py-8 bg-white rounded-xl shadow-sm">
          
          <p className="text-gray-500 mb-4">Commencez dès maintenant à collecter des fonds pour votre cause</p>
          <Link 
            to='/add-project' 
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition duration-200 shadow-sm"
          >
            Créer un nouveau projet
          </Link>
        </div>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className={`bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-lg ${project.is_closed ? 'opacity-90' : 'hover:-translate-y-1'}`}
            >
              {project.is_closed && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-gray-800 text-white text-xs uppercase px-3 py-1 rounded-full font-medium">
                    Archivé
                  </span>
                </div>
              )}
              
              {/* Project Image */}
              {project.photo ? (
                <div className="relative">
                  <img
                    src={project.photo}
                    alt={project.title}
                    className="w-full h-56 object-cover"
                  />
                  {project.is_closed && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">Projet Archivé</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`w-full h-56 flex items-center justify-center ${project.is_closed ? 'bg-gray-300' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}>
                  <span className="text-5xl font-bold text-white">
                    {project.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Project Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-3 text-gray-800">{project.title}</h2>
                
                <div className="space-y-4 mb-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-medium">Progression</span>
                      <span className="text-gray-600">
                        {Math.min(100, Math.round((project.collected_amount / project.target_amount) * 100))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${project.is_closed ? 'bg-gray-500' : 'bg-cyan-600'}`}
                        style={{ width: `${Math.min(100, Math.round((project.collected_amount / project.target_amount) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Amounts */}
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Objectif</p>
                      <p className="text-lg font-semibold">{parseInt(project.target_amount).toLocaleString()} MRU</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Collecté</p>
                      <p className={`text-lg font-semibold ${project.is_closed ? 'text-gray-700' : 'text-cyan-600'}`}>
                        {parseInt(project.collected_amount).toLocaleString()} MRU
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="space-y-3">
                  
                  
                  <Link
                    to={`/projects/${project.id}`}
                    className={`block text-center font-semibold py-2.5 px-4 rounded-lg transition duration-200 shadow-sm ${
                      project.is_closed 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                    }`}
                  >
                    Voir les détails
                  </Link>
                </div>
              </div>
            </div>
          ))}

          
        </div>

        
        
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">📁</div>
          <p className="text-gray-700 text-xl mb-2">Vous n'avez pas encore créé de projet</p>
          <p className="text-gray-500 mb-6">Commencez dès maintenant à collecter des fonds pour votre cause</p>
          <Link 
            to='/add-project' 
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition duration-200 shadow-sm"
          >
            Créer un nouveau projet
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;


// import React, { useState, useEffect } from 'react';
// import axios from '../api/api';
// import authService from '../services/authService';
// import { Link } from 'react-router-dom';

// const MyProjectsPage = () => {
//   const [projects, setProjects] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMyProjects = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get('/donations/my-projects/', {
//           headers: {
//             Authorization: `Bearer ${authService.getTokens().access}`,
//           },
//         });
//         setProjects(res.data);
//       } catch (err) {
//         setError('Failed to fetch your projects.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMyProjects();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto py-8">
//         <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <h1 className="text-4xl font-bold mb-8 text-center">Mes Projets</h1>
//       {projects.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {projects.map((project) => (
//             <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
//                 {/* Affichage de l'image si disponible */}
//                 {project.photo ? (
//                 <img
//                     src={project.photo}
//                     alt={project.title}
//                     className="w-full h-48 object-cover"
//                 />
//                 ) : (
//                 <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
//                     <span className="text-4xl font-bold text-gray-700">
//                     {project.title.charAt(0)}
//                     </span>
//                 </div>
//                 )}
//                 <div className="p-6">
//                 <div className="flex justify-between items-center">
//                     <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
//                     {project.is_closed && (
//                     <span className="bg-gray-500 text-white text-xs uppercase px-2 py-1 rounded">
//                         Archivé
//                     </span>
//                     )}
//                 </div>
//                 <p className="text-gray-600 mb-2">
//                     Objectif : ${parseInt(project.target_amount).toLocaleString()}
//                 </p>
//                 <p className="text-gray-600 mb-4">
//                     Collecté : ${parseInt(project.collected_amount).toLocaleString()}
//                 </p>
//                 {project.is_closed ? (
//                     <div className="bg-gray-100 p-2 rounded text-gray-800 text-center">
//                     Ce projet est archivé et fermé aux dons.
//                     </div>
//                 ) : (
//                     <>
//                     <Link
//                         to={`/projects/${project.id}/withdraw-funds`}
//                         className="block text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mb-4"
//                     >
//                         Retirer les fonds & Archiver le projet
//                     </Link>
//                     <Link
//                         to={`/projects/${project.id}`}
//                         className="block text-center bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded"
//                     >
//                         Voir les détails
//                     </Link>
//                     </>
//                 )}
//                 </div>
//             </div>
//             ))}
//         </div>
//         ) : (
//         <p className="text-center text-gray-600 text-xl">
//             Vous n'avez pas encore créé de projet.
//         </p>
//         )}

//     </div>
//   );
// };

// export default MyProjectsPage;
