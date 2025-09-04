import { useEffect } from 'react';

// Debug component to identify clicking issues
const ClickDebugger = () => {
  useEffect(() => {
    const handleClick = (e) => {
      // Log click events to help debug
      console.log('Click detected on:', e.target);
      console.log('Event propagation stopped:', e.defaultPrevented);
      console.log('Element classes:', e.target.className);
      console.log('Z-index:', window.getComputedStyle(e.target).zIndex);
    };

    const handlePointerEvents = (e) => {
      const computedStyle = window.getComputedStyle(e.target);
      if (computedStyle.pointerEvents === 'none') {
        console.warn('Element has pointer-events: none', e.target);
      }
    };

    // Add global event listeners for debugging
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseenter', handlePointerEvents, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseenter', handlePointerEvents, true);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ClickDebugger;
