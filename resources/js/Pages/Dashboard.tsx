import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Building2,
    Calendar,
    Users,
    CheckCircle,
    Wrench,
    Clock,
    TrendingUp,
    TrendingDown,
    History as HistoryIcon,
    Plus,
    Eye,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    User,
    FileText,
    AlertTriangle,
    CheckSquare,
    XCircle,
    Timer,
    Zap,
    RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

interface DashboardStats {
    total_rooms: number;
    available_rooms: number;
    occupied_rooms: number;
    maintenance_rooms: number;
    total_borrowings_today: number;
    pending_approvals: number;
    active_borrowings: number;
    total_users: number;
    total_borrowings: number;
    completed_borrowings: number;
    cancelled_borrowings: number;
    user_stats?: {
        total: number;
        active: number;
        inactive: number;
        admins: number;
        super_admins: number;
        regular_users: number;
        by_category: {
            employee: number;
            guest: number;
            intern: number;
        };
    };
    borrowing_stats?: {
        today: number;
        this_week: number;
        this_month: number;
        pending: number;
        approved: number;
        active: number;
        completed: number;
        rejected: number;
        cancelled: number;
    };
}

interface RoomUtilization {
    room_name: string;
    utilization: number;
    total_hours: number;
}

interface MonthlyBooking {
    month: string;
    bookings: number;
}

interface RecentActivity {
    id: number;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    user?: string;
    room?: string;
    borrowing_id?: number;
    status?: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
    borrowed_at?: string;
    planned_return_at?: string;
}

interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
    room_utilization: RoomUtilization[];
    monthly_bookings: MonthlyBooking[];
    recent_activities: RecentActivity[];
    recent_rooms?: any[];
    recent_borrowings?: any[];
    pending_approvals?: any[];
    active_borrowings?: any[];
}

const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'borrowing_created':
            return <Plus className="h-4 w-4 text-blue-600" />;
        case 'borrowing_approved':
            return <CheckCircle className="h-4 w-4 text-emerald-600" />;
        case 'borrowing_active':
            return <Activity className="h-4 w-4 text-orange-600" />;
        case 'borrowing_completed':
            return <CheckSquare className="h-4 w-4 text-emerald-600" />;
        case 'borrowing_rejected':
            return <XCircle className="h-4 w-4 text-red-600" />;
        case 'borrowing_cancelled':
            return <XCircle className="h-4 w-4 text-gray-600" />;
        case 'room_maintenance':
            return <Wrench className="h-4 w-4 text-red-600" />;
        case 'user_registered':
            return <User className="h-4 w-4 text-purple-600" />;
        default:
            return <Activity className="h-4 w-4 text-blue-600" />;
    }
};

const getActivityColor = (type: string) => {
    switch (type) {
        case 'borrowing_created':
            return 'bg-blue-50';
        case 'borrowing_approved':
            return 'bg-emerald-50';
        case 'borrowing_active':
            return 'bg-orange-50';
        case 'borrowing_completed':
            return 'bg-emerald-50';
        case 'borrowing_rejected':
            return 'bg-red-50';
        case 'borrowing_cancelled':
            return 'bg-gray-50';
        case 'room_maintenance':
            return 'bg-red-50';
        case 'user_registered':
            return 'bg-purple-50';
        default:
            return 'bg-blue-50';
    }
};

export default function Dashboard({ 
    auth, 
    stats, 
    room_utilization, 
    monthly_bookings, 
    recent_activities 
}: DashboardPageProps) {
    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);
    const firstName = auth.user.name.split(' ')[0];
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // In production, this would call the API to refresh data
        setTimeout(() => {
            setIsRefreshing(false);
            window.location.reload();
        }, 1000);
    };

        const quickStats: {
        title: string;
        value: number;
        change: string;
        trend: 'neutral' | 'up' | 'down';
        icon: any;
        color: string;
        bgGradient: string;
        href: string;
        description: string;
    }[] = [
        {
            title: 'Total Ruangan',
            value: stats.total_rooms,
            change: '+0%',
            trend: 'neutral',
            icon: Building2,
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            bgGradient: 'from-blue-500 to-blue-600',
            href: route('Rooms.Index'),
            description: 'Total ruangan yang tersedia',
        },
        {
            title: 'Ruangan Tersedia',
            value: stats.available_rooms,
            change: `${((stats.available_rooms / stats.total_rooms) * 100).toFixed(0)}%`,
            trend: 'up',
            icon: CheckCircle,
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            bgGradient: 'from-emerald-500 to-emerald-600',
            href: route('Rooms.Index', { status: 'tersedia' }),
            description: 'Siap untuk dipinjam',
        },
        {
            title: 'Sedang Digunakan',
            value: stats.occupied_rooms,
            change: `${((stats.occupied_rooms / stats.total_rooms) * 100).toFixed(0)}%`,
            trend: stats.occupied_rooms > stats.available_rooms ? 'up' : 'down',
            icon: Users,
            color: 'bg-orange-50 text-orange-700 border-orange-200',
            bgGradient: 'from-orange-500 to-orange-600',
            href: route('Rooms.Index', { status: 'dipakai' }),
            description: 'Ruangan aktif digunakan',
        },
        {
            title: 'Maintenance',
            value: stats.maintenance_rooms,
            change: `${((stats.maintenance_rooms / stats.total_rooms) * 100).toFixed(0)}%`,
            trend: stats.maintenance_rooms > 0 ? 'up' : 'neutral',
            icon: Wrench,
            color: 'bg-red-50 text-red-700 border-red-200',
            bgGradient: 'from-red-500 to-red-600',
            href: route('Rooms.Index', { status: 'pemeliharaan' }),
            description: 'Dalam pemeliharaan',
        },
    ];


    const borrowingStats = [
        {
            title: 'Peminjaman Hari Ini',
            value: stats.total_borrowings_today,
            icon: Calendar,
            color: 'bg-blue-50 text-blue-700',
            iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
            href: route('Borrowings.Index'),
            subtitle: 'Total hari ini'
        },
        {
            title: 'Menunggu Persetujuan',
            value: stats.pending_approvals,
            icon: Clock,
            color: 'bg-yellow-50 text-yellow-700',
            iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
            href: route('approvals.index'),
            adminOnly: true,
            subtitle: 'Perlu ditinjau',
            urgent: stats.pending_approvals > 0
        },
        {
            title: 'Sedang Berlangsung',
            value: stats.active_borrowings,
            icon: Activity,
            color: 'bg-emerald-50 text-emerald-700',
            iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            href: route('Borrowings.Index', { status: 'active' }),
            subtitle: 'Peminjaman aktif'
        },
        {
            title: 'Total Pengguna',
            value: stats.total_users,
            icon: User,
            color: 'bg-purple-50 text-purple-700',
            iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
            href: route('users.Index'),
            adminOnly: true,
            subtitle: 'Pengguna terdaftar'
        }
    ];

    const filteredBorrowingStats = borrowingStats.filter(stat => 
        !stat.adminOnly || isAdmin
    );

    const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up':
                return <ArrowUpRight className="h-4 w-4 text-emerald-600" />;
            case 'down':
                return <ArrowDownRight className="h-4 w-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up':
                return 'text-emerald-600 bg-emerald-50';
            case 'down':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    // Calculate statistics
    const roomOccupancyRate = ((stats.occupied_rooms / stats.total_rooms) * 100).toFixed(1);
    const availabilityRate = ((stats.available_rooms / stats.total_rooms) * 100).toFixed(1);
    const totalBorrowings = stats.total_borrowings || 0;
    const completionRate = totalBorrowings > 0 
        ? ((stats.completed_borrowings / totalBorrowings) * 100).toFixed(1) 
        : '0';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Enhanced Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1>
                                Selamat Datang, {firstName}
                            </h1>
                            <Badge variant="outline" className="bg-gradient-to-r from-primary to-primary-dark text-white border-0">
                                <Zap className="h-3 w-3 mr-1" />
                                Live
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Dashboard Sistem Peminjaman Ruangan BPS Provinsi Riau
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                                {currentTime.toLocaleDateString('id-ID', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('Rooms.Index')}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Ruangan
                            </Link>
                        </Button>
                        <Button size="sm" asChild className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary">
                            <Link href={route('Borrowings.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Peminjaman
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Quick Stats - Enhanced */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card 
                                key={stat.title} 
                                className="smooth-hover border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={cn("h-1 bg-gradient-to-r", stat.bgGradient)} />
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-muted-foreground mb-1 truncate">
                                                {stat.title}
                                            </p>
                                            <p className="tracking-tight mb-2">
                                                {stat.value}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                                                    getTrendColor(stat.trend)
                                                )}>
                                                    {getTrendIcon(stat.trend)}
                                                    <span>{stat.change}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {stat.description}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-300",
                                            stat.color
                                        )}>
                                            <Icon className="h-7 w-7" />
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-4 justify-center hover:bg-accent group-hover:translate-x-1 transition-transform"
                                        asChild
                                    >
                                        <Link href={stat.href}>
                                            Lihat Detail
                                            <ArrowUpRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Borrowing Stats - Enhanced */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {filteredBorrowingStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card 
                                key={stat.title} 
                                className={cn(
                                    "smooth-hover border-0 shadow-md hover:shadow-xl transition-all duration-300 group",
                                    stat.urgent && "ring-2 ring-yellow-400 ring-offset-2"
                                )}
                                style={{ animationDelay: `${(index + 4) * 100}ms` }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className={cn(
                                            "p-4 rounded-2xl shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform",
                                            stat.iconBg
                                        )}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-muted-foreground mb-1 truncate">
                                                {stat.title}
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="tracking-tight">
                                                    {stat.value}
                                                </p>
                                                {stat.urgent && (
                                                    <Badge variant="destructive" className="text-xs animate-pulse">
                                                        Urgent
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {stat.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-4 justify-center hover:bg-accent"
                                        asChild
                                    >
                                        <Link href={stat.href}>
                                            Lihat Detail
                                            <ArrowUpRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Statistics Overview - New Section */}
                {isAdmin && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tingkat Hunian</p>
                                        <p className="text-3xl tracking-tight mt-1">{roomOccupancyRate}%</p>
                                    </div>
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                                        <BarChart3 className="h-8 w-8" />
                                    </div>
                                </div>
                                <Progress value={parseFloat(roomOccupancyRate)} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {stats.occupied_rooms} dari {stats.total_rooms} ruangan terisi
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tingkat Ketersediaan</p>
                                        <p className="text-3xl tracking-tight mt-1">{availabilityRate}%</p>
                                    </div>
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
                                        <CheckCircle className="h-8 w-8" />
                                    </div>
                                </div>
                                <Progress value={parseFloat(availabilityRate)} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {stats.available_rooms} ruangan siap dipinjam
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tingkat Penyelesaian</p>
                                        <p className="text-3xl tracking-tight mt-1">{completionRate}%</p>
                                    </div>
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                        <TrendingUp className="h-8 w-8" />
                                    </div>
                                </div>
                                <Progress value={parseFloat(completionRate)} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {stats.completed_borrowings} dari {totalBorrowings} peminjaman
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Room Utilization - Enhanced */}
                   <Card className="border-0 shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white">
                            <BarChart3 className="h-5 w-5" />
                            </div>
                            Utilisasi Ruangan
                        </CardTitle>
                        <Badge variant="secondary">30 Hari</Badge>
                        </div>
                        <CardDescription>
                        Persentase penggunaan ruangan dalam 30 hari terakhir
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {room_utilization?.slice(0, 6).map((room) => (
                        <div key={room.room_name} className="space-y-2">
                            <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <p className="text-sm font-medium">{room.room_name}</p>
                                <p className="text-xs text-muted-foreground">
                                {room.total_hours || 0} jam digunakan
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">{room.utilization.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">utilisasi</p>
                            </div>
                            </div>

                            <div className="relative mt-1">
                            <Progress value={room.utilization} className="h-2.5 bg-gray-100" />
                            <div
                                className="absolute top-0 left-0 h-2.5 bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                                style={{ width: `${room.utilization}%` }}
                            />
                            </div>
                        </div>
                        ))}

                        <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-6"
                        asChild
                        >
                        <Link href={route('history.index')}>
                            <FileText className="h-4 w-4 mr-2" />
                            Lihat Laporan Lengkap
                        </Link>
                        </Button>
                    </CardContent>
                    </Card>

                    {/* Recent Activities - Enhanced */}
                   <Card className="border-0 shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center text-white">
                                    <Activity className="h-5 w-5" />
                                </div>
                                Aktivitas Peminjaman Terbaru
                            </CardTitle>
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                Live
                            </Badge>
                        </div>
                        <CardDescription>
                            Peminjaman yang sedang berlangsung dan baru ditambahkan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recent_activities && recent_activities.length > 0 ? (
                            <>
                                {recent_activities.map((activity, index) => (
                                    <Link
                                        key={activity.id}
                                        href={`/Borrowings/${activity.borrowing_id}`}
                                        className="block"
                                    >
                                        <div 
                                            className="flex gap-3 p-4 rounded-lg hover:bg-accent/50 transition-all duration-200 group border border-transparent hover:border-primary/20"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="shrink-0">
                                                <div className={cn(
                                                    "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm group-hover:scale-110 transition-transform",
                                                    getActivityColor(activity.type)
                                                )}>
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium leading-tight">
                                                        {activity.title}
                                                    </p>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                            "shrink-0 text-xs",
                                                            activity.status === 'pending' && "border-yellow-500 text-yellow-700 bg-yellow-50",
                                                            activity.status === 'approved' && "border-blue-500 text-blue-700 bg-blue-50",
                                                            activity.status === 'active' && "border-emerald-500 text-emerald-700 bg-emerald-50"
                                                        )}
                                                    >
                                                        {activity.status === 'pending' && 'Menunggu'}
                                                        {activity.status === 'approved' && 'Disetujui'}
                                                        {activity.status === 'active' && 'Aktif'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-tight line-clamp-2">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span className="font-medium">{activity.user}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        <span>{activity.room}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{formatDateTime(activity.timestamp)}</span>
                                                    </div>
                                                </div>
                                                {activity.borrowed_at && (
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {formatDateTime(activity.borrowed_at)}
                                                            {activity.planned_return_at && (
                                                                <> - {formatDateTime(activity.planned_return_at)}</>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                                        </div>
                                    </Link>
                                ))}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full mt-4 group"
                                    asChild
                                >
                                    <Link href={route('Borrowings.Index')}>
                                        <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                        Lihat Semua Peminjaman
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                                    <Activity className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Belum ada aktivitas peminjaman
                                </p>
                                <Button size="sm" asChild variant="outline">
                                    <Link href={route('Borrowings.create')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Peminjaman
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>

                {/* Monthly Bookings Chart - Enhanced */}
                {monthly_bookings && monthly_bookings.length > 0 && (
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    Tren Peminjaman Bulanan
                                </CardTitle>
                                <Badge variant="secondary">12 Bulan</Badge>
                            </div>
                            <CardDescription>
                                Statistik peminjaman dalam 12 bulan terakhir
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-4">
                                {monthly_bookings.map((data, index) => {
                                    const maxBookings = Math.max(...monthly_bookings.map(d => d.bookings));
                                    const height = maxBookings > 0 ? (data.bookings / maxBookings) * 100 : 0;
                                    const isCurrentMonth = index === monthly_bookings.length - 1;
                                    
                                    return (
                                        <div 
                                            key={data.month} 
                                            className="text-center group"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="relative h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                                <div 
                                                    className={cn(
                                                        "absolute bottom-0 w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110",
                                                        isCurrentMonth 
                                                            ? "bg-gradient-to-t from-primary to-primary-light" 
                                                            : "bg-gradient-to-t from-primary/70 to-primary-light/70"
                                                    )}
                                                    style={{ height: `${height}%` }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white font-bold text-lg drop-shadow-lg">
                                                        {data.bookings}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "text-xs mb-1",
                                                isCurrentMonth ? "font-bold text-primary" : "text-muted-foreground"
                                            )}>
                                                {data.month}
                                            </div>
                                            <div className={cn(
                                                "text-sm",
                                                isCurrentMonth && "font-bold text-primary"
                                            )}>
                                                {data.bookings}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions - Enhanced */}
                <Card className="border-0 shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Aksi Cepat
                        </CardTitle>
                        <CardDescription>
                            Akses cepat ke fitur yang sering digunakan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Button 
                                variant="outline" 
                                className="h-24 flex-col gap-3 border-2 border-dashed hover:border-solid hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary transition-all duration-300 group" 
                                asChild
                            >
                                <Link href={route('Borrowings.create')}>
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm">Buat Peminjaman</span>
                                </Link>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-24 flex-col gap-3 border-2 border-dashed hover:border-solid hover:bg-gradient-to-br hover:from-secondary/10 hover:to-secondary/5 hover:border-secondary transition-all duration-300 group" 
                                asChild
                            >
                                <Link href={route('Rooms.Index')}>
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm">Lihat Ruangan</span>
                                </Link>
                            </Button>
                            {isAdmin && (
                                <>
                                    <Button 
                                        variant="outline" 
                                        className="h-24 flex-col gap-3 border-2 border-dashed hover:border-solid hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-emerald-500/5 hover:border-emerald-500 transition-all duration-300 group" 
                                        asChild
                                    >
                                        <Link href={route('approvals.index')}>
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm">Persetujuan</span>
                                            {stats.pending_approvals > 0 && (
                                                <Badge className="absolute -top-1 -right-1 bg-red-500">
                                                    {stats.pending_approvals}
                                                </Badge>
                                            )}
                                        </Link>
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="h-24 flex-col gap-3 border-2 border-dashed hover:border-solid hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-purple-500/5 hover:border-purple-500 transition-all duration-300 group" 
                                        asChild
                                    >
                                        <Link href={route('users.Index')}>
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm">Kelola Pengguna</span>
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
