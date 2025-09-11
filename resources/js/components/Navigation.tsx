import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { BPSLogo } from './BPSLogo';
import {
    LayoutDashboard,
    Building,
    Users,
    Calendar,
    History,
    Settings,
    LogOut,
    User as UserIcon,
    Menu,
    X,
    ChevronDown,
    Lock
} from 'lucide-react';
import { PageProps } from '@/types';

interface NavItem {
    label: string;
    href: string;
    icon: any;
    permission?: string;
    active?: boolean;
}

export function Navigation() {
    const { auth, url } = usePage<PageProps>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const user = auth.user;
    
    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: 'dashboard',
            icon: LayoutDashboard,
        },
        {
            label: 'Ruangan',
            href: 'rooms.index',
            icon: Building,
        },
        {
            label: 'Peminjaman',
            href: 'borrowings.index',
            icon: Calendar,
        },
        {
            label: 'Persetujuan',
            href: 'approvals.index',
            icon: Users,
            permission: 'can_approve_rejects',
        },
        {
            label: 'Pengguna',
            href: 'users.index',
            icon: Users,
            permission: 'can_manage_users',
        },
        {
            label: 'Riwayat',
            href: 'history.index',
            icon: History,
        },
        {
            label: 'Pengaturan',
            href: 'settings.index',
            icon: Settings,
        },
    ];

    const canAccess = (permission?: string) => {
        if (!permission || !user) return true;
        return user[permission as keyof typeof user] === true;
    };

    const isActive = (href: string) => {
        return url.startsWith('/' + href.replace('.', '/'));
    };

    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            // Using Inertia's post method for logout
            window.location.href = route('logout');
        }
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                    {/* Logo */}
                    <Link href={route('dashboard')} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <BPSLogo className="text-white" size="sm" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">BPS Riau</h1>
                            <p className="text-xs text-gray-600">Sistem Manajemen</p>
                        </div>
                    </Link>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const hasAccess = canAccess(item.permission);
                            const active = isActive(item.href);

                            return (
                                <div key={item.href} className="relative">
                                    {hasAccess ? (
                                        <Link href={route(item.href)}>
                                            <Button
                                                variant={active ? "default" : "ghost"}
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Icon className="h-4 w-4" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled
                                            className="flex items-center gap-2 opacity-60"
                                        >
                                            <Lock className="h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-3 p-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatar || ''} alt={user?.name || ''} />
                                    <AvatarFallback>
                                        {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {user?.role_label || user?.role}
                                    </p>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={route('profile.edit')} className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    Edit Profil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route('settings.index')} className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Pengaturan
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Keluar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="lg:hidden bg-white border-b border-gray-200">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href={route('dashboard')} className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                                <BPSLogo className="text-white" size="xl" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 text-sm">BPS Riau</h1>
                            </div>
                        </Link>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="mt-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const hasAccess = canAccess(item.permission);
                                const active = isActive(item.href);

                                return (
                                    <div key={item.href}>
                                        {hasAccess ? (
                                            <Link href={route(item.href)}>
                                                <Button
                                                    variant={active ? "default" : "ghost"}
                                                    size="sm"
                                                    className="w-full justify-start gap-2"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.label}
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled
                                                className="w-full justify-start gap-2 opacity-60"
                                            >
                                                <Lock className="h-4 w-4" />
                                                {item.label}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="border-t pt-2 mt-4">
                                <div className="flex items-center gap-3 p-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar || ''} alt={user?.name || ''} />
                                        <AvatarFallback>
                                            {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {user?.role_label || user?.role}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1 mt-2">
                                    <Link href={route('profile.edit')}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start gap-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <UserIcon className="h-4 w-4" />
                                            Edit Profil
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start gap-2 text-red-600"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Keluar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}