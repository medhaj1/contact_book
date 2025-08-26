import { supabase } from '../supabaseClient';

// ✅ Fetch blocked contacts for the logged-in user
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

// ✅ Unblock a contact (improved diagnostics)
export async function unblockContact(contactId, currentUserId) {
  try {
    const cid = Number(contactId);
    console.log("unblockContact: looking for block row with", { contact_id: cid, u_id: currentUserId });

    // 1) Try to SELECT the exact row first so we can inspect what exists
    const { data: found, error: findErr } = await supabase
      .from('block_contacts')
      .select('*')
      .eq('contact_id', cid)
      .eq('u_id', currentUserId);

    if (findErr) {
      console.error('Error querying block_contacts before delete:', findErr);
      return { success: false, error: findErr.message || String(findErr) };
    }

    console.log('unblockContact: found rows:', found);

    if (!found || found.length === 0) {
      // Helpful extra check: show rows that match contact_id in case u_id differs
      const { data: rowsForContact, error: rowsErr } = await supabase
        .from('block_contacts')
        .select('*')
        .eq('contact_id', cid);

      if (rowsErr) console.error('Error querying rows by contact_id:', rowsErr);
      console.log('unblockContact: rows for contact_id (any user):', rowsForContact);

      return {
        success: false,
        error: 'No blocked record found for that contact & user. See console for rows for this contact_id.'
      };
    }

    // 2) If the row exists, attempt delete using eq (delete + select to return deleted rows)
    const { data: delData, error: delErr } = await supabase
      .from('block_contacts')
      .delete()
      .eq('contact_id', cid)
      .eq('u_id', currentUserId)
      .select();

    if (delErr) {
      console.error('Error deleting block row:', delErr);
      return { success: false, error: delErr.message || String(delErr) };
    }

    if (!delData || delData.length === 0) {
      console.warn('Delete returned empty result even though select found rows. Possible RLS denies delete or permission issue.');
      return {
        success: false,
        error: 'Delete returned no rows; possible Row Level Security (RLS) prevented deletion. Check DB policies.'
      };
    }

    console.log('unblockContact: deleted rows:', delData);
    return { success: true, data: delData };
  } catch (err) {
    console.error('Unexpected error in unblockContact:', err);
    return { success: false, error: err.message || String(err) };
  }

  return { success: true };
}
