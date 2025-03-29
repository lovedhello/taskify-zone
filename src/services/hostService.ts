import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

const TABLE_NAME = "food_experiences";
const STAY_TABLE_NAME = "stays";

// Utility function to handle errors
const handleSupabaseError = (error: any, message: string) => {
  if (error) {
    console.error(message, error);
    throw new Error(`${message}: ${error.message}`);
  }
};

// Food Experience Services
export async function getFoodExperienceById(id: string) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    handleSupabaseError(error, "Error fetching food experience by ID");
    return data;
  } catch (error: any) {
    console.error("Error getting food experience by ID:", error);
    return null;
  }
}

export async function getFoodExperiences() {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    handleSupabaseError(error, "Error fetching food experiences");
    return data;
  } catch (error: any) {
    console.error("Error getting food experiences:", error);
    return [];
  }
}

export async function createFoodExperience(
  foodExperience: TablesInsert<"food_experiences">
) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(foodExperience)
      .select()
      .single();

    handleSupabaseError(error, "Error creating food experience");
    return data;
  } catch (error: any) {
    console.error("Error creating food experience:", error);
    throw error;
  }
}

export async function updateFoodExperience(
  id: string,
  updates: TablesUpdate<"food_experiences">
) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    handleSupabaseError(error, "Error updating food experience");
    return data;
  } catch (error: any) {
    console.error("Error updating food experience:", error);
    throw error;
  }
}

export async function deleteFoodExperience(id: string) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    handleSupabaseError(error, "Error deleting food experience");
    return data;
  } catch (error: any) {
    console.error("Error deleting food experience:", error);
    throw error;
  }
}

// Image Upload Services
export async function uploadFoodExperienceImage(
  experienceId: string,
  file: File,
  isPrimary: boolean = false,
  displayOrder: number = 0
) {
  try {
    const filePath = `food-experience-images/${experienceId}/${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("food-experience-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    handleSupabaseError(uploadError, "Error uploading image");

    // Get public URL
    const { data: imageData } = supabase.storage
      .from("food-experience-images")
      .getPublicUrl(filePath);

    // Create image record in the database
    const { data: imageRecord, error: imageRecordError } = await supabase
      .from("food_experience_images")
      .insert({
        experience_id: experienceId,
        image_path: filePath,
        is_primary: isPrimary,
        display_order: displayOrder,
      })
      .select()
      .single();

    handleSupabaseError(imageRecordError, "Error creating image record");

    return imageRecord;
  } catch (error: any) {
    console.error("Error uploading food experience image:", error);
    throw error;
  }
}

export async function deleteFoodExperienceImage(imageId: string) {
  try {
    // Get the image record to get the file path
    const { data: imageRecord, error: imageRecordError } = await supabase
      .from("food_experience_images")
      .select("image_path")
      .eq("id", imageId)
      .single();

    handleSupabaseError(
      imageRecordError,
      "Error fetching image record for deletion"
    );

    if (!imageRecord) {
      throw new Error("Image record not found");
    }

    // Delete the image from storage
    const { error: storageError } = await supabase.storage
      .from("food-experience-images")
      .remove([imageRecord.image_path]);

    handleSupabaseError(storageError, "Error deleting image from storage");

    // Delete the image record from the database
    const { error: dbError } = await supabase
      .from("food_experience_images")
      .delete()
      .eq("id", imageId);

    handleSupabaseError(dbError, "Error deleting image record from database");
  } catch (error: any) {
    console.error("Error deleting food experience image:", error);
    throw error;
  }
}

export async function setFoodExperiencePrimaryImage(
  experienceId: string,
  imageId: string
) {
  try {
    // First, unset the is_primary flag for all images of the experience
    const { error: unsetError } = await supabase
      .from("food_experience_images")
      .update({ is_primary: false })
      .eq("experience_id", experienceId);

    handleSupabaseError(unsetError, "Error unsetting primary images");

    // Then, set the is_primary flag for the specified image
    const { data, error } = await supabase
      .from("food_experience_images")
      .update({ is_primary: true })
      .eq("id", imageId)
      .eq("experience_id", experienceId)
      .select()
      .single();

    handleSupabaseError(error, "Error setting primary image");
    return data;
  } catch (error: any) {
    console.error("Error setting food experience primary image:", error);
    throw error;
  }
}

// Host Stay Services
export async function getHostExperiences(userId: string) {
  try {
    const { data, error } = await supabase
      .from('food_experiences')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching host experiences:', error);
    return [];
  }
}

export async function getHostStays(userId: string) {
  try {
    const { data, error } = await supabase
      .from('stays')
      .select(`
        *,
        stay_images(id, image_path, is_primary, display_order)
      `)
      .eq('host_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching host stays:', error);
    return [];
  }
}

export async function getStayById(stayId: string) {
  try {
    const { data, error } = await supabase
      .from('stays')
      .select(`
        *,
        images:stay_images(*)
      `)
      .eq('id', stayId)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    // Create a full location displayable string
    const locationName = data.location_name || `${data.city}, ${data.state}`;
    
    return {
      ...data,
      location_name: locationName,
    };
  } catch (error) {
    console.error('Error fetching stay:', error);
    return null;
  }
}

export async function createStay(stay: TablesInsert<"stays">) {
  try {
    const { data, error } = await supabase
      .from('stays')
      .insert(stay)
      .select()
      .single();

    if (error) {
      console.error('Error creating stay:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating stay:', error);
    throw error;
  }
}

export async function updateStay(id: string, updates: TablesUpdate<"stays">) {
  try {
    const { data, error } = await supabase
      .from('stays')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating stay:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating stay:', error);
    throw error;
  }
}

export async function uploadStayImage(
  stayId: string,
  file: File,
  isPrimary: boolean = false,
  displayOrder: number = 0
) {
  try {
    const filePath = `stay-images/${stayId}/${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("stay-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: imageData } = supabase.storage
      .from("stay-images")
      .getPublicUrl(filePath);

    // Create image record in the database
    const { data: imageRecord, error: imageRecordError } = await supabase
      .from("stay_images")
      .insert({
        stay_id: stayId,
        image_path: filePath,
        is_primary: isPrimary,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (imageRecordError) {
      console.error('Error creating image record:', imageRecordError);
      throw imageRecordError;
    }

    return imageRecord;
  } catch (error) {
    console.error('Error uploading stay image:', error);
    throw error;
  }
}

export async function deleteStayImage(imageId: string) {
  try {
    // Get the image record to get the file path
    const { data: imageRecord, error: imageRecordError } = await supabase
      .from("stay_images")
      .select("image_path")
      .eq("id", imageId)
      .single();

    if (imageRecordError) {
      console.error('Error fetching image record for deletion:', imageRecordError);
      throw imageRecordError;
    }

    if (!imageRecord) {
      throw new Error("Image record not found");
    }

    // Delete the image from storage
    const { error: storageError } = await supabase.storage
      .from("stay-images")
      .remove([imageRecord.image_path]);

    if (storageError) {
      console.error('Error deleting image from storage:', storageError);
      throw storageError;
    }

    // Delete the image record from the database
    const { error: dbError } = await supabase
      .from("stay_images")
      .delete()
      .eq("id", imageId);

    if (dbError) {
      console.error('Error deleting image record from database:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error deleting stay image:', error);
    throw error;
  }
}

export async function setStayPrimaryImage(
  stayId: string,
  imageId: string
) {
  try {
    // First, unset the is_primary flag for all images of the stay
    const { error: unsetError } = await supabase
      .from("stay_images")
      .update({ is_primary: false })
      .eq("stay_id", stayId);

    if (unsetError) {
      console.error('Error unsetting primary images:', unsetError);
      throw unsetError;
    }

    // Then, set the is_primary flag for the specified image
    const { data, error } = await supabase
      .from("stay_images")
      .update({ is_primary: true })
      .eq("id", imageId)
      .eq("stay_id", stayId)
      .select()
      .single();

    if (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error setting stay primary image:', error);
    throw error;
  }
}
