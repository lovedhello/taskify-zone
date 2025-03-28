import { supabase } from '@/integrations/supabase/client';

// Helper function to get full image URL
const getFullImageUrl = (path: string, type: 'stay' | 'food') => {
  if (!path) return type === 'stay' ? '/images/placeholder-stay.jpg' : '/images/placeholder-food.jpg';
  if (path.startsWith('http')) return path;
  
  // Handle Supabase storage URLs 
  // Checking different pattern possibilities based on Food.tsx
  if (type === 'food') {
    // If the path is already in the format we need
    if (path.startsWith('food-experience-images/')) {
      return `${import.meta.env.VITE_SUPABASE_URL || 'https://bbrgntyiwuniovyoryta.supabase.co'}/storage/v1/object/public/${path}`;
    }
    
    // If it's a relative path without the prefix, add it
    if (!path.includes('/') && !path.startsWith('food-experience-images/')) {
      const fullPath = `food-experience-images/${path}`;
      return `${import.meta.env.VITE_SUPABASE_URL || 'https://bbrgntyiwuniovyoryta.supabase.co'}/storage/v1/object/public/${fullPath}`;
    }
  }
  
  if (type === 'stay') {
    if (path.startsWith('stay-images/')) {
      return `https://bbrgntyiwuniovyoryta.supabase.co/storage/v1/object/public/${path}`;
    }
    
    // If it's a relative path without the prefix, add it
    if (!path.includes('/') && !path.startsWith('stay-images/')) {
      const fullPath = `stay-images/${path}`;
      return `https://bbrgntyiwuniovyoryta.supabase.co/storage/v1/object/public/${fullPath}`;
    }
  }
  
  return `${import.meta.env.VITE_BACKEND_URL || ''}${path}`;
};

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

// Cache structure to store API results
interface ApiCache {
  featuredFood: {
    data: FeaturedItem[];
    timestamp: number;
    expires: number;
  } | null;
  featuredStays: {
    data: FeaturedItem[];
    timestamp: number;
    expires: number;
  } | null;
  foodCategories: {
    data: CategoryCount[];
    timestamp: number;
    expires: number;
  } | null;
}

// Initialize cache
const apiCache: ApiCache = {
  featuredFood: null,
  featuredStays: null,
  foodCategories: null
};

// Cache expiration time in milliseconds (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

// Helper to check if cache is valid
const isCacheValid = (cacheItem: { timestamp: number, expires: number } | null): boolean => {
  if (!cacheItem) return false;
  return Date.now() - cacheItem.timestamp < cacheItem.expires;
};

// API service with caching
export const apiService = {
  // Get featured food experiences
  async getFeaturedFood(): Promise<FeaturedItem[]> {
    // Check cache first
    if (isCacheValid(apiCache.featuredFood)) {
      console.log('Using cached featured food data');
      return apiCache.featuredFood!.data;
    }
    
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('food_experiences')
        .select(`
          id, 
          title, 
          description, 
          price_per_person,
          host_id,
          rating
        `)
        .eq('is_featured', true)
        .eq('status', 'published')
        .limit(3);

      if (error) throw error;
      
      if (!data?.length) {
        return [];
      }

      // Get images separately - match the pattern in Food.tsx
      const foodExperienceIds = data.map(item => item.id);
      const { data: allImageData, error: imageError } = await supabase
        .from('food_experience_images')
        .select('experience_id, image_path, is_primary')
        .in('experience_id', foodExperienceIds);

      if (imageError) {
        console.error('Error fetching food experience images:', imageError);
      }

      // Group images by experience_id, prioritizing primary images
      const imagesByExperienceId = new Map<string, string>();
      
      if (allImageData?.length) {
        console.log('Food experience image data:', allImageData);
        
        // First, try to find primary images
        allImageData
          .filter(img => img.is_primary)
          .forEach(img => {
            imagesByExperienceId.set(img.experience_id, img.image_path);
          });
          
        // For any experiences without a primary image, use the first available
        foodExperienceIds.forEach(id => {
          if (!imagesByExperienceId.has(id)) {
            const firstImage = allImageData.find(img => img.experience_id === id);
            if (firstImage) {
              imagesByExperienceId.set(id, firstImage.image_path);
            }
          }
        });
        
        console.log('Image map:', Object.fromEntries(imagesByExperienceId));
      } else {
        console.log('No food experience images found');
      }

      // Get host names separately
      const hostIds = [...new Set(data.map(item => item.host_id))];
      const { data: hostData, error: hostError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', hostIds);
        
      const hostMap = new Map();
      if (!hostError && hostData?.length) {
        hostData.forEach(host => {
          hostMap.set(host.id, host.name);
        });
      }

      // Transform data to match our interface
      const results = data.map(item => {
        const imagePath = imagesByExperienceId.get(item.id);
        const fullImageUrl = getFullImageUrl(imagePath, 'food');
        console.log(`Experience ID: ${item.id}, Image path: ${imagePath}, Full URL: ${fullImageUrl}`);
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          price_per_person: item.price_per_person,
          image: fullImageUrl,
          host: {
            name: hostMap.get(item.host_id) || 'Host',
            rating: item.rating || 4.8, 
            reviews: 12  // Default or fetch from reviews table
          }
        };
      });
      
      // Update cache
      apiCache.featuredFood = {
        data: results,
        timestamp: Date.now(),
        expires: CACHE_EXPIRATION
      };
      
      return results;
    } catch (error) {
      console.error('Error fetching featured food:', error);
      return [];
    }
  },

  // Get featured stays
  async getFeaturedStays(): Promise<FeaturedItem[]> {
    // Check cache first
    if (isCacheValid(apiCache.featuredStays)) {
      console.log('Using cached featured stays data');
      return apiCache.featuredStays!.data;
    }
    
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('stays')
        .select(`
          id, 
          title, 
          description, 
          price_per_night,
          host_id
        `)
        .eq('is_featured', true)
        .eq('status', 'published')
        .limit(3);

      if (error) throw error;
      
      if (!data?.length) {
        return [];
      }

      // Get images separately
      const imagePromises = data.map(async (item) => {
        const { data: imageData, error: imageError } = await supabase
          .from('stay_images')
          .select('image_path')
          .eq('stay_id', item.id)
          .eq('is_primary', true)
          .limit(1);
          
        return {
          id: item.id,
          imagePath: imageError || !imageData?.length ? null : imageData[0].image_path
        };
      });
      
      const imagesById = new Map(
        (await Promise.all(imagePromises))
          .map(item => [item.id, item.imagePath])
      );

      // Get host names separately
      const hostIds = [...new Set(data.map(item => item.host_id))];
      const { data: hostData, error: hostError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', hostIds);
        
      const hostMap = new Map();
      if (!hostError && hostData?.length) {
        hostData.forEach(host => {
          hostMap.set(host.id, host.name);
        });
      }

      // Transform data to match our interface
      const results = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price_per_night: item.price_per_night,
        image: getFullImageUrl(imagesById.get(item.id), 'stay'),
        host: {
          name: hostMap.get(item.host_id) || 'Host',
          rating: 4.7, // Default rating
          reviews: 15  // Default reviews count
        }
      }));
      
      // Update cache
      apiCache.featuredStays = {
        data: results,
        timestamp: Date.now(),
        expires: CACHE_EXPIRATION
      };
      
      return results;
    } catch (error) {
      console.error('Error fetching featured stays:', error);
      return [];
    }
  },

  // Get food categories with counts
  async getFoodCategories(): Promise<CategoryCount[]> {
    // Check cache first
    if (isCacheValid(apiCache.foodCategories)) {
      console.log('Using cached food categories data');
      return apiCache.foodCategories!.data;
    }
    
    try {
      // Try to fetch from Supabase using count query approach instead of group
      const { data: cuisineTypes, error: cuisineError } = await supabase
        .from('food_experiences')
        .select('cuisine_type')
        .eq('status', 'published')
        .not('cuisine_type', 'is', null);

      if (cuisineError) throw cuisineError;
      
      if (!cuisineTypes?.length) {
        return [];
      }

      // Get unique cuisine types
      const uniqueCuisineTypes = Array.from(new Set(cuisineTypes.map(item => item.cuisine_type)));
      
      // Count each cuisine type
      const categoryCounts: CategoryCount[] = [];
      
      for (const cuisineType of uniqueCuisineTypes) {
        const { count, error: countError } = await supabase
          .from('food_experiences')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
          .eq('cuisine_type', cuisineType);
          
        if (countError) throw countError;
        
        categoryCounts.push({
          cuisine_type: cuisineType,
          count: count || 0
        });
      }
      
      // Update cache
      apiCache.foodCategories = {
        data: categoryCounts,
        timestamp: Date.now(),
        expires: CACHE_EXPIRATION
      };

      return categoryCounts;
    } catch (error) {
      console.error('Error fetching food categories:', error);
      return [];
    }
  },
  
  // Method to invalidate cache if needed (e.g., after user adds new content)
  invalidateCache(type?: 'food' | 'stays' | 'categories') {
    if (!type) {
      // Invalidate all cache
      apiCache.featuredFood = null;
      apiCache.featuredStays = null;
      apiCache.foodCategories = null;
      console.log('All API cache invalidated');
      return;
    }
    
    // Invalidate specific cache
    switch (type) {
      case 'food':
        apiCache.featuredFood = null;
        console.log('Featured food cache invalidated');
        break;
      case 'stays':
        apiCache.featuredStays = null;
        console.log('Featured stays cache invalidated');
        break;
      case 'categories':
        apiCache.foodCategories = null;
        console.log('Food categories cache invalidated');
        break;
    }
  }
};