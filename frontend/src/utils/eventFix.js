import { useEffect } from 'react';

// Hook to fix clicking and hover issues
export const useEventFix = () => {
  useEffect(() => {
    // Run only in development to avoid unexpected style overrides in production
    const isProd = (
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD) ||
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production')
    );
    if (isProd) return;

    // Fix for elements that lose clickability
    const fixClickableElements = () => {
      // Find all potentially problematic elements
      const buttons = document.querySelectorAll('button, [role="button"], a');
      const interactiveElements = document.querySelectorAll('input, select, textarea');
      
      [...buttons, ...interactiveElements].forEach(element => {
        // Ensure they have proper pointer events
        if (window.getComputedStyle(element).pointerEvents === 'none') {
          element.style.pointerEvents = 'auto';
        }
        
        // Hint cursor for clearly clickable elements (non-invasive)
        if (!element.disabled && !element.style.cursor && (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button')) {
          element.style.cursor = 'pointer';
        }
      });
    };

    // Fix z-index conflicts
    const fixZIndexConflicts = () => {
      // Ensure toast container is always on top
      const toastContainer = document.querySelector('.Toastify__toast-container');
      if (toastContainer) {
        toastContainer.style.zIndex = '10000';
        toastContainer.style.pointerEvents = 'none';
      }

      // Fix individual toasts to be clickable
      const toasts = document.querySelectorAll('.Toastify__toast');
      toasts.forEach(toast => {
        toast.style.pointerEvents = 'auto';
      });
    };

    // Run fixes initially
    fixClickableElements();
    fixZIndexConflicts();

    // Set up mutation observer to fix dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          fixClickableElements();
          fixZIndexConflicts();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up on unmount
    return () => {
      observer.disconnect();
    };
  }, []);
};

// Hook to debug clicking issues
export const useClickDebug = (enabled = false) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e) => {
      console.log('🖱️ Click Event:', {
        target: e.target,
        tagName: e.target.tagName,
        className: e.target.className,
        pointerEvents: window.getComputedStyle(e.target).pointerEvents,
        zIndex: window.getComputedStyle(e.target).zIndex,
        position: window.getComputedStyle(e.target).position,
        disabled: e.target.disabled,
        defaultPrevented: e.defaultPrevented
      });
    };

    const handleMouseEnter = (e) => {
      const style = window.getComputedStyle(e.target);
      if (style.pointerEvents === 'none') {
        console.warn('⚠️ Element has pointer-events: none', e.target);
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseenter', handleMouseEnter, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [enabled]);
};
