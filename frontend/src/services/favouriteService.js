// src/services/favouriteService.js
import { supabase } from '../supabaseClient'; //  Make sure supabaseClient.js is inside src/

// Get all favourites for a user
export async function getFavouritesByUser(userId) {
  const { data, error } = await supabase
    .from('contact')
    .select('contact_id')
    .eq('contact_user_id', userId)
    .eq('is_favourite', true);

  if (error) {
    console.error('Error fetching favourites:', error);
    return [];
  }
  return data.map(fav => fav.contact_id);
}

// Add a favourite
export async function addFavourite(userId, contactId) {
  const { data, error } = await supabase
    .from('contact')
    .update({ is_favourite: true })
    .eq('contact_user_id', userId)
    .eq('contact_id', contactId)
    .select();
  console.log("Updated favourites (add):", data);
  if (error) {
    console.error('Error adding favourite:', error);
  }
}

// Remove a favourite
export async function removeFavourite(userId, contactId) {
  const { data, error } = await supabase
    .from('contact')
    .update({ is_favourite: false })
    .eq('contact_user_id', userId)
    .eq('contact_id', contactId)
    .select();
  console.log("Updated favourites (remove):", data);
  if (error) {
    console.error('Error removing favourite:', error);
  }
}
