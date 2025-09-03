import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Calendar,
    Search,
    Plus,
    Filter,
    Eye,
    Edit,
    Trash2,
    Users,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    Download,
    RefreshCw,
    Building2,
    User,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn, formatDateTime, formatDuration, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, Borrowing, PaginatedResponse, BorrowingFilters } from '@/types';

interface BorrowingsPageProps extends PageProps {
    borrowings: PaginatedResponse<Borrowing>;
    filters: BorrowingFilters;
    stats: {
        total: number;
        pending: number;
        approved: number;
        active: number;
        completed: number;
        rejected: number;
        cancelled: number;
    };
}

export default function BorrowingsIndex({ auth, borrowings, filters, stats }: BorrowingsPageProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const handleSearch = (query: string) => {
        router.get('/Borrowings', {
            ...filters,
            search: query || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/Borrowings', {
            ...filters,
            status: status === 'all' ? undefined : status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/Borrowings', {
            ...filters,
            page
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['borrowings', 'stats'],
            onFinish: () => {
                setTimeout(() => setIsRefreshing(false), 1000);
            }
        });
    };

    const handleCancelBorrowing = async (borrowingId: number) => {
        try {
            await router.patch(`/Borrowings/${borrowingId}`, {
                status: 'cancelled'
            });
        } catch (error) {
            console.error('Failed to cancel borrowing:', error);
        }
    };

    const handleCompleteBorrowing = async (borrowingId: number) => {
        try {
            await router.patch(`/Borrowings/${borrowingId}/complete`);
        } catch (error) {
            console.error('Failed to complete borrowing:', error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== filters.search) {
                handleSearch(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setSelectedStatus(filters.status || 'all');
    }, [filters.status]);

    const statusCounts = {
        all: stats.total,
        pending: stats.pending,
        approved: stats.approved,
        active: stats.active,
        completed: stats.completed,
        rejected: stats.rejected,
        cancelled: stats.cancelled,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return Clock;
            case 'approved':
                return CheckCircle;
            case 'rejected':
                return XCircle;
            case 'active':
                return Users;
            case 'completed':
                return CheckCircle;
            case 'cancelled':
                return XCircle;
            default:
                return Calendar;
        }
    };

    const canCancelBorrowing = (borrowing: Borrowing) => {
        const isOwner = borrowing.user_id === auth.user.id;
        const canCancel = ['pending', 'approved'].includes(borrowing.status);
        return (isOwner || isAdmin) && canCancel;
    };

    const canCompleteBorrowing = (borrowing: Borrowing) => {
        return borrowing.status === 'active' && isAdmin;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Peminjaman Ruangan" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Peminjaman Ruangan
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Kelola peminjaman ruangan BPS Riau
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                            Refresh
                        </Button>
                        {isAdmin && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/Borrowings/export">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Link>
                            </Button>
                        )}
                        <Button asChild>
                            <Link href="/Borrowings/Create">
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Peminjaman
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-blue-700">Total</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-yellow-700">Pending</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-blue-700">Disetujui</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.approved}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-emerald-700">Aktif</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats.active}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">Selesai</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-red-700">Ditolak</p>
                                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-orange-700">Dibatalkan</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.cancelled}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Cari peminjaman..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status ({statusCounts.all})
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending ({statusCounts.pending})
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Disetujui ({statusCounts.approved})
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Aktif ({statusCounts.active})
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Selesai ({statusCounts.completed})
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Ditolak ({statusCounts.rejected})
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Dibatalkan ({statusCounts.cancelled})
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Borrowings List */}
                {(borrowings.data?.length || 0) === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchQuery ? 'Tidak ada peminjaman ditemukan' : 'Belum ada peminjaman'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery 
                                    ? `Tidak ada peminjaman yang cocok dengan pencarian "${searchQuery}"`
                                    : 'Buat peminjaman pertama untuk memulai'
                                }
                            </p>
                            {!searchQuery && (
                                <Button asChild>
                                    <Link href="/Borrowings/Create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Peminjaman
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {borrowings.data?.map((borrowing) => (
                                <Card key={borrowing.id} className="overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                Ruang {borrowing.room?.name}
                                                            </h3>
                                                            <Badge 
                                                                variant="outline" 
                                                                className={cn("border", getStatusColor(borrowing.status))}
                                                            >
                                                                {getStatusLabel(borrowing.status, 'borrowing')}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-gray-600 mb-1">
                                                            {borrowing.borrower_name} • {borrowing.borrower_category}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {borrowing.purpose}
                                                        </p>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/Borrowings/${borrowing.id}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {(borrowing.user_id === auth.user.id || isAdmin) && borrowing.status === 'pending' && (
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/Borrowings/${borrowing.id}/edit`}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canCompleteBorrowing(borrowing) && (
                                                                <DropdownMenuItem onClick={() => handleCompleteBorrowing(borrowing.id)}>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Selesaikan
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canCancelBorrowing(borrowing) && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                                Batalkan
                                                                            </DropdownMenuItem>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Batalkan Peminjaman</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Apakah Anda yakin ingin membatalkan peminjaman ini? 
                                                                                    Tindakan ini tidak dapat dibatalkan.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleCancelBorrowing(borrowing.id)}
                                                                                    className="bg-red-600 hover:bg-red-700"
                                                                                >
                                                                                    Batalkan Peminjaman
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        {formatDateTime(borrowing.borrowed_at)}
                                                    </div>
                                                    {borrowing.planned_return_at && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            Sampai: {formatDateTime(borrowing.planned_return_at)}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Users className="h-4 w-4 mr-2" />
                                                        {borrowing.participant_count} peserta
                                                    </div>
                                                </div>

                                                {borrowing.admin_notes && (
                                                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                                            Catatan Admin:
                                                        </p>
                                                        <p className="text-sm text-gray-700">
                                                            {borrowing.admin_notes}
                                                        </p>
                                                    </div>
                                                )}

                                                {borrowing.rejection_reason && (
                                                    <div className="p-3 bg-red-50 rounded-lg mb-4">
                                                        <p className="text-sm font-medium text-red-900 mb-1">
                                                            Alasan Penolakan:
                                                        </p>
                                                        <p className="text-sm text-red-700">
                                                            {borrowing.rejection_reason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs">
                                                            {getUserInitials(borrowing.borrower_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-600">
                                                        {borrowing.borrower_name}
                                                    </span>
                                                </div>
                                                {borrowing.approver && (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-500">•</span>
                                                        <span className="text-sm text-gray-600">
                                                            Disetujui oleh {borrowing.approver.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/borrowings/${borrowing.id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Detail
                                                    </Link>
                                                </Button>
                                                {borrowing.status === 'approved' && (
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        Siap Digunakan
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {borrowings.last_page > 1 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {borrowings.from} - {borrowings.to} dari {borrowings.total} peminjaman
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {borrowings.links?.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => {
                                                        if (link.url) {
                                                            const url = new URL(link.url);
                                                            const page = url.searchParams.get('page');
                                                            if (page) {
                                                                handlePageChange(parseInt(page));
                                                            }
                                                        }
                                                    }}
                                                    disabled={!link.url}
                                                    className={cn(
                                                        "min-w-[40px]",
                                                        link.active && "bg-primary text-primary-foreground"
                                                    )}
                                                >
                                                    {link.label === '&laquo; Previous' ? (
                                                        <ChevronLeft className="h-4 w-4" />
                                                    ) : link.label === 'Next &raquo;' ? (
                                                        <ChevronRight className="h-4 w-4" />
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}