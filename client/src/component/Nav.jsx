"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ScanEye,
  ShieldCheck,
  Search,
  Cloud,
  Server,
} from "lucide-react";

 

const menuData = [
  {
    id: "1",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/dashboard",
  },
  {
    id: "2",
    label: "Scan History",
    icon: <ScanEye size={18} />,
    children: [
      {
        id: "2.1",
        label: "GCP",
        icon: <Cloud size={16} />,
        path: "/GCP_Scan_History",
      },
      {
        id: "2.2",
        label: "AWS",
        icon: <Server size={16} />,
        path: "/AWS_Scan_History",
      },
    ],
  },
  {
    id: "3",
    label: "Findings",
    icon: <ShieldCheck size={18} />,
    children: [
      {
        id: "3.1",
        label: "GCP",
        icon: <Cloud size={16} />,
        path: "/GCP_Findings",
      },
      {
        id: "3.2",
        label: "AWS",
        icon: <Server size={16} />,
        path: "/AWS_Findings",
      },
    ],
  },
];

const MenuItem = ({ item, level = 0 }) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpand = useCallback(() => setExpanded((prev) => !prev), [])
  const navigate = useNavigate()



  const handleClick = () => {
    if (item.path) {
      navigate(item.path)
    } else {
      toggleExpand()
    }
  }

  return (
    <div>
      <div
        className={`
          flex items-center justify-between py-3 px-4 cursor-pointer 
          transition-all duration-200 ease-in-out
          ${
            level === 0
              ? "text-gray-300 hover:bg-gray-700 hover:text-white border-l-4 border-transparent hover:border-green-400"
              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200 ml-4"
          }
        `}
        style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
        onClick={handleClick}
      >
        <span className="text-sm font-medium transition-colors duration-200">{item.label}</span>
        {item.children && (
          <span
            className={`
              transition-transform duration-300 ease-in-out
              ${expanded ? "rotate-180" : "rotate-0"}
            `}
          >
            <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </span>
        )}
      </div>
      {item.children && (
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Nav() {
  const navigate = useNavigate()

    const handleLaunch = () => {
    navigate("/")
  }
  return (
    <div className="w-70 h-screen bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white tracking-wider">PROWLER</h1>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Action Button */}
        <button onClick={handleLaunch} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
          <span>Launch Scan</span>
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-xs">+</span>
          </div>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-4">
          {menuData.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="font-medium">Sign out</span>
        </button>

        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>v2.1.0</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Service Status</span>
          </div>
        </div>
      </div>
    </div>
  )
}
