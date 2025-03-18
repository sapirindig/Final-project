import { BrowserRouter, Route, Routes } from "react-router-dom";
import { pages } from "./router";
import { Navbar } from "./components/Navbar/Navbar";
import { AuthProvider } from "./contexts/AuthContext";

const App: React.FC = () => {
    
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    {pages.map((page) => (
                        <Route key={page.path} path={page.path} element={page.element} />
                    ))}    
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;