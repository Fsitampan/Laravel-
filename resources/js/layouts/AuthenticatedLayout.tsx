// file: resources/js/layouts/AuthenticatedLayout.tsx

import { useState, PropsWithChildren, ReactNode, useEffect } from "react";
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
  Building2, Calendar, FileText, Users, LogOut, Menu,
  Lock, LayoutDashboard, CheckSquare, Home, Bell, User as UserIcon,
  PanelLeftClose, PanelLeftOpen,
  Check, X // ✅ [FIX] Impor ikon Check dan X
} from "lucide-react";
import { cn, getUserInitials } from "@/lib/utils";
import { getCsrfToken } from '../lib/csrf';
import { toast } from "sonner"; // ✅ [FIX] Impor toast dari sonner
import type { User, PageProps } from "@/types"; // Pastikan PageProps ada di types/index.d.ts

// ✅ [FIX] Definisikan ulang type Notification untuk menyertakan time_ago
interface Notification {
    id: number | string;
    user_id: number;
    type: string;
    title: string;
    message: string;
    data?: any;
    read_at?: string | null;
    created_at: string;
    time_ago?: string; // Tambahkan properti ini
}

// ✅ [FIX] Definisikan interface SharedProps
interface SharedProps extends PageProps {
  notifications: Notification[];
  unread_count: number;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  badge?: number
}

export default function AuthenticatedLayout({
  user,
  header,
  children,
}: PropsWithChildren<{
  user: User;
  header?: ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { url } = usePage();

  const { props } = usePage<SharedProps>();
  const { notifications: initialNotifications, unread_count: initialUnreadCount } = props;

  const [notifList, setNotifList] = useState<Notification[]>(initialNotifications || []);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount || 0);

  // Sinkronisasi state dengan props
  useEffect(() => {
    setNotifList(initialNotifications || []);
    setUnreadCount(initialUnreadCount || 0);
  }, [initialNotifications, initialUnreadCount]);

  // Polling untuk update live
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/notifications', { headers: { Accept: 'application/json' } });
        const data = await res.json();
        setNotifList(data.notifications || []);
        const stats = await fetch('/api/notifications/statistics').then(r => r.json());
        setUnreadCount(stats.unread || 0);
      } catch (err) {
        console.error('Gagal memuat notifikasi:', err);
      }
    }, 15000); // Polling setiap 15 detik
    return () => clearInterval(interval);
  }, []);

  // Action Handlers
  const handleMarkAsRead = async (id: number | string) => {
      if (typeof id !== 'number') {
          toast.info("Notifikasi ini tidak dapat ditandai.");
          return;
      }
      const originalList = [...notifList];
      setNotifList(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      try {
          const response = await fetch(`/api/notifications/${id}/mark-read`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'Accept': 'application/json' },
          });
          if (!response.ok) throw new Error('Gagal menandai notifikasi');
          toast.success("Notifikasi ditandai dibaca.");
      } catch (error) {
          toast.error("Gagal menandai notifikasi.");
          setNotifList(originalList);
          setUnreadCount(prev => prev + 1);
      }
  };

  const handleDelete = async (id: number | string) => {
      if (typeof id !== 'number') {
          toast.error("Notifikasi sistem tidak dapat dihapus.");
          return;
      }
      const notificationToDelete = notifList.find(n => n.id === id);
      if (!notificationToDelete) return;
      const wasUnread = !notificationToDelete.read_at;
      setNotifList(prev => prev.filter(n => n.id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
      try {
          const response = await fetch(`/api/notifications/${id}`, {
              method: 'DELETE',
              headers: { 'X-CSRF-TOKEN': getCsrfToken(), 'Accept': 'application/json' },
          });
          if (!response.ok) throw new Error('Gagal menghapus notifikasi');
          toast.success("Notifikasi dihapus.");
      } catch (error) {
          toast.error("Gagal menghapus notifikasi.");
          setNotifList(prev => [...prev, notificationToDelete].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          if (wasUnread) setUnreadCount(prev => prev + 1);
      }
  };


  // Sisa dari komponen (Sidebar, Navigasi, dll) tetap sama
  // ...
  // Anda tidak perlu mengubah kode di bawah ini, cukup pastikan kode di atas sudah benar
  // ...

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
      <div
        className={cn(
          "flex items-center border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50",
          sidebarCollapsed && !mobile ? "px-4 py-5 justify-center" : "px-6 py-5"
        )}
      >
        <img 
          src="/bpslogo.png" 
          alt="BPS Logo" 
          className={cn(
            "object-contain",
            sidebarCollapsed && !mobile ? "h-8 w-8" : "h-10 w-10"
          )}
        />
        {(!sidebarCollapsed || mobile) && (
          <div className="ml-4">
            <h1 className="text-lg font-semibold text-gray-900">BPS Riau</h1>
            <p className="text-sm text-gray-600">SIPERU</p>
          </div>
        )}
      </div>

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

      {(!sidebarCollapsed || mobile) && (
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border cursor-pointer hover:bg-gray-50">
                <Avatar className="h-10 w-10">
                    {user.avatar && (
                       <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    
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
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-full max-w-sm">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm",
          sidebarCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        <Sidebar />
      </div>

      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
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

              <div className="hidden sm:flex sm:items-center sm:space-x-2 text-sm">
                <Home className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">/</span>
                <span className="text-gray-600 capitalize font-medium">
                  {url.split("/")[1] || "dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 max-h-[32rem] overflow-y-auto">
                    <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Notifikasi</span>
                        {unreadCount > 0 && <Badge variant="destructive" className="ml-2">{unreadCount} baru</Badge>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(!notifList || notifList.length === 0) ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 font-medium">Tidak ada notifikasi</p>
                        </div>
                    ) : (
                        <>
                            {notifList.slice(0, 10).map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onSelect={(e) => e.preventDefault()}
                                    className={cn("flex items-start gap-3 py-3 px-2 cursor-pointer transition-colors focus:bg-gray-100", !notification.read_at && "bg-blue-50 hover:bg-blue-100 focus:bg-blue-100")}
                                >
                                    <div className="flex-1 min-w-0 space-y-1" onClick={() => router.get('/notifications')}>
                                        <p className={cn("text-sm font-medium leading-tight", !notification.read_at ? "text-gray-900" : "text-gray-700")}>{notification.title}</p>
                                        <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                                        <p className="text-[10px] text-gray-400">{notification.time_ago}</p>
                                    </div>

                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        {!notification.read_at && (
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" title="Tandai sudah dibaca" onClick={() => handleMarkAsRead(notification.id)}>
                                                <Check className="h-4 w-4 text-emerald-600" />
                                            </Button>
                                        )}
                                        {typeof notification.id === 'number' && (
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-red-100" title="Hapus notifikasi" onClick={() => handleDelete(notification.id)}>
                                                <X className="h-4 w-4 text-red-600" />
                                            </Button>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/notifications" className="w-full justify-center flex text-center text-blue-600 font-medium py-2">Lihat semua notifikasi</Link>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            </div>
          </div>
        </div>

        {header && (
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-6 sm:px-6">{header}</div>
          </div>
        )}

        <main className="flex-1 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}