import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { pages } from "./router";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar/Sidebar";
import LoginPage from "./views/LoginPage/LoginPage";
import { useContext } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isAuthLoaded } = useContext(AuthContext);

  if (!isAuthLoaded) {
    return <div>Loading...</div>; 
  }

  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  const hiddenSidebarRoutes = ["/login", "/register"];
  const isSidebarHidden = hiddenSidebarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {!isSidebarHidden && isLoggedIn && <Sidebar />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          {pages.map((page) => (
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

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
