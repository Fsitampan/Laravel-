import { useState, PropsWithChildren, ReactNode } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Building2,
  Calendar,
  FileText,
  Settings,
  Users,
  LogOut,
  Menu,
  Lock,
  LayoutDashboard,
  CheckSquare,
  Home,
  Bell,
  User as UserIcon,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn, getUserInitials } from "@/lib/utils";
import { BPSLogo } from "@/components/BPSLogo";
import type { User, Notification } from "@/types";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  badge?: number;
  children?: NavigationItem[];
}

interface AuthenticatedLayoutProps
  extends PropsWithChildren<{
    user: User;
    header?: ReactNode;
    notifications?: Notification[];
    unread_count?: number;
  }> {}

export default function AuthenticatedLayout({
  user,
  header,
  children,
  notifications = [],
  unread_count = 0,
}: PropsWithChildren<{
  user: User;
  header?: ReactNode;
  notifications?: Notification[];
  unread_count?: number;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { url } = usePage();

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/Dashboard", icon: LayoutDashboard },
    {
      name: "Manajemen Ruangan",
      href: "/Rooms",
      icon: Building2,
      adminOnly: true,
    },
    { name: "Peminjaman Ruangan", href: "/Borrowings", icon: Calendar },
    {
      name: "Persetujuan",
      href: "/Approvals",
      icon: CheckSquare,
      adminOnly: true,

    },
    { name: "Riwayat Peminjaman", href: "/History", icon: FileText },
    {
      name: "Manajemen Pengguna",
      href: "/users",
      icon: Users,
      superAdminOnly: true,
    },
    {
      name: "Pengaturan Sistem",
      href: "/Settings",
      icon: Settings,
      adminOnly: true,
    },
  ];

  const hasAccess = (item: NavigationItem) => {
    if (item.superAdminOnly && user.role !== "super-admin") return false;
    if (item.adminOnly && !["admin", "super-admin"].includes(user.role))
      return false;
    return true;
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return url === "/" || url === "/dashboard";
    }
    return url.startsWith(href);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super-admin":
        return "Super Admin";
      case "admin":
        return "Administrator";
      default:
        return "Pengguna";
    }
  };

  const Sidebar = ({ mobile = false }) => (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 shadow-sm",
        mobile ? "w-full" : sidebarCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo Header */}
      <div
        className={cn(
          "flex items-center border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50",
          sidebarCollapsed && !mobile ? "px-4 py-5 justify-center" : "px-6 py-5"
        )}
      >
        <BPSLogo size="lg" />
        {(!sidebarCollapsed || mobile) && (
          <div className="ml-4">
            <h1 className="text-lg font-semibold text-gray-900">BPS Riau</h1>
            <p className="text-sm text-gray-600">Sistem Manajemen Ruangan</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle - Desktop Only */}
      {!mobile && (
        <div className="px-2 py-2 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-center hover:bg-gray-100"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* User Info Card with Dropdown */}
      {(!sidebarCollapsed || mobile) && (
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border cursor-pointer hover:bg-gray-50">
                <Avatar className="h-10 w-10">
                    {/* Tambahkan AvatarImage di sini */}
                    {user.avatar && (
                       <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    
                    {/* AvatarFallback akan ditampilkan jika tidak ada foto */}
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                        {getUserInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                    </p>
                    <div className="flex items-center mt-1">
                        <Badge
                            variant="outline"
                            className={cn("text-xs", getRoleColor(user.role))}
                        >
                            {getRoleLabel(user.role)}
                        </Badge>
                    </div>
                </div>
            </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Profil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/Profile" className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Profil Saya</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.post(route("logout"))}
                className="text-red-600 focus:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {(!sidebarCollapsed || mobile) && (
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Menu Utama
          </div>
        )}

        {navigation.map((item) => {
          const hasItemAccess = hasAccess(item);
          const active = isActive(item.href);
          const IconComponent = item.icon;

          return (
            <div key={item.name} className="relative">
              <Link
                href={hasItemAccess ? item.href : "#"}
                className={cn(
                  "group flex items-center text-sm font-medium rounded-lg transition-all duration-200 relative",
                  sidebarCollapsed && !mobile
                    ? "px-3 py-3 justify-center"
                    : "px-3 py-3",
                  active
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-200"
                    : hasItemAccess
                    ? "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                    : "text-gray-400 cursor-not-allowed opacity-60"
                )}
                onClick={(e) => {
                  if (!hasItemAccess) {
                    e.preventDefault();
                  } else if (mobile) {
                    setSidebarOpen(false);
                  }
                }}
                title={sidebarCollapsed && !mobile ? item.name : undefined}
              >
                <IconComponent
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    sidebarCollapsed && !mobile
                      ? "h-5 w-5"
                      : "mr-3 h-5 w-5",
                    active
                      ? "text-blue-600"
                      : hasItemAccess
                      ? "text-gray-500 group-hover:text-gray-700"
                      : "text-gray-400"
                  )}
                />

                {(!sidebarCollapsed || mobile) && (
                  <>
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && hasItemAccess && (
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-700 text-xs px-2 py-0.5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {!hasItemAccess && (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </>
                )}

                {active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-full max-w-sm">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm",
          sidebarCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center space-x-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Breadcrumb */}
              <div className="hidden sm:flex sm:items-center sm:space-x-2 text-sm">
                <Home className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">/</span>
                <span className="text-gray-600 capitalize font-medium">
                  {url.split("/")[1] || "dashboard"}
                </span>
              </div>
            </div>

            {/* Top bar actions */}
            <div className="flex items-center space-x-3">
              {/* Notifikasi */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {unread_count && unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unread_count}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 max-h-96 overflow-y-auto"
                >
                  <DropdownMenuLabel>
                    Notifikasi
                    {unread_count && unread_count > 0 && (
                      <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        {unread_count} baru
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(!notifications || notifications.length === 0) && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Tidak ada notifikasi baru
                    </div>
                  )}
                  {notifications &&
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex items-start gap-2 py-2 px-2 rounded transition ${
                          !notification.read_at ? "bg-blue-50" : ""
                        }`}
                        asChild
                      >
                        <Link href="/notifications">
                          <div className="flex-shrink-0 mt-1">
                            <Bell className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-xs font-medium ${
                                !notification.read_at
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {notification.message}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {notification.created_at}
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/notifications"
                      className="w-full text-center text-blue-600"
                    >
                      Lihat semua notifikasi
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page header */}
        {header && (
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-6 sm:px-6">{header}</div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
