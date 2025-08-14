'use client';

import { EmergencyInfo, formatBloodType, formatLanguages, formatAge, getSeverityColor } from '@/lib/api';
import { 
  UserIcon, 
  HeartIcon, 
  GlobeAltIcon, 
  PhoneIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
} from '@heroicons/react/24/solid';

interface EmergencyCardProps {
  info: EmergencyInfo;
  shortId: string;
}

export default function EmergencyCard({ info, shortId }: EmergencyCardProps) {
  const bloodType = formatBloodType(info.blood_type, info.rh_factor);
  const languages = formatLanguages(info.languages);
  const age = formatAge(info.yob);

  // Critical allergies (severe/fatal) should be prominently displayed
  const criticalAllergies = info.allergies.filter(
    allergy => allergy.severity === 'severe' || allergy.severity === 'fatal'
  );
  const otherAllergies = info.allergies.filter(
    allergy => allergy.severity !== 'severe' && allergy.severity !== 'fatal'
  );

  return (
    <div className="emergency-card max-w-4xl mx-auto">
      {/* Header */}
      <div className="emergency-header">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <ExclamationTriangleSolidIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Emergency Medical Information
            </h1>
            <p className="text-sm text-gray-600">
              Tag ID: <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{shortId}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      {(info.alias || info.yob || bloodType || languages) && (
        <div className="medical-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-red-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {info.alias && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <dt className="text-sm font-medium text-gray-600">Name/Alias</dt>
                <dd className="text-lg font-semibold text-gray-900">{info.alias}</dd>
              </div>
            )}
            {info.yob && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <dt className="text-sm font-medium text-gray-600">Age</dt>
                <dd className="text-lg font-semibold text-gray-900">{age}</dd>
              </div>
            )}
            {bloodType && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <dt className="text-sm font-medium text-red-700 flex items-center">
                  <HeartIcon className="w-4 h-4 mr-1" />
                  Blood Type
                </dt>
                <dd className="text-xl font-bold text-red-800">{bloodType}</dd>
              </div>
            )}
            {languages && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <dt className="text-sm font-medium text-gray-600 flex items-center">
                  <GlobeAltIcon className="w-4 h-4 mr-1" />
                  Languages
                </dt>
                <dd className="text-sm text-gray-900">{languages}</dd>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Critical Allergies */}
      {criticalAllergies.length > 0 && (
        <div className="medical-section">
          <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
            ⚠️ CRITICAL ALLERGIES
          </h2>
          <div className="space-y-3">
            {criticalAllergies.map((allergy, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(allergy.severity)} border-red-300`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-red-900">{allergy.display}</h3>
                    {allergy.reaction && (
                      <p className="text-sm text-red-800 mt-1">
                        <strong>Reaction:</strong> {allergy.reaction}
                      </p>
                    )}
                    {allergy.onset && (
                      <p className="text-xs text-red-700 mt-1">
                        <strong>Onset:</strong> {allergy.onset}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      allergy.severity === 'fatal' 
                        ? 'bg-red-800 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {allergy.severity?.toUpperCase() || 'SEVERE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Allergies */}
      {otherAllergies.length > 0 && (
        <div className="medical-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-500" />
            Other Allergies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {otherAllergies.map((allergy, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getSeverityColor(allergy.severity)}`}
              >
                <h3 className="font-semibold">{allergy.display}</h3>
                {allergy.reaction && (
                  <p className="text-sm mt-1">
                    <strong>Reaction:</strong> {allergy.reaction}
                  </p>
                )}
                {allergy.severity && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded mt-2 bg-gray-200 text-gray-800">
                    {allergy.severity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Conditions */}
      {info.conditions.length > 0 && (
        <div className="medical-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2 text-blue-500" />
            Medical Conditions
          </h2>
          <div className="space-y-3">
            {info.conditions.map((condition, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  condition.severity === 'severe' 
                    ? 'condition-severe border-red-200'
                    : condition.severity === 'moderate'
                    ? 'condition-moderate border-orange-200'
                    : 'condition-mild border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{condition.display}</h3>
                    {condition.notes && (
                      <p className="text-sm text-gray-700 mt-2">{condition.notes}</p>
                    )}
                    {condition.coded && condition.code && (
                      <p className="text-xs text-gray-500 mt-2">
                        Code: {condition.system}/{condition.code}
                      </p>
                    )}
                  </div>
                  {condition.severity && (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      condition.severity === 'severe'
                        ? 'bg-red-100 text-red-800'
                        : condition.severity === 'moderate'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {condition.severity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Medications */}
      {info.medications.length > 0 && (
        <div className="medical-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2 text-green-500" />
            Current Medications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {info.medications.map((medication, index) => (
              <div
                key={index}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <h3 className="font-semibold text-green-900">{medication.display}</h3>
                <div className="mt-2 space-y-1">
                  {medication.dose && (
                    <p className="text-sm text-green-800">
                      <strong>Dose:</strong> {medication.dose}
                    </p>
                  )}
                  {medication.frequency && (
                    <p className="text-sm text-green-800">
                      <strong>Frequency:</strong> {medication.frequency}
                    </p>
                  )}
                  {medication.route && (
                    <p className="text-sm text-green-800">
                      <strong>Route:</strong> {medication.route}
                    </p>
                  )}
                </div>
                {medication.coded && medication.code && (
                  <p className="text-xs text-green-600 mt-2">
                    Code: {medication.system}/{medication.code}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {(info.ice_name || info.ice_phone) && (
        <div className="medical-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PhoneIcon className="w-5 h-5 mr-2 text-blue-500" />
            Emergency Contact
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {info.ice_name && (
              <p className="text-lg font-semibold text-blue-900">{info.ice_name}</p>
            )}
            {info.ice_phone && (
              <p className="text-blue-800">
                <a 
                  href={`tel:${info.ice_phone}`} 
                  className="hover:underline font-medium"
                >
                  {info.ice_phone}
                </a>
              </p>
            )}
            {info.ice_relationship && (
              <p className="text-sm text-blue-700">
                <strong>Relationship:</strong> {info.ice_relationship}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 mt-8">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            Last updated: {new Date(info.last_updated).toLocaleDateString()}
          </div>
          <div className="text-xs">
            Vital Tags - Emergency Medical Information
          </div>
        </div>
      </div>
    </div>
  );
}