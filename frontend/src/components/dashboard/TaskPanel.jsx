import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';


const TaskPanel = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to get task status and styling
  const getTaskStatus = (deadline) => {
    if (!deadline) return { status: 'no-deadline', class: '', badge: '' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        status: 'overdue',
        class: 'border-l-4 border-red-500 bg-red-50',
        badge: `🚨 Overdue (${Math.abs(diffDays)} days)`,
        badgeClass: 'bg-red-100 text-red-800'
      };
    } else if (diffDays === 0) {
      return {
        status: 'due-today',
        class: 'border-l-4 border-orange-500 bg-orange-50',
        badge: '🚨 Due Today',
        badgeClass: 'bg-orange-100 text-orange-800'
      };
    } else if (diffDays === 1) {
      return {
        status: 'due-tomorrow',
        class: 'border-l-4 border-yellow-500 bg-yellow-50',
        badge: '⚠️ Due Tomorrow',
        badgeClass: 'bg-yellow-100 text-yellow-800'
      };
    } else if (diffDays <= 3) {
      return {
        status: 'due-soon',
        class: 'border-l-4 border-blue-500 bg-blue-50',
        badge: `📅 Due in ${diffDays} days`,
        badgeClass: 'bg-blue-100 text-blue-800'
      };
    } else if (diffDays <= 7) {
      return {
        status: 'due-week',
        class: 'border-l-4 border-green-500 bg-green-50',
        badge: `⏰ Due in ${diffDays} days`,
        badgeClass: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        status: 'normal',
        class: 'border-l-4 border-gray-200 bg-gray-50',
        badge: `📅 Due in ${diffDays} days`,
        badgeClass: 'bg-gray-100 text-gray-800'
      };
    }
  };

  // Get urgent tasks for reminder section
  const getUrgentTasks = () => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const status = getTaskStatus(task.deadline).status;
      return ['overdue', 'due-today', 'due-tomorrow', 'due-soon'].includes(status);
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) console.error('Error fetching user:', error);
      else setUser(user);
    };

    getUser();
  }, []);

  // Fetch tasks when user is set
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('task')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data);
    }
  };

  const addTask = async () => {
    if (!user || !newTask.trim()) {
      alert('Please enter a task description');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task')
        .insert([{ user_id: user.id, text: newTask, deadline }])
        .select();

      if (error) throw error;
      
      setTasks(prev => [...prev, data[0]]);
      setNewTask('');
      setDeadline('');
      // Simple success feedback without popup
      console.log('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dismissTask = async (taskId) => {
    if (!user) return;

    const { error } = await supabase
      .from('task')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      console.log('Task dismissed successfully!');
    }
  };

  return (
  <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-md mx-auto mt-10 border border-gray-200">
    <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">📝 My Tasks</h2>

    {!user ? (
      <p className="text-gray-500 text-center">Loading user...</p>
    ) : (
      <>
        {/* Urgent Tasks Reminder Section */}
        {getUrgentTasks().length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
              🔔 Urgent Reminders ({getUrgentTasks().length})
            </h3>
            <div className="space-y-2">
              {getUrgentTasks().slice(0, 3).map(task => {
                const taskStatus = getTaskStatus(task.deadline);
                return (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 truncate flex-1">{task.text}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatus.badgeClass} ml-2`}>
                      {taskStatus.badge}
                    </span>
                  </div>
                );
              })}
              {getUrgentTasks().length > 3 && (
                <p className="text-xs text-gray-600 text-center mt-2">
                  +{getUrgentTasks().length - 3} more urgent tasks
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Task Description</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter task..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Deadline Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
            onClick={addTask}
            disabled={loading}
          >
            {loading ? 'Adding...' : '➕ Add Task'}
          </button>
        </div>

        <ul className="space-y-4">
          {tasks.length === 0 ? (
            <li className="text-gray-500 text-center">No tasks available.</li>
          ) : (
            tasks.map(task => {
              const taskStatus = getTaskStatus(task.deadline);
              return (
                <li
                  key={task.id}
                  className={`p-4 rounded-lg shadow-sm flex justify-between items-start ${taskStatus.class}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{task.text}</p>
                    {task.deadline && (
                      <div className="mt-2 flex items-center space-x-2">
                        <p className="text-sm text-gray-600">
                          📅 Deadline: <span className="font-medium">{task.deadline}</span>
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatus.badgeClass}`}>
                          {taskStatus.badge}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 font-medium text-sm ml-4 flex-shrink-0"
                    onClick={() => dismissTask(task.id)}
                  >
                    ✖ Dismiss
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </>
    )}
  </div>
);

};

export default TaskPanel;
