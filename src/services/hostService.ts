import { supabase } from '@/integrations/supabase/client';
import type { FoodExperience } from '@/types/food';

/**
 * Get all food experiences for the current host
 */
export async function getHostFoodExperiences() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from('food_experiences')
    .select(`
      *,
      images:food_experience_images(id, image_path, is_primary, display_order)
    `)
    .eq('host_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching host food experiences:', error);
    throw error;
  }

  return data.map((experience) => {
    const images = experience.images.map((img: any) => ({
      id: img.id,
      url: img.image_path,
      order: img.display_order || 0,
      is_primary: img.is_primary || false,
    }));

    // Sort images by display_order
    images.sort((a, b) => a.order - b.order);

    return {
      id: experience.id,
      title: experience.title,
      description: experience.description,
      status: experience.status,
      images: images,
      price_per_person: experience.price_per_person,
      cuisine_type: experience.cuisine_type,
      menu_description: experience.menu_description || '',
      location_name: experience.location_name,
      created_at: experience.created_at,
      updated_at: experience.updated_at,
      details: {
        duration: experience.duration || '2 hours',
        groupSize: `Max ${experience.max_guests} guests`,
        includes: ['Food', 'Beverages'],
        language: experience.language || 'English',
        location: `${experience.city}, ${experience.state}`,
      }
    };
  });
}

/**
 * Create a new food experience
 */
export async function createFoodExperience(experienceData: Partial<FoodExperience>) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // First, check if user is a host
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_host')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw profileError;
  }

  // If not a host, update profile to make them a host
  if (!profile.is_host) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_host: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating host status:', updateError);
      throw updateError;
    }
  }

  // Create the food experience
  const { data, error } = await supabase
    .from('food_experiences')
    .insert({
      host_id: userId,
      title: experienceData.title || 'Untitled Experience',
      description: experienceData.description || '',
      price_per_person: experienceData.price_per_person || 0,
      cuisine_type: experienceData.cuisine_type || 'Other',
      menu_description: experienceData.menu_description || '',
      location_name: experienceData.location_name || '',
      address: experienceData.details?.location || '',
      city: experienceData.details?.location?.split(',')[0] || '',
      state: experienceData.details?.location?.split(',')[1]?.trim() || '',
      zipcode: experienceData.zipcode || '',
      latitude: experienceData.coordinates?.lat || 0,
      longitude: experienceData.coordinates?.lng || 0,
      duration: experienceData.details?.duration || '2 hours',
      max_guests: parseInt(experienceData.details?.groupSize?.replace(/\D/g, '') || '8'),
      language: experienceData.details?.language || 'English',
      status: 'draft'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating food experience:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing food experience
 */
export async function updateFoodExperience(id: string, experienceData: Partial<FoodExperience>) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // Check ownership of the experience
  const { data: existingExp, error: checkError } = await supabase
    .from('food_experiences')
    .select('host_id')
    .eq('id', id)
    .single();

  if (checkError) {
    console.error('Error checking experience ownership:', checkError);
    throw checkError;
  }

  if (existingExp.host_id !== userId) {
    throw new Error('You do not have permission to update this experience');
  }

  // Update the food experience
  const { data, error } = await supabase
    .from('food_experiences')
    .update({
      title: experienceData.title,
      description: experienceData.description,
      price_per_person: experienceData.price_per_person,
      cuisine_type: experienceData.cuisine_type,
      menu_description: experienceData.menu_description,
      location_name: experienceData.location_name,
      address: experienceData.details?.location || '',
      city: experienceData.details?.location?.split(',')[0] || '',
      state: experienceData.details?.location?.split(',')[1]?.trim() || '',
      zipcode: experienceData.zipcode || '',
      latitude: experienceData.coordinates?.lat || 0,
      longitude: experienceData.coordinates?.lng || 0,
      duration: experienceData.details?.duration,
      max_guests: parseInt(experienceData.details?.groupSize?.replace(/\D/g, '') || '8'),
      language: experienceData.details?.language,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating food experience:', error);
    throw error;
  }

  return data;
}

/**
 * Change food experience status (draft, published, archived)
 */
export async function changeFoodExperienceStatus(id: string, status: 'draft' | 'published' | 'archived') {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // Check ownership of the experience
  const { data: existingExp, error: checkError } = await supabase
    .from('food_experiences')
    .select('host_id')
    .eq('id', id)
    .single();

  if (checkError) {
    console.error('Error checking experience ownership:', checkError);
    throw checkError;
  }

  if (existingExp.host_id !== userId) {
    throw new Error('You do not have permission to update this experience');
  }

  // Update the status
  const { data, error } = await supabase
    .from('food_experiences')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating food experience status:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a food experience
 */
export async function deleteFoodExperience(id: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // Check ownership of the experience
  const { data: existingExp, error: checkError } = await supabase
    .from('food_experiences')
    .select('host_id')
    .eq('id', id)
    .single();

  if (checkError) {
    console.error('Error checking experience ownership:', checkError);
    throw checkError;
  }

  if (existingExp.host_id !== userId) {
    throw new Error('You do not have permission to delete this experience');
  }

  // Delete the experience
  const { error } = await supabase
    .from('food_experiences')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting food experience:', error);
    throw error;
  }

  return true;
}

/**
 * Upload an image for a food experience
 */
export async function uploadFoodExperienceImage(
  experienceId: string, 
  file: File, 
  isPrimary: boolean = false,
  displayOrder: number = 0
) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  // Verify if experienceId is a valid UUID
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(experienceId);
  
  if (!isValidUUID) {
    // If not a valid UUID, it's likely a sample or test image, so just return success
    console.log('Non-UUID experience ID provided. This might be temporary data.');
    
    // Return a placeholder for preview purposes only
    return {
      id: `preview-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: URL.createObjectURL(file),
      is_primary: isPrimary,
      order: displayOrder
    };
  }

  const userId = session.session.user.id;
  
  try {
    // Check ownership of the experience
    const { data: existingExp, error: checkError } = await supabase
      .from('food_experiences')
      .select('host_id')
      .eq('id', experienceId)
      .single();

    if (checkError) {
      console.error('Error checking ownership:', checkError);
      throw checkError;
    }

    if (existingExp.host_id !== userId) {
      throw new Error('You do not have permission to upload images for this experience');
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    const fileName = `exp_${experienceId.substring(0, 8)}_${timestamp}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `food-experience-images/${fileName}`;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('food-experience-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type // Explicitly set the content type to preserve image quality
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    // If this is set as the primary image, reset all other images to not primary
    if (isPrimary) {
      await supabase
        .from('food_experience_images')
        .update({ is_primary: false })
        .eq('experience_id', experienceId);
    }

    // Create a record in the food_experience_images table
    const { data, error } = await supabase
      .from('food_experience_images')
      .insert({
        experience_id: experienceId,
        image_path: filePath,
        is_primary: isPrimary,
        display_order: displayOrder
      })
      .select()
      .single();

    if (error) {
      // If we failed to insert the record but uploaded the file, try to clean up
      await supabase.storage
        .from('food-experience-images')
        .remove([fileName]);
      
      console.error('Error creating image record:', error);
      throw error;
    }

    return {
      id: data.id,
      url: filePath,
      is_primary: isPrimary,
      order: displayOrder
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('row-level security policy')) {
      // Add RLS policy error handling
      console.error('Security policy error. Trying fallback approach...');
      
      // Create a more specific error message to help debug
      throw new Error(`Permission denied: You don't have the proper permissions to upload images. Please contact support with error code: HOST-IMG-${Date.now()}`);
    }
    
    throw error;
  }
}

/**
 * Delete an image for a food experience
 */
export async function deleteFoodExperienceImage(imageId: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  // Check if the imageId is a valid UUID
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(imageId);
  
  // If not a valid UUID, it's likely a sample or test image, so just return success
  if (!isValidUUID) {
    console.log('Skipping deletion of non-UUID image ID:', imageId);
    return true;
  }

  const userId = session.session.user.id;

  // Get the image with the experience ID
  const { data: image, error: imageError } = await supabase
    .from('food_experience_images')
    .select('image_path, experience_id')
    .eq('id', imageId)
    .single();

  if (imageError) {
    console.error('Error fetching image:', imageError);
    throw imageError;
  }

  // Check ownership of the experience
  const { data: existingExp, error: checkError } = await supabase
    .from('food_experiences')
    .select('host_id')
    .eq('id', image.experience_id)
    .single();

  if (checkError) {
    console.error('Error checking experience ownership:', checkError);
    throw checkError;
  }

  if (existingExp.host_id !== userId) {
    throw new Error('You do not have permission to delete images for this experience');
  }

  // Delete the image from storage
  const filePath = image.image_path.replace('food-experience-images/', '');
  const { error: storageError } = await supabase.storage
    .from('food-experience-images')
    .remove([filePath]);

  if (storageError) {
    console.error('Error deleting image from storage:', storageError);
    // Continue with database deletion even if storage deletion fails
  }

  // Delete the image record
  const { error } = await supabase
    .from('food_experience_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('Error deleting image record:', error);
    throw error;
  }

  return true;
}

/**
 * Update the display order of images
 */
export async function updateImageOrder(experienceId: string, imageOrders: { id: string, order: number }[]) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // Check ownership of the experience
  const { data: existingExp, error: checkError } = await supabase
    .from('food_experiences')
    .select('host_id')
    .eq('id', experienceId)
    .single();

  if (checkError) {
    console.error('Error checking experience ownership:', checkError);
    throw checkError;
  }

  if (existingExp.host_id !== userId) {
    throw new Error('You do not have permission to update images for this experience');
  }

  // Update each image's order
  const promises = imageOrders.map(({ id, order }) => {
    return supabase
      .from('food_experience_images')
      .update({ display_order: order })
      .eq('id', id);
  });

  try {
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error updating image orders:', error);
    throw error;
  }
}

/**
 * Get host profile information
 */
export async function getHostProfile() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching host profile:', error);
    throw error;
  }

  return data;
}

/**
 * Update host profile
 */
export async function updateHostProfile(profileData: {
  name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
}) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating host profile:', error);
    throw error;
  }

  return data;
}

/**
 * Set an image as the primary image for a food experience
 */
export async function setFoodExperiencePrimaryImage(experienceId: string, imageId: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // Check ownership of the experience
  const { data: existingExp, error: checkError } = await supabase
    .from('food_experiences')
    .select('host_id')
    .eq('id', experienceId)
    .single();

  if (checkError) {
    console.error('Error checking experience ownership:', checkError);
    throw checkError;
  }

  if (existingExp.host_id !== userId) {
    throw new Error('You do not have permission to update images for this experience');
  }

  // First, set all images for this experience to not primary
  const { error: resetError } = await supabase
    .from('food_experience_images')
    .update({ is_primary: false })
    .eq('experience_id', experienceId);

  if (resetError) {
    console.error('Error resetting primary status of images:', resetError);
    throw resetError;
  }

  // Then set the selected image as primary
  const { error } = await supabase
    .from('food_experience_images')
    .update({ is_primary: true })
    .eq('id', imageId);

  if (error) {
    console.error('Error setting primary image:', error);
    throw error;
  }

  return true;
} 