// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from '../api/api';
// import authService from '../services/authService';

// const DonationPage = () => {
//   const { projectId } = useParams();
//   const [project, setProject] = useState(null);
//   const [topDonators, setTopDonators] = useState([]);
//   const [donationAmount, setDonationAmount] = useState('');
//   const [walletBalance, setWalletBalance] = useState(null);
//   const [error, setError] = useState(null);
//   const [successMsg, setSuccessMsg] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch project details
//   useEffect(() => {
//     const fetchProject = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`/donations/projects/${projectId}/`);
//         setProject(response.data);
//       } catch (err) {
//         setError("Failed to fetch project details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProject();
//   }, [projectId]);

//   // Fetch top donators for the project
//   useEffect(() => {
//     const fetchTopDonators = async () => {
//       try {
//         const response = await axios.get(`/donations/projects/${projectId}/top-donators/`);
//         setTopDonators(response.data);
//       } catch (err) {
//         console.error("Failed to fetch top donators.");
//       }
//     };
//     fetchTopDonators();
//   }, [projectId]);

//   // Fetch wallet balance from a dedicated endpoint (adjust URL as needed)
//   useEffect(() => {
//     const fetchWalletBalance = async () => {
//       try {
//         const response = await axios.get('/wallet/');
//         setWalletBalance(response.data.balance);
//       } catch (err) {
//         console.error("Failed to fetch wallet balance.");
//       }
//     };
//     fetchWalletBalance();
//   }, []);

//   const handleDonate = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccessMsg(null);
//     try {
//       const payload = {
//         project_id: projectId,
//         amount: parseFloat(donationAmount)
//       };
//       const response = await axios.post('/donations/', payload, {
//         headers: {
//           Authorization: `Bearer ${authService.getTokens().access}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       setSuccessMsg(response.data.message || "Donation successful!");
//       // Refresh wallet balance and project details
//       const walletRes = await axios.get('/wallet/');
//       setWalletBalance(walletRes.data.balance);
//       const projRes = await axios.get(`/donations/projects/${projectId}/`);
//       setProject(projRes.data);
//       setDonationAmount('');
//     } catch (err) {
//       setError(err.response?.data.error || "Donation failed.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="container mx-auto px-4">
//         {/* Project Banner & Details */}
//         {project && (
//           <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//             <div className="relative">
//               {project.photo ? (
//                 <img
//                   src={project.photo}
//                   alt={project.title}
//                   className="w-full h-64 object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
//                   <span className="text-6xl text-gray-700">
//                     {project.title.charAt(0)}
//                   </span>
//                 </div>
//               )}
//             </div>
//             <div className="p-6">
//               <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
//               <p className="text-gray-700 mb-4">{project.description}</p>
//               <div className="mb-4">
//                 <span className="font-semibold">Target Amount: </span>${project.target_amount}
//               </div>
//               <div className="mb-4">
//                 <span className="font-semibold">Collected Amount: </span>${project.collected_amount}
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="flex flex-col md:flex-row gap-8 mt-8">
//           {/* Donation Form */}
//           <div className="md:w-1/2 bg-white p-6 rounded-lg shadow">
//             <h2 className="text-2xl font-semibold mb-4">Make a Donation</h2>
//             {walletBalance !== null && (
//               <p className="mb-4 text-gray-600">
//                 Your Wallet Balance: ${walletBalance}
//               </p>
//             )}
//             {error && (
//               <div className="bg-red-100 p-4 rounded text-red-700 mb-4">
//                 {error}
//               </div>
//             )}
//             {successMsg && (
//               <div className="bg-green-100 p-4 rounded text-green-700 mb-4">
//                 {successMsg}
//               </div>
//             )}
//             <form onSubmit={handleDonate}>
//               <div className="mb-4">
//                 <label htmlFor="donationAmount" className="block mb-2 font-semibold">
//                   Donation Amount
//                 </label>
//                 <input
//                   id="donationAmount"
//                   type="number"
//                   step="0.01"
//                   value={donationAmount}
//                   onChange={(e) => setDonationAmount(e.target.value)}
//                   className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
//                   required
//                 />
//               </div>
//               <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded font-semibold">
//                 Donate Now
//               </button>
//             </form>
//           </div>

//           {/* Top Donators */}
//           <div className="md:w-1/2 bg-white p-6 rounded-lg shadow">
//             <h2 className="text-2xl font-semibold mb-4">Top Donators</h2>
//             {topDonators.length > 0 ? (
//               <ul>
//                 {topDonators.map((donator, index) => (
//                   <li key={index} className="flex justify-between border-b py-2">
//                     <span>{donator.name}</span>
//                     <span className="font-semibold">${donator.amount}</span>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-gray-500">No donations yet.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DonationPage;
