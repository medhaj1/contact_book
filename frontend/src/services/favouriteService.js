// src/services/favouriteService.js
import { supabase } from '../supabaseClient'; // ✅ Make sure supabaseClient.js is inside src/

// Get all favourites for a user
export async function getFavouritesByUser(userId) {
  const { data, error } = await supabase
    .from('favourites')
    .select('contact_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favourites:', error);
    return [];
  }
  return data.map(fav => fav.contact_id);
}

// Add a favourite
export async function addFavourite(userId, contactId) {
  const { error } = await supabase
    .from('favourites')
    .insert([{ user_id: userId, contact_id: contactId }]);

  if (error) {
    console.error('Error adding favourite:', error);
  }
}

// Remove a favourite
export async function removeFavourite(userId, contactId) {
  const { error } = await supabase
    .from('favourites')
    .delete()
    .eq('user_id', userId)
    .eq('contact_id', contactId);

  if (error) {
    console.error('Error removing favourite:', error);
  }
}



