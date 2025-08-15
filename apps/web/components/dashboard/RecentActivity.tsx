'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  EyeIcon,
  QrCodeIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'scan' | 'tag_created' | 'profile_updated' | 'medical_updated';
  description: string;
  timestamp: Date;
  metadata?: any;
}

const activityIcons = {
  scan: EyeIcon,
  tag_created: QrCodeIcon,
  profile_updated: UserIcon,
  medical_updated: DocumentTextIcon,
};

const activityColors = {
  scan: 'text-blue-600',
  tag_created: 'text-green-600',
  profile_updated: 'text-yellow-600',
  medical_updated: 'text-red-600',
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with API call
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'scan',
        description: 'Emergency tag scanned in Madrid, Spain',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: '2',
        type: 'profile_updated',
        description: 'Profile information updated',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: '3',
        type: 'tag_created',
        description: 'New QR code generated for wallet card',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: '4',
        type: 'medical_updated',
        description: 'Added new allergy: Penicillin',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: '5',
        type: 'scan',
        description: 'Emergency tag scanned in Barcelona, Spain',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h4>
            <p className="mt-1 text-sm text-gray-500">
              Your emergency tag activity will appear here.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, activityIdx) => {
                const Icon = activityIcons[activity.type];
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`bg-white h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activityColors[activity.type]}`}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.timestamp.toISOString()}>
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activities.length > 0 && (
          <div className="mt-6">
            <button className="w-full text-center text-sm text-red-600 hover:text-red-500 font-medium">
              View all activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}