import { useEffect, useRef } from 'react';

/**
 * Hook to handle outside clicks for dropdowns, modals, and other components
 * @param {function} callback - Function to call when outside click is detected
 * @param {boolean} enabled - Whether the outside click detection is enabled
 * @param {Array} excludeRefs - Array of refs to exclude from outside click detection
 */
export const useOutsideClick = (callback, enabled = true, excludeRefs = []) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event) => {
      // Check if click is outside the main ref
      if (ref.current && !ref.current.contains(event.target)) {
        // Check if click is not in any excluded refs
        const isClickInExcludedArea = excludeRefs.some(excludeRef => 
          excludeRef.current && excludeRef.current.contains(event.target)
        );
        
        if (!isClickInExcludedArea) {
          callback();
        }
      }
    };

    // Add listener for mouse and touch events
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [callback, enabled, excludeRefs]);

  return ref;
};

/**
 * Hook to handle escape key press
 * @param {function} callback - Function to call when escape is pressed
 * @param {boolean} enabled - Whether the escape key detection is enabled
 */
export const useEscapeKey = (callback, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, enabled]);
};

/**
 * Combined hook for handling both outside clicks and escape key
 * @param {function} callback - Function to call when outside click or escape is detected
 * @param {boolean} enabled - Whether the detection is enabled
 * @param {Array} excludeRefs - Array of refs to exclude from outside click detection
 */
export const useClickAwayAndEscape = (callback, enabled = true, excludeRefs = []) => {
  const ref = useOutsideClick(callback, enabled, excludeRefs);
  useEscapeKey(callback, enabled);
  return ref;
};

/**
 * Hook specifically for modal/popup components
 * @param {function} onClose - Function to call when modal should close
 * @param {boolean} isOpen - Whether the modal is currently open
 * @param {boolean} closeOnBackdropClick - Whether clicking the backdrop should close modal
 * @param {boolean} closeOnEscape - Whether pressing escape should close modal
 */
export const useModalControls = (
  onClose, 
  isOpen = true, 
  closeOnBackdropClick = true, 
  closeOnEscape = true
) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleBackdropClick = (event) => {
      if (closeOnBackdropClick && modalRef.current && event.target === modalRef.current) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (closeOnBackdropClick) {
      document.addEventListener('mousedown', handleBackdropClick);
    }
    
    if (closeOnEscape) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleBackdropClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, closeOnBackdropClick, closeOnEscape]);

  return modalRef;
};
