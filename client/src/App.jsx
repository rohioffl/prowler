import { useState } from 'react'
import "./index.css"
import "./App.css"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Scan from './pages/Scan';
import ScanList from './pages/ScanList';
import Nav from './component/Nav';
import ScanHistory from './pages/ScanHistory';
import FindingDetails from './pages/FindingDetails';
import GCPScanList from './pages/GCPScanList';
import GCPScanHistory from './pages/GCPScanHistory';
import GCPFindingDetails from './pages/GCPFindingDetails';
function App() {
  return (
<BrowserRouter>
  <div className="flex h-screen w-screen">

    <div className="w-64 bg-gray-800 text-white">
      <Nav />
    </div>

    <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
      <Routes>
        <Route path="/" element={<Scan />} />
        <Route path="/AWS_Scan" element={<ScanList />} />
        <Route path="/GCP_Scan" element={<GCPScanList/>} />
        <Route path="/AWS_Scan_History" element={<ScanHistory />} />
        <Route path="/GCP_Scan_History" element={<GCPScanHistory/>} />
        <Route path="/AWSfinding/:id" element={<FindingDetails />} />
        <Route path="/GCPfinding/:id" element={<GCPFindingDetails/>} />
      </Routes>
    </div>
  </div>
</BrowserRouter>

  )
}

export default App
