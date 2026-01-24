import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { getAllMenuItems, fuzzySearch, MenuItem } from '../../config/menuConfig';
import { useAuth } from '../../context/AuthContext';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showAllMenus, setShowAllMenus] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { can } = useAuth();

    // Get all menu items filtered by permissions
    const allItems = useMemo(() => {
        return getAllMenuItems().filter(
            (item) => !item.permission || can(item.permission)
        );
    }, [can]);

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (showAllMenus || !query.trim()) {
            return allItems;
        }
        return fuzzySearch(allItems, query);
    }, [allItems, query, showAllMenus]);

    // Group items by category
    const groupedItems = useMemo(() => {
        const groups: Record<string, MenuItem[]> = {
            menu: [],
            admin: [],
            others: [],
        };

        filteredItems.forEach((item) => {
            if (groups[item.category]) {
                groups[item.category].push(item);
            }
        });

        return groups;
    }, [filteredItems]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setShowAllMenus(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Reset selected index when filtered items change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredItems]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredItems.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredItems.length - 1
                    );
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredItems[selectedIndex]) {
                        handleSelectItem(filteredItems[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        },
        [filteredItems, selectedIndex, onClose]
    );

    // Navigate to selected item
    const handleSelectItem = (item: MenuItem) => {
        navigate(item.path);
        onClose();
    };

    // Handle show all menus
    const handleShowAllMenus = () => {
        setQuery('');
        setShowAllMenus(true);
        setSelectedIndex(0);
    };

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.querySelector(
                `[data-index="${selectedIndex}"]`
            );
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'menu':
                return 'Menu';
            case 'admin':
                return 'Admin';
            case 'others':
                return 'Others';
            default:
                return category;
        }
    };

    let currentIndex = 0;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                onKeyDown={handleKeyDown}
            >
                {/* Search Input */}
                <div className="relative border-b border-gray-200 dark:border-gray-700">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-5 h-5 text-gray-400 dark:text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search menus..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowAllMenus(false);
                        }}
                        className="w-full h-14 pl-12 pr-20 text-base bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700">
                            <span>Esc</span>
                        </kbd>
                    </div>
                </div>

                {/* Results List */}
                <div
                    ref={listRef}
                    className="max-h-[50vh] overflow-y-auto py-2 scroll-smooth"
                >
                    {filteredItems.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <svg
                                className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm">No results found for "{query}"</p>
                            <button
                                onClick={handleShowAllMenus}
                                className="mt-3 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                            >
                                Show all menus
                            </button>
                        </div>
                    ) : (
                        <>
                            {(['menu', 'admin', 'others'] as const).map((category) => {
                                const items = groupedItems[category];
                                if (items.length === 0) return null;

                                return (
                                    <div key={category} className="mb-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {getCategoryLabel(category)}
                                        </div>
                                        {items.map((item) => {
                                            const itemIndex = currentIndex++;
                                            const isSelected = itemIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={item.id}
                                                    data-index={itemIndex}
                                                    onClick={() => handleSelectItem(item)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected
                                                            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                >
                                                    <span
                                                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${isSelected
                                                                ? 'bg-brand-100 dark:bg-brand-800/50 text-brand-600 dark:text-brand-400'
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                                            }`}
                                                    >
                                                        {item.icon}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {item.parent && (
                                                                <>
                                                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                                                        {item.parent}
                                                                    </span>
                                                                    <svg
                                                                        className="w-3 h-3 text-gray-400 dark:text-gray-500"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M9 5l7 7-7 7"
                                                                        />
                                                                    </svg>
                                                                </>
                                                            )}
                                                            <span className="text-sm font-medium truncate">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                            {item.path}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                            ↵
                                                        </kbd>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={handleShowAllMenus}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                            />
                        </svg>
                        Show All Menus
                    </button>
                    <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                ↑
                            </kbd>
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                ↓
                            </kbd>
                            <span>to navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                ↵
                            </kbd>
                            <span>to select</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
