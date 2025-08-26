// src/components/groups/GroupPanel.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  getUserGroups,
  createGroup,
  addMemberByEmail,
  getGroupMembers,
  getGroupTasks,
  createGroupTask,
  deleteTask,
  leaveGroup,
  deleteGroup,
  addContactToGroup,
  getUserContactsWhoAreUsers,
  debugGroupAccess,
} from '../../services/groupService';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';

const GroupPanel = ({ currentUser }) => {
  const currentUserId = currentUser?.id;
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contactsWhoAreUsers, setContactsWhoAreUsers] = useState([]);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');

  const [taskText, setTaskText] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  const selectedGroup = useMemo(() => groups.find((g) => g.id === selectedGroupId) || null, [groups, selectedGroupId]);

  useEffect(() => {
    if (!currentUserId) {
      console.log('No currentUserId, skipping group fetch');
      return;
    }
    
    console.log('Fetching groups for user:', currentUserId);
    (async () => {
      // Debug call to see what's happening
      await debugGroupAccess(currentUserId);
      
      const res = await getUserGroups(currentUserId);
      console.log('getUserGroups result:', res);
      if (res.success) {
        setGroups(res.data);
      } else {
        console.error('Failed to fetch groups:', res.error);
        setGroups([]);
      }
    })();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    (async () => {
      const res = await getUserContactsWhoAreUsers(currentUserId);
      if (res.success) setContactsWhoAreUsers(res.data);
    })();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedGroupId) return;
    (async () => {
      const [membersRes, tasksRes] = await Promise.all([
        getGroupMembers(selectedGroupId),
        getGroupTasks(selectedGroupId),
      ]);
      if (membersRes.success) setMembers(membersRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
    })();
  }, [selectedGroupId]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const res = await createGroup({ name: newGroupName, description: newGroupDesc, ownerUserId: currentUserId });
    if (res.success) {
      setGroups((prev) => [...prev, res.data]);
      setNewGroupName('');
      setNewGroupDesc('');
    } else {
      toast.error(res.error || 'Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    
    const res = await deleteGroup({ groupId, userId: currentUserId });
    if (res.success) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroupId === groupId) setSelectedGroupId(null);
    } else {
      toast.error(res.error || 'Failed to delete group');
    }
  };

  const handleInvite = async () => {
    if (!selectedGroupId || !inviteEmail.trim()) return;
    const res = await addMemberByEmail({ groupId: selectedGroupId, email: inviteEmail.trim() });
    if (res.success) {
      // Refresh members
      const mRes = await getGroupMembers(selectedGroupId);
      if (mRes.success) setMembers(mRes.data);
      setInviteEmail('');
    } else {
      toast.error(res.error || 'Failed to add member');
    }
  };

  const handleAddContact = async () => {
    if (!selectedGroupId || !selectedContactId) return;
    const res = await addContactToGroup({ groupId: selectedGroupId, contactId: selectedContactId, userId: currentUserId });
    if (res.success) {
      // Refresh members
      const mRes = await getGroupMembers(selectedGroupId);
      if (mRes.success) setMembers(mRes.data);
      setSelectedContactId('');
    } else {
      toast.error(res.error || 'Failed to add contact');
    }
  };

  const handleCreateTask = async () => {
    if (!selectedGroupId || !taskText.trim()) return;
    const res = await createGroupTask({ groupId: selectedGroupId, text: taskText, deadline: taskDeadline, creatorUserId: currentUserId });
    if (res.success) {
      setTasks((prev) => [...prev, res.data]);
      setTaskText('');
      setTaskDeadline('');
    } else {
      toast.error(res.error || 'Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const res = await deleteTask(taskId);
    if (res.success) setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleLeaveGroup = async (groupId) => {
    const res = await leaveGroup({ groupId, userId: currentUserId });
    if (res.success) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroupId === groupId) setSelectedGroupId(null);
    } else {
      toast.error(res.error || 'Failed to leave');
    }
  };

  // Keep user online heartbeat in groups view too
  useEffect(() => {
    if (!currentUserId) return;
    const ping = setInterval(() => {
      supabase.from('user_profile').update({ last_seen: new Date().toISOString() }).eq('u_id', currentUserId);
    }, 25 * 1000);
    supabase.from('user_profile').update({ last_seen: new Date().toISOString() }).eq('u_id', currentUserId);
    return () => clearInterval(ping);
  }, [currentUserId]);

  const isProtectedRole = (role) => ['admin'].includes(String(role || '').toLowerCase());

  return (
    <div className="flex gap-6 w-full">
      {/* Groups list */}
      <div className="w-72 bg-white dark:bg-[#141820] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 h-[520px] overflow-y-auto">
        <h3 className="font-semibold text-lg dark:text-gray-100 mb-3">Groups</h3>
        <div className="space-y-2">
          {groups.map((g) => (
            <div
              key={g.id}
              className={`p-3 rounded-lg cursor-pointer border ${selectedGroupId === g.id ? 'bg-blue-50 dark:bg-[#161b22] border-blue-300 dark:border-blue-700' : 'border-slate-200 dark:border-[#30363d] hover:bg-slate-50 dark:hover:bg-[#1f2937]'}`}
              onClick={() => setSelectedGroupId(g.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{g.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-400 capitalize">{g.role}</span>
              </div>
              {g.description && (
                <div className="text-xs text-gray-400 dark:text-gray-400 mt-1 line-clamp-2">{g.description}</div>
              )}
              <div className="flex gap-2 mt-2">
                {!isProtectedRole(g.role) && (
                  <button 
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 hover:dark:text-red-500" 
                    onClick={(e) => { e.stopPropagation(); handleLeaveGroup(g.id); }}
                  >
                    Leave
                  </button>
                )}
                {isProtectedRole(g.role) && (
                  <button 
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 hover:dark:text-red-500" 
                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create group */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#202733]">
          <div className="font-semibold text-sm dark:text-gray-100 mb-2">Create Group</div>
          <input className="w-full border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400 mb-2" placeholder="Group name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
          <input className="w-full border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400 mb-2" placeholder="Description (optional)" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} />
          <button className="w-full bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-700 hover:from-indigo-900 hover:via-indigo-700 hover:to-indigo-500 text-white rounded-md py-2 text-sm" onClick={handleCreateGroup}>Create</button>
        </div>
      </div>

      {/* Group details */}
      <div className="flex-1 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 h-[520px] overflow-y-auto">
        {!selectedGroup ? (
          <div className="text-gray-500 dark:text-gray-400">Select a group to view members and tasks.</div>
        ) : (
          <div className="space-y-6">
            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg dark:text-gray-100">Members</h3>
                <div className="flex gap-2">
                  <input
                    className="border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400"
                    placeholder="Invite by email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <button className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-700 hover:from-indigo-900 hover:via-indigo-700 hover:to-indigo-500 text-white rounded-md px-3 text-sm" onClick={handleInvite}>Invite</button>
                </div>
              </div>

              {/* Add from contacts */}
              {contactsWhoAreUsers.length > 0 && (
                <div className="flex gap-2 mb-3">
                  <select
                    className="flex-1 border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400"
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                  >
                    <option value="">Add from contacts...</option>
                    {contactsWhoAreUsers.map((contact) => (
                      <option key={contact.contact_id} value={contact.contact_id}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                  </select>
                  <button 
                    className="bg-green-600 dark:bg-green-700 text-white rounded-md px-3 text-sm hover:dark:bg-green-600" 
                    onClick={handleAddContact}
                    disabled={!selectedContactId}
                  >
                    Add
                  </button>
                </div>
              )}

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((m) => (
                  <li key={m.u_id} className="border border-slate-200 dark:border-[#30363d] rounded-lg p-3 dark:bg-[#1a1f2c]">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src={m.image || '/user-placeholder.png'} alt={m.name || m.email} />
                      <div>
                        <div className="font-medium text-sm">{m.name || m.email}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-400 capitalize">{m.role}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tasks */}
            <div>
              <h3 className="font-semibold text-lg dark:text-gray-100 mb-2">Group Tasks</h3>
              <div className="flex gap-2 mb-3">
                <input className="flex-1 border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400" placeholder="Task description" value={taskText} onChange={(e) => setTaskText(e.target.value)} />
                <input type="date" className="border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
                <button className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-700 hover:from-indigo-900 hover:via-indigo-700 hover:to-indigo-500 text-white rounded-md px-3 text-sm" onClick={handleCreateTask}>Add</button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-sm">No tasks yet.</div>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li key={t.id} className="border border-slate-200 dark:border-[#30363d] rounded-lg p-3 flex items-center justify-between dark:bg-[#1a1f2c]">
                      <div>
                        <div className="font-medium text-sm">{t.text}</div>
                        {t.deadline && <div className="text-xs text-gray-400 dark:text-gray-400">Due: {new Date(t.deadline).toLocaleDateString()}</div>}
                      </div>
                      <button className="text-red-600 dark:text-red-400 hover:dark:text-red-500 text-sm" onClick={() => handleDeleteTask(t.id)}>Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPanel; 