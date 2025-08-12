import { supabase } from '../supabaseClient';


// Get user's favourite contacts
export async function getFavouritesByUser(userId) {
  const { data, error } = await supabase
    .from('favourites')
    .select('contact_id')
    .eq('user_id', userId);

  if (error) return { success: false, error };
  // Return array of contact_ids
  return { success: true, data: data.map(item => item.contact_id) };
}

// Add a favourite
export async function addFavourite(userId, contactId) {
  const { data, error } = await supabase
    .from('favourites')
    .insert([{ user_id: userId, contact_id: contactId }]);

  if (error) return { success: false, error };
  return { success: true, data };
}

// Remove a favourite
export async function removeFavourite(userId, contactId) {
  const { data, error } = await supabase
    .from('favourites')
    .delete()
    .eq('user_id', userId)
    .eq('contact_id', contactId);

  if (error) return { success: false, error };
  return { success: true, data };
}

