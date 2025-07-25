// Utility to clear authentication data - useful for debugging
export const clearAllAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  console.log('✅ Cleared all authentication data');
};

// Run this in browser console if needed
if (typeof window !== 'undefined') {
  (window as any).clearAuth = clearAllAuthData;
}