import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Calendar,
    Plus,
    Search,
    Filter,
    Clock,
    User,
    Building2,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    Timer,
    Users,
    Activity,
    MapPin,
    CalendarDays,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials, debounce } from '@/lib/utils';
import type { PageProps, Borrowing, PaginatedResponse, BorrowingFilters } from '@/types';

interface BorrowingsPageProps extends PageProps {
    borrowings: PaginatedResponse<Borrowing>;
    filters: BorrowingFilters;
}

// Mock data untuk gambar ruangan - dalam production akan dari database
const getRoomImage = (roomName: string): string => {
    const imageMap: { [key: string]: string } = {
        'A': 'https://images.unsplash.com/photo-1745970649957-b4b1f7fde4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25mZXJlbmNlJTIwcm9vbSUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3Mjk3MTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'B': 'https://images.unsplash.com/photo-1692133226337-55e513450a32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMG1lZXRpbmclMjByb29tJTIwb2ZmaWNlfGVufDF8fHx8MTc1NzQwMzg5MHww&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'C': 'https://images.unsplash.com/photo-1750768145390-f0ad18d3e65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBtZWV0aW5nJTIwcm9vbSUyMHByb2plY3RvcnxlbnwxfHx8fDE3NTc0MDM5MDJ8MA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'D': 'https://images.unsplash.com/photo-1719845853806-1c54b0ed37c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNjdXNzaW9uJTIwcm9vbSUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzU3NDAzOTA2fDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'E': 'https://images.unsplash.com/photo-1689150571822-1b573b695391?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpdG9yaXVtJTIwc2VtaW5hciUyMGhhbGx8ZW58MXx8fHwxNzU3NDAzODk0fDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'F': 'https://images.unsplash.com/photo-1589639293663-f9399bb41721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb20lMjBvZmZpY2V8ZW58MXx8fHwxNzU3NDAzODk4fDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral'
    };
    
    const roomCode = roomName.toUpperCase();
    return imageMap[roomCode] || imageMap['A']; // Default fallback
};

export default function BorrowingsIndex({ auth, borrowings, filters }: BorrowingsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [viewAll, setViewAll] = useState(filters.viewAll ? "all" : "mine");


    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const handleSearch = debounce((value: string) => {
        router.get('/Borrowings', { 
            ...filters, 
            search: value,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    }, 300);

    const handleStatusFilter = (status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled' | 'all') => {
        setStatusFilter(status);
        router.get('/Borrowings', { 
            ...filters, 
            status: status === 'all' ? undefined : status,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/Borrowings', { 
            ...filters, 
            page 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleViewFilter = (mode: "mine" | "all") => {
    setViewAll(mode);
    router.get('/Borrowings', { 
        ...filters, 
        viewAll: mode === "all" ? 1 : 0,
        page: 1 
    }, { 
        preserveState: true,
        replace: true 
    });
    };



    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            case 'active':
                return <Timer className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const statusCounts = {
        total: borrowings.total,
        pending: borrowings.data.filter(b => b.status === 'pending').length,
        approved: borrowings.data.filter(b => b.status === 'approved').length,
        active: borrowings.data.filter(b => b.status === 'active').length,
        completed: borrowings.data.filter(b => b.status === 'completed').length,
    };



    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Peminjaman Ruangan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Peminjaman Ruangan
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola dan monitor peminjaman ruangan BPS Riau
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button asChild>
                            <Link href="/Borrowings/Create">
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Peminjaman
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                                        Total Peminjaman
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {statusCounts.total}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm ml-1 font-medium text-emerald-600">
                                            +12%
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                                    <Calendar className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                                        Menunggu Persetujuan
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {statusCounts.pending}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Butuh review
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl shrink-0 bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                                        Disetujui
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {statusCounts.approved}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Siap digunakan
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                                        Sedang Berlangsung
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {statusCounts.active}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <Activity className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm ml-1 font-medium text-emerald-600">
                                            Aktif
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <Timer className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                                        Selesai
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {statusCounts.completed}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Diselesaikan
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl shrink-0 bg-gray-50 text-gray-700 border-gray-200">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Filter & Pencarian
                        </CardTitle>
                        <CardDescription>
                            Cari dan filter peminjaman berdasarkan status atau kata kunci
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari peminjaman, ruangan, atau peminjam..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            handleSearch(e.target.value);
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                               {/* Filter View: Peminjaman Saya / Semua */}
                                <Select value={viewAll} onValueChange={handleViewFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Tampilan Data" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mine">Peminjaman Saya</SelectItem>
                                    <SelectItem value="all">Semua Peminjaman</SelectItem>
                                </SelectContent>
                                </Select>

                                {/* Filter Status */}
                                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Menunggu Persetujuan</SelectItem>
                                    <SelectItem value="approved">Disetujui</SelectItem>
                                    <SelectItem value="active">Sedang Berlangsung</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Borrowings List */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {borrowings.data.map((borrowing) => (
                        <Card key={borrowing.id} className="border-0 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200">
                            <div className="relative h-48">
                                <img
                                    src={getRoomImage(borrowing.room?.name || 'A')}
                                    alt={`Ruang ${borrowing.room?.name}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <Badge variant="outline" className={cn("backdrop-blur-sm bg-white/90", getStatusColor(borrowing.status))}>
                                        {getStatusIcon(borrowing.status)}
                                        <span className="ml-2">{getStatusLabel(borrowing.status, 'borrowing')}</span>
                                    </Badge>
                                </div>
                                
                                {/* Room Info Overlay */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                                        <h3 className="text-white font-semibold text-lg">Ruang {borrowing.room?.name}</h3>
                                        <p className="text-white/80 text-sm">#{borrowing.id} • {borrowing.participant_count} peserta</p>
                                    </div>
                                </div>
                            </div>
                            
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Borrower Info */}
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                {getUserInitials(borrowing.borrower_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{borrowing.borrower_name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{borrowing.borrower_phone}</p>
                                        </div>
                                    </div>

                                    {/* Date & Time Info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Waktu Mulai</p>
                                                <p className="text-muted-foreground">{formatDateTime(borrowing.borrowed_at)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">
                                                    {borrowing.actual_returned_date ? 'Selesai' : 'Target Selesai'}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {formatDateTime(borrowing.actual_returned_date || borrowing.planned_return_at || '')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Purpose */}
                                    {borrowing.purpose && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm">
                                                <span className="font-medium">Tujuan: </span>
                                                <span className="text-muted-foreground">{borrowing.purpose}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Admin Notes */}
                                    {borrowing.notes && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-800">
                                                <span className="font-medium">Catatan Admin: </span>
                                                {borrowing.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Rejection Reason */}
                                    {borrowing.rejection_reason && (
                                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                            <p className="text-sm text-red-800">
                                                <span className="font-medium">Alasan Ditolak: </span>
                                                {borrowing.rejection_reason}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <div className="pt-2">
                                        <Button asChild className="w-full" variant="outline">
                                            <Link href={`/Borrowings/${borrowing.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Lihat Detail Peminjaman
                                                <ArrowUpRight className="h-4 w-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {borrowings.data.length === 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">
                                Tidak ada peminjaman ditemukan
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Coba ubah filter pencarian Anda untuk melihat hasil yang berbeda'
                                    : 'Belum ada peminjaman ruangan yang dibuat di sistem'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <Button asChild>
                                    <Link href="/Borrowings/Create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Peminjaman Pertama
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {borrowings.data.length > 0 && borrowings.last_page > 1 && (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan <span className="font-medium">{borrowings.from}</span> sampai <span className="font-medium">{borrowings.to}</span> dari <span className="font-medium">{borrowings.total}</span> peminjaman
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(borrowings.current_page - 1)}
                                        disabled={borrowings.current_page <= 1}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-muted-foreground px-3">
                                        Halaman <span className="font-medium">{borrowings.current_page}</span> dari <span className="font-medium">{borrowings.last_page}</span>
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(borrowings.current_page + 1)}
                                        disabled={borrowings.current_page >= borrowings.last_page}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}