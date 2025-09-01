import React from 'react';
import { ToastContainer } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';

const ThemedToastContainer = () => {
  const { isDark } = useTheme();

  return (
    <ToastContainer 
      position="top-right" 
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDark ? "dark" : "light"}
      style={{ zIndex: 9999 }}
    />
  );
};

export default ThemedToastContainer;
