import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { setHasCompletedOnboarding } = useStore();

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    
    console.log("ProtectedRoute - checking auth:", { userId, authToken });
    
    // For development: if no auth data exists, create demo user
    if (!userId || !authToken) {
      console.log("ProtectedRoute - creating demo user");
      // Set demo user data for development
      localStorage.setItem("userId", "demo-user-123");
      localStorage.setItem("userName", "Demo User");
      localStorage.setItem("userEmail", "demo@nexora.com");
      localStorage.setItem("userCredits", "20");
      localStorage.setItem("userSubscription", "free");
      localStorage.setItem("authToken", "demo-token-123");
      
      // Skip onboarding for demo user
      setHasCompletedOnboarding(true);
      
      console.log("ProtectedRoute - demo user created, setting authenticated");
      // Small delay to ensure localStorage is set before rendering
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 100);
    } else {
      console.log("ProtectedRoute - existing user found");
      setIsAuthenticated(!!(userId && authToken));
    }
  }, [setHasCompletedOnboarding]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
