// Protected Route Component - Redirects to login if not authenticated
import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: string;
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, can } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // Show loading spinner while checking auth
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login with return URL
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    if (requiredPermission && !can(requiredPermission)) {
        // User doesn't have required permission
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Access Denied</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
