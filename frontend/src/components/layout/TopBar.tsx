import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { LogOut, User, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function useBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs: { label: string; path: string }[] = [
    { label: "Dashboard", path: "/" },
  ];

  if (segments[0] === "features" && segments[1] === "new") {
    crumbs.push({ label: "New Feature", path: "/features/new" });
  } else if (segments[0] === "features" && segments[1]) {
    crumbs.push({ label: "Feature Detail", path: `/features/${segments[1]}` });
  } else if (segments[0] === "settings") {
    crumbs.push({ label: "Settings", path: "/settings" });
  }

  return crumbs;
}

export function TopBar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const crumbs = useBreadcrumbs();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pageTitle = crumbs[crumbs.length - 1]?.label ?? "Dashboard";

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center gap-2">
        <nav className="flex items-center text-sm">
          {crumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center">
              {i > 0 && (
                <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-text-tertiary" />
              )}
              {i < crumbs.length - 1 ? (
                <Link
                  to={crumb.path}
                  className="text-text-secondary hover:text-text transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-text">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {user?.email?.charAt(0).toUpperCase() ?? "U"}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border border-border bg-white py-1 shadow-lg z-50">
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-sm font-medium text-text truncate">
                {user?.email ?? "User"}
              </p>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-canvas transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
