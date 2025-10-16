import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path: string;
}

export default function Breadcrumbs() {
  const location = useLocation();
  
  // Generate breadcrumbs from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }];
    
    let currentPath = "";
    paths.forEach((path) => {
      currentPath += `/${path}`;
      // Convert path to readable label (e.g., "mvp-development" -> "MVP Development")
      const label = path
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      breadcrumbs.push({ label, path: currentPath });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 py-3 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;
        
        return (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-white flex items-center">
                {isFirst && <Home className="w-4 h-4 mr-1" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={cn(
                  "hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center",
                  isFirst && "flex items-center"
                )}
              >
                {isFirst && <Home className="w-4 h-4 mr-1" />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
