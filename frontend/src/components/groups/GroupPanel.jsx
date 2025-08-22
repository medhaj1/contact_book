// src/components/groups/GroupPanel.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  getUserGroups,
  addMemberByEmail,
  getGroupMembers,
  getGroupTasks,
  createGroupTask,
  getUserContactsWhoAreUsers,
  createGroup,
  deleteGroup,
  leaveGroup, // <-- Add this line
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
  const [taskCompletion, setTaskCompletion] = useState({});
  const [taskCompleted, setTaskCompleted] = useState({});

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
  const handleLeaveGroup = async (groupId) => {
    if (!groupId || !currentUserId) return;
    const res = await leaveGroup({ groupId, userId: currentUserId });
    if (res.success) {
      setGroups(groups.filter(g => g.id !== groupId));
      setSelectedGroupId(null);
      alert('You have left the group.');
    } else {
      alert(res.error || 'Failed to leave group');
    }
  };

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
  const handleCreateTask = async () => {
    if (!selectedGroupId || !groupTaskText.trim()) return;
    const res = await createGroupTask({
      groupId: selectedGroupId,
      text: groupTaskText,
      deadline: groupTaskDeadline,
      completed: false,
      completion_percent: 0
      // no userId here!
    });
    if (res.success) {
      setTasks(prev => [...prev, res.data]);
      setGroupTaskText('');
      setGroupTaskDeadline('');
    } else {
      alert(res.error || 'Failed to create task');
    }
  };

  // Update task completion status
  const handleTaskCompletionChange = async (taskId, completed) => {
    await supabase.from('task').update({ completed }).eq('id', taskId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed } : t));
  };

  const handleTaskPercentChange = async (taskId, percent) => {
    await supabase.from('task').update({ completion_percent: percent }).eq('id', taskId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completion_percent: percent } : t));
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    await supabase.from('task').delete().eq('id', taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };
  return (
    <div className="flex flex-col w-full h-full">
      {/* Top: Group selection and member search/add */}
      <div className="flex gap-6 w-full">
        {/* Groups list */}
        <div className="w-72 bg-white rounded-xl border border-slate-200 p-4 h-[520px] overflow-y-auto">
          <h3 className="font-semibold text-lg mb-3">Groups</h3>
          <div className="space-y-2">
            {groups.map((g) => (
              <div
                key={g.id}
                className={`p-3 rounded-lg cursor-pointer border ${selectedGroupId === g.id ? 'bg-blue-50 border-blue-300' : 'border-slate-200 hover:bg-slate-50'}`}
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
                  {/* Show Leave button for non-admins */}
                  {g.role !== 'admin' && (
                    <button 
                      className="text-xs text-red-600 hover:text-red-800" 
                      onClick={(e) => { e.stopPropagation(); handleLeaveGroup(g.id); }}
                    >
                      Leave
                    </button>
                  )}
                  {/* Show Delete button for admins */}
                  {g.role === 'admin' && (
                    <button 
                      className="text-xs text-red-600 hover:text-red-800" 
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

              {/* Assign Task to Member - MOVE THIS ABOVE TASKS LIST */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Assign Task to Member</h3>
                <form onSubmit={handleAssignTask} className="flex gap-2 mb-4">
                  <select
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    className="flex-1 border rounded-md p-2 text-sm"
                    required
                  >
                    <option value="">Select Member</option>
                    {members.map(m => (
                      <option key={m.u_id} value={m.u_id}>{m.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Task description"
                    value={memberTaskText}
                    onChange={e => setMemberTaskText(e.target.value)}
                    className="border rounded-md p-2 text-sm"
                    required
                  />
                  <input
                    type="date"
                    value={memberTaskDeadline}
                    onChange={e => setMemberTaskDeadline(e.target.value)}
                    className="border rounded-md p-2 text-sm"
                  />
                  <button type="submit" className="bg-blue-600 text-white rounded-md px-3 text-sm">
                    Assign Task
                  </button>
                </form>
              </div>

              {/* Tasks List */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Group Tasks</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    className="flex-1 border rounded-md p-2 text-sm"
                    placeholder="Task description"
                    value={groupTaskText}
                    onChange={(e) => setGroupTaskText(e.target.value)}
                  />
                  <input
                    type="date"
                    className="border rounded-md p-2 text-sm"
                    value={groupTaskDeadline}
                    onChange={(e) => setGroupTaskDeadline(e.target.value)}
                  />
                  <button
                    className="bg-blue-600 text-white rounded-md px-3 text-sm"
                    onClick={handleCreateTask}
                  >
                    Add
                  </button>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-slate-500 text-sm">No tasks yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {[...tasks]
                      .sort((a, b) => {
                        // First, sort by completed status (incomplete first)
                        if (a.completed !== b.completed) return a.completed ? 1 : -1;
                        // Then, sort by deadline (ascending)
                        const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
                        const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
                        return dateA - dateB;
                      })
                      .map((t) => {
                        const assignedMember = members.find(m => m.u_id === t.user_id);
                        return (
                          <li
                            key={t.id}
                            className={`border rounded-lg p-3 flex items-center justify-between ${
                              t.completed ? 'bg-slate-100 text-slate-400 opacity-70' : 'border-slate-200'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-sm">{t.text}</div>
                              {t.deadline && <div className="text-xs text-slate-500">Due: {new Date(t.deadline).toLocaleDateString()}</div>}
                              {assignedMember && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Assigned to: <span className="font-semibold">{assignedMember.name || assignedMember.email}</span>
                                </div>
                              )}
                              {!t.user_id && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Assigned to: <span className="font-semibold">Group</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={!!t.completed}
                                    onChange={e => handleTaskCompletionChange(t.id, e.target.checked)}
                                  />
                                  Completed
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={t.completion_percent || 0}
                                  onChange={e => handleTaskPercentChange(t.id, Number(e.target.value))}
                                  className="border rounded px-2 py-1 text-xs w-16"
                                />
                                <span className="text-xs">%</span>
                              </div>
                            </div>
                            <button className="text-red-600 text-sm" onClick={() => handleDeleteTask(t.id)}>Delete</button>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupPanel;