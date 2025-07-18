// src/components/CloudScan.js
import React, { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CloudScan = () => {
  const [provider, setProvider] = useState('');
  const [accountId, setAccountId] = useState('');
  const [region, setRegion] = useState('');
  const [message, setMessage] = useState('');

  const handleProviderSelect = (prov) => {
    setProvider(prov);
    setMessage('');
  };

  const downloadAWSYaml = () => {
    fetch(`${API_BASE_URL}/download-cf-template/`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "external_audit_template.yaml";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  };

  const handleStartScan = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/start-scan/`, {
        accountId,
        region,
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage("Scan failed: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Cloud Scanner</h2>

      <div className="mb-4">
        <p className="font-semibold mb-2">Select Provider:</p>
        <button
          onClick={() => handleProviderSelect('aws')}
          className="bg-yellow-500 text-white px-4 py-2 mr-2 rounded"
        >
          AWS
        </button>
        <button
          onClick={() => handleProviderSelect('gcp')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          GCP
        </button>
      </div>

      {provider === 'aws' && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Step 1: Download & Deploy</h3>
          <p className="mb-2">Download the CloudFormation template and deploy it in your AWS account.</p>
          <button
            onClick={downloadAWSYaml}
            className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          >
            Download Template
          </button>

          <h3 className="text-lg font-bold mb-2">Step 2: Enter Account Details</h3>
          <input
            type="text"
            placeholder="AWS Account ID"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Region (e.g., us-east-1 or all)"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border p-2 w-full mb-4"
          />

          <button
            onClick={handleStartScan}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Start AWS Scan
          </button>
        </div>
      )}

      {provider === 'gcp' && (
        <p className="text-red-600 mt-4">GCP support coming soon...</p>
      )}

      {message && <p className="mt-4 text-gray-800 font-semibold">{message}</p>}
    </div>
  );
};

export default CloudScan;
