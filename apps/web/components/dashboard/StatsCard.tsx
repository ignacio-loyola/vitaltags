interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: React.ComponentType<{ className?: string }>;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'gray' 
}: StatsCardProps) {
  const colorClasses = {
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white', 
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    gray: 'bg-gray-500 text-white',
  };

  const changeColorClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600', 
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`inline-flex items-center justify-center p-3 rounded-md ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeColorClasses[change.type]}`}>
                    <span className="sr-only">
                      {change.type === 'increase' ? 'Increased' : change.type === 'decrease' ? 'Decreased' : 'No change'} by
                    </span>
                    {change.value}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}