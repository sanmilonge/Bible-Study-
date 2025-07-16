import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import BibleReader from "./components/BibleReader";
import Home from "./components/Home";
import Friends from "./components/Friends";
import Reminders from "./components/Reminders";
import Chat from "./components/Chat";
import Notes from "./components/Notes";
import Settings from "./components/Settings";
import { Toaster } from "./components/ui/toaster";
import { authAPI } from "./services/api";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const userInfo = await authAPI.getCurrentUser();
                    setUser(userInfo);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // Clear invalid token
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AuthPage onLogin={handleLogin} />;
    }

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/bible" element={<BibleReader user={user} />} />
                    <Route path="/friends" element={<Friends user={user} />} />
                    <Route path="/reminders" element={<Reminders user={user} />} />
                    <Route path="/chat" element={<Chat user={user} />} />
                    <Route path="/notes" element={<Notes user={user} />} />
                    <Route path="/settings" element={<Settings user={user} onLogout={handleLogout} />} />
                </Routes>
            </BrowserRouter>
            <Toaster />
        </div>
    );
}

export default App;

