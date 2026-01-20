import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
    BoxCubeIcon,
    CalenderIcon,
    ChevronDownIcon,
    GridIcon,
    ListIcon,
    PageIcon,
    PieChartIcon,
    PlugInIcon,
    TableIcon,
    UserCircleIcon,
} from "../icons";
import { useAuth } from "../context/AuthContext";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    permission?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean; permission?: string }[];
};

// Base nav items (same as sidebar)
const baseNavItems: NavItem[] = [
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

// Admin items (permission-gated)
const adminNavItems: NavItem[] = [
    {
        icon: <UserCircleIcon />,
        name: "Users",
        path: "/admin/users",
        permission: "usermanagement.read",
    },
    {
        icon: <GridIcon />,
        name: "Roles",
        path: "/admin/roles",
        permission: "rolemanagement.read",
    },
    {
        icon: <TableIcon />,
        name: "Audit",
        path: "/audit-logs",
        permission: "auditlog.read",
    },
];

const othersItems: NavItem[] = [
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
        name: "UI",
        subItems: [
            { name: "Alerts", path: "/alerts", pro: false },
            { name: "Buttons", path: "/buttons", pro: false },
        ],
    },
    {
        icon: <PlugInIcon />,
        name: "Auth",
        subItems: [
            { name: "Sign In", path: "/signin", pro: false },
            { name: "Sign Up", path: "/signup", pro: false },
        ],
    },
];

const TopNavbar: React.FC = () => {
    const { can } = useAuth();
    const location = useLocation();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname === path;

    // Filter admin items by permission
    const filteredAdminItems = adminNavItems.filter(
        (item) => !item.permission || can(item.permission)
    );
    const allItems = [...baseNavItems, ...filteredAdminItems, ...othersItems];

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

    const handleDropdownToggle = (name: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <nav ref={dropdownRef} className="flex items-center gap-1 flex-wrap">
            {allItems.map((item) => (
                <div key={item.name} className="relative">
                    {item.subItems ? (
                        <>
                            <button
                                type="button"
                                onClick={(e) => handleDropdownToggle(item.name, e)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${item.subItems.some((sub) => isActive(sub.path))
                                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                                    }`}
                            >
                                <span className="w-4 h-4">{item.icon}</span>
                                <span>{item.name}</span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            {/* Dropdown Menu */}
                            {openDropdown === item.name && (
                                <div
                                    className="absolute left-0 top-full mt-1 min-w-[180px] py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                                    style={{ zIndex: 9999 }}
                                >
                                    {item.subItems.map((subItem) => (
                                        <Link
                                            key={subItem.name}
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
                        </>
                    ) : (
                        item.path && (
                            <Link
                                to={item.path}
                                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${isActive(item.path)
                                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                                    }`}
                            >
                                <span className="w-4 h-4">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        )
                    )}
                </div>
            ))}
        </nav>
    );
};

export default TopNavbar;
