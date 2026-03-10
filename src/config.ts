export const getApiUrl = () => {
  // If VITE_API_URL is set (e.g. for production build pointing to a specific server), use it.
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use relative path to ensure we hit the same server that served the page.
  return '';
};
