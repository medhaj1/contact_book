// src/components/groups/GroupPanel.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  getUserGroups,
  addMemberByEmail,
  getGroupMembers,
  getGroupTasks,
  createGroupTask,
  createGroup,
  deleteGroup,
  leaveGroup,
  deleteTask,
  archiveGroup,
  unarchiveGroup,
} from '../../services/groupService';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';
//import { handleLeaveGroup, handleDeleteTask } from './someFile';

const GroupPanel = ({ currentUser }) => {
  // Try different possible id fields
  const currentUserId = currentUser?.id || currentUser?.user?.id || currentUser?.sub;

  // Helper function to generate avatar
  const generateAvatar = (name, email) => {
    const displayName = name || email || 'User';
    const initials = displayName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    // Generate a consistent color based on the name/email
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const colorIndex = (displayName.charCodeAt(0) + displayName.charCodeAt(displayName.length - 1)) % colors.length;
    
    return {
      initials,
      bgColor: colors[colorIndex]
    };
  };

  // Avatar component
  const MemberAvatar = ({ member }) => {
    const [imageError, setImageError] = useState(false);
    const avatar = generateAvatar(member.name, member.email);
    
    if (member.image && !imageError) {
      return (
        <img 
          className="w-8 h-8 rounded-full object-cover" 
          src={member.image} 
          alt={member.name || member.email}
          onError={() => setImageError(true)}
        />
      );
    }
    
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${avatar.bgColor}`}>
        {avatar.initials}
      </div>
    );
  };

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberTaskText, setMemberTaskText] = useState('');
  const [memberTaskDeadline, setMemberTaskDeadline] = useState('');

  const selectedGroup = useMemo(() => groups.find((g) => g.id === selectedGroupId) || null, [groups, selectedGroupId]);

  useEffect(() => {
    if (!currentUserId) return;
    getUserGroups(currentUserId).then(res => {
      if (res.success) setGroups(res.data);
    });
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedGroupId) return;
    Promise.all([
      getGroupMembers(selectedGroupId),
      getGroupTasks(selectedGroupId),
    ]).then(([membersRes, tasksRes]) => {
      if (membersRes.success) setMembers(membersRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
    });
  }, [selectedGroupId]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    
    if (!currentUserId) {
      toast.error('User not authenticated. Please log in again.');
      return;
    }
    
    const res = await createGroup({ name: newGroupName, description: newGroupDesc, ownerUserId: currentUserId });
    if (res.success) {
      setGroups((prev) => [...prev, res.data]);
      setNewGroupName('');
      setNewGroupDesc('');
      toast.success('Group created successfully!', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error(res.error || 'Failed to create group', {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Leave group
  const handleLeaveGroup = async (groupId) => {
    if (!groupId || !currentUserId) return;
    const res = await leaveGroup({ groupId, userId: currentUserId });
    if (res.success) {
      setGroups(groups => groups.filter(g => g.id !== groupId));
      setSelectedGroupId(null);
      toast.success('You have left the group.', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error(res.error || 'Failed to leave group', {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Delete group
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    
    const res = await deleteGroup({ groupId, userId: currentUserId });
    if (res.success) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroupId === groupId) setSelectedGroupId(null);
      toast.success('Group deleted.', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error(res.error || 'Failed to delete group', {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Invite member by email
  const handleInviteByEmail = async () => {
    if (!selectedGroupId || !inviteEmail.trim()) return;
    const res = await addMemberByEmail({ groupId: selectedGroupId, email: inviteEmail.trim() });
    if (res.success) {
      const mRes = await getGroupMembers(selectedGroupId);
      if (mRes.success) setMembers(mRes.data);
      setInviteEmail('');
      toast.success('Member invited successfully!', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error(res.error || 'Failed to add member', {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const res = await deleteTask(taskId);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Task deleted.', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error('Failed to delete task', {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  

  const handleArchiveGroup = async (groupId) => {
    const res = await archiveGroup({ groupId });
    if (res.success) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, archived: true } : g));
    }
  };

  const handleUnarchiveGroup = async (groupId) => {
    const res = await unarchiveGroup({ groupId });
    if (res.success) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, archived: false } : g));
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

  const handleCompletionChange = async (taskId, percent, forceComplete = false) => {
    const completed = forceComplete || percent === 100;
    const { error } = await supabase
      .from('task')
      .update({ completion_percent: percent, completed })
      .eq('id', taskId);
    if (!error) {
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, completion_percent: percent, completed } : t
        )
      );
    }
  };

  const sortedTasks = [...tasks]
    .sort((a, b) => {
      // Completed tasks go last
      if (!!a.completed !== !!b.completed) return a.completed ? 1 : -1;
      // Sort by deadline (earliest first)
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });

  // Sort: archived groups go last
  const sortedGroups = [...groups].sort((a, b) => {
    if (!!a.archived !== !!b.archived) return a.archived ? 1 : -1;
    return 0;
  });

  if (!currentUserId) {
    return <div className="text-slate-500 dark:text-slate-400">Please log in to access groups.</div>;
  }

  return (
    <div className="flex gap-6 w-full h-full">
      {/* Groups list */}
      <div className="w-72 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-full flex flex-col">
        <h3 className="font-semibold text-lg mb-3 dark:text-slate-100 flex-shrink-0">Groups</h3>
        <div className="flex-1 overflow-y-auto space-y-2">{/* Made scrollable */}
          {sortedGroups.map((g) => (
            <div
              key={g.id}
              className={`p-3 rounded-lg cursor-pointer border ${
                g.archived
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 opacity-60'
                  : selectedGroupId === g.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                  : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              onClick={() => setSelectedGroupId(g.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-slate-100">{g.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{g.role}</span>
              </div>
              {g.description && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{g.description}</div>
              )}
              <div className="flex gap-2 mt-2">
                {!isProtectedRole(g.role) && (
                  <button 
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" 
                    onClick={(e) => { e.stopPropagation(); handleLeaveGroup(g.id); }}
                  >
                    Leave
                  </button>
                )}
                {isProtectedRole(g.role) && !g.archived && (
                  <button 
                    className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300" 
                    onClick={(e) => { e.stopPropagation(); handleArchiveGroup(g.id); }}
                  >
                    Archive
                  </button>
                )}
                {isProtectedRole(g.role) && g.archived && (
                  <>
                    <button 
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" 
                      onClick={(e) => { e.stopPropagation(); handleUnarchiveGroup(g.id); }}
                    >
                      Unarchive
                    </button>
                    <button 
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ml-2" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create group */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#202733] flex-shrink-0">
          <div className="font-semibold text-sm dark:text-gray-100 mb-2">Create Group</div>
          <input className="w-full border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400 mb-2" placeholder="Group name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
          <input className="w-full border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400 mb-2" placeholder="Description (optional)" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} />
          <button className="w-full bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-700 hover:from-indigo-900 hover:via-indigo-700 hover:to-indigo-500 text-white rounded-md py-2 text-sm" onClick={handleCreateGroup}>Create</button>
        </div>
      </div>

      {/* Group details */}
      <div className="flex-1 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-full flex flex-col">
        {!selectedGroup ? (
          <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center h-full">Select a group to view members and tasks.</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6">{/* Made content scrollable */}
            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg dark:text-gray-100">Members</h3>
                <div className="flex gap-2">
                  <input
                    className="border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-[#202733] dark:text-gray-400 placeholder:dark:text-gray-400"
                    placeholder="Add a user via email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <button className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-700 hover:from-indigo-900 hover:via-indigo-700 hover:to-indigo-500 text-white rounded-md px-3 text-sm" onClick={handleInviteByEmail}>Add</button>
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((m) => (
                  <li key={m.u_id} className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <MemberAvatar member={m} />
                      <div>
                        <div className="font-medium text-sm dark:text-slate-100">{m.name || m.email}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{m.role}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assign task to member */}
            <div className="mt-4 mb-3">
              <h4 className="font-semibold mb-2 dark:text-slate-100">Assign Task to Member</h4>
              <div className="flex gap-2">
                <select
                  className="border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-slate-600 dark:text-slate-300"
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                >
                  <option value="">Select member...</option>
                  {members.map(m => (
                    <option key={m.u_id} value={m.u_id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
                <input
                  className="flex-1 border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-slate-600 dark:text-slate-300 dark:placeholder-slate-400"
                  placeholder="Task description"
                  value={memberTaskText}
                  onChange={e => setMemberTaskText(e.target.value)}
                />
                <input
                  type="date"
                  className="border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-slate-600 dark:text-slate-300"
                  value={memberTaskDeadline}
                  onChange={e => setMemberTaskDeadline(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white rounded-md px-3 text-sm"
                  onClick={async () => {
                    if (!selectedGroupId || !selectedMemberId || !memberTaskText.trim()) return;
                    const res = await createGroupTask({
                      groupId: selectedGroupId,
                      text: memberTaskText,
                      deadline: memberTaskDeadline,
                      userId: selectedMemberId
                    });
                    if (res.success) {
                      setTasks((prev) => [...prev, res.data]);
                      setMemberTaskText('');
                      setMemberTaskDeadline('');
                      toast.success('Task assigned!', {
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                      });
                    } else {
                      toast.error(res.error || 'Failed to assign task', {
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                      });
                    }
                  }}
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Tasks */}
            {/*<div>
              <h3 className="font-semibold text-lg mb-2 dark:text-slate-100">Group Tasks</h3>
              <div className="flex gap-2 mb-3">
                <input className="flex-1 border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-slate-600 dark:text-slate-300 dark:placeholder-slate-400" placeholder="Task description" value={taskText} onChange={(e) => setTaskText(e.target.value)} />
                <input type="date" className="border rounded-md p-2 text-sm dark:bg-[#1a1f2c] dark:border-slate-600 dark:text-slate-300" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
                <button className="bg-blue-600 text-white rounded-md px-3 text-sm" onClick={handleCreateTask}>Add</button>
              </div>*/}
              {tasks.length === 0 ? (
                <div className="text-slate-500 dark:text-slate-400 text-sm">No tasks yet.</div>
              ) : (
                <ul className="space-y-2">
                  {sortedTasks.map((t) => (
                    <li
                      key={t.id}
                      className={`border rounded-lg p-3 flex flex-col gap-2 ${
                        t.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 opacity-70'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm dark:text-slate-100">{t.text}</div>
                          {t.deadline && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Due: {new Date(t.deadline).toLocaleDateString()}
                            </div>
                          )}
                          {t.user_id ? (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              Task assigned to: {members.find(m => m.u_id === t.user_id)?.name || members.find(m => m.u_id === t.user_id)?.email || 'Member'}
                            </div>
                          ) : (
                           <div className="text-xs text-blue-600 dark:text-blue-400">
                              Task assigned to: GROUP
                            </div>
                          )}
                        </div>
                        <button className="text-red-600 dark:text-red-400 text-sm" onClick={() => handleDeleteTask(t.id)}>Delete</button>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <label className="text-xs text-slate-500 dark:text-slate-400">Progress:</label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={t.completion_percent || 0}
                          onChange={e => handleCompletionChange(t.id, Number(e.target.value))}
                          className="w-32 h-2 accent-blue-600"
                          style={{ accentColor: "#2563eb" }}
                        />
                        <span className="text-xs font-semibold w-8 text-center dark:text-slate-300">{t.completion_percent || 0}%</span>
                        <label className="flex items-center gap-1 text-xs dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={!!t.completed}
                            onChange={e => handleCompletionChange(t.id, e.target.checked ? 100 : t.completion_percent || 0, e.target.checked)}
                            className="accent-blue-600"
                            style={{ accentColor: "#2563eb" }}
                          />
                          Completed
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
        )}
      </div>
    </div>
  );
};

export default GroupPanel;