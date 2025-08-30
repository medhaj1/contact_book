import { supabase } from '../supabaseClient';

/**
 * Helper: Clean phone number (digits + optional leading '+')
 */
function cleanPhoneNumber(phone) {
  if (!phone) return null;
  const trimmed = phone.trim();
  const cleaned = trimmed.startsWith("+")
    ? "+" + trimmed.slice(1).replace(/\D/g, "")
    : trimmed.replace(/\D/g, "");
  return cleaned;
}

/**
 * Helper: Sanitize string input (trim and normalize)
 */
function sanitizeString(str) {
  if (!str) return null;
  return str.trim();
}

/**
 * Normalize category input to always be an array
 */
function normalizeCategoryIds(categoryIds) {
  if (!categoryIds) return [];
  if (Array.isArray(categoryIds)) {
    return categoryIds.map(id => String(id).trim());
  }
  return [String(categoryIds).trim()];
}

/**
 * Add Contact with Optional Photo Upload
 */
export const addContact = async (contactData, photoFile = null, userId) => {
  try {
    const { name, email, phone, birthday, category_ids } = contactData;

    // Sanitize inputs
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email);
    const cleanPhone = cleanPhoneNumber(phone);
    const cleanCategoryIds = normalizeCategoryIds(category_ids);

    // Validate and format birthday
    let formattedBirthday = null;
    if (birthday && birthday.trim()) {
      const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (birthdayRegex.test(birthday.trim())) {
        const date = new Date(birthday.trim());
        if (!isNaN(date.getTime())) {
          formattedBirthday = birthday.trim();
        } else {
          throw new Error("Invalid birthday date format");
        }
      } else {
        throw new Error("Birthday must be in YYYY-MM-DD format");
      }
    }

    let photoUrl = null;

    if (photoFile) {
      // Get user's name from the users table
      const { data: userData, error: userError } = await supabase
        .from("user_profile")
        .select("name")
        .eq("u_id", userId)
        .single();

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      const userName = userData.name;
      const ext = photoFile.name.split(".").pop();
      const fileName = `${cleanName}.${ext}`;
      const filePath = `users/${userName}/${cleanName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("contact-images")
        .upload(filePath, photoFile, {
          contentType: photoFile.type,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: publicData } = supabase.storage
        .from("contact-images")
        .getPublicUrl(filePath);

      photoUrl = publicData.publicUrl;
    }

    const { data: insertData, error: insertError } = await supabase
      .from("contact")
      .insert([{
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        photo_url: photoUrl,
        user_id: userId,
        birthday: formattedBirthday,
        category_ids: cleanCategoryIds.length > 0 ? cleanCategoryIds : null,
        is_favourite: false  // Default new contacts to not favourite
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to add contact: ${insertError.message}`);
    }

    return { success: true, data: insertData };
  } catch (error) {
    console.error("Add Contact Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get All Contacts for a User
 */
export const getContacts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("contact")
      .select("*")
      .eq("user_id", userId)
      .order("contact_id", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get Contacts Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Update Contact (with optional new image)
 */
export const updateContact = async (contactId, contactData, photoFile = null, userId) => {
  try {
    const { name, email, phone, birthday, category_ids } = contactData;

    // Sanitize inputs
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email);
    const cleanPhone = cleanPhoneNumber(phone);
    const cleanCategoryIds = normalizeCategoryIds(category_ids);

    // Validate and format birthday
    let formattedBirthday = null;
    if (birthday && birthday.trim()) {
      const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (birthdayRegex.test(birthday.trim())) {
        const date = new Date(birthday.trim());
        if (!isNaN(date.getTime())) {
          formattedBirthday = birthday.trim();
        } else {
          throw new Error("Invalid birthday date format");
        }
      } else {
        throw new Error("Birthday must be in YYYY-MM-DD format");
      }
    } else if (birthday === '') {
      formattedBirthday = null;
    }

    let photoUrl = null;

    if (photoFile) {
      const { data: oldContact, error: fetchError } = await supabase
        .from("contact")
        .select("photo_url")
        .eq("contact_id", contactId)
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch old contact: ${fetchError.message}`);
      }

      // Get user's name from the user_profile table
      const { data: userData, error: userError } = await supabase
        .from("user_profile")
        .select("name")
        .eq("u_id", userId)
        .single();

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      const userName = userData.name;

      // Delete old photo if exists
      if (oldContact?.photo_url) {
        const fullPath = new URL(oldContact.photo_url).pathname;
        const pathToDelete = decodeURIComponent(
          fullPath.replace("/storage/v1/object/public/contact-images/", "")
        );

        if (pathToDelete) {
          const { error: deleteOldError } = await supabase.storage
            .from("contact-images")
            .remove([pathToDelete]);

          if (deleteOldError) {
            console.warn("Failed to delete old image:", deleteOldError.message);
          }
        }
      }

      const ext = photoFile.name.split(".").pop();
      const fileName = `${cleanName}-${Date.now()}.${ext}`;
      const filePath = `users/${userName}/${cleanName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("contact-images")
        .upload(filePath, photoFile, {
          contentType: photoFile.type,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: publicData } = supabase.storage
        .from("contact-images")
        .getPublicUrl(filePath);

      photoUrl = publicData.publicUrl;
    }

    // Build update object with sanitized data
    const updateFields = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      category_ids: cleanCategoryIds.length > 0 ? cleanCategoryIds : null,
    };

    // Handle birthday separately
    if (formattedBirthday !== null) {
      updateFields.birthday = formattedBirthday;
    } else {
      updateFields.birthday = null;
    }

    if (photoUrl) updateFields.photo_url = photoUrl;

    const { data: updatedData, error: updateError } = await supabase
      .from("contact")
      .update(updateFields)
      .eq("contact_id", contactId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Update Contact Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete Contact
 */
export const deleteContact = async (contactId) => {
  try {
    // Fetch contact to get photo URL
    const { data: contactData, error: fetchError } = await supabase
      .from("contact")
      .select("photo_url")
      .eq("contact_id", contactId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch contact: ${fetchError.message}`);
    }

    // If contact had a photo, delete it from Supabase storage
    if (contactData?.photo_url) {
      const fullPath = new URL(contactData.photo_url).pathname;
      const pathToDelete = decodeURIComponent(
        fullPath.replace("/storage/v1/object/public/contact-images/", "")
      );

      if (pathToDelete) {
        const { error: deleteError } = await supabase.storage
          .from("contact-images")
          .remove([pathToDelete]);

        if (deleteError) {
          console.warn("Failed to delete image:", deleteError.message);
        }
      }
    }

    // Delete contact from DB
    const { error: deleteDbError } = await supabase
      .from("contact")
      .delete()
      .eq("contact_id", contactId);

    if (deleteDbError) {
      throw new Error(`Delete failed: ${deleteDbError.message}`);
    }

    return { success: true, message: "Contact and image deleted successfully." };
  } catch (error) {
    console.error("Delete Contact Error:", error.message);
    return { success: false, error: error.message };
  }
};

