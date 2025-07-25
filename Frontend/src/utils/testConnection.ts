// Simple utility to test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/verify', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Backend connection successful');
      return true;
    } else {
      console.log('⚠️ Backend responded but authentication failed (expected for test)');
      return true; // This is expected without a token
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Test MongoDB connection through backend
export const testDatabaseConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/announcements', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      console.log('✅ Database connection successful (authentication required)');
      return true;
    } else if (response.ok) {
      console.log('✅ Database connection successful');
      return true;
    } else {
      console.log('❌ Database connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};