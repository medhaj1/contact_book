import React, { useState, useEffect } from 'react';
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
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("category")
      .select("*")
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

    // When creating a new category
    await supabase.from('category').insert([
      { name: cleanName, user_id: userId }
    ]);

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

/**
 * Get categories for a specific user
 */
export async function getUserCategories(userId) {
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .eq('user_id', userId);

  if (error) return { success: false, error };
  return { success: true, data };
}

/**
 * Get contacts by category
 */
export async function getContactsByCategory(categoryId, userId) {
  const { data, error } = await supabase
    .from('contact')
    .select('*')
    .eq('category_id', categoryId)
    .eq('user_id', userId);

  if (error) return { success: false, error };
  return { success: true, data };
}

/**
 * React component to display and manage categories
 */
const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const userId = supabase.auth.user()?.id;

  useEffect(() => {
    if (!userId) return;
    getUserCategories(userId).then(res => {
      if (res.success) setCategories(res.data);
    });
  }, [userId]);

  // Fetch contacts when a category is selected
  useEffect(() => {
    if (!selectedCategoryId || !userId) {
      setContacts([]);
      return;
    }
    getContactsByCategory(selectedCategoryId, userId).then(res => {
      if (res.success) setContacts(res.data);
    });
  }, [selectedCategoryId, userId]);

  return (
    <div>
      <h1>Your Categories</h1>
      <ul>
        {categories.map(category => (
          <li
            key={category.category_id}
            style={{ cursor: 'pointer', fontWeight: selectedCategoryId === category.category_id ? 'bold' : 'normal' }}
            onClick={() => setSelectedCategoryId(category.category_id)}
          >
            {category.name}
          </li>
        ))}
      </ul>
      {/* Show contacts for selected category */}
      {selectedCategoryId && (
        <div>
          <h2>Contacts in this category:</h2>
          <ul>
            {contacts.length === 0 ? (
              <li>No contacts found.</li>
            ) : (
              contacts.map(contact => (
                <li key={contact.contact_id}>{contact.name} ({contact.email})</li>
              ))
            )}
          </ul>
        </div>
      )}
      {/* ... add category form ... */}
    </div>
  );
};

export default CategoryManager;
