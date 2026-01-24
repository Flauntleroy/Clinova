// Menu Configuration - Single Source of Truth
// Pure data only, no JSX/React components
// RULE: Every menu MUST have a permission (no optional permissions)

export type MenuIconType =
    | 'grid'
    | 'calendar'
    | 'user'
    | 'list'
    | 'table'
    | 'page'
    | 'chart'
    | 'box'
    | 'plugin';

export interface MenuItemConfig {
    id: string;
    label: string;
    path?: string;
    icon: MenuIconType;
    permission: string; // REQUIRED - use 'public.access' for public menus
    children?: Omit<MenuItemConfig, 'icon' | 'children'>[];
    badges?: Array<{ type: 'new' | 'pro' }>;
}

export interface MenuSection {
    id: string;
    title: string;
    items: MenuItemConfig[];
}

// ============================================
// PERMISSION CONSTANTS
// ============================================
export const PERMISSIONS = {
    PUBLIC: 'public.access',
    // Admin
    USER_MANAGEMENT: 'usermanagement.read',
    ROLE_MANAGEMENT: 'rolemanagement.read',
    AUDIT_LOG: 'auditlog.read',
    // Vedika
    VEDIKA: 'vedika.read',
} as const;

// ============================================
// MENU SECTIONS - Add new menus here only!
// ============================================

export const menuSections: MenuSection[] = [
    // ========== MENU SECTION ==========
    {
        id: 'menu',
        title: 'Menu',
        items: [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: 'grid',
                permission: PERMISSIONS.PUBLIC,
                children: [
                    { id: 'dashboard-ecommerce', label: 'Ecommerce', path: '/', permission: PERMISSIONS.PUBLIC },
                ],
            },
            {
                id: 'calendar',
                label: 'Calendar',
                path: '/calendar',
                icon: 'calendar',
                permission: PERMISSIONS.PUBLIC,
            },
            {
                id: 'profile',
                label: 'User Profile',
                path: '/profile',
                icon: 'user',
                permission: PERMISSIONS.PUBLIC,
            },
            {
                id: 'vedika',
                label: 'Vedika',
                icon: 'grid',
                permission: PERMISSIONS.VEDIKA,
                children: [
                    { id: 'vedika-dashboard', label: 'Dashboard', path: '/vedika', permission: PERMISSIONS.VEDIKA },
                    { id: 'vedika-index', label: 'Index Data', path: '/vedika/index', permission: PERMISSIONS.VEDIKA },
                ],
            },
            {
                id: 'forms',
                label: 'Forms',
                icon: 'list',
                permission: PERMISSIONS.PUBLIC,
                children: [
                    { id: 'forms-elements', label: 'Form Elements', path: '/form-elements', permission: PERMISSIONS.PUBLIC },
                ],
            },
            {
                id: 'tables',
                label: 'Tables',
                icon: 'table',
                permission: PERMISSIONS.PUBLIC,
                children: [
                    { id: 'tables-basic', label: 'Basic Tables', path: '/basic-tables', permission: PERMISSIONS.PUBLIC },
                ],
            },
            {
                id: 'pages',
                label: 'Pages',
                icon: 'page',
                permission: PERMISSIONS.PUBLIC,
                children: [
                    { id: 'pages-blank', label: 'Blank Page', path: '/blank', permission: PERMISSIONS.PUBLIC },
                    { id: 'pages-404', label: '404 Error', path: '/error-404', permission: PERMISSIONS.PUBLIC },
                ],
            },
        ],
    },

    // ========== ADMIN SECTION ==========
    {
        id: 'admin',
        title: 'Admin',
        items: [
            {
                id: 'user-management',
                label: 'Manajemen Pengguna',
                path: '/admin/users',
                icon: 'user',
                permission: PERMISSIONS.USER_MANAGEMENT,
            },
            {
                id: 'role-management',
                label: 'Manajemen Role',
                path: '/admin/roles',
                icon: 'grid',
                permission: PERMISSIONS.ROLE_MANAGEMENT,
            },
            {
                id: 'audit-log',
                label: 'Audit Log',
                path: '/audit-logs',
                icon: 'table',
                permission: PERMISSIONS.AUDIT_LOG,
            },
        ],
    },

    // ========== OTHERS SECTION ==========
    {
        id: 'others',
        title: 'Others',
        items: [
            {
                id: 'charts',
                label: 'Charts',
                icon: 'chart',
                permission: PERMISSIONS.PUBLIC,
                children: [
                    { id: 'charts-line', label: 'Line Chart', path: '/line-chart', permission: PERMISSIONS.PUBLIC },
                    { id: 'charts-bar', label: 'Bar Chart', path: '/bar-chart', permission: PERMISSIONS.PUBLIC },
                ],
            },
            {
                id: 'ui-elements',
                label: 'UI Elements',
                icon: 'box',
                permission: PERMISSIONS.PUBLIC,
                children: [
                    { id: 'ui-alerts', label: 'Alerts', path: '/alerts', permission: PERMISSIONS.PUBLIC },
                    { id: 'ui-avatars', label: 'Avatar', path: '/avatars', permission: PERMISSIONS.PUBLIC },
                    { id: 'ui-badge', label: 'Badge', path: '/badge', permission: PERMISSIONS.PUBLIC },
                    { id: 'ui-buttons', label: 'Buttons', path: '/buttons', permission: PERMISSIONS.PUBLIC },
                    { id: 'ui-images', label: 'Images', path: '/images', permission: PERMISSIONS.PUBLIC },
                    { id: 'ui-videos', label: 'Videos', path: '/videos', permission: PERMISSIONS.PUBLIC },
                ],
            },
            {
                id: 'authentication',
                label: 'Authentication',
                icon: 'plugin',
                permission: PERMISSIONS.PUBLIC,
                children: [
                    { id: 'auth-signin', label: 'Sign In', path: '/signin', permission: PERMISSIONS.PUBLIC },
                    { id: 'auth-signup', label: 'Sign Up', path: '/signup', permission: PERMISSIONS.PUBLIC },
                ],
            },
        ],
    },
];
