import { supabase } from '../supabaseClient';

/**
 * Helper: Sanitize string input (trim and normalize)
 */
function sanitizeString(str) {
  if (!str) return null;
  return str.trim();
}

/**
 * Get all categories from the database
 */
export const getCategories = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .eq("user_id", userId) // Only fetch categories for this user
      .order("category_id", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get Categories Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Add a new category
 */
export const addCategory = async (categoryName, userId) => {
  try {
    const cleanName = sanitizeString(categoryName);
    
    if (!cleanName) {
      throw new Error("Category name is required");
    }
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { error: insertError } = await supabase
      .from("category")
      .insert([{
        name: cleanName,
        user_id: userId
      }]);

    if (insertError) {
      throw new Error(`Failed to add category: ${insertError.message}`);
    }

    return { success: true, message: "Category added successfully" };
  } catch (error) {
    console.error("Add Category Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Update category
 */
export const updateCategory = async (categoryId, categoryName) => {
  try {
    const cleanName = sanitizeString(categoryName);
    
    if (!cleanName) {
      throw new Error("Category name is required");
    }

    const { data: updatedData, error: updateError } = await supabase
      .from("category")
      .update({ category_name: cleanName })
      .eq("category_id", categoryId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update category: ${updateError.message}`);
    }

    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Update Category Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId) => {
  try {
    const { error: deleteError } = await supabase
      .from("category")
      .delete()
      .eq("category_id", categoryId);

    if (deleteError) {
      throw new Error(`Failed to delete category: ${deleteError.message}`);
    }

    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("Delete Category Error:", error.message);
    return { success: false, error: error.message };
  }
};



