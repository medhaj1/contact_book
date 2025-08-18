import { supabase } from '../supabaseClient';

/**
 * Helper: Sanitize string input (trim and normalize)
 */
function sanitizeString(str) {
  if (!str) return null;
  return str.trim();
}

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_profile")
      .select("*")
      .eq("u_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get User Profile Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { name, email, phone, bio } = profileData;
    
    const updateFields = {};
    if (name !== undefined) updateFields.name = sanitizeString(name);
    if (email !== undefined) updateFields.email = sanitizeString(email);
    if (phone !== undefined) updateFields.phone = sanitizeString(phone);
    if (bio !== undefined) updateFields.bio = sanitizeString(bio);

    const { data: updatedData, error: updateError } = await supabase
      .from("user_profile")
      .update(updateFields)
      .eq("u_id", userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }

    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Update User Profile Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Create user profile
 */
export const createUserProfile = async (userId, profileData) => {
  try {
    const { name, email, phone, bio } = profileData;
    
    const { data: insertData, error: insertError } = await supabase
      .from("user_profile")
      .insert([{
        u_id: userId,
        name: sanitizeString(name),
        email: sanitizeString(email),
        phone: sanitizeString(phone),
        bio: sanitizeString(bio)
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create user profile: ${insertError.message}`);
    }

    return { success: true, data: insertData };
  } catch (error) {
    console.error("Create User Profile Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Upload user avatar
 */
export const uploadUserAvatar = async (userId, avatarFile) => {
  try {
    if (!avatarFile) {
      throw new Error("No avatar file provided");
    }

    // Get user profile to get the name for folder structure
    const { data: userData, error: userError } = await supabase
      .from("user_profile")
      .select("name")
      .eq("u_id", userId)
      .single();

    if (userError) {
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    const userName = userData.name;
    const ext = avatarFile.name.split(".").pop();
    const fileName = `avatar-${Date.now()}.${ext}`;
    const filePath = `users/${userName}/avatar/${fileName}`;

    // Delete old avatar if exists
    const { data: existingFiles } = await supabase.storage
      .from("contact-images")
      .list(`users/${userName}/avatar`);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `users/${userName}/avatar/${file.name}`);
      await supabase.storage
        .from("contact-images")
        .remove(filesToDelete);
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from("contact-images")
      .upload(filePath, avatarFile, {
        contentType: avatarFile.type,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
      .from("contact-images")
      .getPublicUrl(filePath);

    // Update user profile with avatar URL
    const { data: updatedData, error: updateError } = await supabase
      .from("user_profile")
      .update({ avatar_url: publicData.publicUrl })
      .eq("u_id", userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update profile with avatar: ${updateError.message}`);
    }

    return { success: true, data: updatedData, avatarUrl: publicData.publicUrl };
  } catch (error) {
    console.error("Upload Avatar Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete user avatar
 */
export const deleteUserAvatar = async (userId) => {
  try {
    // Get user profile to get the name for folder structure
    const { data: userData, error: userError } = await supabase
      .from("user_profile")
      .select("name, avatar_url")
      .eq("u_id", userId)
      .single();

    if (userError) {
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    // Delete avatar from storage
    if (userData.avatar_url) {
      const fullPath = new URL(userData.avatar_url).pathname;
      const pathToDelete = decodeURIComponent(
        fullPath.replace("/storage/v1/object/public/contact-images/", "")
      );

      if (pathToDelete) {
        const { error: deleteError } = await supabase.storage
          .from("contact-images")
          .remove([pathToDelete]);

        if (deleteError) {
          console.warn("Failed to delete avatar file:", deleteError.message);
        }
      }
    }

    // Update user profile to remove avatar URL
    const { data: updatedData, error: updateError } = await supabase
      .from("user_profile")
      .update({ avatar_url: null })
      .eq("u_id", userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Delete Avatar Error:", error.message);
    return { success: false, error: error.message };
  }
};
