import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const TaskPanel = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch the current logged-in user on mount
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

  // Fetch tasks after user is set
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('task')
        .select('*')
        .eq('user_id', user.id);

      if (error) console.error('Error fetching tasks:', error);
      else setTasks(data);
    };

    fetchTasks();
  }, [user]);

  const addTask = async () => {
    if (!user || !newTask.trim()) {
      console.error('User not logged in or task is empty');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('task')
      .insert([{ user_id: user.id, text: newTask }])
      .select();

    if (error) {
      console.error('Error adding task:', error);
    } else {
      setTasks(prev => [...prev, data[0]]);
      setNewTask('');
    }
    setLoading(false);
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
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow w-[800px] mx-auto shadow-lg dark:bg-slate-700 dark:text-slate-300">
      <h2 className="text-lg font-bold mb-4">Tasks</h2>

      {!user ? (
        <p className="text-gray-500 dark:text-slate-300">Loading...</p>
      ) : (
        <>
          <div className="mb-4 flex">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 rounded-l-lg dark:text-white border border-slate-100 dark:bg-slate-600 dark:border-slate-500 text-sm focus:outline-none hover:border-blue-100 dark:hover:border-slate-400 shadow hover:shadow-md focus:ring-1 focus:ring-blue-200 dark:focus:ring-indigo-500 transition-colors"
              placeholder="Add a new task..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
            />
            <button
              className=" px-4 py-2 w-[100px] shadow-md hover:shadow-lg bg-gradient-to-r from-blue-700 to-blue-400 dark:bg-gradient-to-r dark:from-indigo-900 dark:to-indigo-700 text-white dark:text-slate-100 text-base hover:from-blue-800 hover:to-blue-500 dark:hover:from-indigo-950 dark:hover:to-indigo-800 transform transition-transform duration-200 rounded-r-lg"
              onClick={addTask}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
          <ul>
            {tasks.length === 0 ? (
              <li className="text-gray-500 dark:text-slate-400">No tasks available.</li>
            ) : (
              tasks.map(task => (
                <li
                  key={task.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span>{task.text}</span>
                  <button
                    className="text-red-500 dark:text-red-600 dark:hover:text-red-400 hover:text-red-700 px-2"
                    onClick={() => dismissTask(task.id)}
                  >
                    Dismiss
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default TaskPanel;
