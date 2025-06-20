"use client";
import React, { useEffect, useState } from "react";
import AuthScreen from "@/components/AuthScreen";
import ChatInterface from "@/components/ChatInterface";

interface UserData {
  id: string;
  email: string;
  username?: string;
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromToken = async () => {
    setIsLoading(true);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profile = await res.json();

      const userData: UserData = {
        id: profile.id,
        email: profile.email,
        username: profile.username,
      };

      setUser(userData);
      localStorage.setItem("user_data", JSON.stringify(userData));
    } catch (error) {
      console.error("Profile fetch error:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const handleAuthenticated = async (authData: any) => {
    // Save token from login response
    if (authData.access_token) {
      localStorage.setItem("auth_token", authData.access_token);
    } else if (authData.token) {
      localStorage.setItem("auth_token", authData.token);
    }

    // Refresh user info by fetching profile
    await loadUserFromToken();
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
