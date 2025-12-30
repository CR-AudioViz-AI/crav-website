// /hooks/useRBAC.ts
// Role-Based Access Control Hook - CR AudioViz AI
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// Types
interface Role {
  id: string;
  name: string;
  display_name: string;
  level: number;
}

interface UserRole {
  id: string;
  role_id: string;
  organization_id: string | null;
  granted_at: string;
  expires_at: string | null;
  role: Role;
}

interface RBACContextType {
  userId: string | null;
  roles: UserRole[];
  permissions: string[];
  highestRole: Role | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  hasMinimumRole: (minLevel: number) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  isVendor: () => boolean;
  refreshRoles: () => Promise<void>;
}

// Permission check helper
const checkPermission = (permissions: string[], required: string): boolean => {
  // Direct match
  if (permissions.includes(required)) return true;
  
  // Check for manage permission (grants all actions on resource)
  const [resource] = required.split(':');
  if (permissions.includes(`${resource}:manage`)) return true;
  
  // Check for :all scope when :own is required
  const allVersion = required.replace(':own', ':all');
  if (permissions.includes(allVersion)) return true;
  
  return false;
};

// Context
const RBACContext = createContext<RBACContextType | null>(null);

// Provider
export function RBACProvider({ 
  children, 
  userId 
}: { 
  children: ReactNode; 
  userId: string | null;
}) {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [highestRole, setHighestRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!userId) {
      setRoles([]);
      setPermissions([]);
      setHighestRole(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch user roles
      const rolesRes = await fetch(`/api/rbac?action=user-roles&userId=${userId}`);
      const rolesData = await rolesRes.json();
      
      if (rolesData.userRoles) {
        setRoles(rolesData.userRoles);
        setHighestRole(rolesData.highestRole || null);
      }

      // Fetch permissions
      const permsRes = await fetch(`/api/rbac?action=user-permissions&userId=${userId}`);
      const permsData = await permsRes.json();
      
      if (permsData.permissions) {
        setPermissions(permsData.permissions);
      }

    } catch (error) {
      console.error('Failed to fetch RBAC data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasPermission = useCallback((permission: string): boolean => {
    return checkPermission(permissions, permission);
  }, [permissions]);

  const hasRole = useCallback((roleName: string): boolean => {
    return roles.some(ur => ur.role?.name === roleName);
  }, [roles]);

  const hasMinimumRole = useCallback((minLevel: number): boolean => {
    return (highestRole?.level || 0) >= minLevel;
  }, [highestRole]);

  const isAdmin = useCallback((): boolean => {
    return hasMinimumRole(90); // admin level
  }, [hasMinimumRole]);

  const isModerator = useCallback((): boolean => {
    return hasMinimumRole(70); // moderator level
  }, [hasMinimumRole]);

  const isVendor = useCallback((): boolean => {
    return hasRole('vendor') || hasMinimumRole(50);
  }, [hasRole, hasMinimumRole]);

  const value: RBACContextType = {
    userId,
    roles,
    permissions,
    highestRole,
    isLoading,
    hasPermission,
    hasRole,
    hasMinimumRole,
    isAdmin,
    isModerator,
    isVendor,
    refreshRoles: fetchRoles
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
}

// Hook
export function useRBAC(): RBACContextType {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
}

// Permission Gate Component
export function PermissionGate({
  children,
  permission,
  fallback = null,
  showLoading = false
}: {
  children: ReactNode;
  permission: string | string[];
  fallback?: ReactNode;
  showLoading?: boolean;
}) {
  const { hasPermission, isLoading } = useRBAC();

  if (isLoading && showLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = permissions.some(p => hasPermission(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Role Gate Component
export function RoleGate({
  children,
  role,
  minLevel,
  fallback = null
}: {
  children: ReactNode;
  role?: string | string[];
  minLevel?: number;
  fallback?: ReactNode;
}) {
  const { hasRole, hasMinimumRole } = useRBAC();

  let hasAccess = false;

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    hasAccess = roles.some(r => hasRole(r));
  }

  if (minLevel !== undefined) {
    hasAccess = hasAccess || hasMinimumRole(minLevel);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Admin Gate Component
export function AdminGate({
  children,
  fallback = null
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin } = useRBAC();

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Utility: Assign role to user
export async function assignRole(
  userId: string,
  roleName: string,
  options?: {
    organizationId?: string;
    grantedBy?: string;
    expiresAt?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/rbac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        roleName,
        ...options
      })
    });

    const data = await res.json();
    
    if (!res.ok) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to assign role' };
  }
}

// Utility: Remove role from user
export async function removeRole(
  userId: string,
  roleId: string,
  organizationId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let url = `/api/rbac?userId=${userId}&roleId=${roleId}`;
    if (organizationId) {
      url += `&organizationId=${organizationId}`;
    }

    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to remove role' };
  }
}

// Utility: Check permission (server-side compatible)
export async function checkUserPermission(
  userId: string,
  permission: string,
  organizationId?: string
): Promise<boolean> {
  try {
    let url = `/api/rbac?action=check-permission&userId=${userId}&permission=${permission}`;
    if (organizationId) {
      url += `&organizationId=${organizationId}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    return data.hasPermission || false;
  } catch (error) {
    return false;
  }
}

// Role levels for reference
export const ROLE_LEVELS = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  MODERATOR: 70,
  SUPPORT: 60,
  VENDOR: 50,
  CREATOR: 40,
  SUBSCRIBER: 30,
  USER: 10,
  GUEST: 0
} as const;

// Common permissions for reference
export const PERMISSIONS = {
  // Users
  USERS_READ_OWN: 'users:read:own',
  USERS_UPDATE_OWN: 'users:update:own',
  USERS_READ_ALL: 'users:read:all',
  USERS_MANAGE: 'users:manage',
  
  // Products
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_READ_OWN: 'products:read:own',
  PRODUCTS_UPDATE_OWN: 'products:update:own',
  PRODUCTS_DELETE_OWN: 'products:delete:own',
  PRODUCTS_MANAGE: 'products:manage',
  
  // Orders
  ORDERS_CREATE: 'orders:create',
  ORDERS_READ_OWN: 'orders:read:own',
  ORDERS_READ_ALL: 'orders:read:all',
  ORDERS_MANAGE: 'orders:manage',
  
  // Moderation
  MODERATION_READ: 'moderation:read',
  MODERATION_APPROVE: 'moderation:approve',
  MODERATION_REJECT: 'moderation:reject',
  MODERATION_MANAGE: 'moderation:manage',
  
  // Analytics
  ANALYTICS_READ_OWN: 'analytics:read:own',
  ANALYTICS_READ_ALL: 'analytics:read:all',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Admin
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_ROLES: 'admin:roles'
} as const;

export default useRBAC;
