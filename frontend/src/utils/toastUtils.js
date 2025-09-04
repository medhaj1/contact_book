import { toast } from 'react-toastify';

// Standardized toast functions that respect global configuration
export const showSuccessToast = (message) => {
  return toast.success(message);
};

export const showErrorToast = (message) => {
  return toast.error(message);
};

export const showWarningToast = (message) => {
  return toast.warning(message);
};

export const showInfoToast = (message) => {
  return toast.info(message);
};

// For custom toast options when needed (but prefer using global config)
export const showToastWithOptions = (message, type = 'info', options = {}) => {
  const defaultOptions = {
    // Only override if absolutely necessary
    // Most options should come from ThemedToastContainer
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  switch (type) {
    case 'success':
      return toast.success(message, finalOptions);
    case 'error':
      return toast.error(message, finalOptions);
    case 'warning':
      return toast.warning(message, finalOptions);
    case 'info':
    default:
      return toast.info(message, finalOptions);
  }
};

// Utility to dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Utility to dismiss a specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
