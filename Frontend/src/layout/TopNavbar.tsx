import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDownIcon } from "../icons";
import { useAuth } from "../context/AuthContext";
import { getAllNavItems, NavItem } from "../config/menuUtils";

const TopNavbar: React.FC = () => {
    const { can } = useAuth();
    const location = useLocation();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname === path;

    // Get all menu items filtered by permissions and flatten into single array
    const allNavItems = useMemo(() => {
        const menuData = getAllNavItems(can);
        return menuData.flatMap(({ navItems }) => navItems);
    }, [can]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDropdownToggle = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const renderNavItem = (item: NavItem) => {
        if (item.subItems) {
            return (
                <div key={item.id} className="relative">
                    <button
                        type="button"
                        onClick={(e) => handleDropdownToggle(item.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${item.subItems.some((sub) => isActive(sub.path))
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                            }`}
                    >
                        <span className="w-4 h-4">{item.icon}</span>
                        <span>{item.name}</span>
                        <ChevronDownIcon
                            className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.id ? "rotate-180" : ""
                                }`}
                        />
                    </button>
                    {/* Dropdown Menu */}
                    {openDropdown === item.id && (
                        <div
                            className="absolute left-0 top-full mt-1 min-w-[180px] py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                            style={{ zIndex: 9999 }}
                        >
                            {item.subItems.map((subItem) => (
                                <Link
                                    key={subItem.id}
                                    to={subItem.path}
                                    className={`block px-4 py-2 text-sm transition-colors ${isActive(subItem.path)
                                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                                        }`}
                                    onClick={() => setOpenDropdown(null)}
                                >
                                    {subItem.name}
                                    {subItem.new && (
                                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-600 rounded">
                                            new
                                        </span>
                                    )}
                                    {subItem.pro && (
                                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-brand-100 text-brand-600 rounded">
                                            pro
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Single item without children
        if (item.path) {
            return (
                <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${isActive(item.path)
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                        }`}
                >
                    <span className="w-4 h-4">{item.icon}</span>
                    <span>{item.name}</span>
                </Link>
            );
        }

        return null;
    };

    return (
        <nav ref={dropdownRef} className="flex items-center gap-1 flex-wrap">
            {allNavItems.map(renderNavItem)}
        </nav>
    );
};

export default TopNavbar;
