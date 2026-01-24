// Menu Utilities - Icon mapping and helper functions
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
import {
    MenuIconType,
    MenuItemConfig,
    MenuSection,
    menuSections,
    PERMISSIONS,
} from './menuConfig';

// ============================================
// ICON MAPPING
// ============================================

const iconMap: Record<MenuIconType, React.ReactNode> = {
    grid: <GridIcon />,
    calendar: <CalenderIcon />,
    user: <UserCircleIcon />,
    list: <ListIcon />,
    table: <TableIcon />,
    page: <PageIcon />,
    chart: <PieChartIcon />,
    box: <BoxCubeIcon />,
    plugin: <PlugInIcon />,
};

export function getMenuIcon(iconType: MenuIconType): React.ReactNode {
    return iconMap[iconType] || <GridIcon />;
}

// ============================================
// NAV ITEM TYPE (for Sidebar/Navbar rendering)
// ============================================

export interface NavItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    path?: string;
    permission?: string;
    subItems?: {
        id: string;
        name: string;
        path: string;
        pro?: boolean;
        new?: boolean;
        permission?: string;
    }[];
}

// ============================================
// PERMISSION FILTERING
// ============================================

// Check if a permission allows access
function hasAccess(permission: string, can: (permission: string) => boolean): boolean {
    // Public menus are always accessible
    if (permission === PERMISSIONS.PUBLIC) {
        return true;
    }
    // Check user permission
    return can(permission);
}

function filterMenuItem(
    item: MenuItemConfig,
    can: (permission: string) => boolean
): MenuItemConfig | null {
    // Check parent permission
    if (!hasAccess(item.permission, can)) {
        return null;
    }

    // If has children, filter them too
    if (item.children) {
        const filteredChildren = item.children.filter(
            (child) => hasAccess(child.permission, can)
        );

        // If no children left after filtering, don't show parent
        if (filteredChildren.length === 0) {
            return null;
        }

        return { ...item, children: filteredChildren };
    }

    return item;
}

export function filterMenuByPermissions(
    sections: MenuSection[],
    can: (permission: string) => boolean
): MenuSection[] {
    return sections
        .map((section) => ({
            ...section,
            items: section.items
                .map((item) => filterMenuItem(item, can))
                .filter((item): item is MenuItemConfig => item !== null),
        }))
        .filter((section) => section.items.length > 0);
}

// ============================================
// CONVERT TO NAV ITEMS (for Sidebar/Navbar)
// ============================================

export function toNavItems(items: MenuItemConfig[]): NavItem[] {
    return items.map((item) => ({
        id: item.id,
        name: item.label,
        icon: getMenuIcon(item.icon),
        path: item.path,
        permission: item.permission,
        subItems: item.children?.map((child) => ({
            id: child.id,
            name: child.label,
            path: child.path || '',
            pro: child.badges?.some((b) => b.type === 'pro'),
            new: child.badges?.some((b) => b.type === 'new'),
            permission: child.permission,
        })),
    }));
}

// ============================================
// GET FILTERED NAV ITEMS BY SECTION
// ============================================

export function getNavItemsForSection(
    sectionId: string,
    can: (permission: string) => boolean
): NavItem[] {
    const filtered = filterMenuByPermissions(menuSections, can);
    const section = filtered.find((s) => s.id === sectionId);
    return section ? toNavItems(section.items) : [];
}

export function getAllNavItems(
    can: (permission: string) => boolean
): { section: MenuSection; navItems: NavItem[] }[] {
    const filtered = filterMenuByPermissions(menuSections, can);
    return filtered.map((section) => ({
        section,
        navItems: toNavItems(section.items),
    }));
}

// ============================================
// FLAT MENU ITEMS (for Command Palette search)
// ============================================

export interface FlatMenuItem {
    id: string;
    name: string;
    path: string;
    icon: React.ReactNode;
    sectionId: string;
    parent?: string;
    permission?: string;
    keywords: string[];
}

export function flattenMenuItems(
    sections: MenuSection[]
): FlatMenuItem[] {
    const result: FlatMenuItem[] = [];

    sections.forEach((section) => {
        section.items.forEach((item) => {
            if (item.children && item.children.length > 0) {
                // Add each child as a flat item
                item.children.forEach((child) => {
                    if (child.path) {
                        result.push({
                            id: child.id,
                            name: child.label,
                            path: child.path,
                            icon: getMenuIcon(item.icon),
                            sectionId: section.id,
                            parent: item.label,
                            permission: child.permission || item.permission,
                            keywords: [
                                item.label.toLowerCase(),
                                child.label.toLowerCase(),
                                section.title.toLowerCase(),
                            ],
                        });
                    }
                });
            } else if (item.path) {
                // Add the item itself
                result.push({
                    id: item.id,
                    name: item.label,
                    path: item.path,
                    icon: getMenuIcon(item.icon),
                    sectionId: section.id,
                    permission: item.permission,
                    keywords: [item.label.toLowerCase(), section.title.toLowerCase()],
                });
            }
        });
    });

    return result;
}

export function getFilteredFlatMenuItems(
    can: (permission: string) => boolean
): FlatMenuItem[] {
    const filtered = filterMenuByPermissions(menuSections, can);
    return flattenMenuItems(filtered);
}

// ============================================
// FUZZY SEARCH
// ============================================

export function fuzzySearch(
    items: FlatMenuItem[],
    query: string
): FlatMenuItem[] {
    if (!query.trim()) {
        return items;
    }

    const lowerQuery = query.toLowerCase();
    const queryParts = lowerQuery.split(/\s+/);

    return items
        .map((item) => {
            const searchText = [
                item.name.toLowerCase(),
                item.parent?.toLowerCase() || '',
                ...item.keywords,
            ].join(' ');

            // Check if all query parts match
            const allPartsMatch = queryParts.every((part) =>
                searchText.includes(part)
            );

            if (!allPartsMatch) {
                return { item, score: 0 };
            }

            let score = 0;

            // Exact match in name
            if (item.name.toLowerCase() === lowerQuery) {
                score = 100;
            }
            // Name starts with query
            else if (item.name.toLowerCase().startsWith(lowerQuery)) {
                score = 75;
            }
            // Name contains query
            else if (item.name.toLowerCase().includes(lowerQuery)) {
                score = 50;
            }
            // Parent name matches
            else if (item.parent?.toLowerCase().includes(lowerQuery)) {
                score = 25;
            }
            // Keywords match
            else {
                score = 10;
            }

            return { item, score };
        })
        .filter((result) => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((result) => result.item);
}
