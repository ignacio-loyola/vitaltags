'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { 
  QrCodeIcon,
  EyeIcon,
  HeartIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  activeTags: number;
  totalScans: number;
  medicalEntries: number;
  privacyScore: number;
  lastScan?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call - replace with real API
    const fetchStats = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: DashboardStats = {
        activeTags: 2,
        totalScans: 47,
        medicalEntries: 8,
        privacyScore: 85,
        lastScan: '2 hours ago',
      };
      
      setStats(mockStats);
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md"></div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your emergency tags.
        </p>
      </div>

      {/* Alert for incomplete profile */}
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Complete your profile
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Add emergency contact information to help first responders reach your loved ones.{' '}
                <a href="/profile" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                  Update now
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Tags"
          value={stats?.activeTags || 0}
          icon={QrCodeIcon}
          color="red"
          change={stats?.activeTags ? { value: '+1 this month', type: 'increase' } : undefined}
        />
        
        <StatsCard
          title="Total Scans"
          value={stats?.totalScans || 0}
          icon={EyeIcon}
          color="blue"
          change={stats?.lastScan ? { value: stats.lastScan, type: 'neutral' } : undefined}
        />
        
        <StatsCard
          title="Medical Entries"
          value={stats?.medicalEntries || 0}
          icon={HeartIcon}
          color="green"
        />
        
        <StatsCard
          title="Privacy Score"
          value={`${stats?.privacyScore || 0}%`}
          icon={ShieldCheckIcon}
          color="yellow"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <QuickActions />
          
          {/* Emergency readiness card */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Emergency Readiness
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="ml-3 text-sm text-gray-700">Profile information complete</span>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="ml-3 text-sm text-gray-700">Medical conditions added</span>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="ml-3 text-sm text-gray-700">Emergency contact missing</span>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="ml-3 text-sm text-gray-700">QR codes generated</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats?.privacyScore || 0}%` }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stats?.privacyScore || 0}% ready for emergencies
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <RecentActivity />
          
          {/* Tips card */}
          <div className="bg-blue-50 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-blue-900 mb-4">
                💡 Tips for Better Emergency Preparedness
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Keep your medical information up to date</li>
                <li>• Test your QR codes monthly to ensure they work</li>
                <li>• Print backup tags for your wallet and key ring</li>
                <li>• Add emergency contacts for faster response</li>
                <li>• Review privacy settings regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}