const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export interface EmergencyInfo {
  alias?: string;
  yob?: number;
  languages?: string[];
  blood_type?: string;
  rh_factor?: string;
  ice_name?: string;
  ice_phone?: string;
  ice_relationship?: string;
  conditions: MedicalCondition[];
  allergies: Allergy[];
  medications: Medication[];
  last_updated: string;
  scan_id?: number;
}

export interface MedicalCondition {
  display: string;
  severity?: string;
  coded: boolean;
  code?: string;
  system?: string;
  notes?: string;
}

export interface Allergy {
  display: string;
  reaction?: string;
  severity?: string;
  onset?: string;
  coded: boolean;
  code?: string;
  system?: string;
}

export interface Medication {
  display: string;
  dose?: string;
  route?: string;
  frequency?: string;
  coded: boolean;
  code?: string;
  system?: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Emergency endpoints (public, no auth required)
  async getEmergencyInfo(
    shortId: string,
    lang?: string,
    format: 'json' | 'minimal' = 'json'
  ): Promise<EmergencyInfo> {
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (format !== 'json') params.append('format', format);
    
    const queryString = params.toString();
    const endpoint = `/e/${shortId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<EmergencyInfo>(endpoint);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Public stats
  async getPublicStats(): Promise<{
    active_tags: number;
    total_scans: number;
    countries_reached: number;
    last_updated: string;
  }> {
    return this.request('/stats');
  }

  // Auth endpoints
  async requestMagicLink(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyMagicLink(token: string): Promise<{
    access_token: string;
    token_type: string;
    user_id: number;
  }> {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
}

export const api = new ApiClient();

// Utility functions
export const formatBloodType = (bloodType?: string, rhFactor?: string): string | undefined => {
  if (!bloodType) return undefined;
  return `${bloodType}${rhFactor || ''}`;
};

export const formatLanguages = (languages?: string[]): string => {
  if (!languages || languages.length === 0) return 'Not specified';
  
  const languageNames = languages.map(lang => {
    // Simple language code to name mapping
    const langMap: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
    };
    
    return langMap[lang] || lang.toUpperCase();
  });
  
  return languageNames.join(', ');
};

export const getSeverityColor = (severity?: string): string => {
  switch (severity?.toLowerCase()) {
    case 'severe':
    case 'fatal':
      return 'allergy-critical';
    case 'moderate':
      return 'allergy-severe';
    case 'mild':
      return 'allergy-mild';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

export const formatAge = (yob?: number): string => {
  if (!yob) return 'Not specified';
  const currentYear = new Date().getFullYear();
  const age = currentYear - yob;
  return `${age} years old (born ${yob})`;
};

export const formatLastUpdated = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
};