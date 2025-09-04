/**
 * Utility to help identify components that could benefit from outside click functionality
 */

/**
 * Identifies potential candidates for outside click enhancement
 * by looking for common patterns in the DOM
 */
export const identifyOutsideClickCandidates = () => {
  const candidates = [];
  
  // Look for dropdowns
  const dropdowns = document.querySelectorAll('[class*="dropdown"], [class*="menu"], [class*="popup"]');
  dropdowns.forEach(element => {
    if (element.style.display !== 'none' && element.offsetParent !== null) {
      candidates.push({
        type: 'dropdown',
        element,
        classes: element.className,
        suggestion: 'Consider adding outside click to dismiss'
      });
    }
  });
  
  // Look for modals without outside click
  const modals = document.querySelectorAll('[class*="modal"], [class*="dialog"], .fixed.inset-0');
  modals.forEach(element => {
    if (element.style.display !== 'none' && element.offsetParent !== null) {
      const hasBackdropClick = element.hasAttribute('data-backdrop-click') || 
                              element.onclick !== null;
      if (!hasBackdropClick) {
        candidates.push({
          type: 'modal',
          element,
          classes: element.className,
          suggestion: 'Consider adding backdrop click to dismiss'
        });
      }
    }
  });
  
  // Look for floating elements
  const floating = document.querySelectorAll('[class*="float"], [class*="fixed"], [class*="absolute"]');
  floating.forEach(element => {
    if (element.style.display !== 'none' && 
        element.offsetParent !== null && 
        element.querySelector('button, [role="button"]')) {
      candidates.push({
        type: 'floating',
        element,
        classes: element.className,
        suggestion: 'Check if outside click would improve UX'
      });
    }
  });
  
  return candidates;
};

/**
 * Logs potential outside click enhancement opportunities to console
 */
export const auditOutsideClickOpportunities = () => {
  console.group('🎯 Outside Click Enhancement Audit');
  
  const candidates = identifyOutsideClickCandidates();
  
  if (candidates.length === 0) {
    console.log('✅ No obvious candidates found - great job!');
  } else {
    console.log(`Found ${candidates.length} potential candidates:`);
    candidates.forEach((candidate, index) => {
      console.group(`${index + 1}. ${candidate.type.toUpperCase()}`);
      console.log('Element:', candidate.element);
      console.log('Classes:', candidate.classes);
      console.log('💡 Suggestion:', candidate.suggestion);
      console.groupEnd();
    });
  }
  
  console.groupEnd();
};

/**
 * Hook to automatically audit for outside click opportunities in development
 */
export const useOutsideClickAudit = (enabled = process.env.NODE_ENV === 'development') => {
  if (typeof window === 'undefined' || !enabled) return;
  
  // Run audit after component updates
  setTimeout(() => {
    auditOutsideClickOpportunities();
  }, 1000);
};
