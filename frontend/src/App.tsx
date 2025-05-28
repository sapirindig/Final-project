import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { pages } from "./router";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar/Sidebar";
import LoginPage from "./views/LoginPage/LoginPage"; // כולל גם RegisterForm
import BusinessProfileForm from "./components/BusinessProfileForm/BusinessProfileForm";
import HomePage from "./views/HomePage/HomePage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAuthLoaded } = useContext(AuthContext);

  if (!isAuthLoaded) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    console.log("ProtectedRoute: Not logged in, navigating to /login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();
  const hiddenSidebarRoutes = ["/login", "/register"];
  const isSidebarHidden = hiddenSidebarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {!isSidebarHidden && isLoggedIn && <Sidebar />}

      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn
                ? <Navigate to="/business-profile" replace />
                : <LoginPage />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/business-profile"
            element={
              <ProtectedRoute>
                <BusinessProfileForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          {pages
            .filter(p => !["/", "/home", "/business-profile"].includes(p.path))
            .map(page => (
              <Route
                key={page.path}
                path={page.path}
                element={<ProtectedRoute>{page.element}</ProtectedRoute>}
              />
            ))}
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
