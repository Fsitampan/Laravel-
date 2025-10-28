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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Calendar,
    Plus,
    Search,
    Clock,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    Timer,
    Users,
    Activity,
    CalendarDays,
    ArrowUpRight,
    TrendingUp,
    Ban
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials, debounce } from '@/lib/utils';
import type { PageProps, Borrowing, PaginatedResponse, BorrowingFilters } from '@/types';

interface BorrowingsPageProps extends PageProps {
    borrowings: PaginatedResponse<Borrowing>;
    filters: BorrowingFilters;
}

// Fungsi untuk mendapatkan gambar ruangan (sama seperti di Rooms)
const getRoomImage = (room: any): string => {
    // Sama persis seperti di halaman Rooms
    return room?.image_url || `https://placehold.co/800x600/e2e8f0/64748b?text=Ruang+${encodeURIComponent(room?.name || 'X')}`;
};

export default function BorrowingsIndex({ auth, borrowings, filters }: BorrowingsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [viewAll, setViewAll] = useState(filters.viewAll ? "all" : "mine");
    
    // State untuk cancel dialog
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const openCancelDialog = (borrowing: Borrowing) => {
        setSelectedBorrowing(borrowing);
        setCancellationReason('');
        setCancelDialogOpen(true);
    };

    const handleCancelBorrowing = () => {
        if (!selectedBorrowing || !cancellationReason.trim()) {
            toast.error('Alasan pembatalan harus diisi');
            return;
        }

        setIsSubmitting(true);
        
        router.post(`/Borrowings/${selectedBorrowing.id}/cancel`, {
            cancellation_reason: cancellationReason
        }, {
            onSuccess: () => {
                toast.success('Peminjaman berhasil dibatalkan');
                setCancelDialogOpen(false);
                setCancellationReason('');
                setSelectedBorrowing(null);
            },
            onError: (errors) => {
                toast.error(errors.message || 'Gagal membatalkan peminjaman');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
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
                return <Ban className="h-4 w-4" />;
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
                                    src={getRoomImage(borrowing.room)}
                                    alt={`Ruang ${borrowing.room?.name || 'Unknown'}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback jika gambar gagal load
                                        const target = e.target as HTMLImageElement;
                                        target.src = `https://placehold.co/800x600/e2e8f0/64748b?text=Ruang+${encodeURIComponent(borrowing.room?.name || 'X')}`;
                                    }}
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
                                        <h3 className="text-white font-semibold text-lg"> {borrowing.room?.name}</h3>
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

                                    {/* Action Buttons */}
                                    <div className="pt-2 space-y-2">
                                        <Button asChild className="w-full" variant="outline">
                                            <Link href={`/Borrowings/${borrowing.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Lihat Detail Peminjaman
                                                <ArrowUpRight className="h-4 w-4 ml-2" />
                                            </Link>
                                        </Button>

                                        {/* Cancel Button - Hanya muncul jika status pending atau approved DAN user adalah pemilik */}
                                        {(borrowing.status === 'pending' || borrowing.status === 'approved') && 
                                         (borrowing.user_id === auth.user.id || isAdmin) && (
                                            <Button 
                                                className="w-full" 
                                                variant="destructive"
                                                onClick={() => openCancelDialog(borrowing)}
                                            >
                                                <Ban className="h-4 w-4 mr-2" />
                                                Batalkan Peminjaman
                                            </Button>
                                        )}
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

                {/* Cancel Dialog */}
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Batalkan Peminjaman</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin membatalkan peminjaman ini? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {selectedBorrowing && (
                                <div className="p-4 bg-muted rounded-lg space-y-2">
                                    <p className="text-sm"><span className="font-medium">Ruangan:</span> {selectedBorrowing.room?.name}</p>
                                    <p className="text-sm"><span className="font-medium">Peminjam:</span> {selectedBorrowing.borrower_name}</p>
                                    <p className="text-sm"><span className="font-medium">Waktu:</span> {formatDateTime(selectedBorrowing.borrowed_at)}</p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="cancellation_reason">
                                    Alasan Pembatalan <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="cancellation_reason"
                                    placeholder="Jelaskan alasan pembatalan peminjaman..."
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Alasan ini akan dikirimkan ke admin sebagai notifikasi
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCancelDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancelBorrowing}
                                disabled={isSubmitting || !cancellationReason.trim()}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Ban className="h-4 w-4 mr-2" />
                                        Ya, Batalkan Peminjaman
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}