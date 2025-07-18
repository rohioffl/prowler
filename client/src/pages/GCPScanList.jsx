import { useEffect, useState } from "react"
import axios from "axios"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GCPScanList = () => {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScanData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/GCP_Scan`)
        setScans(res.data.findings)
        console.table(res.data.findings)
      } catch (err) {
        console.error("Failed to fetch scan list:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchScanData()
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="w-full   mx-auto px-4 py-6 sm:px-6 lg:px-8 h-screen">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 text-center sm:text-left">
          🛡️ Prowler Scan Findings
        </h2>
        <p className="text-sm text-gray-600 mt-2 text-center sm:text-left">
          Security findings from your GCP environment
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600 text-center">Loading scan results...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">No scan data found.</p>
          <p className="text-gray-400 text-sm mt-2">Run a scan to see your security findings here.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-lg shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Finding ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    AWS Account
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scans.map((scan, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-3 py-4 text-sm font-mono text-gray-900 truncate max-w-32">{scan.findingId}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{scan.awsAccountId}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="line-clamp-2">{scan.title}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(scan.severity)}`}
                      >
                        {scan.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{scan.recordState}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{scan.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tablet View */}
          <div className="hidden md:block lg:hidden">
            <div className="grid gap-4">
              {scans.map((scan, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">{scan.title}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">ID: {scan.findingId}</p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getSeverityColor(scan.severity)}`}
                    >
                      {scan.severity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Account:</span>
                      <p className="text-gray-900 font-medium">{scan.awsAccountId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">State:</span>
                      <p className="text-gray-900">{scan.recordState}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Created:</span>
                      <p className="text-gray-600">{new Date(scan.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <div className="space-y-3">
              {scans.map((scan, index) => (
                <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(scan.severity)}`}
                    >
                      {scan.severity}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(scan.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">{scan.title}</h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Finding ID:</span>
                      <span className="text-gray-900 font-mono text-right truncate ml-2 max-w-32">
                        {scan.findingId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account:</span>
                      <span className="text-gray-900 font-medium">{scan.awsAccountId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">State:</span>
                      <span className="text-gray-900">{scan.recordState}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{scans.length}</span> security findings
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default GCPScanList
