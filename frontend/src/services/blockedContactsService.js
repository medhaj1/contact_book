import { supabase } from '../supabaseClient';

// Fetch blocked contacts for the logged-in user
export async function getBlockedContacts(currentUserId) {
  const { data, error } = await supabase
    .from('blocked_contacts')
    .select('contact_id')
    .eq('user_id', currentUserId);

  if (error) {
    console.error("Error fetching blocked contacts:", error);
    return [];
  }
  return data.map(item => item.contact_id);
}

// Block a contact
export async function blockContact(contactId, currentUserId) {
  const { error } = await supabase
    .from('blocked_contacts')
    .insert([{ contact_id: contactId, user_id: currentUserId }]);

  if (error) {
    console.error("Error blocking contact:", error);
  }
}

// Unblock a contact
export async function unblockContact(contactId, currentUserId) {
  const { error } = await supabase
    .from('blocked_contacts')
    .delete()
    .eq('contact_id', contactId)
    .eq('user_id', currentUserId);

  if (error) {
    console.error("Error unblocking contact:", error);
  }
}