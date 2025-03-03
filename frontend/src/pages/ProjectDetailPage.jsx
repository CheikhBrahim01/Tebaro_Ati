// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from '../api/api';
// import authService from '../services/authService';

// const ProjectDetailPage = () => {
//   const { projectId } = useParams();
//   const [project, setProject] = useState(null);
//   const [walletBalance, setWalletBalance] = useState(null);
//   const [topDonators, setTopDonators] = useState([]);
//   const [donationAmount, setDonationAmount] = useState('');
//   const [error, setError] = useState(null);
//   const [successMsg, setSuccessMsg] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch project details and wallet balance
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         // Fetch project details
//         const projectRes = await axios.get(`/donations/projects/${projectId}/`);
//         setProject(projectRes.data);

//         // Fetch wallet balance
//         const walletRes = await axios.get('/donations/wallet/', {
//           headers: {
//             Authorization: `Bearer ${authService.getTokens().access}`,
//           },
//         });
//         setWalletBalance(walletRes.data.balance);
//       } catch (err) {
//         setError('Failed to fetch project or wallet info.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [projectId]);

//   // Fetch top donators
//   useEffect(() => {
//     const fetchTopDonators = async () => {
//       try {
//         const res = await axios.get(`/donations/projects/${projectId}/top-donators/`);
//         setTopDonators(res.data);
//       } catch (err) {
//         console.error('Failed to fetch top donators');
//       }
//     };
//     fetchTopDonators();
//   }, [projectId]);

//   // Handle donation submission
//   const handleDonate = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccessMsg(null);
//     try {
//       const payload = {
//         project_id: projectId,
//         amount: parseInt(donationAmount, 10),
//       };
//       const res = await axios.post('/donations/donate/', payload, {
//         headers: {
//           Authorization: `Bearer ${authService.getTokens().access}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       setSuccessMsg(res.data.message || 'Donation successful!');

//       // Refresh wallet and project data
//       const walletRes = await axios.get('/donations/wallet/', {
//         headers: { Authorization: `Bearer ${authService.getTokens().access}` },
//       });
//       setWalletBalance(walletRes.data.balance);

//       const projRes = await axios.get(`/donations/projects/${projectId}/`);
//       setProject(projRes.data);

//       setDonationAmount('');
//     } catch (err) {
//       setError(err.response?.data.error || 'Donation failed.');
//     }
//   };

//   // Handle funds withdrawal for the project owner
//   const handleWithdraw = async () => {
//     setError(null);
//     setSuccessMsg(null);
//     try {
//       const res = await axios.post(
//         `/donations/projects/${projectId}/withdraw-funds/`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${authService.getTokens().access}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       setSuccessMsg(res.data.message || 'Withdrawal successful!');
      
//       // Refresh wallet and project data
//       const walletRes = await axios.get('/donations/wallet/', {
//         headers: { Authorization: `Bearer ${authService.getTokens().access}` },
//       });
//       setWalletBalance(walletRes.data.balance);
      
//       const projRes = await axios.get(`/donations/projects/${projectId}/`);
//       setProject(projRes.data);
//     } catch (err) {
//       setError(err.response?.data.error || 'Withdrawal failed.');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
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

//   if (!project) return null;

//   // Déterminer si l'utilisateur connecté est le propriétaire du projet
//   const currentUser = authService.getUser();
//   const isOwner = project.beneficiary && project.beneficiary.id === currentUser.id;

//   // Calcul du pourcentage de financement (max 100%)
//   const progressPercentage = Math.min(
//     (project.collected_amount / project.target_amount) * 100,
//     100
//   );

//   // Nombre de donateurs (basé sur topDonators)
//   const donorCount = topDonators.length;

//   return (
//     <div className="bg-gray-50 min-h-screen py-8">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Titre et informations de la collecte */}
//         <div className="text-center mb-6">
//           <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.title}</h1>
//           <p className="text-gray-600">
//             {project.beneficiary && project.beneficiary.username
//               ? `${project.beneficiary.username} is organizing this fundraiser`
//               : 'Organizing this fundraiser'}
//           </p>
//           <button className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full mt-2">
//             Donation protected
//           </button>
//         </div>

//         {/* Contenu principal en deux colonnes */}
//         <div className="md:flex md:space-x-6">
//           {/* Colonne gauche : Image & Histoire */}
//           <div className="md:w-2/3">
//             {project.photo ? (
//               <img
//                 src={project.photo}
//                 alt={project.title}
//                 className="w-full min-h-96 object-cover rounded-lg mb-4"
//               />
//             ) : (
//               <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded-lg mb-4">
//                 <span className="text-6xl text-gray-700">{project.title.charAt(0)}</span>
//               </div>
//             )}
//             <div className="bg-white rounded-lg shadow p-6 mb-6">
//               <h2 className="text-xl font-semibold mb-2">Campaign Story</h2>
//               <p className="text-gray-700 break-words">{project.description}</p>
//             </div>
//           </div>

//           {/* Colonne droite : Carte de donation */}
//           <div className="md:w-1/3 mt-6 md:mt-0">
//             <div className="bg-white rounded-lg shadow p-6 sticky top-4">
//               <div className="mb-4">
//                 <div className="text-3xl font-bold text-gray-800">
//                   ${project.collected_amount.toLocaleString()}
//                 </div>
//                 <p className="text-gray-600">
//                   raised of ${project.target_amount.toLocaleString()} goal
//                 </p>
//                 {donorCount > 0 && (
//                   <p className="text-sm text-cyan-600 mt-2">
//                     {donorCount} people just donated
//                   </p>
//                 )}
//               </div>
//               <div className="mb-4">
//                 <div className="w-full bg-gray-200 rounded-full h-4">
//                   <div
//                     style={{ width: `${progressPercentage}%` }}
//                     className="bg-cyan-500 h-4 rounded-full transition-all"
//                   />
//                 </div>
//               </div>

//               {/* Section pour le bénéficiaire ou le donateur */}
//               {isOwner ? (
//                 // Pour le propriétaire : si le projet est totalement financé, afficher le bouton de retrait
//                 project.collected_amount >= project.target_amount ? (
//                   <>
//                     <button
//                       onClick={handleWithdraw}
//                       className="w-full bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600 mb-4"
//                     >
//                       Withdraw Funds & Close Project
//                     </button>
//                     <div className="bg-gray-100 p-2 rounded text-gray-800 text-center mb-4">
//                       This project is fully funded and closed to further donations.
//                     </div>
//                   </>
//                 ) : (
//                   <div className="bg-yellow-100 p-2 rounded text-yellow-800 text-center mb-4">
//                     You cannot donate to your own project.
//                   </div>
//                 )
//               ) : (
//                 // Pour les donateurs
//                 <form onSubmit={handleDonate} className="mb-6">
//                   {error && (
//                     <div className="bg-red-100 p-2 rounded text-red-700 mb-2 text-center">
//                       {error}
//                     </div>
//                   )}
//                   {successMsg && (
//                     <div className="bg-green-100 p-2 rounded text-green-700 mb-2 text-center">
//                       {successMsg}
//                     </div>
//                   )}
//                   <div className="flex space-x-2">
//                     <input
//                       type="number"
//                       placeholder="Enter amount"
//                       value={donationAmount}
//                       onChange={(e) => setDonationAmount(e.target.value)}
//                       required
//                       className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                     />
//                     <button
//                       type="submit"
//                       className="bg-cyan-500 text-white px-4 py-2 rounded font-semibold hover:bg-cyan-600"
//                     >
//                       Donate
//                     </button>
//                   </div>
//                 </form>
//               )}

//               {/* Section des top donators */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-2">Top Donators</h3>
//                 {topDonators.length > 0 ? (
//                   <ul>
//                     {topDonators.map((donator, index) => (
//                       <li key={index} className="flex justify-between border-b py-2 text-sm">
//                         <span>{donator.name}</span>
//                         <span className="font-semibold">
//                           ${donator.amount.toLocaleString()}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="text-gray-500 text-sm">No donations yet.</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetailPage;




import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/api';
import authService from '../services/authService';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [topDonators, setTopDonators] = useState([]);
  const [donationAmount, setDonationAmount] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);

  // Fetch project details and wallet balance
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch project
        const projectRes = await axios.get(`/donations/projects/${projectId}/`);
        setProject(projectRes.data);

        // Fetch wallet balance
        const walletRes = await axios.get('/donations/wallet/', {
          headers: {
            Authorization: `Bearer ${authService.getTokens().access}`,
          },
        });
        setWalletBalance(walletRes.data.balance);
      } catch (err) {
        setError('Failed to fetch project or wallet information.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // Fetch top donators
  useEffect(() => {
    const fetchTopDonators = async () => {
      try {
        const res = await axios.get(`/donations/projects/${projectId}/top-donators/`);
        setTopDonators(res.data);
      } catch (err) {
        console.error('Failed to fetch top donators');
      }
    };
    fetchTopDonators();
  }, [projectId]);

  // Handle donation
  const handleDonate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid donation amount.');
        return;
      }

      const payload = {
        project_id: projectId,
        amount: amount,
      };
      
      const res = await axios.post('/donations/donate/', payload, {
        headers: {
          Authorization: `Bearer ${authService.getTokens().access}`,
          'Content-Type': 'application/json',
        },
      });
      
      setSuccessMsg(res.data.message || 'Donation successful!');
      setShowThankYou(true);

      // Refresh wallet and project
      const walletRes = await axios.get('/donations/wallet/', {
        headers: {
          Authorization: `Bearer ${authService.getTokens().access}`,
        },
      });
      setWalletBalance(walletRes.data.balance);

      const projRes = await axios.get(`/donations/projects/${projectId}/`);
      setProject(projRes.data);

      // Refresh top donators
      const donatorsRes = await axios.get(`/donations/projects/${projectId}/top-donators/`);
      setTopDonators(donatorsRes.data);

      setDonationAmount('');
      
      // Hide thank you message after 5 seconds
      setTimeout(() => {
        setShowThankYou(false);
      }, 5000);
    } catch (err) {
      setError(err.response?.data.error || 'Donation failed. Please try again.');
    }
  };

  // Handle funds withdrawal for project owner
  const handleWithdraw = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post(
        `/donations/projects/${projectId}/withdraw-funds/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authService.getTokens().access}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccessMsg(res.data.message || 'Funds withdrawn successfully! Project has been archived.');
      
      // Refresh wallet and project data
      const walletRes = await axios.get('/donations/wallet/', {
        headers: { Authorization: `Bearer ${authService.getTokens().access}` },
      });
      setWalletBalance(walletRes.data.balance);
      
      const projRes = await axios.get(`/donations/projects/${projectId}/`);
      setProject(projRes.data);
    } catch (err) {
      setError(err.response?.data.error || 'Withdrawal failed. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-red-600 text-xl font-semibold mb-2">Error</div>
            <p className="text-gray-700">{error}</p>
            <Link to="/" className="mt-4 inline-block bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  // Determine if current user is the project owner
  const isOwner = project.beneficiary === authService.getUser().id;

  // Calculate donation progress (capped at 100%)
  const progressPercentage = Math.min(
    (project.collected_amount / project.target_amount) * 100,
    100
  );

  // Format large numbers with commas
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Thank You Message */}
        {showThankYou && (
          <div className="fixed top-6 right-6 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out max-w-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div>
                <h3 className="font-bold">Merci !</h3>
                <p>Votre don a été traité avec succés.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Project Status Banner */}
        {project.is_closed && (
          <div className="bg-gray-800 text-white py-3 px-4 rounded-lg mb-6 text-center">
            Ce projet a été archivé et n'accepte plus de dons.
          </div>
        )}
        
        {project.collected_amount >= project.target_amount && !project.is_closed && (
          <div className="bg-green-600 text-white py-3 px-4 rounded-lg mb-6 text-center">
            Ce projet atteint son objectif de financement ! Merci à tous les supportes.
          </div>
        )}
        
        {/* Top Section: Title & Fundraiser Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">{project.title}</h1>
          <p className="text-gray-600 mb-3">
            {project.beneficiary?.username
              ? `${project.beneficiary.username} is organizing this fundraiser`
              : 'Organiser cette collecte de fonds'}
          </p>
          <div className="flex justify-center gap-2">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              dons sécurisés
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              Verifié
            </span>
          </div>
        </div>

        {/* Main Content Columns */}
        <div className="md:flex md:space-x-8">
          {/* Left Column: Image & Story */}
          <div className="md:w-2/3">
            {/* Campaign Image with Style */}
            <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
              {project.photo ? (
                <img
                  src={project.photo}
                  alt={project.title}
                  className="w-full h-[400px] object-cover"
                />
              ) : (
                <div className="w-full h-[400px] bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <span className="text-8xl font-bold text-white opacity-80">
                    {project.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Campaign Description Card */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">A propos de ce projet</h2>
              <div className="prose text-gray-700 max-w-none">
                <p className="whitespace-pre-line">{project.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Donation Card */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-4">
              {/* Progress Section */}
              <div className="p-6 border-b">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <div className="text-3xl font-bold text-gray-800">{formatNumber(project.collected_amount)} MRU</div>
                    <p className="text-gray-600">objectif de {formatNumber(project.target_amount)} MRU levé</p>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-600 font-bold">{Math.round(progressPercentage)}%</div>
                    <p className="text-gray-500 text-sm">compléte</p>
                  </div>
                </div>
                
                {/* Improved Progress Bar */}
                <div className="mt-4 mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      style={{ width: `${progressPercentage}%` }}
                      className={`h-4 rounded-full transition-all ${
                        project.is_closed ? 'bg-gray-500' : progressPercentage >= 100 ? 'bg-green-600' : 'bg-cyan-500'
                      }`}
                    />
                  </div>
                </div>
                
                {/* Donors Count */}
                {topDonators.length > 0 && (
                  <div className="flex items-center mt-4 text-cyan-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span>{topDonators.length} {topDonators.length === 1 ? 'person has' : 'people have'} donated</span>
                  </div>
                )}
              </div>

              {/* Wallet Balance */}
              {walletBalance !== null && (
                <div className="bg-gray-50 p-3 border-b">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Le solde de votre portefeuille:</span>
                    <span className="font-semibold">{formatNumber(walletBalance)} MRU</span>
                  </div>
                </div>
              )}

              {/* Owner or Donor Actions */}
              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4">
                    {error}
                  </div>
                )}
                
                {successMsg && !showThankYou && (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 mb-4">
                    {successMsg}
                  </div>
                )}

                {isOwner ? (
                  <>
                    {project.collected_amount > 0 && !project.is_closed ? (
                      <button
                        onClick={handleWithdraw}
                        className={`w-full text-center py-3 px-4 rounded-lg font-semibold transition-all shadow-sm mb-4 ${
                          project.is_closed
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                        }`}
                        disabled={project.is_closed}
                      >
                        Retirer les fonds 
                      </button>
                    ) : project.is_closed ? (
                      <div className="bg-gray-100 p-4 rounded-lg text-gray-700 text-center mb-4">
                        Ce projet a été archivé et n'accepte plus de dons.
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-4 rounded-lg text-gray-700 text-center mb-4">
                        Aucun fond disponible pour le retrait.
                      </div>
                    )}
                    
                    
                  </>
                ) : (
                  <>
                    {!project.is_closed ? (
                      <form onSubmit={handleDonate}>
                        <div className="mb-4">
                          <label htmlFor="amount" className="block text-gray-700 mb-2 font-medium">
                            Montant du don
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-gray-500">$</span>
                            </div>
                            <input
                              id="amount"
                              type="number"
                              min="1"
                              step="0.01"
                              placeholder="Enter amount"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              required
                              className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-sm"
                        >
                          Donate Now
                        </button>
                      </form>
                    ) : (
                      <div className="bg-gray-100 p-4 rounded-lg text-gray-700 text-center">
                        Ce projet a été archivé et n'accepte plus de dons.
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Top Donators Section */}
              <div className="p-6 bg-gray-50 border-t">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Top Donators</h3>
                {topDonators.length > 0 ? (
                  <ul className="divide-y">
                    {topDonators.map((donator, index) => (
                      <li
                        key={index}
                        className={`flex items-center justify-between py-3 ${index === 0 ? 'text-cyan-700 font-medium' : ''}`}
                      >
                        <div className="flex items-center">
                          {index < 3 && (
                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full mr-2 text-xs font-bold ${
                              index === 0 ? 'bg-yellow-400 text-yellow-800' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              'bg-amber-700 text-amber-100'
                            }`}>
                              {index + 1}
                            </span>
                          )}
                          <span>{donator.name}</span>
                        </div>
                        <span className="font-semibold">
                          ${formatNumber(donator.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-400 text-5xl mb-2"></div>
                    <p className="text-gray-500">Be the first to donate!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;