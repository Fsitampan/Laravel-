import { useState, useEffect, useCallback } from "react";
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
    Building, 
    Users, 
    Calendar, 
    CheckCircle, 
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Plus,
    Eye,
    BarChart3,
    Lock,
    Settings,
    History,
    UserCheck,
    Search,
    Filter,
    RefreshCw
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface FullDashboardProps extends PageProps {
    statistics?: {
        total_rooms?: number;
        available_rooms?: number;
        occupied_rooms?: number;
        maintenance_rooms?: number;
        total_borrowings?: number;
        pending_borrowings?: number;
        approved_borrowings?: number;
        active_borrowings?: number;
        completed_borrowings?: number;
        total_users?: number;
        active_users?: number;
        inactive_users?: number;
        today_borrowings?: number;
        this_week_borrowings?: number;
        this_month_borrowings?: number;
    };
    recent_borrowings?: any[];
    recent_rooms?: any[];
    pending_approvals?: any[];
}

export default function FullDashboard({ 
    auth, 
    statistics = {}, 
    recent_borrowings = [], 
    recent_rooms = [],
    pending_approvals = []
}: FullDashboardProps) {
    const user = auth.user;
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Early return if no user
    if (!user) {
        return null;
    }

    // Mock data for demonstration
    const mockStatistics = {
        total_rooms: 6,
        available_rooms: 4,
        occupied_rooms: 1,
        maintenance_rooms: 1,
        total_borrowings: 25,
        pending_borrowings: 3,
        approved_borrowings: 15,
        active_borrowings: 4,
        completed_borrowings: 18,
        total_users: 24,
        active_users: 20,
        inactive_users: 4,
        today_borrowings: 2,
        this_week_borrowings: 8,
        this_month_borrowings: 15,
        ...statistics
    };

    const mockRecentBorrowings = recent_borrowings.length > 0 ? recent_borrowings : [
        {
            id: 1,
            borrower_name: "Ahmad Syahputra",
            room_name: "Ruang Rapat A",
            borrow_date: "2024-12-20",
            status: "pending",
            status_label: "Menunggu Persetujuan",
            borrower_category: "pegawai",
            borrower_category_label: "Pegawai"
        },
        {
            id: 2,
            borrower_name: "Siti Nurhaliza",
            room_name: "Ruang Seminar B",
            borrow_date: "2024-12-20",
            status: "approved",
            status_label: "Disetujui",
            borrower_category: "tamu",
            borrower_category_label: "Tamu"
        },
        {
            id: 3,
            borrower_name: "Budi Santoso",
            room_name: "Ruang Meeting C",
            borrow_date: "2024-12-19",
            status: "active",
            status_label: "Sedang Berlangsung",
            borrower_category: "anak-magang",
            borrower_category_label: "Anak Magang"
        }
    ];

    const mockPendingApprovals = user.can_approve_rejects ? (pending_approvals.length > 0 ? pending_approvals : [
        {
            id: 1,
            borrower_name: "Dewi Sartika",
            room_name: "Ruang Rapat D",
            borrow_date: "2024-12-21",
            purpose: "Rapat koordinasi bulanan"
        },
        {
            id: 2,
            borrower_name: "Andi Wijaya",
            room_name: "Ruang Seminar A",
            borrow_date: "2024-12-22",
            purpose: "Presentasi proposal"
        }
    ]) : [];

    // Quick stats for cards
    const quickStats = [
        {
            title: "Total Ruangan",
            value: mockStatistics.total_rooms,
            icon: Building,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            change: "+2 dari bulan lalu",
            trending: "up" as const
        },
        {
            title: "Peminjaman Aktif",
            value: mockStatistics.active_borrowings,
            icon: Calendar,
            color: "text-green-600",
            bgColor: "bg-green-50",
            change: "+5 dari minggu lalu",
            trending: "up" as const
        },
        {
            title: "Menunggu Persetujuan",
            value: mockStatistics.pending_borrowings,
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            change: "-2 dari hari ini",
            trending: "down" as const
        },
        {
            title: "Total Pengguna",
            value: mockStatistics.total_users,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            change: "+8 dari bulan lalu",
            trending: "up" as const
        }
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'tersedia':
            case 'available':
                return 'status-available';
            case 'dipakai':
            case 'occupied':
                return 'status-occupied';
            case 'pemeliharaan':
            case 'maintenance':
                return 'status-maintenance';
            case 'pending':
                return 'bg-orange-100 text-orange-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryStyle = (category: string) => {
        switch (category) {
            case 'pegawai':
                return 'category-employee';
            case 'tamu':
                return 'category-guest';
            case 'anak-magang':
                return 'category-intern';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const hasAccess = (permission: string) => {
        switch (permission) {
            case 'manage_rooms':
                return user.role === 'admin' || user.role === 'super-admin';
            case 'approve_rejects':
                return user.role === 'admin' || user.role === 'super-admin';
            case 'manage_users':
                return user.role === 'super-admin';
            default:
                return true;
        }
    };

    const renderRestrictedAccess = (title: string, description: string) => (
        <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="p-12 text-center">
                <div className="relative inline-block">
                    <Lock className="h-16 w-16 text-muted-foreground/40 mx-auto mb-6" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                    </div>
                </div>
                <h3 className="text-2xl font-medium mb-3 text-muted-foreground">{title}</h3>
                <p className="text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
                    {description}
                </p>
            </CardContent>
        </Card>
    );

    const handleRefresh = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
    };

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Dashboard Lengkap - BPS Riau" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Dashboard BPS Riau
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Sistem Manajemen Ruangan Digital - Selamat datang, {user.name}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Memuat...' : 'Refresh'}
                        </Button>
                        
                        <Link href="/Borrowings/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajukan Peminjaman
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickStats.map((stat, index) => {
                        const Icon = stat.icon;
                        const TrendIcon = stat.trending === 'up' ? TrendingUp : TrendingDown;
                        
                        return (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold">
                                                {stat.value}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2">
                                                <TrendIcon className={`h-3 w-3 ${stat.trending === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                                                <span className={`text-xs ${stat.trending === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {stat.change}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                            <Icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Main Dashboard Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                        <TabsTrigger value="rooms">Ruangan</TabsTrigger>
                        <TabsTrigger value="borrowings">Peminjaman</TabsTrigger>
                        <TabsTrigger value="approvals" disabled={!hasAccess('approve_rejects')}>
                            {hasAccess('approve_rejects') ? 'Persetujuan' : (
                                <span className="flex items-center gap-2">
                                    <Lock className="h-3 w-3" />
                                    Persetujuan
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="users" disabled={!hasAccess('manage_users')}>
                            {hasAccess('manage_users') ? 'Pengguna' : (
                                <span className="flex items-center gap-2">
                                    <Lock className="h-3 w-3" />
                                    Pengguna
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Borrowings */}
                            <Card className="lg:col-span-2">
                                <div className="p-6 border-b">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                Peminjaman Terbaru
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Aktivitas peminjaman ruangan terkini
                                            </p>
                                        </div>
                                        <Link href="/Borrowings">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Lihat Semua
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {mockRecentBorrowings.slice(0, 5).map((borrowing) => (
                                            <div key={borrowing.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback>
                                                            {borrowing.borrower_name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{borrowing.borrower_name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {borrowing.room_name} • {borrowing.borrow_date}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getCategoryStyle(borrowing.borrower_category)}>
                                                        {borrowing.borrower_category_label}
                                                    </Badge>
                                                    <Badge className={getStatusStyle(borrowing.status)}>
                                                        {borrowing.status_label}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Room Status Overview */}
                            <Card>
                                <div className="p-6 border-b">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Status Ruangan
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Ringkasan status semua ruangan
                                    </p>
                                </div>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-available"></div>
                                                <span className="text-sm">Tersedia</span>
                                            </div>
                                            <span className="font-medium">{mockStatistics.available_rooms}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-occupied"></div>
                                                <span className="text-sm">Dipakai</span>
                                            </div>
                                            <span className="font-medium">{mockStatistics.occupied_rooms}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-maintenance"></div>
                                                <span className="text-sm">Pemeliharaan</span>
                                            </div>
                                            <span className="font-medium">{mockStatistics.maintenance_rooms}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Link href="/Rooms">
                                            <Button variant="outline" className="w-full">
                                                <Building className="h-4 w-4 mr-2" />
                                                Kelola Ruangan
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pending Approvals for Admins */}
                        {hasAccess('approve_rejects') && mockPendingApprovals.length > 0 && (
                            <Card>
                                <div className="p-6 border-b">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        Menunggu Persetujuan
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Peminjaman yang memerlukan persetujuan Anda
                                    </p>
                                </div>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {mockPendingApprovals.slice(0, 3).map((borrowing) => (
                                            <div key={borrowing.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {borrowing.borrower_name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{borrowing.borrower_name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {borrowing.room_name} • {borrowing.borrow_date}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link href="/Approvals">
                                                    <Button size="sm" variant="outline">
                                                        Tinjau
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                        
                                        {mockPendingApprovals.length > 3 && (
                                            <div className="text-center pt-2">
                                                <Link href="/Approvals">
                                                    <Button variant="outline" size="sm">
                                                        Lihat {mockPendingApprovals.length - 3} lainnya
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <div className="p-6 border-b">
                                <h3 className="font-semibold">Aksi Cepat</h3>
                                <p className="text-sm text-muted-foreground">
                                    Akses cepat ke fitur-fitur utama sistem
                                </p>
                            </div>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Link href="/Borrowings/Create">
                                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                            <Plus className="h-6 w-6" />
                                            <span className="text-sm">Ajukan Peminjaman</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/Rooms">
                                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                            <Building className="h-6 w-6" />
                                            <span className="text-sm">Lihat Ruangan</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/History">
                                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                            <BarChart3 className="h-6 w-6" />
                                            <span className="text-sm">Riwayat</span>
                                        </Button>
                                    </Link>
                                    
                                    <Link href="/profile/edit">
                                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                            <Users className="h-6 w-6" />
                                            <span className="text-sm">Edit Profil</span>
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Other Tab Contents */}
                    <TabsContent value="rooms">
                        {hasAccess('manage_rooms') ? (
                            <Card>
                                <div className="p-6 border-b">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Manajemen Ruangan</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    placeholder="Cari ruangan..." 
                                                    className="pl-10 w-64"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <p className="text-center text-muted-foreground py-8">
                                        Konten manajemen ruangan akan ditampilkan di sini.
                                        <br />
                                        <Link href="/Rooms" className="text-primary hover:underline">
                                            Klik di sini untuk mengakses halaman ruangan lengkap.
                                        </Link>
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            renderRestrictedAccess(
                                "Manajemen Ruangan",
                                "Akses ke pengelolaan ruangan memerlukan hak akses Administrator."
                            )
                        )}
                    </TabsContent>

                    <TabsContent value="borrowings">
                        <Card>
                            <div className="p-6 border-b">
                                <h3 className="font-semibold">Peminjaman Ruangan</h3>
                            </div>
                            <CardContent className="p-6">
                                <p className="text-center text-muted-foreground py-8">
                                    Konten manajemen peminjaman akan ditampilkan di sini.
                                    <br />
                                    <Link href="/Borrowings" className="text-primary hover:underline">
                                        Klik di sini untuk mengakses halaman peminjaman lengkap.
                                    </Link>
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="approvals">
                        {hasAccess('approve_rejects') ? (
                            <Card>
                                <div className="p-6 border-b">
                                    <h3 className="font-semibold">Persetujuan Peminjaman</h3>
                                </div>
                                <CardContent className="p-6">
                                    <p className="text-center text-muted-foreground py-8">
                                        Konten persetujuan peminjaman akan ditampilkan di sini.
                                        <br />
                                        <Link href="/Approvals" className="text-primary hover:underline">
                                            Klik di sini untuk mengakses halaman persetujuan lengkap.
                                        </Link>
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            renderRestrictedAccess(
                                "Persetujuan Peminjaman",
                                "Fitur persetujuan peminjaman hanya dapat diakses oleh Administrator."
                            )
                        )}
                    </TabsContent>

                    <TabsContent value="users">
                        {hasAccess('manage_users') ? (
                            <Card>
                                <div className="p-6 border-b">
                                    <h3 className="font-semibold">Manajemen Pengguna</h3>
                                </div>
                                <CardContent className="p-6">
                                    <p className="text-center text-muted-foreground py-8">
                                        Konten manajemen pengguna akan ditampilkan di sini.
                                        <br />
                                        <Link href="/users" className="text-primary hover:underline">
                                            Klik di sini untuk mengakses halaman pengguna lengkap.
                                        </Link>
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            renderRestrictedAccess(
                                "Manajemen Pengguna",
                                "Pengelolaan pengguna sistem memerlukan hak akses Super Administrator."
                            )
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}