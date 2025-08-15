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
} from '../../services/groupService';
import { supabase } from '../../supabaseClient';

const GroupPanel = ({ currentUser }) => {
  const currentUserId = currentUser?.id;
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');

  const [taskText, setTaskText] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  const selectedGroup = useMemo(() => groups.find((g) => g.id === selectedGroupId) || null, [groups, selectedGroupId]);

  useEffect(() => {
    if (!currentUserId) return;
    (async () => {
      const res = await getUserGroups(currentUserId);
      if (res.success) setGroups(res.data);
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
      alert(res.error || 'Failed to create group');
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
      alert(res.error || 'Failed to add member');
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
      alert(res.error || 'Failed to add task');
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
      alert(res.error || 'Failed to leave');
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
              {!isProtectedRole(g.role) && (
                <button className="text-xs text-red-600 mt-2" onClick={(e) => { e.stopPropagation(); handleLeaveGroup(g.id); }}>Leave</button>
              )}
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
                  {tasks.map((t) => (
                    <li key={t.id} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{t.text}</div>
                        {t.deadline && <div className="text-xs text-slate-500">Due: {new Date(t.deadline).toLocaleDateString()}</div>}
                      </div>
                      <button className="text-red-600 text-sm" onClick={() => handleDeleteTask(t.id)}>Delete</button>
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