import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GCPScanHistory = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/GCPscanlist`);
                setScans(res.data.data);
            } catch (err) {
                console.error('❌ Error fetching scan list:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
    }, []);

    const handleRowClick = (id) => {
        navigate(`/GCPfinding/${id}`);
    };

    const handleDownloadSelected = async (selectedIds) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/gcp-xls`, {
                id: selectedIds,
            });
           
            const findings = res.data.findings;
             console.table(findings)


            if (!findings || findings.length === 0) {
                alert("No findings found for this scan.");
                return;
            }

            // ✅ Flatten associatedStandards and relatedRequirements
            const flattened = findings.map(item => ({
                ...item,
                relatedRequirements: Array.isArray(item.relatedRequirements)
                    ? item.relatedRequirements.join(', ')
                    : '',
                associatedStandards: Array.isArray(item.associatedStandards)
                    ? item.associatedStandards.map(std => std.StandardsId).join(', ')
                    : '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(flattened);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Findings");

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, `GCP_scan_${selectedIds}_findings.xlsx`);
        } catch (err) {
            console.error("❌ Error downloading Excel:", err);
        }
    }


        return (
            <div className="p-4 sm:p-6 overflow-x-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">📜 Recent Scans</h2>

                {loading ? (
                    <p className="text-gray-600">Loading...</p>
                ) : scans.length === 0 ? (
                    <p className="text-red-500">No scan records available.</p>
                ) : (
                    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 border">S No</th>
                                    <th className="px-4 py-3 border">Date</th>
                                    <th className="px-4 py-3 border">Provider</th>
                                    <th className="px-4 py-3 border">Region</th>
                                    <th className="px-4 py-3 border">Account ID</th>
                                    <th className="px-4 py-3 border text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800">
                                {scans.map((scan, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleRowClick(scan._id)} // 👈 Click handler on row
                                    >
                                        <td className="px-4 py-2 border">{index + 1}</td>
                                        <td className="px-4 py-2 border">{new Date(scan.date).toLocaleString()}</td>
                                        <td className="px-4 py-2 border">{scan.provider || 'AWS'}</td>
                                        <td className="px-4 py-2 border">{scan.region}</td>
                                        <td className="px-4 py-2 border">{scan.accountId}</td>
                                        <td className="px-4 py-2 border text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // prevent row click from triggering when download is clicked
                                                    handleDownloadSelected(scan._id);
                                                }}
                                                className="text-blue-600 hover:underline"
                                            >
                                                📥 Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}
            </div>
        );
    };

    export default GCPScanHistory;
