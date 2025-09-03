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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    RefreshCw,
    Shield,
    Database,
    Server,
    Cpu,
    HardDrive,
    Zap,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Crown,
    Star,
    Award,
    Target
} from 'lucide-react';
import { cn, formatDateTime, formatRelativeTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, DashboardStats, Room, Borrowing, User as UserType } from '@/types';

interface SuperAdminDashboardProps extends PageProps {
    stats: DashboardStats & {
        total_users: number;
        admin_users: number;
        regular_users: number;
        active_users: number;
        database_size: string | number;
        storage_used: string | number;
        cache_size: string | number;
        system_uptime: string;
    };
    recent_activities: Array<{
        id: number;
        title: string;
        description: string;
        timestamp: string;
        user: string;
        type: string;
    }>;
    system_health: {
        database: { status: string; message: string };
        storage: { status: string; message: string };
        queue: { status: string; message: string };
        cache: { status: string; message: string };
    };
    performance_metrics: {
        average_response_time: string;
        peak_concurrent_users: number;
        error_rate: string;
        memory_usage: string;
    };
    room_utilization: Array<{
        room_name: string;
        utilization: number;
    }>;
    user_activity: {
        daily_active_users: number;
        weekly_active_users: number;
        monthly_active_users: number;
        new_users_this_month: number;
    };
    monthly_trends: Array<{
        month: string;
        borrowings: number;
        users: number;
    }>;
    top_stats: {
        most_used_room: string;
        busiest_day: string;
        peak_hour: string;
        most_active_user: string;
    };
    pending_approvals: Borrowing[];
    system_alerts: Array<{
        type: string;
        title: string;
        message: string;
        action_url?: string;
    }>;
}

export default function SuperAdminDashboard({
    auth,
    stats,
    recent_activities,
    system_health,
    performance_metrics,
    room_utilization,
    user_activity,
    monthly_trends,
    top_stats,
    pending_approvals,
    system_alerts
}: SuperAdminDashboardProps) {
    const [refreshing, setRefreshing] = useState(false);

    const refreshData = async () => {
        setRefreshing(true);
        try {
            router.reload({ 
                only: ['stats', 'recent_activities', 'system_health', 'performance_metrics', 'room_utilization', 'user_activity', 'monthly_trends', 'top_stats', 'pending_approvals', 'system_alerts']
            });
        } finally {
            setTimeout(() => setRefreshing(false), 1000);
        }
    };

    const getHealthStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return CheckCircle;
            case 'warning':
                return AlertTriangle;
            case 'error':
                return XCircle;
            default:
                return AlertCircle;
        }
    };

    const getHealthStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-100 border-green-200';
            case 'warning':
                return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'error':
                return 'text-red-600 bg-red-100 border-red-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getAlertVariant = (type: string): 'default' | 'destructive' => {
        return type === 'error' ? 'destructive' : 'default';
    };

    const superAdminActions = [
        {
            title: 'Manajemen Pengguna',
            description: 'Kelola semua pengguna sistem dan peran mereka',
            icon: Users,
            href: '/users',
            color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
            badge: stats.total_users,
        },
        {
            title: 'Pengaturan Sistem',
            description: 'Konfigurasi sistem dan pengaturan lanjutan',
            icon: Settings,
            href: '/Settings/Advanced',
            color: 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
        },
        {
            title: 'Analitik Lanjutan',
            description: 'Laporan dan analisis sistem mendalam',
            icon: BarChart3,
            href: '/History/Analytics',
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
        },
        {
            title: 'Backup & Restore',
            description: 'Kelola backup data dan pemulihan sistem',
            icon: Database,
            href: '/Settings/Database',
            color: 'bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Super Admin Dashboard" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Crown className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Super Admin Dashboard
                                </h1>
                                <p className="text-gray-600">
                                    Selamat datang, {auth.user.name} - Kontrol penuh sistem BPS Riau
                                </p>
                            </div>
                        </div>
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
                        <Badge variant="outline" className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
                            <Crown className="h-3 w-3 mr-1" />
                            Super Administrator
                        </Badge>
                    </div>
                </div>

                {/* System Alerts */}
                {system_alerts.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                            Peringatan Sistem
                        </h2>
                        <div className="grid gap-4">
                            {system_alerts.map((alert, index) => (
                                <Alert key={index} variant={getAlertVariant(alert.type)} className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="h-5 w-5 mt-0.5" />
                                        <div>
                                            <AlertTitle>{alert.title}</AlertTitle>
                                            <AlertDescription>{alert.message}</AlertDescription>
                                        </div>
                                    </div>
                                    {alert.action_url && (
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={alert.action_url}>
                                                Lihat Detail
                                            </Link>
                                        </Button>
                                    )}
                                </Alert>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* System Overview */}
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 smooth-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">Total Ruangan</p>
                                    <p className="text-3xl font-bold text-purple-900">{stats.total_rooms}</p>
                                    <p className="text-xs text-purple-600 mt-1">
                                        {stats.available_rooms} tersedia • {stats.occupied_rooms} terpakai
                                    </p>
                                </div>
                                <Building2 className="h-12 w-12 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 smooth-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Total Pengguna</p>
                                    <p className="text-3xl font-bold text-blue-900">{stats.total_users}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {stats.admin_users} admin • {stats.regular_users} pengguna
                                    </p>
                                </div>
                                <Users className="h-12 w-12 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 smooth-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-700">Peminjaman Aktif</p>
                                    <p className="text-3xl font-bold text-emerald-900">{stats.active_borrowings}</p>
                                    <p className="text-xs text-emerald-600 mt-1">
                                        {stats.pending_approvals} menunggu persetujuan
                                    </p>
                                </div>
                                <Activity className="h-12 w-12 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 smooth-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Pengguna Aktif</p>
                                    <p className="text-3xl font-bold text-orange-900">{stats.active_users}</p>
                                    <p className="text-xs text-orange-600 mt-1">
                                        30 hari terakhir
                                    </p>
                                </div>
                                <Zap className="h-12 w-12 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Health Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Server className="h-5 w-5 mr-2 text-blue-600" />
                            Status Kesehatan Sistem
                        </CardTitle>
                        <CardDescription>
                            Monitoring real-time komponen sistem utama
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(system_health).map(([component, health]) => {
                                const StatusIcon = getHealthStatusIcon(health.status);
                                return (
                                    <div 
                                        key={component}
                                        className={cn(
                                            "p-4 rounded-lg border-2",
                                            getHealthStatusColor(health.status)
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium capitalize">{component}</h4>
                                            <StatusIcon className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm opacity-80">{health.message}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Cpu className="h-5 w-5 mr-2 text-green-600" />
                                Metrik Performa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Response Time Rata-rata</span>
                                <span className="text-sm font-bold text-gray-900">{performance_metrics.average_response_time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Peak Concurrent Users</span>
                                <span className="text-sm font-bold text-gray-900">{performance_metrics.peak_concurrent_users}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Error Rate</span>
                                <span className="text-sm font-bold text-gray-900">{performance_metrics.error_rate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Memory Usage</span>
                                <span className="text-sm font-bold text-gray-900">{performance_metrics.memory_usage}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <HardDrive className="h-5 w-5 mr-2 text-purple-600" />
                                Storage & Database
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Database Size</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {typeof stats.database_size === 'number' ? `${stats.database_size} MB` : stats.database_size}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Storage Used</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {typeof stats.storage_used === 'number' ? `${stats.storage_used} GB` : stats.storage_used}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Cache Size</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {typeof stats.cache_size === 'number' ? `${stats.cache_size} MB` : stats.cache_size}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">System Uptime</span>
                                <span className="text-sm font-bold text-gray-900">{stats.system_uptime}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Super Admin Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Crown className="h-5 w-5 mr-2 text-purple-600" />
                            Kontrol Super Admin
                        </CardTitle>
                        <CardDescription>
                            Akses eksklusif untuk manajemen sistem tingkat lanjut
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {superAdminActions.map((action) => (
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
                                            {action.badge && (
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

                {/* Enhanced Analytics Tabs */}
                <Tabs defaultValue="statistics" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="statistics">Statistik</TabsTrigger>
                        <TabsTrigger value="activity">Aktivitas</TabsTrigger>
                        <TabsTrigger value="utilization">Utilisasi</TabsTrigger>
                        <TabsTrigger value="trends">Tren</TabsTrigger>
                        <TabsTrigger value="top-stats">Top Stats</TabsTrigger>
                    </TabsList>

                    {/* Statistics Tab */}
                    <TabsContent value="statistics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Aktivitas Pengguna</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-900">
                                                {user_activity.daily_active_users}
                                            </div>
                                            <div className="text-sm text-blue-700">Aktif Hari Ini</div>
                                        </div>
                                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-900">
                                                {user_activity.weekly_active_users}
                                            </div>
                                            <div className="text-sm text-emerald-700">Aktif Minggu Ini</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-900">
                                                {user_activity.monthly_active_users}
                                            </div>
                                            <div className="text-sm text-purple-700">Aktif Bulan Ini</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-900">
                                                {user_activity.new_users_this_month}
                                            </div>
                                            <div className="text-sm text-orange-700">Pengguna Baru</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Persetujuan Menunggu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pending_approvals.length > 0 ? (
                                        <div className="space-y-3">
                                            {pending_approvals.map((borrowing) => (
                                                <div key={borrowing.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium">{borrowing.borrower_name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Ruang {borrowing.room?.name} - {formatRelativeTime(borrowing.created_at)}
                                                        </p>
                                                    </div>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/Approvals`}>Review</Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <CheckSquare className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                            <p>Tidak ada persetujuan yang menunggu</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Aktivitas Sistem Terbaru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recent_activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                                <p className="text-sm text-gray-600">{activity.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatRelativeTime(activity.timestamp)} • {activity.user}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Utilization Tab */}
                    <TabsContent value="utilization" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Utilisasi Ruangan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {room_utilization.map((room, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-900">Ruang {room.room_name}</span>
                                                <span className="text-gray-600">{room.utilization}%</span>
                                            </div>
                                            <Progress value={room.utilization} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tren Bulanan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {monthly_trends.slice(-6).map((month, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="font-medium text-gray-900">{month.month}</div>
                                            <div className="flex space-x-4 text-sm">
                                                <span className="text-blue-600">{month.borrowings} peminjaman</span>
                                                <span className="text-emerald-600">{month.users} pengguna baru</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Top Stats Tab */}
                    <TabsContent value="top-stats" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Star className="h-5 w-5 mr-2 text-yellow-600" />
                                        Statistik Utama
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-yellow-900">Ruangan Terpopuler</h4>
                                            <p className="text-sm text-yellow-700">{top_stats.most_used_room}</p>
                                        </div>
                                        <Award className="h-8 w-8 text-yellow-600" />
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-blue-900">Hari Tersibuk</h4>
                                            <p className="text-sm text-blue-700">{top_stats.busiest_day}</p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-blue-600" />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-emerald-900">Jam Puncak</h4>
                                            <p className="text-sm text-emerald-700">{top_stats.peak_hour}</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-emerald-600" />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-purple-900">Pengguna Teraktif</h4>
                                            <p className="text-sm text-purple-700">{top_stats.most_active_user}</p>
                                        </div>
                                        <Target className="h-8 w-8 text-purple-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="h-5 w-5 mr-2 text-red-600" />
                                        Akses Cepat Admin
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button asChild className="w-full justify-start">
                                        <Link href="/SuperAdmin/System/Logs">
                                            <FileText className="h-4 w-4 mr-2" />
                                            System Logs
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href="/SuperAdmin/System/Performance">
                                            <Cpu className="h-4 w-4 mr-2" />
                                            Performance Monitor
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href="/Settings/Database">
                                            <Database className="h-4 w-4 mr-2" />
                                            Database Management
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href="/Settings/Security">
                                            <Shield className="h-4 w-4 mr-2" />
                                            Security Settings
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}