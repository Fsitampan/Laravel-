import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  Clock, 
  History, 
  Settings, 
  LogOut, 
  UserCheck,
  Lock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { BPSLogo } from "./BPSLogo";
import { useAuth } from "./AuthContext";
import { useBPS } from "./BPSContext";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Navigation({ activeView, onViewChange, onLogout, collapsed, onToggleCollapse }: NavigationProps) {
  const { user } = useAuth();
  const { borrowers, canApproveRejects, canManageRooms, canManageUsers } = useBPS();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const pendingCount = borrowers.filter(b => b.status === "pending").length;

  // Check access for menu items
  const hasAccess = (item: string) => {
    switch (item) {
      case "rooms":
        return canManageRooms();
      case "approvals":
        return canApproveRejects();
      case "users":
        return canManageUsers();
      default:
        return true;
    }
  };

  const menuItems = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      restricted: false
    },
    {
      id: "rooms",
      label: "Manajemen Ruangan",
      icon: Building,
      badge: null,
      restricted: !hasAccess("rooms")
    },
    {
      id: "borrowers",
      label: "Peminjaman",
      icon: Users,
      badge: null,
      restricted: false
    },
    {
      id: "approvals",
      label: "Persetujuan",
      icon: UserCheck,
      badge: pendingCount > 0 ? pendingCount : null,
      restricted: !hasAccess("approvals")
    },
    {
      id: "history",
      label: "Riwayat",
      icon: History,
      badge: null,
      restricted: false
    },
    {
      id: "users",
      label: "Manajemen Pengguna",
      icon: Users,
      badge: null,
      restricted: !hasAccess("users")
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: Settings,
      badge: null,
      restricted: false
    }
  ];

  const getRoleInfo = () => {
    switch (user?.role) {
      case "super-admin":
        return { label: "Super Admin", className: "role-super-admin" };
      case "admin":
        return { label: "Administrator", className: "role-admin" };
      default:
        return { label: "Pengguna", className: "role-user" };
    }
  };

  const roleInfo = getRoleInfo();

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    
    const content = (
      <Button
        variant={isActive ? "default" : "ghost"}
        onClick={() => onViewChange(item.id)}
        disabled={item.restricted}
        className={`
          w-full justify-start gap-3 h-12 px-4 transition-all duration-200
          ${collapsed ? 'px-3' : 'px-4'}
          ${isActive 
            ? 'bg-primary text-primary-foreground shadow-md' 
            : item.restricted 
              ? 'text-muted-foreground hover:text-muted-foreground hover:bg-muted/30 cursor-not-allowed opacity-60'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
        `}
      >
        <div className="relative flex items-center gap-3">
          <Icon className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5'} flex-shrink-0`} />
          {item.restricted && (
            <Lock className="h-3 w-3 absolute -top-1 -right-1 text-red-400" />
          )}
          {!collapsed && (
            <>
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge className="ml-auto bg-red-500 text-white text-xs px-2 animate-pulse">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </div>
      </Button>
    );

    if (collapsed && item.restricted) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <div className="text-center">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  🔒 Akses Terbatas
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <div className="text-center">
                <p className="font-medium">{item.label}</p>
                {item.badge && (
                  <Badge className="bg-red-500 text-white text-xs mt-1">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300
        ${collapsed ? 'w-20' : 'w-72'}
        ${showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-lg">
                  <BPSLogo className="text-sidebar-primary-foreground" size="md" />
                </div>
                {!collapsed && (
                  <div>
                    <h2 className="text-sidebar-foreground font-bold">BPS Riau</h2>
                    <p className="text-sidebar-foreground/70 text-xs">Sistem Manajemen</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Collapse Button */}
              <div className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {user?.name?.substring(0, 2).toUpperCase() || "UN"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sidebar-foreground font-medium truncate">
                    {user?.name || "Unknown User"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={`${roleInfo.className} text-xs`}>
                      {roleInfo.label}
                    </Badge>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              onClick={onLogout}
              className={`
                w-full justify-start gap-3 h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                ${collapsed ? 'px-3' : 'px-4'}
              `}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Keluar</span>}
            </Button>
            
            {!collapsed && (
              <div className="mt-4 text-center">
                <p className="text-xs text-sidebar-foreground/50">
                  © 2024 BPS Provinsi Riau
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}