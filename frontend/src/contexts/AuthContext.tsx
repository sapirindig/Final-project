// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// הגדרת ה-interface עבור הערכים שיועברו דרך הקונטקסט
interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  login: () => void;
  logout: () => void;
}

// יצירת הקונטקסט עצמו.
// הערכים ההתחלתיים הם אובייקט שמכיל את כל הפונקציות והמצב,
// במקום undefined. זה פותר את בעיית הטיפוס.
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {}, // יישום ריק
  login: () => {},         // יישום ריק
  logout: () => {},        // יישום ריק
});

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // טען את מצב ההתחברות מ-localStorage כברירת מחדל
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const storedValue = localStorage.getItem('isLoggedIn');
      return storedValue ? JSON.parse(storedValue) : false;
    } catch (error) {
      console.error("Failed to parse 'isLoggedIn' from localStorage:", error);
      return false;
    }
  });

  // אפקט שרץ בכל פעם ש-isLoggedIn משתנה ושומר את הערך ב-localStorage.
  useEffect(() => {
    try {
      localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    } catch (error) {
      console.error("Failed to save 'isLoggedIn' to localStorage:", error);
    }
  }, [isLoggedIn]);

  // פונקציה נוחה לשימוש כדי לחבר משתמש
  const login = () => {
    setIsLoggedIn(true);
    // לוגיקה נוספת לאחר התחברות, למשל שמירת טוקן
  };

  // פונקציה נוחה לשימוש כדי לנתק משתמש
  const logout = () => {
    setIsLoggedIn(false);
    // ניקוי נתוני התחברות מ-localStorage
  };

  const value = {
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook לגישה לקונטקסט של האוטנטיקציה
export const useAuth = (): AuthContextType => { // הגדרת טיפוס החזרה מפורשת
  const context = useContext(AuthContext);
  // הבדיקה עדיין נחוצה למקרה שמישהו משתמש ב-useAuth מחוץ ל-AuthProvider
  // למרות שה-context אינו undefined מבחינת TypeScript, הוא עדיין יכול להיות האובייקט הריק שניתן ב-createContext
  // אם הוא לא עוטף ב-AuthProvider.
  if (!context) { // בדיקה זו תתפוס את המקרה בו הקונטקסט לא סופק כלל, או סופק אובייקט ריק שאינו תקין.
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ייצוא כל המרכיבים הנדרשים
export { AuthContext, AuthProvider };