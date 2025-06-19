"use client";
import React, { useEffect, useState } from "react";
import AuthScreen from "@/components/AuthScreen";
import ChatInterface from "@/components/ChatInterface";

interface UserData {
  id: string;
  email: string;
  username?: string;
  token?: string;
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }

    setIsLoading(false);
  }, []);

  const handleAuthenticated = (authData: any) => {
    const userData: UserData = {
      id: authData.user?.id || authData.id,
      email: authData.user?.email || authData.email,
      username: authData.user?.username || authData.username,
      token: authData.token,
    };

    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return <ChatInterface user={user} onLogout={handleLogout} />;
}

export default App;
