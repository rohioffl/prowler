import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getSeverityColor = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-700 text-white';
    case 'HIGH':
      return 'bg-red-500 text-white';
    case 'MEDIUM':
      return 'bg-yellow-400 text-black';
    case 'LOW':
      return 'bg-green-400 text-black';
    default:
      return 'bg-gray-300 text-black';
  }
};

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'FAILED':
      return 'bg-red-200 text-red-800';
    case 'PASSED':
      return 'bg-green-200 text-green-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const GCPFindingDetails = () => {
  const { id } = useParams();
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinding = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/GCPfinding/${id}`);
        setFindings(res.data.findings);
      } catch (err) {
        console.error('❌ Error fetching finding:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinding();
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🔍 Findings for Scan ID: <span className="text-blue-600">{id}</span></h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : findings.length === 0 ? (
        <p className="text-red-500">No findings found for this scan.</p>
      ) : (
        findings.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 shadow rounded-lg p-6 mb-5">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-blue-700">{item.details || 'No Title'}</div>
              <div className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(item.severity)}`}>
                {item.severity || 'N/A'}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{item.description || 'No description provided.'}</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm text-gray-700">
              <div>
                <strong>Status:</strong>{' '}
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status || 'Unknown'}
                </span>
              </div>
              <div><strong>Resource:</strong> {item.resourceName || 'N/A'}</div>
              <div><strong>Region:</strong> {item.region || 'N/A'}</div>
              <div><strong>Service:</strong> {item.service || 'N/A'}</div>
              <div><strong>Subservice:</strong> {item.subService || 'N/A'}</div>
              <div><strong>Timestamp:</strong> {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GCPFindingDetails;
