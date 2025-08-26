// src/components/groups/GroupPanel.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  getUserGroups,
  addMemberByEmail,
  getGroupMembers,
  getGroupTasks,
  createGroupTask,
  getUserContactsWhoAreUsers,
  debugGroupAccess,
  archiveGroup,
  unarchiveGroup, // <-- Import unarchiveGroup
} from '../../services/groupService';
import { supabase } from '../../supabaseClient';

const GroupPanel = ({ currentUser }) => {
  const currentUserId = currentUser?.id;
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [groupTaskText, setGroupTaskText] = useState('');
  const [groupTaskDeadline, setGroupTaskDeadline] = useState('');
  const [memberTaskText, setMemberTaskText] = useState('');
  const [memberTaskDeadline, setMemberTaskDeadline] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const [selectedContactId, setSelectedContactId] = useState('');

  const [taskText, setTaskText] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

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

  // Add member by email
  const handleInvite = async () => {
    if (!selectedGroupId || !inviteEmail.trim()) return;
    const res = await addMemberByEmail({ groupId: selectedGroupId, email: inviteEmail.trim() });
    if (res.success) {
      const mRes = await getGroupMembers(selectedGroupId);
      if (mRes.success) setMembers(mRes.data);
      setInviteEmail('');
    } else {
      console.error('Invite error:', res.error); // Only log errors
      alert(res.error || 'Failed to add member');
    }
  };

  // Assign task to member
  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !selectedMemberId || !memberTaskText.trim()) {
      alert('Please select a member and enter a task.');
      return;
    }
    const res = await createGroupTask({
      groupId: selectedGroupId,
      text: memberTaskText,
      deadline: memberTaskDeadline,
      userId: selectedMemberId,
      completed: false,
      completion_percent: 0
    });
    if (res.success) {
      setTasks((prev) => [...prev, res.data]);
      setMemberTaskText('');
      setMemberTaskDeadline('');
      setSelectedMemberId('');
      alert('Task assigned!');
    } else {
      alert(res.error || 'Failed to assign task');
    }
  };

  // Create new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const res = await createGroup({ name: newGroupName.trim(), description: newGroupDesc.trim(), ownerUserId: currentUserId });
    if (res.success) {
      setGroups(prev => [...prev, res.data]);
      setNewGroupName('');
      setNewGroupDesc('');
    } else {
      alert(res.error || 'Failed to create group');
    }
  };

  // Leave group
  // (Removed duplicate handleLeaveGroup function)

  // Delete group
  const handleDeleteGroup = async (groupId) => {
    if (!groupId || !currentUserId) return;
    const res = await deleteGroup({ groupId, userId: currentUserId });
    if (res.success) {
      setGroups(groups.filter(g => g.id !== groupId));
      setSelectedGroupId(null);
      alert('Group deleted.');
    } else {
      alert(res.error || 'Failed to delete group');
    }
  };

  // Create task
  // (Removed duplicate handleCreateTask function. Use the one below.)

  // Update task completion status
  const handleTaskCompletionChange = async (taskId, completed) => {
    await supabase.from('task').update({ completed }).eq('id', taskId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed } : t));
  };

  const handleCreateTask = async () => {
    if (!selectedGroupId || !taskText.trim()) return;
    const res = await createGroupTask({
      groupId: selectedGroupId,
      text: taskText,
      deadline: taskDeadline,
      userId: selectedMemberId || null, // allow unassigned tasks
      completed: false,
      completion_percent: 0
    });
    if (res.success) {
      setTasks((prev) => [...prev, res.data]);
      setTaskText('');
      setTaskDeadline('');
    } else {
      alert(res.error || 'Failed to add task');
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

  return (
    <div className="flex gap-6 w-full">
      {/* Groups list */}
      <div className="w-72 bg-white rounded-xl border border-slate-200 p-4 h-[520px] overflow-y-auto">
        <h3 className="font-semibold text-lg mb-3">Groups</h3>
        <div className="space-y-2">
          {sortedGroups.map((g) => (
            <div
              key={g.id}
              className={`p-3 rounded-lg cursor-pointer border ${
                g.archived
                  ? 'bg-yellow-50 border-yellow-300 opacity-60'
                  : selectedGroupId === g.id
                  ? 'bg-blue-50 border-blue-300'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setSelectedGroupId(g.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{g.name}</span>
                <span className="text-xs text-slate-500 capitalize">{g.role}</span>
              </div>
              {g.description && (
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{g.description}</div>
              )}
              <div className="flex gap-2 mt-2">
                {!isProtectedRole(g.role) && (
                  <button 
                    className="text-xs text-red-600 hover:text-red-800" 
                    onClick={(e) => { e.stopPropagation(); handleLeaveGroup(g.id); }}
                  >
                    Leave
                  </button>
                )}
                {isProtectedRole(g.role) && !g.archived && (
                  <button 
                    className="text-xs text-yellow-600 hover:text-yellow-800" 
                    onClick={(e) => { e.stopPropagation(); handleArchiveGroup(g.id); }}
                  >
                    Archive
                  </button>
                )}
                {isProtectedRole(g.role) && g.archived && (
                  <>
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800" 
                      onClick={(e) => { e.stopPropagation(); handleUnarchiveGroup(g.id); }}
                    >
                      Unarchive
                    </button>
                    <button 
                      className="text-xs text-red-600 hover:text-red-800 ml-2" 
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
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="font-semibold text-sm mb-2">Create Group</div>
            <input className="w-full border rounded-md p-2 text-sm mb-2" placeholder="Group name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
            <input className="w-full border rounded-md p-2 text-sm mb-2" placeholder="Description (optional)" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} />
            <button className="w-full bg-blue-600 text-white rounded-md py-2 text-sm" onClick={handleCreateGroup}>Create</button>
          </div>
        </div>

        {/* Group details */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 h-[520px] overflow-y-auto">
          {!selectedGroup ? (
            <div className="text-slate-500">Select a group to view members and tasks.</div>
          ) : (
            <div className="space-y-6">
              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">Members</h3>
                  <div className="flex gap-2">
                    <input
                      className="border rounded-md p-2 text-sm"
                      placeholder="Invite by email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <button className="bg-slate-800 text-white rounded-md px-3 text-sm" onClick={handleInvite}>Invite</button>
                  </div>
                </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((m) => (
                  <li key={m.u_id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src={m.image || '/user-placeholder.png'} alt={m.name || m.email} />
                      <div>
                        <div className="font-medium text-sm">{m.name || m.email}</div>
                        <div className="text-xs text-slate-500 capitalize">{m.role}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Assign task to member - new section */}
            <div className="mt-4 mb-3">
              <h4 className="font-semibold mb-2">Assign Task to Member</h4>
              <div className="flex gap-2">
                <select
                  className="border rounded-md p-2 text-sm"
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
                  className="flex-1 border rounded-md p-2 text-sm"
                  placeholder="Task description"
                  value={memberTaskText}
                  onChange={e => setMemberTaskText(e.target.value)}
                />
                <input
                  type="date"
                  className="border rounded-md p-2 text-sm"
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
                    } else {
                      alert(res.error || 'Failed to assign task');
                    }
                  }}
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Tasks */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Group Tasks</h3>
              <div className="flex gap-2 mb-3">
                <input className="flex-1 border rounded-md p-2 text-sm" placeholder="Task description" value={taskText} onChange={(e) => setTaskText(e.target.value)} />
                <input type="date" className="border rounded-md p-2 text-sm" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
                <button className="bg-blue-600 text-white rounded-md px-3 text-sm" onClick={handleCreateTask}>Add</button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-slate-500 text-sm">No tasks yet.</div>
              ) : (
                <ul className="space-y-2">
                  {sortedTasks.map((t) => (
                    <li
                      key={t.id}
                      className={`border rounded-lg p-3 flex flex-col gap-2 ${
                        t.completed
                          ? 'bg-green-50 border-green-300 opacity-70'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{t.text}</div>
                          {t.deadline && (
                            <div className="text-xs text-slate-500">
                              Due: {new Date(t.deadline).toLocaleDateString()}
                            </div>
                          )}
                          {/* Show assigned member or group */}
                          {t.user_id ? (
                            <div className="text-xs text-blue-600">
                              Task assigned to: {members.find(m => m.u_id === t.user_id)?.name || members.find(m => m.u_id === t.user_id)?.email || 'Member'}
                            </div>
                          ) : (
                            <div className="text-xs text-blue-600">
                              Task assigned to: GROUP
                            </div>
                          )}
                        </div>
                        <button className="text-red-600 text-sm" onClick={() => handleDeleteTask(t.id)}>Delete</button>
                      </div>
                      {/* Completion slider */}
                      <div className="flex items-center gap-3 mt-2">
                        <label className="text-xs text-slate-500">Progress:</label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={t.completion_percent || 0}
                          onChange={e => handleCompletionChange(t.id, Number(e.target.value))}
                          className="w-32 h-2 accent-blue-600"
                          style={{ accentColor: "#2563eb" }} // Tailwind blue-600
                        />
                        <span className="text-xs font-semibold w-8 text-center">{t.completion_percent || 0}%</span>
                        <label className="flex items-center gap-1 text-xs">
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

            
            
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPanel;

