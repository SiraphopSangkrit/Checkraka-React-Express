import { Link, useLocation } from "react-router";
import {
  House,
  Users,
  ChevronDown,
  ChevronRight,
  Settings,
  Car,
  Bike,
  Truck,
  ArrowUpRight,
  Blocks
} from "lucide-react";
import { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface NavigationItem {
  name: string;
  href?: string;
  icon?: any;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/admin", icon: House },

  {
    name: "Products",
    icon: ArrowUpRight,
    children: [
      { name: "Cars", href: "/admin/product/cars", icon: Car },
      { name: "Motorcycles", href: "/admin/product/motorcycles", icon: Bike },
      { name: "Trucks", href: "/admin/product/trucks", icon: Truck },
    ],
  },
  {
    name: "Category",
    href: "/admin/categories",
    icon: Blocks,
  },
  {
    name: "Settings",
    icon: Settings,
    children: [
      { name: "General", href: "/admin/settings/general", icon: Settings },
      { name: "Users", href: "/admin/settings/users", icon: Users },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const hasActiveChild = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some((child) => isItemActive(child.href));
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isExpanded = expandedItems.includes(item.name);
    const isActive = isItemActive(item.href);
    const hasActiveChildren = hasActiveChild(item.children);

    if (item.children) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`${
              hasActiveChildren
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-content2"
            } group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors`}
          >
            {item.icon && (
              <item.icon
                className={`${
                  hasActiveChildren ? "text-primary" : "text-default-400"
                } mr-3 flex-shrink-0 h-6 w-6`}
                aria-hidden="true"
              />
            )}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>

          {/* Children */}
          {isExpanded && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.name}
                  to={child.href!}
                  className={`${
                    isItemActive(child.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-content2"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  {child.icon && (
                    <child.icon
                      className={`${
                        isItemActive(child.href)
                          ? "text-primary-foreground"
                          : "text-default-400"
                      } mr-3 flex-shrink-0 h-5 w-5`}
                      aria-hidden="true"
                    />
                  )}
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Regular menu item without children
    return (
      <Link
        key={item.name}
        to={item.href!}
        className={`${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-content2"
        } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
      >
        <item.icon
          className={`${
            isActive ? "text-primary-foreground" : "text-default-400"
          } mr-3 flex-shrink-0 h-6 w-6`}
          aria-hidden="true"
        />
        {!isCollapsed && item.name}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map(renderNavigationItem)}
        </nav>
        <div className="p-4 flex justify-center ">
          <ThemeSwitcher></ThemeSwitcher>
        </div>
      </div>
    </div>
  );
}
