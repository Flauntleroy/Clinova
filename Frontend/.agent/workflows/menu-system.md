---
description: how to add or modify menus in the application
---

# Menu System Architecture

This document explains the menu system architecture for SIMRS MERA Frontend.

## Overview

Menu is defined as **static configuration** in code (NOT database). Single source of truth.

```
src/config/menuConfig.ts  (pure data, no JSX)
        │
        ▼
src/config/menuUtils.tsx  (icon mapping + helpers)
        │
        ├──► layout/AppSidebar.tsx
        ├──► layout/TopNavbar.tsx
        └──► components/header/CommandPalette.tsx
```

## Rules (WAJIB)

### 1. Menu is Static Config
- ❌ JANGAN buat tabel menu di database
- ❌ JANGAN buat API untuk fetch menu
- ✅ Menu HARUS didefinisikan di `menuConfig.ts`

### 2. Permission WAJIB
- ❌ JANGAN ada menu tanpa permission
- ✅ Gunakan `PERMISSIONS.PUBLIC` untuk menu publik
- ✅ Tambah permission baru ke object `PERMISSIONS`

### 3. Separation of Concerns
- `menuConfig.ts` = PURE DATA (no JSX, no React)
- `menuUtils.tsx` = Helper functions + icon mapping
- UI components HANYA import dari `menuUtils.tsx`

### 4. menuUtils.tsx Rules
- ❌ JANGAN import React hooks (`useAuth`, `useState`, etc)
- ❌ JANGAN akses global state
- ✅ Hanya pure functions

## How to Add New Menu

1. Edit `src/config/menuConfig.ts`
2. Add permission constant jika perlu:
```typescript
export const PERMISSIONS = {
    PUBLIC: 'public.access',
    // Add new permission here:
    NEW_MODULE: 'newmodule.read',
} as const;
```

3. Add menu item:
```typescript
{
    id: 'new-module',           // Stable, unique ID
    label: 'New Module',        // Display label
    path: '/new-module',        // Route path
    icon: 'grid',               // Icon type
    permission: PERMISSIONS.NEW_MODULE,
}
```

4. For menu with children:
```typescript
{
    id: 'parent-menu',
    label: 'Parent Menu',
    icon: 'grid',
    permission: PERMISSIONS.NEW_MODULE,
    children: [
        { id: 'child-1', label: 'Child 1', path: '/parent/child-1', permission: PERMISSIONS.NEW_MODULE },
        { id: 'child-2', label: 'Child 2', path: '/parent/child-2', permission: PERMISSIONS.NEW_MODULE },
    ],
}
```

5. Menu automatically appears in:
   - ✅ Sidebar
   - ✅ Top Navbar
   - ✅ Command Palette (Ctrl+K / Alt+S)

## Icon Types

Available icon types in `MenuIconType`:
- `grid` - GridIcon
- `calendar` - CalenderIcon
- `user` - UserCircleIcon
- `list` - ListIcon
- `table` - TableIcon
- `page` - PageIcon
- `chart` - PieChartIcon
- `box` - BoxCubeIcon
- `plugin` - PlugInIcon

To add new icon: update both `MenuIconType` and `iconMap` in `menuUtils.tsx`

## Permission Filtering

- `PERMISSIONS.PUBLIC` = Always visible (no permission check)
- Other permissions = Checked via `can(permission)` from AuthContext
- If parent permission fails, entire subtree hidden
- If all children fail permission, parent also hidden

## Files Reference

| File | Purpose |
|------|---------|
| `src/config/menuConfig.ts` | Menu data (pure TypeScript) |
| `src/config/menuUtils.tsx` | Icon mapping, filtering, flattening |
| `src/layout/AppSidebar.tsx` | Sidebar UI |
| `src/layout/TopNavbar.tsx` | Top navigation UI |
| `src/components/header/CommandPalette.tsx` | Search modal |
