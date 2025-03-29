
// Add or update stay type definitions
export interface Stay {
  id: string;
  title: string;
  description: string;
  images: {
    url: string;
    order: number;
    is_primary?: boolean;
  }[];
  price_per_night: number;
  property_type: string;
  location_name: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  host: {
    id?: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    phone?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities?: string[];
}

// Update the HostStay interface for the dashboard
export interface HostStay {
  id: string | number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  images: {
    id: string;
    url: string;
    order: number;
    is_primary: boolean;
  }[];
  price_per_night: number;
  property_type: string;
  location_name: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  created_at: string;
  updated_at: string;
}
