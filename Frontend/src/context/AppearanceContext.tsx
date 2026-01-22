"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect, useCallback } from "react";

// Types
export interface AppearanceState {
    mode: 'light' | 'dark';
    contrast: 'normal' | 'high';
    direction: 'ltr' | 'rtl';
    density: 'comfortable' | 'compact';
    navLayout: 'sidebar' | 'minimal' | 'top';
    navStyle: 'integrate' | 'apparent';
    primaryColor: string;
    fontFamily: string;
    fontSize: number;
}

// Default settings
const defaultAppearance: AppearanceState = {
    mode: 'light',
    contrast: 'normal',
    direction: 'ltr',
    density: 'comfortable',
    navLayout: 'sidebar',
    navStyle: 'integrate',
    primaryColor: '#22c55e', // Green
    fontFamily: 'Public Sans',
    fontSize: 16,
};

// Color presets with names
export const colorPresets = [
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
];

// Font options
export const fontFamilies = [
    { name: 'Public Sans', value: "'Public Sans', sans-serif" },
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'DM Sans', value: "'DM Sans', sans-serif" },
    { name: 'Nunito Sans', value: "'Nunito Sans', sans-serif" },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
];

// Storage key
const STORAGE_KEY = 'mera:appearance';

// Context type
interface AppearanceContextType {
    appearance: AppearanceState;
    updateAppearance: <K extends keyof AppearanceState>(key: K, value: AppearanceState[K]) => void;
    resetAppearance: () => void;
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

// Helper to generate CSS color shades from a hex color
function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [appearance, setAppearance] = useState<AppearanceState>(defaultAppearance);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setAppearance({ ...defaultAppearance, ...parsed });
            }
        } catch (e) {
            console.warn('Failed to load appearance settings:', e);
        }
        setIsInitialized(true);
    }, []);

    // Apply settings to DOM when state changes
    useEffect(() => {
        if (!isInitialized) return;

        const html = document.documentElement;

        // Mode (dark/light)
        if (appearance.mode === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        // Contrast
        if (appearance.contrast === 'high') {
            html.classList.add('high-contrast');
        } else {
            html.classList.remove('high-contrast');
        }

        // Direction
        html.setAttribute('dir', appearance.direction);

        // Density
        html.classList.remove('density-comfortable', 'density-compact');
        html.classList.add(`density-${appearance.density}`);

        // Navigation layout
        html.dataset.navLayout = appearance.navLayout;
        html.dataset.navStyle = appearance.navStyle;

        // Primary color as CSS variables - generate all brand shades
        const hsl = hexToHSL(appearance.primaryColor);

        // Set base primary variables
        html.style.setProperty('--primary-hue', `${hsl.h}`);
        html.style.setProperty('--primary-sat', `${hsl.s}%`);
        html.style.setProperty('--primary-color', appearance.primaryColor);
        html.style.setProperty('--primary-color-light', `hsl(${hsl.h}, ${hsl.s}%, 95%)`);
        html.style.setProperty('--primary-color-dark', `hsl(${hsl.h}, ${hsl.s}%, 35%)`);

        // Generate and set all brand color shades to override Tailwind's static colors
        // These values are based on the primary color's hue and saturation
        const brandShades: Record<string, number> = {
            '25': 97,
            '50': 95,
            '100': 90,
            '200': 82,
            '300': 70,
            '400': 58,
            '500': 50, // Base - the selected primary color lightness
            '600': 43,
            '700': 36,
            '800': 30,
            '900': 24,
            '950': 15,
        };

        // Apply brand color overrides
        Object.entries(brandShades).forEach(([shade, lightness]) => {
            html.style.setProperty(`--color-brand-${shade}`, `hsl(${hsl.h}, ${hsl.s}%, ${lightness}%)`);
        });

        // Font family - apply to html element using CSS variable
        const fontValue = fontFamilies.find(f => f.name === appearance.fontFamily)?.value || fontFamilies[0].value;
        html.style.setProperty('--font-family', fontValue);
        html.style.fontFamily = fontValue;

        // Font size (base)
        html.style.fontSize = `${appearance.fontSize}px`;

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    }, [appearance, isInitialized]);

    const updateAppearance = useCallback(<K extends keyof AppearanceState>(
        key: K,
        value: AppearanceState[K]
    ) => {
        setAppearance((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetAppearance = useCallback(() => {
        setAppearance(defaultAppearance);
    }, []);

    const openSettings = useCallback(() => setIsSettingsOpen(true), []);
    const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

    return (
        <AppearanceContext.Provider
            value={{
                appearance,
                updateAppearance,
                resetAppearance,
                isSettingsOpen,
                openSettings,
                closeSettings,
            }}
        >
            {children}
        </AppearanceContext.Provider>
    );
};

export const useAppearance = () => {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error("useAppearance must be used within an AppearanceProvider");
    }
    return context;
};
