// src/services/groupService.js
import { supabase } from '../supabaseClient';

// GROUPS
export async function getUserGroups(userId) {
  try {
    if (!userId) throw new Error('Missing userId');

    const { data: memberRows, error: memberErr } = await supabase
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', userId);

    if (memberErr) throw memberErr;
    if (!memberRows || memberRows.length === 0) return { success: true, data: [] };

    const groupIds = memberRows.map((m) => m.group_id);

    const { data: groups, error: groupErr } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
      .order('created_at', { ascending: true });

    if (groupErr) throw groupErr;

    // Merge roles onto groups
    const roleByGroupId = new Map(memberRows.map((m) => [m.group_id, m.role]));
    const enriched = (groups || []).map((g) => ({ ...g, role: roleByGroupId.get(g.id) || 'member' }));
    return { success: true, data: enriched };
  } catch (error) {
    console.error('getUserGroups error', error);
    return { success: false, error: error.message };
  }
}

export async function createGroup({ name, description, ownerUserId }) {
  try {
    if (!ownerUserId) throw new Error('Missing ownerUserId');
    if (!name || !name.trim()) throw new Error('Group name is required');

    const { data: groupRows, error: groupErr } = await supabase
      .from('groups')
      .insert([{ name: name.trim(), description: description || '' }])
      .select();

    if (groupErr) throw groupErr;
    const group = groupRows?.[0];
    if (!group) throw new Error('Failed to create group');

    // Most common database constraints allow: 'admin', 'member', 'viewer'
    // Try 'admin' first for group creator, then fallback to 'member'
    const candidateRoles = ['admin', 'member'];
    let usedRole = null;
    let lastErr = null;

    for (const role of candidateRoles) {
      const { error: memberErr } = await supabase
        .from('group_members')
        .insert([{ group_id: group.id, user_id: ownerUserId, role }]);
      if (!memberErr) {
        usedRole = role;
        break;
      }
      lastErr = memberErr;
    }

    if (!usedRole) {
      // Clean up the created group on failure to assign membership
      await supabase.from('groups').delete().eq('id', group.id);
      throw lastErr || new Error('Failed to create group membership');
    }

    // Attach role used so the UI can reflect it
    const groupWithRole = { ...group, role: usedRole };
    return { success: true, data: groupWithRole };
  } catch (error) {
    console.error('createGroup error', error);
    return { success: false, error: error.message };
  }
}

export async function leaveGroup({ groupId, userId }) {
  try {
    if (!groupId || !userId) throw new Error('Missing groupId or userId');
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('leaveGroup error', error);
    return { success: false, error: error.message };
  }
}

export async function addMemberByEmail({ groupId, email }) {
  try {
    if (!groupId || !email) throw new Error('Missing groupId or email');

    // Find user by email in user_profile
    const { data: profiles, error: profileErr } = await supabase
      .from('user_profile')
      .select('u_id, email, name, image')
      .eq('email', email)
      .limit(1);

    if (profileErr) throw profileErr;
    const profile = profiles?.[0];
    if (!profile) {
      return { success: false, error: 'No user found with this email' };
    }

    // Check if already a member
    const { data: existing, error: checkErr } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', profile.u_id)
      .limit(1);

    if (checkErr) throw checkErr;
    if (existing && existing.length > 0) {
      return { success: false, error: 'User is already a member of this group' };
    }

    // Most common database constraints allow: 'member', 'viewer'
    // Try 'member' first, then fallback to 'viewer'
    const candidateRoles = ['member', 'viewer'];
    let inserted = false;
    let lastErr = null;
    for (const role of candidateRoles) {
      const { error: insertErr } = await supabase
        .from('group_members')
        .insert([{ group_id: groupId, user_id: profile.u_id, role }]);
      if (!insertErr) {
        inserted = true;
        break;
      }
      lastErr = insertErr;
    }

    if (!inserted) throw lastErr || new Error('Failed to add member');

    return { success: true, data: profile };
  } catch (error) {
    console.error('addMemberByEmail error', error);
    return { success: false, error: error.message };
  }
}

export async function getGroupMembers(groupId) {
  try {
    if (!groupId) throw new Error('Missing groupId');

    const { data: memberRows, error: memberErr } = await supabase
      .from('group_members')
      .select('user_id, role, joined_at')
      .eq('group_id', groupId);

    if (memberErr) throw memberErr;

    if (!memberRows || memberRows.length === 0) return { success: true, data: [] };

    const userIds = memberRows.map((m) => m.user_id);
    const { data: profiles, error: profileErr } = await supabase
      .from('user_profile')
      .select('u_id, name, email, image, last_seen')
      .in('u_id', userIds);

    if (profileErr) throw profileErr;

    const roleByUserId = new Map(memberRows.map((m) => [m.user_id, m.role]));
    const enriched = (profiles || []).map((p) => ({ ...p, role: roleByUserId.get(p.u_id) || 'member' }));
    return { success: true, data: enriched };
  } catch (error) {
    console.error('getGroupMembers error', error);
    return { success: false, error: error.message };
  }
}

// GROUP TASKS
export async function getGroupTasks(groupId) {
  try {
    if (!groupId) throw new Error('Missing groupId');
    const { data, error } = await supabase
      .from('task')
      .select('*')
      .eq('group_id', groupId)
      .order('deadline', { ascending: true });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('getGroupTasks error', error);
    return { success: false, error: error.message };
  }
}

export async function createGroupTask({ groupId, text, deadline, creatorUserId }) {
  try {
    if (!groupId) throw new Error('Missing groupId');
    if (!creatorUserId) throw new Error('Missing creatorUserId');
    if (!text || !text.trim()) throw new Error('Task text is required');

    const { data, error } = await supabase
      .from('task')
      .insert([{ group_id: groupId, user_id: creatorUserId, text: text.trim(), deadline }])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    console.error('createGroupTask error', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTask(taskId) {
  try {
    if (!taskId) throw new Error('Missing taskId');
    const { error } = await supabase
      .from('task')
      .delete()
      .eq('id', taskId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('deleteTask error', error);
    return { success: false, error: error.message };
  }
} 