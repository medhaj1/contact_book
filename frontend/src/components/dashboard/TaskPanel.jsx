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
    <div className="p-6 bg-white rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Tasks</h2>

      {!user ? (
        <p className="text-gray-500">Loading user...</p>
      ) : (
        <>
          <div className="mb-4 flex">
            <input
              type="text"
              className="border p-2 flex-1 rounded-l"
              placeholder="Add a new task..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 rounded-r"
              onClick={addTask}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
          <ul>
            {tasks.length === 0 ? (
              <li className="text-gray-500">No tasks available.</li>
            ) : (
              tasks.map(task => (
                <li
                  key={task.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span>{task.text}</span>
                  <button
                    className="text-red-500 hover:text-red-700 px-2"
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
