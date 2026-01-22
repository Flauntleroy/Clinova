// usePermissions hook - Check user permissions for RBAC
// Uses the useAuth hook to get user permissions

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface UsePermissionsReturn {
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
}

export function usePermissions(): UsePermissionsReturn {
    const { user, can } = useAuth();

    // Get permissions from user object (if available)
    const permissions: string[] = user?.permissions || [];

    const hasPermission = useCallback((permission: string): boolean => {
        return can(permission);
    }, [can]);

    const hasAnyPermission = useCallback((perms: string[]): boolean => {
        return perms.some((p) => can(p));
    }, [can]);

    const hasAllPermissions = useCallback((perms: string[]): boolean => {
        return perms.every((p) => can(p));
    }, [can]);

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}

export default usePermissions;
