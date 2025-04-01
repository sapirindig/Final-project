import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { pages } from "./router";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar/Sidebar";
import { useContext } from "react";
import LoginPage from "./views/LoginPage/LoginPage";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);
    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const AppContent: React.FC = () => {
    const { isLoggedIn } = useContext(AuthContext);
    
    return (
        <BrowserRouter>
            <div className="app-container">
                {isLoggedIn && <Sidebar />}
                <div className="main-content">
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                isLoggedIn ? (
                                    <Navigate to="/homepage" replace />
                                ) : (
                                    <LoginPage />
                                )
                            } 
                        />
                        {pages.filter(page => page.path !== "/").map((page) => (
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
