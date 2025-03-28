import { supabase } from '@/integrations/supabase/client';

interface FeaturedItem {
  id: number;
  title: string;
  description: string;
  image: string;
  price_per_person?: number;
  price_per_night?: number;
  host: {
    name: string;
    rating: number;
    reviews: number;
  };
}

interface CategoryCount {
  cuisine_type: string;
  count: number;
}

// Mock data for development when database tables don't exist yet
const mockFeaturedFood: FeaturedItem[] = [
  {
    id: 1,
    title: "Authentic Italian Pasta Making",
    description: "Learn to make pasta from scratch with a professional chef in a cozy home kitchen.",
    image: "/images/food/pasta-making.jpg",
    price_per_person: 65,
    host: {
      name: "Marco",
      rating: 4.9,
      reviews: 127
    }
  },
  {
    id: 2,
    title: "Thai Street Food Experience",
    description: "Discover the vibrant flavors of Thai street food with our expert culinary guide.",
    image: "/images/food/thai-food.jpg",
    price_per_person: 45,
    host: {
      name: "Supaporn",
      rating: 4.8,
      reviews: 93
    }
  },
  {
    id: 3,
    title: "Spanish Tapas Workshop",
    description: "Create traditional Spanish tapas and enjoy them with local wines in a friendly atmosphere.",
    image: "/images/food/spanish-tapas.jpg",
    price_per_person: 55,
    host: {
      name: "Miguel",
      rating: 4.7,
      reviews: 68
    }
  }
];

const mockFeaturedStays: FeaturedItem[] = [
  {
    id: 1,
    title: "Luxury Beachfront Villa",
    description: "Spacious villa with private beach access, pool, and stunning ocean views.",
    image: "/images/stays/beach-villa.jpg",
    price_per_night: 249,
    host: {
      name: "Sarah",
      rating: 4.9,
      reviews: 84
    }
  },
  {
    id: 2,
    title: "Mountain Retreat Cabin",
    description: "Cozy cabin surrounded by pine forest with hiking trails and mountain views.",
    image: "/images/stays/mountain-cabin.jpg",
    price_per_night: 179,
    host: {
      name: "Michael",
      rating: 4.8,
      reviews: 62
    }
  },
  {
    id: 3,
    title: "Modern Downtown Loft",
    description: "Stylish loft in the heart of the city, walking distance to restaurants and attractions.",
    image: "/images/stays/city-loft.jpg",
    price_per_night: 155,
    host: {
      name: "Jennifer",
      rating: 4.7,
      reviews: 93
    }
  }
];

const mockCategoryCounts: CategoryCount[] = [
  { cuisine_type: "Italian", count: 12 },
  { cuisine_type: "Asian", count: 8 },
  { cuisine_type: "African", count: 5 }
];

// API service with fallback to mock data
export const apiService = {
  // Get featured food experiences
  async getFeaturedFood(): Promise<FeaturedItem[]> {
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('food_experiences')
        .select(`
          id, 
          title, 
          description, 
          price_per_person,
          food_experience_images(url),
          host_id,
          user_profiles(name)
        `)
        .eq('is_featured', true)
        .eq('status', 'published')
        .limit(3);

      if (error || !data?.length) {
        console.log('Using mock food data:', error?.message);
        return mockFeaturedFood;
      }

      // Transform data to match our interface
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price_per_person: item.price_per_person,
        image: item.food_experience_images?.[0]?.url || '/images/placeholder-food.jpg',
        host: {
          name: item.user_profiles?.name || 'Host',
          rating: 4.8, // Default or fetch from reviews table
          reviews: 12  // Default or fetch from reviews table
        }
      }));
    } catch (error) {
      console.error('Error fetching featured food:', error);
      return mockFeaturedFood;
    }
  },

  // Get featured stays
  async getFeaturedStays(): Promise<FeaturedItem[]> {
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('stays')
        .select(`
          id, 
          title, 
          description, 
          price_per_night,
          stay_images(url),
          host_id,
          user_profiles(name)
        `)
        .eq('is_featured', true)
        .eq('status', 'published')
        .limit(3);

      if (error || !data?.length) {
        console.log('Using mock stays data:', error?.message);
        return mockFeaturedStays;
      }

      // Transform data to match our interface
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price_per_night: item.price_per_night,
        image: item.stay_images?.[0]?.url || '/images/placeholder-stay.jpg',
        host: {
          name: item.user_profiles?.name || 'Host',
          rating: 4.7,
          reviews: 15
        }
      }));
    } catch (error) {
      console.error('Error fetching featured stays:', error);
      return mockFeaturedStays;
    }
  },

  // Get food categories with counts
  async getFoodCategories(): Promise<CategoryCount[]> {
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('food_experiences')
        .select('cuisine_type, count(*)')
        .eq('status', 'published')
        .group('cuisine_type');

      if (error || !data?.length) {
        console.log('Using mock category data:', error?.message);
        return mockCategoryCounts;
      }

      return data.map(item => ({
        cuisine_type: item.cuisine_type,
        count: item.count
      }));
    } catch (error) {
      console.error('Error fetching food categories:', error);
      return mockCategoryCounts;
    }
  }
};