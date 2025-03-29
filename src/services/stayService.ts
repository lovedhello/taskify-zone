import { supabase } from '@/integrations/supabase/client';
import { addDays, format } from 'date-fns';

// Types
export interface Stay {
  id: string;
  title: string;
  description: string;
  image?: string;
  images: { url: string; order?: number }[];
  price_per_night: number;
  host: {
    id?: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
  };
  host_id: string;
  details: {
    bedrooms: number;
    beds: number;
    bathrooms: number;
    maxGuests: number;
    amenities: string[];
    location: string;
    propertyType?: string;
  };
  availability?: {
    date: string;
    price: number;
    is_available: boolean;
  }[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  status?: string;
  is_featured?: boolean;
}

// Define types for Supabase responses
interface UserProfile {
  id?: string;
  name: string;
  avatar_url: string | null;
}

interface StayImage {
  id?: string;
  image_path: string;
  is_primary?: boolean;
  display_order?: number;
}

interface StayReview {
  rating: number;
}

interface StayFromDB {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  status: string;
  property_type: string | null;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[] | string | null;
  location_name: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  host_id: string;
  profiles: UserProfile[];
  stay_images: StayImage[];
  stay_reviews: StayReview[];
  stay_amenities?: { id: string; amenity_id: string; }[];
}

// Helper function to get full image URL
const getFullImageUrl = (url: string) => {
  if (!url) return `/images/placeholder-stay.jpg`;
  if (url.startsWith('http')) return url;
  // Handle Supabase storage URLs
  if (url.startsWith('stay-images/')) {
    return `https://bbrgntyiwuniovyoryta.supabase.co/storage/v1/object/public/${url}`;
  }
  return `${import.meta.env.VITE_BACKEND_URL || ''}${url}`;
};

// Helper function to generate availability for the next 30 days
// This will be replaced with real availability data when available
const generateAvailability = (basePrice: number) => {
  const availability = [];
  const startDate = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = addDays(startDate, i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Price variation for weekends
    let price = basePrice;
    if (isWeekend) price += Math.round(basePrice * 0.25); // 25% more on weekends
    
    availability.push({
      date: format(date, 'yyyy-MM-dd'),
      price,
      is_available: true
    });
  }
  
  return availability;
};

// Mock data for initial development
const mockStays: Stay[] = [
  {
    id: "1",
    title: "Luxury Beachfront Villa",
    description: "Spacious villa with private beach access, pool, and stunning ocean views. Perfect for a family getaway or a romantic retreat. Enjoy the sunset from your private terrace.",
    image: "/images/stays/beach-villa.jpg",
    images: [
      { url: "/images/stays/beach-villa.jpg", order: 0 },
      { url: "/images/stays/beach-villa-2.jpg", order: 1 },
      { url: "/images/stays/beach-villa-3.jpg", order: 2 }
    ],
    price_per_night: 249,
    host: {
      id: "sarah123",
      name: "Sarah",
      image: "/images/avatars/sarah.jpg",
      rating: 4.9,
      reviews: 84
    },
    host_id: "sarah",
    details: {
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      maxGuests: 8,
      amenities: ["Wi-Fi", "Pool", "Kitchen", "Free parking", "Beach access", "Air conditioning"],
      location: "Miami Beach, FL",
      propertyType: "house"
    },
    coordinates: {
      lat: 25.7907,
      lng: -80.1300
    }
  },
  {
    id: "2",
    title: "Mountain Retreat Cabin",
    description: "Cozy cabin surrounded by pine forest with hiking trails and mountain views. The perfect place to disconnect and enjoy nature. Includes a hot tub on the deck.",
    image: "/images/stays/mountain-cabin.jpg",
    images: [
      { url: "/images/stays/mountain-cabin.jpg", order: 0 },
      { url: "/images/stays/mountain-cabin-2.jpg", order: 1 },
      { url: "/images/stays/mountain-cabin-3.jpg", order: 2 }
    ],
    price_per_night: 179,
    host: {
      id: "michael456",
      name: "Michael",
      image: "/images/avatars/michael.jpg",
      rating: 4.8,
      reviews: 62
    },
    host_id: "michael",
    details: {
      bedrooms: 2,
      beds: 3,
      bathrooms: 1,
      maxGuests: 6,
      amenities: ["Wi-Fi", "Fireplace", "Hot tub", "Kitchen", "Free parking", "Pets allowed"],
      location: "Asheville, NC",
      propertyType: "cabin"
    },
    coordinates: {
      lat: 35.5951,
      lng: -82.5515
    }
  },
  {
    id: "3",
    title: "Modern Downtown Loft",
    description: "Stylish loft in the heart of the city, walking distance to restaurants and attractions. Modern amenities and contemporary design make this an ideal city escape.",
    image: "/images/stays/city-loft.jpg",
    images: [
      { url: "/images/stays/city-loft.jpg", order: 0 },
      { url: "/images/stays/city-loft-2.jpg", order: 1 },
      { url: "/images/stays/city-loft-3.jpg", order: 2 }
    ],
    price_per_night: 155,
    host: {
      id: "jennifer789",
      name: "Jennifer",
      image: "/images/avatars/jennifer.jpg",
      rating: 4.7,
      reviews: 93
    },
    host_id: "jennifer",
    details: {
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ["Wi-Fi", "Air conditioning", "Kitchen", "Washer/Dryer", "Gym access", "Doorman"],
      location: "Chicago, IL",
      propertyType: "apartment"
    },
    coordinates: {
      lat: 41.8781,
      lng: -87.6298
    }
  },
  {
    id: "4",
    title: "Cozy Private Room in Shared House",
    description: "Comfortable private room in a shared house with access to common areas. Great for solo travelers or couples looking for an affordable option.",
    image: "/images/stays/private-room.jpg",
    images: [
      { url: "/images/stays/private-room.jpg", order: 0 },
      { url: "/images/stays/private-room-2.jpg", order: 1 }
    ],
    price_per_night: 75,
    host: {
      name: "David",
      image: "/images/avatars/david.jpg",
      rating: 4.6,
      reviews: 47
    },
    host_id: "david",
    details: {
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ["Wi-Fi", "Kitchen access", "Laundry", "Backyard", "Street parking"],
      location: "Portland, OR",
      propertyType: "room"
    },
    coordinates: {
      lat: 45.5152,
      lng: -122.6784
    }
  },
  {
    id: "5",
    title: "Charming Cottage with Garden",
    description: "Quaint cottage with a beautiful garden and outdoor seating area. Close to local attractions but secluded enough for peace and quiet.",
    image: "/images/stays/cottage.jpg",
    images: [
      { url: "/images/stays/cottage.jpg", order: 0 },
      { url: "/images/stays/cottage-2.jpg", order: 1 },
      { url: "/images/stays/cottage-3.jpg", order: 2 }
    ],
    price_per_night: 120,
    host: {
      name: "Emma",
      image: "/images/avatars/emma.jpg",
      rating: 4.9,
      reviews: 71
    },
    host_id: "emma",
    details: {
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      maxGuests: 4,
      amenities: ["Wi-Fi", "Garden", "Kitchen", "Free parking", "BBQ grill", "Fire pit"],
      location: "Savannah, GA",
      propertyType: "cottage"
    },
    coordinates: {
      lat: 32.0835,
      lng: -81.0998
    }
  }
];

// Service functions
export const stayService = {
  // Get all stays with filtering options
  async getStays(options: {
    search?: string;
    zipcode?: string;
    location?: string;
    sort?: string;
    limit?: number;
    propertyType?: string[];
    bedrooms?: string;
    maxGuests?: string;
  } = {}): Promise<Stay[]> {
    try {
      console.log('Fetching stays with options:', options);
      
      // Try to fetch from Supabase
      let query = supabase
        .from('stays')
        .select(`
          id, 
          title, 
          description, 
          price_per_night,
          status,
          property_type,
          bedrooms,
          beds,
          bathrooms,
          max_guests,
          amenities,
          location_name,
          zipcode,
          latitude,
          longitude,
          host_id,
          host:profiles!host_id(id, name, avatar_url),
          stay_images:stay_images(id, image_path, is_primary, display_order),
          stay_reviews:stay_reviews(rating),
          stay_amenities:stay_amenities(amenity_id, amenities:amenities(id, name))
        `)
        .eq('status', 'published');
      
      // Apply filters
      if (options.zipcode) {
        query = query.eq('zipcode', options.zipcode);
      }
      
      if (options.location) {
        query = query.ilike('location_name', `%${options.location}%`);
      }
      
      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%,location_name.ilike.%${options.search}%`);
      }
      
      if (options.propertyType && options.propertyType.length > 0) {
        query = query.in('property_type', options.propertyType);
      }
      
      // Sorting
      if (options.sort) {
        switch (options.sort) {
          case 'price_asc':
            query = query.order('price_per_night', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price_per_night', { ascending: false });
            break;
          case 'rating_desc':
            // Complex sorting would need to be handled in post-processing
            query = query.order('id', { ascending: true });
            break;
          default:
            query = query.order('id', { ascending: true });
        }
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stays:', error);
        throw new Error('Failed to fetch stays');
      }
      
      if (!data || data.length === 0) {
        console.log('No stays found in database');
        return [];
      }
      
      console.log('Raw stays data from DB:', data);
      
      // Transform data to match our interface
      const transformedData = data.map(stayData => {
        // Get the host profile data - using type assertion to help TypeScript
        const hostProfile = stayData.host as UserProfile;
        const userProfile = hostProfile || { name: 'Host', avatar_url: '' };
        
        const stayImages = Array.isArray(stayData.stay_images) ? stayData.stay_images : [];
        const stayReviews = Array.isArray(stayData.stay_reviews) ? stayData.stay_reviews : [];
        
        // Calculate average rating from reviews
        const averageRating = stayReviews.length > 0
          ? stayReviews.reduce((sum, review: any) => sum + review.rating, 0) / stayReviews.length
          : 4.7;
        
        // Find primary image or use the first one
        const primaryImage = stayImages.find(img => img.is_primary) || stayImages[0];
        
        // Parse amenities - handle cases where it might be a string, array, or null
        let amenitiesArray: string[] = [];
        if (stayData.amenities) {
          if (Array.isArray(stayData.amenities)) {
            amenitiesArray = stayData.amenities;
          } else if (typeof stayData.amenities === 'string') {
            try {
              // Try parsing if it's a JSON string
              const parsed = JSON.parse(stayData.amenities);
              amenitiesArray = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              // If not valid JSON, split by comma if it's a comma-separated string
              amenitiesArray = stayData.amenities.split(',').map(item => item.trim());
            }
          }
        }
        
        // Default amenities if none are provided
        if (amenitiesArray.length === 0) {
          amenitiesArray = ['Wi-Fi', 'Kitchen'];
        }
        
        // Process the images
        const processedImages = stayImages
          .map(img => ({
            url: getFullImageUrl(img.image_path),
            order: img.display_order || 0
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // If no images are found, add a placeholder
        if (processedImages.length === 0) {
          processedImages.push({
            url: '/images/mountain.jpg',
            order: 0
          });
        }
        
        return {
          id: stayData.id,
          title: stayData.title,
          description: stayData.description,
          price_per_night: stayData.price_per_night,
          status: stayData.status,
          images: processedImages,
          image: stayImages.length > 0 
            ? getFullImageUrl(primaryImage?.image_path || '') 
            : processedImages[0].url,
          host: {
            id: stayData.host_id,
            name: userProfile.name || 'Host',
            image: getFullImageUrl(userProfile.avatar_url || ''),
            rating: parseFloat(averageRating.toFixed(1)),
            reviews: stayReviews.length || Math.floor(Math.random() * 50) + 10
          },
          host_id: stayData.host_id,
          details: {
            bedrooms: stayData.bedrooms || 1,
            beds: stayData.beds || 1,
            bathrooms: stayData.bathrooms || 1,
            maxGuests: stayData.max_guests || 2,
            amenities: amenitiesArray,
            location: stayData.location_name || 'Unknown location',
            propertyType: stayData.property_type || 'apartment'
          },
          coordinates: {
            lat: stayData.latitude || 0,
            lng: stayData.longitude || 0
          },
          // Generate availability for now - will be replaced with real data later
          availability: generateAvailability(stayData.price_per_night)
        };
      });
      
      console.log(`Returning ${transformedData.length} stays from database`);
      return transformedData;
    } catch (error) {
      console.error('Error in getStays:', error);
      throw error;
    }
  },
  
  // Get a specific stay by ID
  async getStayById(stayId: string) {
    try {
      const { data, error } = await supabase
        .from('stays')
        .select(`
          *,
          stay_images(*),
          stay_reviews(*),
          stay_amenities(*)
        `)
        .eq('id', stayId)
        .single();

      if (error) throw error;
      
      if (!data) {
        return null;
      }

      // Process the stay amenities rather than accessing direct amenities property
      let amenitiesList: string[] = [];
      if (data.stay_amenities && Array.isArray(data.stay_amenities)) {
        // Extract amenity IDs from stay_amenities
        const amenityIds = data.stay_amenities.map((item: any) => item.amenity_id);
        
        if (amenityIds.length > 0) {
          // Fetch the actual amenity names
          const { data: amenitiesData } = await supabase
            .from('amenities')
            .select('*')
            .in('id', amenityIds);
            
          if (amenitiesData) {
            amenitiesList = amenitiesData.map((a: any) => a.name);
          }
        }
      }

      // Get the host profile data - using type assertion to help TypeScript
      const hostProfile = data.host as UserProfile;
      const userProfile = hostProfile || { name: 'Host', avatar_url: '' };
      
      const stayImages = Array.isArray(data.stay_images) ? data.stay_images : [];
      const stayReviews = Array.isArray(data.stay_reviews) ? data.stay_reviews : [];
      
      // Calculate average rating from reviews
      const averageRating = stayReviews.length > 0
        ? stayReviews.reduce((sum, review: any) => sum + review.rating, 0) / stayReviews.length
        : 4.7;
      
      // Find primary image or use the first one
      const primaryImage = stayImages.find(img => img.is_primary) || stayImages[0];
      
      // Process the image URLs into our desired format
      const processedImages = stayImages
        .map(img => ({
          url: getFullImageUrl(img.image_path),
          order: img.display_order || 0
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
          
      // If no images are found, add a placeholder image
      if (processedImages.length === 0) {
        processedImages.push({
          url: '/images/mountain.jpg',
          order: 0
        });
      }
      
      return {
        ...data,
        images: processedImages,
        details: {
          bedrooms: data.bedrooms || 1,
          beds: data.beds || 1,
          bathrooms: data.bathrooms || 1,
          maxGuests: data.max_guests || 2,
          amenities: amenitiesList, // Use the processed amenities list
          location: data.location_name || 'Unknown location',
          propertyType: data.property_type || 'apartment'
        },
        coordinates: {
          lat: data.latitude || 0,
          lng: data.longitude || 0
        },
        availability: generateAvailability(data.price_per_night)
      };

    } catch (error) {
      console.error('Error getting stay by ID:', error);
      return null;
    }
  },
  
  // Get featured stays for homepage
  async getFeaturedStays(limit = 3): Promise<Stay[]> {
    try {
      console.log(`Fetching ${limit} featured stays`);
      
      // Try to fetch featured stays from Supabase
      const { data, error } = await supabase
        .from('stays')
        .select(`
          id, 
          title, 
          description, 
          price_per_night,
          property_type,
          bedrooms,
          beds,
          bathrooms,
          max_guests,
          location_name,
          host_id,
          host:profiles!host_id(id, name, avatar_url),
          stay_images:stay_images(id, image_path, is_primary, display_order),
          stay_reviews:stay_reviews(rating),
          stay_amenities:stay_amenities(amenity_id, amenities:amenities(id, name))
        `)
        .eq('is_featured', true)
        .eq('status', 'published')
        .limit(limit);
      
      if (error) {
        console.error('Error fetching featured stays:', error);
        throw new Error('Failed to fetch featured stays');
      }
      
      if (!data || data.length === 0) {
        console.log('No featured stays found');
        return [];
      }
      
      // Transform data to match our interface
      return data.map(stayData => {
        // Get the host profile data - using type assertion to help TypeScript
        const hostProfile = stayData.host as UserProfile;
        const userProfile = hostProfile || { name: 'Host', avatar_url: '' };
        
        const stayImages = Array.isArray(stayData.stay_images) ? stayData.stay_images : [];
        const stayReviews = Array.isArray(stayData.stay_reviews) ? stayData.stay_reviews : [];
        
        // Calculate average rating from reviews
        const averageRating = stayReviews.length > 0
          ? stayReviews.reduce((sum, review: any) => sum + review.rating, 0) / stayReviews.length
          : 4.7;
        
        // Find primary image or use the first one
        const primaryImage = stayImages.find(img => img.is_primary) || stayImages[0];
        
        // Parse amenities - handle cases where it might be a string, array, or null
        let amenitiesArray: string[] = [];
        if (stayData.amenities) {
          if (Array.isArray(stayData.amenities)) {
            amenitiesArray = stayData.amenities;
          } else if (typeof stayData.amenities === 'string') {
            try {
              // Try parsing if it's a JSON string
              const parsed = JSON.parse(stayData.amenities);
              amenitiesArray = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              // If not valid JSON, split by comma if it's a comma-separated string
              amenitiesArray = stayData.amenities.split(',').map(item => item.trim());
            }
          }
        }
        
        // Default amenities if none are provided
        if (amenitiesArray.length === 0) {
          amenitiesArray = ['Wi-Fi', 'Kitchen'];
        }
        
        // Process the image URLs into our desired format
        const processedImages = stayImages
          .map(img => ({
            url: getFullImageUrl(img.image_path),
            order: img.display_order || 0
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
          
        // If no images are found, add a placeholder image
        if (processedImages.length === 0) {
          processedImages.push({
            url: '/images/mountain.jpg',
            order: 0
          });
        }
        
        return {
          id: stayData.id,
          title: stayData.title,
          description: stayData.description,
          price_per_night: stayData.price_per_night,
          images: processedImages,
          image: stayImages.length > 0 
            ? getFullImageUrl(primaryImage?.image_path || '') 
            : processedImages[0].url,
          host: {
            name: userProfile.name || 'Host',
            image: getFullImageUrl(userProfile.avatar_url || ''),
            rating: parseFloat(averageRating.toFixed(1)),
            reviews: stayReviews.length || Math.floor(Math.random() * 50) + 10
          },
          host_id: stayData.host_id,
          details: {
            bedrooms: stayData.bedrooms || 1,
            beds: stayData.beds || 1,
            bathrooms: stayData.bathrooms || 1,
            maxGuests: stayData.max_guests || 2,
            amenities: amenitiesArray,
            location: stayData.location_name || 'Unknown location',
            propertyType: stayData.property_type || 'apartment'
          },
          availability: generateAvailability(stayData.price_per_night)
        };
      });
    } catch (error) {
      console.error('Error in getFeaturedStays:', error);
      throw error;
    }
  },
  
  // Toggle favorite status for a stay (would normally save to user's favorites in DB)
  async toggleFavorite(stayId: string, userId: string): Promise<boolean> {
    try {
      console.log(`Toggling favorite for stay ID: ${stayId} and user ID: ${userId}`);
      
      // Check if the stay is already a favorite
      const { data: existingFavorite, error: checkError } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('stay_id', stayId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking favorite status:', checkError);
        return false;
      }
      
      // If it exists, remove it
      if (existingFavorite) {
        const { error: deleteError } = await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existingFavorite.id);
        
        if (deleteError) {
          console.error('Error removing favorite:', deleteError);
          return false;
        }
        
        console.log(`Removed stay ID: ${stayId} from favorites`);
        return true;
      }
      
      // If it doesn't exist, add it
      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          stay_id: stayId,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error adding favorite:', insertError);
        return false;
      }
      
      console.log(`Added stay ID: ${stayId} to favorites`);
      return true;
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      return false;
    }
  },
  
  // Get user's favorite stays
  async getFavorites(userId: string): Promise<string[]> {
    try {
      console.log(`Fetching favorites for user ID: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('stay_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching favorites:', error);
        return [];
      }
      
      return data.map(fav => fav.stay_id);
    } catch (error) {
      console.error('Error in getFavorites:', error);
      return [];
    }
  }
};

export default stayService;
