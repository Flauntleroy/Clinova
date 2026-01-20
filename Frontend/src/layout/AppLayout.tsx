import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { useAppearance } from "../context/AppearanceContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { appearance } = useAppearance();
  const { navLayout, density } = appearance;

  // Calculate main content margin based on layout
  const getMainMargin = () => {
    if (navLayout === 'top') {
      return ''; // No left margin for top nav
    }
    if (navLayout === 'minimal') {
      return 'lg:ml-[70px]'; // Smaller margin for minimal sidebar
    }
    // Default sidebar layout
    return isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]';
  };

  // Density-based styling - comfortable is full width and spacious, compact is contained
  const contentPadding = density === 'compact' ? 'p-4 md:p-5' : 'p-6 md:p-8';
  const contentMaxWidth = density === 'compact' ? 'max-w-(--breakpoint-2xl) mx-auto' : '';

  return (
    <div className="min-h-screen xl:flex">
      {/* Only show sidebar for sidebar/minimal layouts */}
      {navLayout !== 'top' && (
        <div>
          <AppSidebar />
          <Backdrop />
        </div>
      )}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${getMainMargin()} ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <AppHeader />
        <div className={`${contentMaxWidth} ${contentPadding}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
