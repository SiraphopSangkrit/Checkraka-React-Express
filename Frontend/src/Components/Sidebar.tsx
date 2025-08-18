import { Link, useLocation } from "react-router";
import * as LucideIcons from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useCategories } from "../contexts/CategoriesContext";
import type { LucideIcon } from "lucide-react";

interface NavigationItem {
  name: string;
  href?: string;
  icon?: string;
  children?: NavigationItem[];
}

const IconComponent = ({ iconName }: { iconName: string }) => {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const Icon = icons[iconName];
  
  if (!Icon) {
    return <LucideIcons.Package size={24} />;
  }
  
  return <Icon size={24} />;
};

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { categories } = useCategories();
  
  // Filter only active categories for sidebar
  const activeCategories = categories.filter(cat => cat.isActive).sort((a, b) => a.title.localeCompare(b.title));

  // Generate navigation items dynamically based on categories
  const dynamicNavigation = useMemo(() => {
    return [
      { name: "Dashboard", href: "/admin", icon: "House" },
      {
        name: "Products",
        icon: "ArrowUpRight",
        children: activeCategories.map((category): NavigationItem => ({
          name: category.title,
          href: `/admin/product/${category.slug}`,
          icon: category.icon || "Package",
        })),
      },
      {
        name: "Category",
        href: "/admin/categories",
        icon: "Blocks",
      },
      {
        name: "Brands",
        href: "/admin/brands",
        icon: "Blocks",
      },
      {
        name: "Models",
        href: "/admin/models",
        icon: "Blocks",
      },
      {
        name: "Settings",
        icon: "Settings",
        children: [
          { name: "General", href: "/admin/settings/general", icon: "Settings" },
          { name: "Users", href: "/admin/settings/users", icon: "Users" },
        ],
      },
    ];
  }, [activeCategories]);

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
              <div
                className={`${
                  hasActiveChildren ? "text-primary" : "text-default-400"
                } mr-3 flex-shrink-0`}
              >
                <IconComponent iconName={item.icon} />
              </div>
            )}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                <IconComponent
                  iconName={isExpanded ? "ChevronDown" : "ChevronRight"}
                />
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
                    <div
                      className={`${
                        isItemActive(child.href)
                          ? "text-primary-foreground"
                          : "text-default-400"
                      } mr-3 flex-shrink-0`}
                    >
                      <IconComponent iconName={child.icon} />
                    </div>
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
        {item.icon && (
          <div
            className={`${
              isActive ? "text-primary-foreground" : "text-default-400"
            } mr-3 flex-shrink-0`}
          >
            <IconComponent iconName={item.icon} />
          </div>
        )}
        {!isCollapsed && item.name}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {dynamicNavigation.map(renderNavigationItem)}
        </nav>
        <div className="p-4 flex justify-center">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
