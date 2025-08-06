import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const TaskPanel = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

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
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset today's time

      data.forEach(task => {
        if (!task.deadline) return;

        // Convert string to date safely
        const deadlineDate = new Date(task.deadline);
        deadlineDate.setHours(0, 0, 0, 0); // Reset time

        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log(`[DEBUG] Task: "${task.text}", Deadline: ${deadlineDate.toISOString().split("T")[0]}, Days Left: ${diffDays}`);

        if (diffDays === 7) {
          toast.info(`⏰ Reminder: "${task.text}" is due in 7 days!`);
        } else if (diffDays === 0) {
          toast.warning(`🚨 ALERT: "${task.text}" is due today!`);
        }
      });

      setTasks(data);
    }
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
      .insert([{ user_id: user.id, text: newTask, deadline }])
      .select();

    if (error) {
      console.error('Error adding task:', error);
    } else {
      setTasks(prev => [...prev, data[0]]);
      setNewTask('');
      setDeadline('');
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
  <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-md mx-auto mt-10 border border-gray-200">
    <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">📝 My Tasks</h2>

    {!user ? (
      <p className="text-gray-500 text-center">Loading user...</p>
    ) : (
      <>
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
            tasks.map(task => (
              <li
                key={task.id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold text-gray-800">{task.text}</p>
                  {task.deadline && (
                    <p className="text-sm text-gray-600 mt-1">
                      📅 Deadline: <span className="font-medium">{task.deadline}</span>
                    </p>
                  )}
                </div>
                <button
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                  onClick={() => dismissTask(task.id)}
                >
                  ✖ Dismiss
                </button>
              </li>
            ))
          )}
        </ul>
        <ToastContainer position="top-right" autoClose={5000} />
      </>
    )}
  </div>
);

};

export default TaskPanel;
