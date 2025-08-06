import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const TaskPanel = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const getTaskStatus = (deadline) => {
    if (!deadline) return { status: 'no-deadline', class: '', badge: '', badgeClass: '' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'overdue',
        class: 'border-l-4 border-red-600 bg-red-50 dark:bg-red-900 dark:bg-opacity-40',
        badge: `🚨 Overdue (${Math.abs(diffDays)} days)`,
        badgeClass: 'bg-red-100 text-red-800'
      };
    } else if (diffDays === 0) {
      return {
        status: 'due-today',
        class: 'border-l-4 border-orange-600 bg-orange-50 dark:bg-orange-900 dark:bg-opacity-40',
        badge: '🚨 Due Today',
        badgeClass: 'bg-orange-100 text-orange-900'
      };
    } else if (diffDays === 1) {
      return {
        status: 'due-tomorrow',
        class: 'border-l-4 border-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-40',
        badge: '⚠️ Due Tomorrow',
        badgeClass: 'bg-yellow-100 text-yellow-800'
      };
    } else if (diffDays <= 3) {
      return {
        status: 'due-soon',
        class: 'border-l-4 border-green-600 bg-green-50 dark:bg-green-900 dark:bg-opacity-40 ',
        badge: `📅 Due in ${diffDays} days`,
        badgeClass: 'bg-green-100 text-green-800'
      };
    
    } else {
      return {
        status: 'normal',
        class: 'border-l-4 border-gray-400 bg-gray-50 dark:bg-slate-600',
        badge: `📅 Due in ${diffDays} days`,
        badgeClass: 'bg-gray-100 text-gray-800'
      };
    }
  };

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

  useEffect(() => {
    if (!user) return;
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
    }
  };

  return (
    <div className="p-6 rounded-[1.25rem] w-full max-w-3xl mx-auto mt-10 bg-white dark:bg-slate-700 shadow-xl border border-slate-200 dark:border-slate-500">
      <h2 className="text-3xl font-bold mb-6 text-blue-900 border-b pb-3 border-slate-300 dark:text-indigo-300 dark:border-slate-400 text-center">📝 My Tasks</h2>

      {!user ? (
        <p className="text-gray-500 dark:text-slate-400 text-center">Loading user...</p>
      ) : (
        <>
          {getUrgentTasks().length > 0 && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-indigo-900 dark:bg-opacity-50 border border-orange-200 dark:border-indigo-900 rounded-lg shadow-inner shadow-xl">
              <h3 className="text-lg font-semibold text-red-700 dark:text-indigo-200 mb-3 flex items-center">
                🔔 Urgent Reminders ({getUrgentTasks().length})
              </h3>
              <div className="space-y-2">
                {getUrgentTasks().slice(0, 3).map(task => {
                  const taskStatus = getTaskStatus(task.deadline);
                  return (
                    <div key={task.id} className="flex items-center justify-between text-sm">
                      <span className="text-base text-gray-700 dark:text-slate-100 truncate flex-1">{task.text}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatus.badgeClass} ml-2`}>
                        {taskStatus.badge}
                      </span>
                    </div>
                  );
                })}
                {getUrgentTasks().length > 3 && (
                  <p className="text-xs text-gray-600 dark:text-slate-300 text-center mt-2">
                    +{getUrgentTasks().length - 3} more urgent tasks
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-blue-800 dark:text-indigo-300 font-semibold mb-1">Task Description</label>
              <input
                type="text"
                className="w-full dark:text-slate-200 dark:bg-slate-600 dark:border-slate-500 border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:ring-1 hover:ring-blue-300 dark:focus:ring-indigo-300 dark:hover:ring-indigo-300 transition"
                placeholder="Enter task..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-blue-800 dark:text-indigo-300 font-semibold mb-1">Deadline Date</label>
              <input
                type="date"
                className="w-full text-slate-500 dark:text-slate-300 dark:bg-slate-600 dark:border-slate-500 border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:ring-1 hover:ring-blue-300 dark:focus:ring-indigo-300 dark:hover:ring-indigo-300 transition"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-800 to-blue-400 hover:from-blue-900 hover:to-blue-500 dark:from-indigo-800 dark:to-indigo-400 dark:hover:from-indigo-900 dark:hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
              onClick={addTask}
              disabled={loading}
            >
              {loading ? 'Adding...' : '+ Add Task'}
            </button>
          </div>

          <ul className="space-y-4">
            {tasks.length === 0 ? (
              <li className="text-slate-500 dark:text-slate-400 text-center italic">No tasks available. 🎉</li>
            ) : (
              tasks.map(task => {
                const taskStatus = getTaskStatus(task.deadline);
                return (
                  <li
                    key={task.id}
                    className={`p-4 rounded-xl shadow-md flex justify-between items-start ${taskStatus.class} transition-transform hover:scale-[1.01]`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-slate-300">{task.text}</p>
                      {task.deadline && (
                        <div className="mt-2 flex items-center space-x-2">
                          <p className="text-sm text-gray-600 dark:text-slate-300">
                            📅 Deadline: <span className="font-medium">{task.deadline}</span>
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatus.badgeClass}`}>
                            {taskStatus.badge}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 dark:text-red-700 dark:hover:text-red-500 hover:underline font-medium text-sm ml-4 flex-shrink-0"
                      onClick={() => dismissTask(task.id)}
                    >
                      Dismiss
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