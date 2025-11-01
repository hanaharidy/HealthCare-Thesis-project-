import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Function to sign in and store token
  const signIn = (userData, token) => {
    setCurrentUser(userData);
    localStorage.setItem('token', token); // Store token in localStorage
  };

  // Function to sign out and clear token
  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('token'); // Remove token from localStorage
  };

  // Check token and fetch user data on app load
  const checkToken = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('http://localhost:8000/users/validate-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
          signOut();
        }
      } catch (err) {
        console.error('Failed to validate token:', err);
        signOut();
      }
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  // The `value` prop contains the data and functions provided by the context
  const value = {
    currentUser,
    setCurrentUser,
    signIn,
    signOut,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
