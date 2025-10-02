import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Building2,
    Calendar,
    Users,
    CheckSquare,
    FileText,
    Plus,
    ArrowRight,
    Clock,
    MapPin,
    User,
    AlertCircle,
    TrendingUp,
    Activity,
    Eye,
    Edit,
    Settings,
    BarChart3,
    PieChart,
    RefreshCw
} from 'lucide-react';
import { cn, formatDateTime, formatRelativeTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, DashboardStats, Room, Borrowing, User as UserType } from '@/types';

interface DashboardPageProps extends PageProps {
    stats?: DashboardStats;
    recent_rooms?: Room[];
    recent_borrowings?: Borrowing[];
    pending_approvals?: Borrowing[];
    active_borrowings?: Borrowing[];
}

export default function Dashboard({
    auth,
    stats = {
        total_rooms: 6,
        available_rooms: 4,
        occupied_rooms: 2,
        maintenance_rooms: 0,
        total_borrowings_today: 8,
        pending_approvals: 3,
        active_borrowings: 2,
        total_users: 15,
        monthly_bookings: [],
        room_utilization: [],
        recent_activities: [],
        total_borrowings: 15,
        completed_borrowings: 10,
        cancelled_borrowings: 5,
        user_stats: {

            total: 15,
            active: 12,
            inactive: 3,
            admins: 2,
            super_admins: 1,
            regular_users: 13,
            by_category: {
                employee: 10,
                guest: 4,
                intern: 1,
            },
        },
        borrowing_stats: {
            today: 8, 
            this_week: 25,
            this_month: 150,
            pending: 3,
            approved: 10,
            active: 2,
            completed: 10,
            rejected: 2,
            cancelled: 5,
        },
    },
    recent_rooms = [],
    recent_borrowings = [],
    pending_approvals = [],
    active_borrowings = [],
}: DashboardPageProps) {
    const [refreshing, setRefreshing] = useState(false);

    const refreshData = async () => {
        setRefreshing(true);
        try {
            router.reload({ 
                only: ['stats', 'recent_rooms', 'recent_borrowings', 'pending_approvals', 'active_borrowings']
            });
        } finally {
            setTimeout(() => setRefreshing(false), 1000);
        }
    };

    const quickActions = [
        {
            title: 'Pinjam Ruangan',
            description: 'Buat permintaan peminjaman ruangan baru',
            icon: Plus,
            href: '/Borrowings/Create',
            color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
            available: true,
        },
        {
            title: 'Lihat Ruangan',
            description: 'Cek status dan ketersediaan ruangan',
            icon: Building2,
            href: '/Rooms',
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
            available: true,
        },
        {
            title: 'Persetujuan',
            description: 'Kelola persetujuan peminjaman ruangan',
            icon: CheckSquare,
            href: '/Approvals',
            color: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
            available: ['admin', 'super-admin'].includes(auth.user.role),
            badge: pending_approvals.length,
        },
        {
            title: 'Riwayat',
            description: 'Lihat riwayat peminjaman ruangan',
            icon: FileText,
            href: '/History',
            color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
            available: true,
        },
    ];

    const roomUtilization = stats.room_utilization || [];
    const monthlyBookings = stats.monthly_bookings || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Selamat Datang, {auth.user.name.split(' ')[0]}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Dashboard Sistem Manajemen Ruangan BPS Riau
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshData}
                            disabled={refreshing}
                            className="smooth-transition"
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                            Refresh
                        </Button>
                        <Badge variant="outline" className="px-3 py-1">
                            {formatDateTime(new Date(), { 
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Badge>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 smooth-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Total Ruangan</p>
                                    <p className="text-3xl font-bold text-blue-900">{stats.total_rooms}</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 smooth-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-700">Ruangan Tersedia</p>
                                    <p className="text-3xl font-bold text-emerald-900">{stats.available_rooms}</p>
                                </div>
                                <div className="h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <CheckSquare className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 smooth-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Peminjaman Hari Ini</p>
                                    <p className="text-3xl font-bold text-orange-900">{stats.total_borrowings_today}</p>
                                </div>
                                <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 smooth-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">
                                        {['admin', 'super-admin'].includes(auth.user.role) ? 'Menunggu Persetujuan' : 'Total Pengguna'}
                                    </p>
                                    <p className="text-3xl font-bold text-purple-900">
                                        {['admin', 'super-admin'].includes(auth.user.role) ? stats.pending_approvals : stats.total_users}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                    {['admin', 'super-admin'].includes(auth.user.role) ? (
                                        <AlertCircle className="h-6 w-6 text-white" />
                                    ) : (
                                        <Users className="h-6 w-6 text-white" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-blue-600" />
                            Tindakan Cepat
                        </CardTitle>
                        <CardDescription>
                            Akses cepat ke fitur-fitur utama sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions
                                .filter(action => action.available)
                                .map((action) => (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="group relative"
                                >
                                    <div className={cn(
                                        "p-6 rounded-xl text-white smooth-transition",
                                        action.color
                                    )}>
                                        <div className="flex items-center justify-between mb-3">
                                            <action.icon className="h-8 w-8" />
                                            {action.badge && action.badge > 0 && (
                                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                                    {action.badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                                        <p className="text-sm opacity-90">{action.description}</p>
                                        <ArrowRight className="h-4 w-4 mt-3 group-hover:translate-x-1 smooth-transition" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
                        <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                        <TabsTrigger value="rooms">Status Ruangan</TabsTrigger>
                        <TabsTrigger value="bookings">Peminjaman</TabsTrigger>
                        <TabsTrigger value="analytics">Analitik</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="h-5 w-5 mr-2 text-blue-600" />
                                        Aktivitas Terbaru
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {stats.recent_activities?.slice(0, 5).map((activity, index) => (
                                        <div key={activity.id || index} className="flex items-start space-x-3">
                                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.title}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatRelativeTime(activity.timestamp)} 
                                                    {activity.user && ` • ${activity.user}`}
                                                </p>
                                            </div>
                                        </div>
                                    )) || (
                                        <div className="text-center py-8 text-gray-500">
                                            <Activity className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                            <p>Belum ada aktivitas terbaru</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Room Utilization */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                                        Utilisasi Ruangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {roomUtilization.length > 0 ? roomUtilization.map((room, index) => (
                                        <div key={room.room_name || index} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-900">
                                                    Ruang {room.room_name}
                                                </span>
                                                <span className="text-gray-600">
                                                    {room.utilization}%
                                                </span>
                                            </div>
                                            <Progress 
                                                value={room.utilization} 
                                                className="h-2"
                                            />
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <PieChart className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                            <p>Data utilisasi belum tersedia</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Rooms Tab */}
                    <TabsContent value="rooms" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recent_rooms.length > 0 ? recent_rooms.map((room) => (
                                <Card key={room.id} className="smooth-hover">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Ruang {room.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {room.full_name}
                                                </p>
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className={cn("border", getStatusColor(room.status))}
                                            >
                                                {getStatusLabel(room.status, 'room')}
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="h-4 w-4 mr-2" />
                                                Kapasitas: {room.capacity} orang
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                {room.location || 'Lokasi tidak tersedia'}
                                            </div>
                                        </div>

                                        {room.current_borrowing && (
                                            <div className="p-3 bg-blue-50 rounded-lg mb-4">
                                                <p className="text-sm font-medium text-blue-900 mb-1">
                                                    Sedang Digunakan
                                                </p>
                                                <p className="text-sm text-blue-700">
                                                    {room.current_borrowing.borrower_name}
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    {formatDateTime(room.current_borrowing.borrowed_at)} - 
                                                    {room.current_borrowing.planned_return_at && 
                                                        formatDateTime(room.current_borrowing.planned_return_at)
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex space-x-2">
                                            <Button asChild variant="outline" size="sm" className="flex-1">
                                                <Link href={`/Rooms/${room.id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Detail
                                                </Link>
                                            </Button>
                                            {room.status === 'dipakai' && (
                                                <Button asChild size="sm" className="flex-1">
                                                    <Link href={`/Borrowings/Create?room=${room.id}`}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Pinjam
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="col-span-full">
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Belum Ada Data Ruangan
                                            </h3>
                                            <p className="text-gray-600 mb-6">
                                                Sistem belum memiliki data ruangan yang dapat ditampilkan.
                                            </p>
                                            {['admin', 'super-admin'].includes(auth.user.role) && (
                                                <Button asChild>
                                                    <Link href="/Rooms/create">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Tambah Ruangan
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Bookings Tab */}
                    <TabsContent value="bookings" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Active Borrowings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center">
                                            <Activity className="h-5 w-5 mr-2 text-green-600" />
                                            Peminjaman Aktif
                                        </span>
                                        <Badge variant="secondary">
                                            {active_borrowings.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {active_borrowings.slice(0, 3).map((borrowing) => (
                                        <div key={borrowing.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        Ruang {borrowing.room?.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {borrowing.borrower_name}
                                                    </p>
                                                </div>
                                                <Badge 
                                                    variant="outline"
                                                    className={cn("border", getStatusColor(borrowing.status))}
                                                >
                                                    {getStatusLabel(borrowing.status, 'borrowing')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">
                                                {borrowing.purpose}
                                            </p>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatDateTime(borrowing.borrowed_at)}
                                                {borrowing.planned_return_at && (
                                                    <> - {formatDateTime(borrowing.planned_return_at)}</>
                                                )}
                                            </div>
                                        </div>
                                    )) || (
                                        <div className="text-center py-8 text-gray-500">
                                            <Calendar className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                            <p>Tidak ada peminjaman aktif</p>
                                        </div>
                                    )}

                                    {active_borrowings.length > 3 && (
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href="/Borrowings?status=active">
                                                Lihat Semua ({active_borrowings.length})
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pending Approvals or Recent Borrowings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center">
                                            {['admin', 'super-admin'].includes(auth.user.role) ? (
                                                <>
                                                    <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                                                    Menunggu Persetujuan
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                                                    Peminjaman Terbaru Anda
                                                </>
                                            )}
                                        </span>
                                        <Badge variant="secondary">
                                            {['admin', 'super-admin'].includes(auth.user.role) ? 
                                                pending_approvals.length : 
                                                recent_borrowings.filter(b => b.user_id === auth.user.id).length
                                            }
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {['admin', 'super-admin'].includes(auth.user.role) ? (
                                        // Admin view: Pending Approvals
                                        <>
                                            {pending_approvals.slice(0, 3).map((borrowing) => (
                                                <div key={borrowing.id} className="border rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                Ruang {borrowing.room?.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                {borrowing.borrower_name}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="text-orange-700 bg-orange-50 border-orange-200">
                                                            Pending
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        {borrowing.purpose}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {formatRelativeTime(borrowing.created_at)}
                                                        </div>
                                                        <Button 
                                                            asChild 
                                                            size="sm" 
                                                            variant="outline"
                                                        >
                                                            <Link href={`/Approvals`}>
                                                                Review
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )) || (
                                                <div className="text-center py-8 text-gray-500">
                                                    <CheckSquare className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                                    <p>Tidak ada peminjaman yang menunggu persetujuan</p>
                                                </div>
                                            )}

                                            {pending_approvals.length > 3 && (
                                                <Button asChild variant="outline" className="w-full">
                                                    <Link href="/Approvals">
                                                        Lihat Semua ({pending_approvals.length})
                                                    </Link>
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        // User view: Recent Borrowings
                                        <>
                                            {recent_borrowings
                                                .filter(b => b.user_id === auth.user.id)
                                                .slice(0, 3)
                                                .map((borrowing) => (
                                                <div key={borrowing.id} className="border rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                Ruang {borrowing.room?.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                {borrowing.purpose}
                                                            </p>
                                                        </div>
                                                        <Badge 
                                                            variant="outline"
                                                            className={cn("border", getStatusColor(borrowing.status))}
                                                        >
                                                            {getStatusLabel(borrowing.status, 'borrowing')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatDateTime(borrowing.borrowed_at)}
                                                    </div>
                                                </div>
                                            )) || (
                                                <div className="text-center py-8 text-gray-500">
                                                    <FileText className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                                    <p>Belum ada peminjaman</p>
                                                </div>
                                            )}
                                            
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href="/History">
                                                    Lihat Semua Riwayat
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Bookings Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                                        Tren Peminjaman Bulanan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {monthlyBookings.length > 0 ? (
                                        <div className="space-y-4">
                                            {monthlyBookings.map((month, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium text-gray-900">
                                                            {month.month}
                                                        </span>
                                                        <span className="text-gray-600">
                                                            {month.bookings} peminjaman
                                                        </span>
                                                    </div>
                                                    <Progress 
                                                        value={(month.bookings / Math.max(...monthlyBookings.map(m => m.bookings))) * 100} 
                                                        className="h-2"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <BarChart3 className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                            <p>Data analitik belum tersedia</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Statistics Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                                        Ringkasan Statistik
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-900">
                                                    {stats.total_rooms > 0 ? 
                                                        ((stats.available_rooms / stats.total_rooms) * 100).toFixed(0) : 
                                                        0
                                                    }%
                                                </div>
                                                <div className="text-sm text-blue-700">
                                                    Tingkat Ketersediaan
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                                <div className="text-2xl font-bold text-emerald-900">
                                                    {stats.active_borrowings}
                                                </div>
                                                <div className="text-sm text-emerald-700">
                                                    Peminjaman Aktif
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Ruangan Tersedia</span>
                                                <span className="font-medium text-emerald-600">
                                                    {stats.available_rooms}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Ruangan Terpakai</span>
                                                <span className="font-medium text-orange-600">
                                                    {stats.occupied_rooms}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Maintenance</span>
                                                <span className="font-medium text-red-600">
                                                    {stats.maintenance_rooms}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}