import Link from 'next/link';
import { 
  PlusIcon,
  QrCodeIcon,
  DocumentArrowDownIcon,
  UserPlusIcon,
  HeartIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const actions = [
  {
    name: 'Create New Tag',
    description: 'Generate a new emergency QR code',
    href: '/tags/new',
    icon: QrCodeIcon,
    color: 'bg-red-500 hover:bg-red-600',
  },
  {
    name: 'Add Medical Info',
    description: 'Update conditions, allergies, or medications',
    href: '/medical',
    icon: HeartIcon,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'Update Profile',
    description: 'Edit your basic information',
    href: '/profile',
    icon: UserPlusIcon,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    name: 'Download PDF',
    description: 'Get printable emergency tags',
    href: '/tags?action=download',
    icon: DocumentArrowDownIcon,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="relative group bg-white p-6 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 text-white ${action.color} transition-colors`}>
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
                  {action.name}
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <PlusIcon className="h-6 w-6" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}