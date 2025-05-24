import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  user: any;
  token: string | null;
  isAuthLoaded: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  token: null,
  isAuthLoaded: false,
});

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setToken(parsed.token || null);
      setIsLoggedIn(true);
    }
    setIsAuthLoaded(true);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, token, isAuthLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
