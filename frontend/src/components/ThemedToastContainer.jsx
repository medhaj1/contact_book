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
      newestOnTop={true}
  closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={true}
      draggable={true}
      pauseOnHover={true}
      theme={isDark ? "dark" : "light"}
      style={{ zIndex: 9999 }}
      enableMultiContainer={false}
  limit={3}
  closeButton={false}
      toastClassName="custom-toast"
      bodyClassName="custom-toast-body"
      progressClassName="custom-progress-bar"
    />
  );
};

export default ThemedToastContainer;
