import React, { useContext } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { pages } from "./router";
import { AuthProvider, AuthContext, useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar/Sidebar";
import LoginPage from "./views/LoginPage/LoginPage"; // רק LoginPage, שכולל את RegisterForm
import BusinessProfileForm from "./components/BusinessProfileForm/BusinessProfileForm";
import HomePage from "./views/HomePage/HomePage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  console.log("ProtectedRoute: isLoggedIn =", isLoggedIn, "for path:", window.location.pathname);
  if (!isLoggedIn) {
    console.log("ProtectedRoute: Not logged in, navigating to /");
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isLoggedIn } = useAuth();
  console.log("AppContent: isLoggedIn =", isLoggedIn);

  return (
    <BrowserRouter>
      <div className="app-container">
        {isLoggedIn && <Sidebar />}

        <div className="main-content">
          <Routes>
            {/* הנתיב הראשי ("/") - השער היחיד לאימות.
                אם המשתמש מחובר, הפנו אותו ל-/business-profile.
                אחרת, הציגו את ה-LoginPage (שמכיל את טופס ההרשמה וההתחברות).
            */}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  console.log("AppContent: User is logged in, redirecting to /business-profile"),
                  <Navigate to="/business-profile" replace />
                ) : (
                  console.log("AppContent: User is NOT logged in, showing LoginPage"),
                  <LoginPage />
                )
              }
            />

            {/* טופס הפרופיל העסקי - חייב להיות מוגן */}
            <Route
              path="/business-profile"
              element={
                <ProtectedRoute>
                  <BusinessProfileForm />
                </ProtectedRoute>
              }
            />

            {/* דף הבית - חייב להיות מוגן */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* שאר הדפים מ־pages - ודאו שהם גם מוגנים ואין נתיבים כפולים */}
            {pages
              .filter((page) => page.path !== "/" && page.path !== "/home" && page.path !== "/business-profile")
              .map((page) => (
                <Route
                  key={page.path}
                  path={page.path}
                  element={
                    <ProtectedRoute>
                      {page.element}
                    </ProtectedRoute>
                  }
                />
              ))}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;