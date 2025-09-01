// src/services/favouriteService.js
import { supabase } from '../supabaseClient'; //  Make sure supabaseClient.js is inside src/

// Get all favourites for a user (now returns contact objects with is_favourite = true)
export async function getFavouritesByUser(userId) {
  try {
    const { data, error } = await supabase
      .from('contact')
      .select('contact_id')
      .eq('user_id', userId)
      .eq('is_favourite', true);

    if (error) {
      console.error('Error fetching favourites:', error);
      return { success: false, data: [] };
    }
    return { success: true, data: data.map(contact => contact.contact_id) };
  } catch (error) {
    console.error('Error fetching favourites:', error);
    return { success: false, data: [] };
  }
}

// Add a favourite (update is_favourite to true)
export async function addFavourite(userId, contactId) {
  try {
    const { error } = await supabase
      .from('contact')
      .update({ is_favourite: true })
      .eq('contact_id', contactId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error adding favourite:', error);
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error('Error adding favourite:', error);
    return { success: false };
  }
}

// Remove a favourite (update is_favourite to false)
export async function removeFavourite(userId, contactId) {
  try {
    const { error } = await supabase
      .from('contact')
      .update({ is_favourite: false })
      .eq('contact_id', contactId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing favourite:', error);
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error('Error removing favourite:', error);
    return { success: false };
  }
}

// Bulk add favourites
export async function bulkAddFavourites(userId, contactIds) {
  try {
    if (!contactIds || contactIds.length === 0) {
      throw new Error("No contacts selected");
    }

    const { error } = await supabase
      .from('contact')
      .update({ is_favourite: true })
      .in('contact_id', contactIds)
      .eq('user_id', userId);

    if (error) {
      console.error('Error bulk adding favourites:', error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      message: `Successfully added ${contactIds.length} contact(s) to favourites`,
      updatedCount: contactIds.length
    };
  } catch (error) {
    console.error('Error bulk adding favourites:', error);
    return { success: false, error: error.message };
  }
}

// Bulk remove favourites
export async function bulkRemoveFavourites(userId, contactIds) {
  try {
    if (!contactIds || contactIds.length === 0) {
      throw new Error("No contacts selected");
    }

    const { error } = await supabase
      .from('contact')
      .update({ is_favourite: false })
      .in('contact_id', contactIds)
      .eq('user_id', userId);

    if (error) {
      console.error('Error bulk removing favourites:', error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      message: `Successfully removed ${contactIds.length} contact(s) from favourites`,
      updatedCount: contactIds.length
    };
  } catch (error) {
    console.error('Error bulk removing favourites:', error);
    return { success: false, error: error.message };
  }
}
