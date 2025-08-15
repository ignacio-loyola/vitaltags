'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  UserIcon,
  HeartIcon,
  GlobeAltIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const profileSchema = z.object({
  alias: z.string().min(1, 'Alias is required').max(100, 'Alias must be less than 100 characters'),
  yob: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future').optional(),
  blood_type: z.enum(['A', 'B', 'AB', 'O', '']).optional(),
  rh_factor: z.enum(['+', '-', '']).optional(),
  donor_status: z.boolean().optional(),
  primary_langs: z.array(z.string()).min(1, 'At least one language is required'),
  ice_name: z.string().max(200, 'Name must be less than 200 characters').optional(),
  ice_phone: z.string().max(50, 'Phone must be less than 50 characters').optional(),
  ice_relationship: z.string().max(100, 'Relationship must be less than 100 characters').optional(),
  // Privacy settings
  public_alias: z.boolean(),
  public_yob: z.boolean(),
  public_blood: z.boolean(),
  public_languages: z.boolean(),
  public_ice: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      alias: '',
      primary_langs: ['en'],
      public_alias: true,
      public_yob: true,
      public_blood: true,
      public_languages: true,
      public_ice: false,
    }
  });

  const watchedFields = watch();

  useEffect(() => {
    // Mock API call to load profile data
    const loadProfile = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockProfile = {
        alias: 'John Doe',
        yob: 1985,
        blood_type: 'A' as const,
        rh_factor: '+' as const,
        donor_status: true,
        primary_langs: ['en', 'es'],
        ice_name: 'Jane Doe',
        ice_phone: '+1 (555) 123-4567',
        ice_relationship: 'Spouse',
        public_alias: true,
        public_yob: true,
        public_blood: true,
        public_languages: true,
        public_ice: false,
      };

      // Set form values
      Object.entries(mockProfile).forEach(([key, value]) => {
        setValue(key as keyof ProfileFormData, value);
      });

      setLoading(false);
    };

    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Profile data:', data);
      // TODO: Call actual API
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (langCode: string) => {
    const currentLangs = watchedFields.primary_langs || [];
    if (currentLangs.includes(langCode)) {
      setValue('primary_langs', currentLangs.filter(lang => lang !== langCode));
    } else {
      setValue('primary_langs', [...currentLangs, langCode]);
    }
  };

  const PrivacyToggle = ({ field, label }: { field: keyof ProfileFormData, label: string }) => {
    const isPublic = watch(field) as boolean;
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-700">{label}</span>
        <button
          type="button"
          onClick={() => setValue(field, !isPublic)}
          className="flex items-center space-x-1 text-sm"
        >
          {isPublic ? (
            <>
              <EyeIcon className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Public</span>
            </>
          ) : (
            <>
              <EyeSlashIcon className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600">Private</span>
            </>
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal information and privacy settings for emergency situations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="alias" className="block text-sm font-medium text-gray-700">
                  Name/Alias *
                </label>
                <input
                  {...register('alias')}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="How you'd like to be addressed"
                />
                {errors.alias && (
                  <p className="mt-1 text-sm text-red-600">{errors.alias.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="yob" className="block text-sm font-medium text-gray-700">
                  Year of Birth
                </label>
                <input
                  {...register('yob', { valueAsNumber: true })}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="1990"
                />
                {errors.yob && (
                  <p className="mt-1 text-sm text-red-600">{errors.yob.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
              <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
              Medical Information
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                  Blood Type
                </label>
                <select
                  {...register('blood_type')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select blood type</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div>
                <label htmlFor="rh_factor" className="block text-sm font-medium text-gray-700">
                  Rh Factor
                </label>
                <select
                  {...register('rh_factor')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Rh</option>
                  <option value="+">Positive (+)</option>
                  <option value="-">Negative (-)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  {...register('donor_status')}
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Organ donor
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
              <GlobeAltIcon className="h-5 w-5 mr-2 text-blue-500" />
              Languages
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Select languages you speak. This helps first responders communicate with you.
            </p>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = watchedFields.primary_langs?.includes(lang.code) || false;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                    } border`}
                  >
                    {lang.name}
                  </button>
                );
              })}
            </div>
            
            {errors.primary_langs && (
              <p className="mt-2 text-sm text-red-600">{errors.primary_langs.message}</p>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
              <PhoneIcon className="h-5 w-5 mr-2 text-green-500" />
              Emergency Contact (ICE)
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="ice_name" className="block text-sm font-medium text-gray-700">
                  Contact Name
                </label>
                <input
                  {...register('ice_name')}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label htmlFor="ice_phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  {...register('ice_phone')}
                  type="tel"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="ice_relationship" className="block text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <input
                  {...register('ice_relationship')}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Spouse, Parent, Sibling, etc."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Privacy Settings
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Control what information is visible on your emergency page. Private information is never shared.
            </p>
            
            <div className="space-y-3 border border-gray-200 rounded-md p-4">
              <PrivacyToggle field="public_alias" label="Name/Alias" />
              <PrivacyToggle field="public_yob" label="Year of Birth" />
              <PrivacyToggle field="public_blood" label="Blood Type" />
              <PrivacyToggle field="public_languages" label="Languages" />
              <PrivacyToggle field="public_ice" label="Emergency Contact" />
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Even if set to private, emergency responders may still have access to this information through other medical systems.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}