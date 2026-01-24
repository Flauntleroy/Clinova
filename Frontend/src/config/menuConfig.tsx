import React from 'react';
import {
    BoxCubeIcon,
    CalenderIcon,
    GridIcon,
    ListIcon,
    PageIcon,
    PieChartIcon,
    PlugInIcon,
    TableIcon,
    UserCircleIcon,
} from '../icons';

// MenuItem type for searchable menu items
export interface MenuItem {
    id: string;
    name: string;
    path: string;
    icon: React.ReactNode;
    category: 'menu' | 'admin' | 'others';
    parent?: string; // Parent menu name if this is a submenu
    permission?: string;
    keywords?: string[]; // Additional keywords for search
}

// NavItem type for sidebar/navbar rendering
export interface NavItem {
    name: string;
    icon: React.ReactNode;
    path?: string;
    permission?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean; permission?: string }[];
}

// Base nav items (Menu section)
export const baseNavItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        subItems: [{ name: "Ecommerce", path: "/", pro: false }],
    },
    {
        icon: <CalenderIcon />,
        name: "Calendar",
        path: "/calendar",
    },
    {
        icon: <UserCircleIcon />,
        name: "User Profile",
        path: "/profile",
    },
    {
        name: "Forms",
        icon: <ListIcon />,
        subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
    },
    {
        name: "Tables",
        icon: <TableIcon />,
        subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
    },
    {
        name: "Pages",
        icon: <PageIcon />,
        subItems: [
            { name: "Blank Page", path: "/blank", pro: false },
            { name: "404 Error", path: "/error-404", pro: false },
        ],
    },
];

// Admin nav items (permission-gated)
export const adminNavItems: NavItem[] = [
    {
        icon: <UserCircleIcon />,
        name: "Manajemen Pengguna",
        path: "/admin/users",
        permission: "usermanagement.read",
    },
    {
        icon: <GridIcon />,
        name: "Manajemen Role",
        path: "/admin/roles",
        permission: "rolemanagement.read",
    },
    {
        icon: <TableIcon />,
        name: "Audit Log",
        path: "/audit-logs",
        permission: "auditlog.read",
    },
];

// Vedika nav items
export const vedikaNavItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Vedika",
        subItems: [
            { name: "Dashboard", path: "/vedika", pro: false },
            { name: "Index Data", path: "/vedika/index", pro: false },
        ],
    },
];

// Others section
export const othersItems: NavItem[] = [
    {
        icon: <PieChartIcon />,
        name: "Charts",
        subItems: [
            { name: "Line Chart", path: "/line-chart", pro: false },
            { name: "Bar Chart", path: "/bar-chart", pro: false },
        ],
    },
    {
        icon: <BoxCubeIcon />,
        name: "UI Elements",
        subItems: [
            { name: "Alerts", path: "/alerts", pro: false },
            { name: "Avatar", path: "/avatars", pro: false },
            { name: "Badge", path: "/badge", pro: false },
            { name: "Buttons", path: "/buttons", pro: false },
            { name: "Images", path: "/images", pro: false },
            { name: "Videos", path: "/videos", pro: false },
        ],
    },
    {
        icon: <PlugInIcon />,
        name: "Authentication",
        subItems: [
            { name: "Sign In", path: "/signin", pro: false },
            { name: "Sign Up", path: "/signup", pro: false },
        ],
    },
];

// Helper function to flatten nav items into searchable menu items
function flattenNavItems(
    items: NavItem[],
    category: MenuItem['category']
): MenuItem[] {
    const result: MenuItem[] = [];

    items.forEach((item) => {
        if (item.subItems && item.subItems.length > 0) {
            // Add each sub-item as a searchable menu item
            item.subItems.forEach((subItem) => {
                result.push({
                    id: `${item.name}-${subItem.name}`.toLowerCase().replace(/\s+/g, '-'),
                    name: subItem.name,
                    path: subItem.path,
                    icon: item.icon,
                    category,
                    parent: item.name,
                    permission: subItem.permission,
                    keywords: [item.name.toLowerCase(), subItem.name.toLowerCase()],
                });
            });
        } else if (item.path) {
            // Add the item itself as a searchable menu item
            result.push({
                id: item.name.toLowerCase().replace(/\s+/g, '-'),
                name: item.name,
                path: item.path,
                icon: item.icon,
                category,
                permission: item.permission,
                keywords: [item.name.toLowerCase()],
            });
        }
    });

    return result;
}

// Get all searchable menu items
export function getAllMenuItems(): MenuItem[] {
    return [
        ...flattenNavItems(baseNavItems, 'menu'),
        ...flattenNavItems(vedikaNavItems, 'menu'),
        ...flattenNavItems(adminNavItems, 'admin'),
        ...flattenNavItems(othersItems, 'others'),
    ];
}

// Simple fuzzy search function
export function fuzzySearch(items: MenuItem[], query: string): MenuItem[] {
    if (!query.trim()) {
        return items;
    }

    const lowerQuery = query.toLowerCase();
    const queryParts = lowerQuery.split(/\s+/);

    return items
        .map((item) => {
            let score = 0;
            const searchText = [
                item.name.toLowerCase(),
                item.parent?.toLowerCase() || '',
                ...(item.keywords || []),
            ].join(' ');

            // Check if all query parts match
            const allPartsMatch = queryParts.every((part) =>
                searchText.includes(part)
            );

            if (!allPartsMatch) {
                return { item, score: 0 };
            }

            // Exact match in name
            if (item.name.toLowerCase() === lowerQuery) {
                score += 100;
            }
            // Name starts with query
            else if (item.name.toLowerCase().startsWith(lowerQuery)) {
                score += 75;
            }
            // Name contains query
            else if (item.name.toLowerCase().includes(lowerQuery)) {
                score += 50;
            }
            // Parent name matches
            else if (item.parent?.toLowerCase().includes(lowerQuery)) {
                score += 25;
            }
            // Keywords match
            else {
                score += 10;
            }

            return { item, score };
        })
        .filter((result) => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((result) => result.item);
}
