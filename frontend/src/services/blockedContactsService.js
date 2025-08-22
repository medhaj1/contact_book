import { supabase } from '../supabaseClient';

// ✅ Fetch blocked contacts for the logged-in user
export async function getBlockedContacts(currentUserId) {
  const { data, error } = await supabase
    .from('block_contacts')
    .select(`
      contact_id,
      contacts:contact_id (
        name,
        email
      )
    `)
    .eq('u_id', currentUserId);

  if (error) {
    console.error("Error fetching blocked contacts:", error);
    return { success: false, data: [], error: error.message };
  }

  return { success: true, data: data.map(item => ({
    contact_id: item.contact_id,
    name: item.contacts?.name || 'Unknown Contact',
    email: item.contacts?.email || ''
  })) };
}

// ✅ Block a contact
export async function blockContact(contactId, currentUserId) {
  if (contactId === currentUserId) {
    return { success: false, error: "You cannot block yourself" };
  }

  const { error } = await supabase
    .from('block_contacts')
    .insert([{ contact_id: contactId, u_id: currentUserId }]);

  if (error) {
    // Handle unique constraint violation gracefully
    if (error.code === '23505') {
      return { success: false, error: "Contact is already blocked" };
    }
    console.error("Error blocking contact:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ✅ Unblock a contact
export async function unblockContact(contactId, currentUserId) {
  const { error } = await supabase
    .from('block_contacts')
    .delete()
    .eq('contact_id', contactId)
    .eq('u_id', currentUserId);

  if (error) {
    console.error("Error unblocking contact:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
