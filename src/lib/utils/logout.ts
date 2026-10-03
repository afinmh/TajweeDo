/**
 * Utility function to perform complete logout
 * Clears all storage, cache, and cookies
 */
export async function performCompleteLogout() {
  try {
    // 1. Call logout API to clear server-side session/cookie
    await fetch('/api/auth/logout', { 
      method: 'POST', 
      cache: 'no-store' 
    });
  } catch (error) {
    console.error('Logout API error:', error);
  }

  // 2. Clear all localStorage
  try {
    localStorage.clear();
  } catch (error) {
    console.error('localStorage clear error:', error);
  }

  // 3. Clear all sessionStorage
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('sessionStorage clear error:', error);
  }

  // 4. Clear all IndexedDB databases
  try {
    if (window.indexedDB && window.indexedDB.databases) {
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });
    }
  } catch (error) {
    console.error('IndexedDB clear error:', error);
  }

  // 5. Tell Service Worker to clear all caches
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ 
        type: 'LOGOUT_CLEAR_ALL' 
      });
      
      // Give service worker time to clear caches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Service Worker message error:', error);
  }

  // 6. Manually clear all caches from client side
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  } catch (error) {
    console.error('Caches clear error:', error);
  }

  // 7. Unregister service workers
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }
  } catch (error) {
    console.error('Service Worker unregister error:', error);
  }

  // 8. Clear cookies manually (as backup)
  try {
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      const domain = window.location.hostname;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  } catch (error) {
    console.error('Cookie clear error:', error);
  }

  // 9. Redirect to home page with force reload (no cache)
  window.location.href = '/?_=' + Date.now();
}
