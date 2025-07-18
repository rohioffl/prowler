import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ ADD THIS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ScanHistory() {
  const [scans, setScans] = useState([]);
  const navigate = useNavigate(); // ✅ INIT NAVIGATE

  useEffect(() => {
    axios.get(`${API_BASE_URL}/scan_history/`)
      .then(res => setScans(res.data.scans))
      .catch(err => console.error('Scan history error:', err));
  }, []);

  const handleRowClick = (id) => {
    navigate(`/AWSfinding/${id}`);
  };

  if (!scans.length) {
    return <p className="text-center mt-10 text-gray-500">Loading scan history...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">AWS Scan History</h2>

      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-indigo-100">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Account ID</th>
            <th className="p-3 text-left">Region</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, idx) => (
            <tr
              key={scan._id}
              className="hover:bg-indigo-50 cursor-pointer"
              onClick={() => handleRowClick(scan._id)} // ✅ CORRECT FUNCTION
            >
              <td className="p-3">{idx + 1}</td>
              <td className="p-3">{scan.accountId}</td>
              <td className="p-3">{scan.region}</td>
              <td className="p-3">{new Date(scan.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
