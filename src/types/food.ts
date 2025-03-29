
// Update the host type to include phone property
export interface FoodExperience {
  id: string;
  title: string;
  description: string;
  images: {
    url: string;
    order: number;
    is_primary?: boolean;
  }[];
  price_per_person: number;
  cuisine_type: string;
  menu_description?: string;
  location_name: string;
  host: {
    id?: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    phone?: string;
  };
  details: {
    duration: string;
    groupSize: string;
    includes: string[];
    language: string;
    location: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities?: string[];
}

// Update types for HostFoodExperience in the host dashboard
export interface HostFoodExperience {
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
  price_per_person: number;
  cuisine_type: string;
  menu_description: string;
  location_name: string;
  created_at: string;
  updated_at: string;
  details: {
    duration: string;
    groupSize: string;
    includes: string[];
    language: string;
    location: string;
  };
}
