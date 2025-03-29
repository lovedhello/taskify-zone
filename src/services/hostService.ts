import { supabase } from '@/integrations/supabase/client';
import type { FoodExperience } from '@/types/food';
import type { Stay } from '@/types/stay';

/**
 * Get all food experiences for the current host
 */
export async function getHostFoodExperiences(): Promise<FoodExperience[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return [];

    const hostId = session.session.user.id;

    const { data, error } = await supabase
      .from('food_experiences')
      .select(`
        *,
        images:food_experience_images(id, image_path, is_primary, display_order)
      `)
      .eq('host_id', hostId);

    if (error) {
      console.error('Error fetching food experiences:', error);
      return [];
    }

    // Process the data into the right format
    return data.map((experience) => {
      // Format images
      const images = experience.images?.map((img: any) => ({
        url: img.image_path,
        order: img.display_order || 0,
        is_primary: img.is_primary || false,
      })) || [];

      // Sort images by display_order with primary images first
      images.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.order - b.order;
      });

      return {
        id: experience.id,
        title: experience.title,
        description: experience.description,
        images: images,
        price_per_person: experience.price_per_person,
        cuisine_type: experience.cuisine_type,
        menu_description: experience.menu_description || '',
        location_name: experience.location_name,
        host: {
          name: 'Host',
          image: '/default-avatar.png',
          rating: 4.5, // Default value, would ideally be calculated from reviews
          reviews: 0 // Default value, would ideally be count of reviews
        },
        details: {
          duration: experience.duration || '2 hours',
          groupSize: `Max ${experience.max_guests} guests`,
          includes: ['Food', 'Beverages'],
          language: experience.language || 'English',
          location: `${experience.city}, ${experience.state}`,
        },
        coordinates: experience.latitude && experience.longitude
          ? { lat: experience.latitude, lng: experience.longitude }
          : undefined
      };
    });
  } catch (error) {
    console.error('Error in getFoodExperiences:', error);
    return [];
  }
}

/**
 * Get all stays for the current host
 */
export async function getHostStays(): Promise<Stay[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return [];

    const hostId = session.session.user.id;

    const { data, error } = await supabase
      .from('stays')
      .select(`
        *,
        images:stay_images(id, image_path, is_primary, display_order)
      `)
      .eq('host_id', hostId);

    if (error) {
      console.error('Error fetching stays:', error);
      return [];
    }

    // Process the data into the right format
    return data.map((stay) => {
      // Format images
      const images = stay.images?.map((img: any) => ({
        url: img.image_path,
        order: img.display_order || 0,
        is_primary: img.is_primary || false,
      })) || [];

      // Sort images by display_order with primary images first
      images.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.order - b.order;
      });

      return {
        id: stay.id,
        title: stay.title,
        description: stay.description,
        images: images,
        price_per_night: stay.price_per_night,
        property_type: stay.property_type,
        location_name: stay.location_name,
        max_guests: stay.max_guests,
        bedrooms: stay.bedrooms,
        beds: stay.beds,
        bathrooms: stay.bathrooms,
        host: {
          name: 'Host',
          image: '/default-avatar.png',
          rating: 4.5, // Default value, would ideally be calculated from reviews
          reviews: 0 // Default value, would ideally be count of reviews
        },
        coordinates: stay.latitude && stay.longitude
          ? { lat: stay.latitude, lng: stay.longitude }
          : undefined,
        amenities: []
      };
    });
  } catch (error) {
    console.error('Error in getStays:', error);
    return [];
  }
}

/**
 * Get host info
 */
export async function getHostInfo(): Promise<{ host_id: string }[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return [];

    const hostId = session.session.user.id;
    // Convert the single object to an array
    return [{ host_id: hostId }];
  } catch (error) {
    console.error('Error getting host info:', error);
    return [];
  }
}

/**
 * Change food experience status
 */
export async function changeFoodExperienceStatus(id: string, status: 'draft' | 'published' | 'archived') {
  try {
    const { data, error } = await supabase
      .from('food_experiences')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating food experience status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in changeFoodExperienceStatus:', error);
    throw error;
  }
}

/**
 * Change stay status
 */
export async function changeStayStatus(id: string, status: 'draft' | 'published' | 'archived') {
  try {
    const { data, error } = await supabase
      .from('stays')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating stay status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in changeStayStatus:', error);
    throw error;
  }
}

/**
 * Delete food experience
 */
export async function deleteFoodExperience(id: string) {
  try {
    const { data, error } = await supabase
      .from('food_experiences')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting food experience:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteFoodExperience:', error);
    throw error;
  }
}

/**
 * Delete stay
 */
export async function deleteStay(id: string) {
  try {
    const { data, error } = await supabase
      .from('stays')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting stay:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteStay:', error);
    throw error;
  }
}

/**
 * Create a new food experience
 */
export async function createFoodExperience(foodExperience: any) {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const hostId = session.session.user.id;

    // Insert the food experience
    const { data, error } = await supabase
      .from('food_experiences')
      .insert([
        {
          ...foodExperience,
          host_id: hostId,
        },
      ])
      .select()

    if (error) {
      console.error('Error creating food experience:', error);
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in createFoodExperience:', error);
    throw error;
  }
}

/**
 * Create a new stay
 */
export async function createStay(stay: any) {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const hostId = session.session.user.id;

    // Insert the stay
    const { data, error } = await supabase
      .from('stays')
      .insert([
        {
          ...stay,
          host_id: hostId,
        },
      ])
      .select()

    if (error) {
      console.error('Error creating stay:', error);
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in createStay:', error);
    throw error;
  }
}

/**
 * Update an existing food experience
 */
export async function updateFoodExperience(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('food_experiences')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating food experience:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateFoodExperience:', error);
    throw error;
  }
}

/**
 * Update an existing stay
 */
export async function updateStay(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('stays')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating stay:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateStay:', error);
    throw error;
  }
}

/**
 * Upload a food experience image
 */
export async function uploadFoodExperienceImage(
  experienceId: string,
  file: File,
  isPrimary: boolean,
  order: number
) {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const hostId = session.session.user.id;
    const timestamp = Date.now();
    const filePath = `food-experience-images/${hostId}/${experienceId}/${timestamp}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('food-experience-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('food-experience-images')
      .getPublicUrl(filePath);

    // Save image details to the database
    const { data: imageData, error: imageError } = await supabase
      .from('food_experience_images')
      .insert([
        {
          experience_id: experienceId,
          image_path: filePath,
          is_primary: isPrimary,
          display_order: order,
        },
      ])
      .select();

    if (imageError) {
      console.error('Error saving image details:', imageError);
      throw imageError;
    }

    return { ...imageData, publicURL: urlData.publicUrl };
  } catch (error) {
    console.error('Error in uploadFoodExperienceImage:', error);
    throw error;
  }
}

/**
 * Upload a stay image
 */
export async function uploadStayImage(
  stayId: string,
  file: File,
  isPrimary: boolean,
  order: number
) {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const hostId = session.session.user.id;
    const timestamp = Date.now();
    const filePath = `stay-images/${hostId}/${stayId}/${timestamp}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('stay-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stay-images')
      .getPublicUrl(filePath);

    // Save image details to the database
    const { data: imageData, error: imageError } = await supabase
      .from('stay_images')
      .insert([
        {
          stay_id: stayId,
          image_path: filePath,
          is_primary: isPrimary,
          display_order: order,
        },
      ])
      .select();

    if (imageError) {
      console.error('Error saving image details:', imageError);
      throw imageError;
    }

    return { ...imageData, publicURL: urlData.publicUrl };
  } catch (error) {
    console.error('Error in uploadStayImage:', error);
    throw error;
  }
}

/**
 * Delete a food experience image
 */
export async function deleteFoodExperienceImage(imageId: string) {
  try {
    const { data, error } = await supabase
      .from('food_experience_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting food experience image:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteFoodExperienceImage:', error);
    throw error;
  }
}

/**
 * Delete a stay image
 */
export async function deleteStayImage(imageId: string) {
  try {
    const { data, error } = await supabase
      .from('stay_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting stay image:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteStayImage:', error);
    throw error;
  }
}

/**
 * Set a food experience image as primary
 */
export async function setFoodExperiencePrimaryImage(imageId: string, experienceId: string) {
  try {
    // First, set all images for the experience to not primary
    const { error: resetError } = await supabase
      .from('food_experience_images')
      .update({ is_primary: false })
      .eq('experience_id', experienceId);

    if (resetError) {
      console.error('Error resetting primary images:', resetError);
      throw resetError;
    }

    // Then, set the selected image as primary
    const { data, error } = await supabase
      .from('food_experience_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in setFoodExperiencePrimaryImage:', error);
    throw error;
  }
}

/**
 * Set a stay image as primary
 */
export async function setStayPrimaryImage(imageId: string, stayId: string) {
  try {
    // First, set all images for the stay to not primary
    const { error: resetError } = await supabase
      .from('stay_images')
      .update({ is_primary: false })
      .eq('stay_id', stayId);

    if (resetError) {
      console.error('Error resetting primary images:', resetError);
      throw resetError;
    }

    // Then, set the selected image as primary
    const { data, error } = await supabase
      .from('stay_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in setStayPrimaryImage:', error);
    throw error;
  }
}

/**
 * Get a stay by ID
 */
export async function getStayById(id: string): Promise<Stay | null> {
  try {
    const { data, error } = await supabase
      .from('stays')
      .select(`
        *,
        images:stay_images(id, image_path, is_primary, display_order)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching stay:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Process the images
    const images = data.images.map((img: any) => ({
      url: img.image_path,
      order: img.display_order || 0,
      is_primary: img.is_primary || false,
    }));

    // Sort images by display_order
    images.sort((a, b) => a.order - b.order);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      images: images,
      price_per_night: data.price_per_night,
      property_type: data.property_type,
      location_name: data.location_name,
      max_guests: data.max_guests,
      bedrooms: data.bedrooms,
      beds: data.beds,
      bathrooms: data.bathrooms,
      host: {
        name: 'Host',
        image: '/default-avatar.png',
        rating: 4.5, // Default value, would ideally be calculated from reviews
        reviews: 0 // Default value, would ideally be count of reviews
      },
      coordinates: data.latitude && data.longitude
        ? { lat: data.latitude, lng: data.longitude }
        : undefined,
      amenities: []
    };
  } catch (error) {
    console.error('Error in getStayById:', error);
    return null;
  }
}

/**
 * Get stay details by ID
 */
export async function getStayDetailsById(id: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('stays')
      .select(`
        *,
        stay_images(id, image_path, is_primary, display_order),
        stay_amenities(amenity:amenities(id, name, category)),
        stay_reviews(id, rating, comment, created_at)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching stay details:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Process the images
    const images = data.stay_images.map((img: any) => ({
      url: img.image_path,
      order: img.display_order || 0,
      is_primary: img.is_primary || false,
    }));

    // Sort images by display_order
    images.sort((a, b) => a.order - b.order);

    // Map stay_amenities to get the actual amenity data
    const amenities = data.stay_amenities.map(item => 
      item.amenity?.name || ''
    ).filter(Boolean);

    const stayDetails = {
      ...data,
      location_name: data.location_name || `${data.city}, ${data.state}`
    };
    
    return stayDetails;
  } catch (error) {
    console.error('Error in getStayDetailsById:', error);
    return null;
  }
}
