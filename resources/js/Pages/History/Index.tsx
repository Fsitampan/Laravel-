import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    History,
    Search,
    Filter,
    Calendar,
    User,
    Building2,
    Clock,
    Eye,
    Activity,
    FileText,
    Download,
    RefreshCw,
    Plus,
    Edit,
    CheckCircle,
    XCircle,
    Ban,
    CheckCircle2
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials, debounce } from '@/lib/utils';
import type { PageProps, BorrowingHistory, PaginatedResponse, HistoryFilters } from '@/types';

// Perbarui props interface agar sesuai dengan data yang dikirim dari controller
interface HistoryPageProps extends PageProps {
    histories: PaginatedResponse<BorrowingHistory>;
    actionCounts: {
        total: number;
        created: number;
        updated: number;
        approved: number;
        rejected: number;
        cancelled: number;
        completed: number;
    };
    filters: HistoryFilters;
}

export default function HistoryIndex({ auth, histories, actionCounts, filters }: HistoryPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.action || 'all');

    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const handleSearch = debounce((value: string) => {
        router.get('/history', {
            ...filters,
            search: value,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    }, 300);

    const handleActionFilter = (action: string) => {
        setActionFilter(action);
        router.get('/history', {
            ...filters,
            action: action === 'all' ? undefined : action,
            page: 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/history', {
            ...filters,
            page
        }, {
            preserveState: true,
            replace: true
        });
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created':
                return <Plus className="h-4 w-4" />;
            case 'updated':
                return <Edit className="h-4 w-4" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            case 'cancelled':
                return <Ban className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'created':
                return 'border-blue-200 bg-blue-50 text-blue-700';
            case 'updated':
                return 'border-orange-200 bg-orange-50 text-orange-700';
            case 'approved':
                return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'rejected':
                return 'border-red-200 bg-red-50 text-red-700';
            case 'cancelled':
                return 'border-gray-200 bg-gray-50 text-gray-700';
            case 'completed':
                return 'border-gray-200 bg-gray-50 text-gray-700';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-700';
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'created':
                return 'Dibuat';
            case 'updated':
                return 'Diperbarui';
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            case 'cancelled':
                return 'Dibatalkan';
            case 'completed':
                return 'Selesai';
            default:
                return action;
        }
    };

    // Objek actionCounts di frontend Dihapus karena data ini sudah dikirim dari backend
    // langsung ke props `actionCounts`.

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Aktivitas" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Riwayat Aktivitas
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Lihat semua aktivitas sistem BPS Riau
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <Button variant="outline" onClick={() => router.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        {isAdmin && (
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Aktivitas</p>
                                    {/* Gunakan actionCounts dari props */}
                                    <p className="text-2xl font-bold text-gray-900">{actionCounts.total}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
                                    <Activity className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Dibuat</p>
                                    {/* Gunakan actionCounts dari props */}
                                    <p className="text-2xl font-bold text-blue-600">{actionCounts.created}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
                                    <Plus className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Diperbarui</p>
                                    {/* Gunakan actionCounts dari props */}
                                    <p className="text-2xl font-bold text-orange-600">{actionCounts.updated}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-orange-50 text-orange-700">
                                    <Edit className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Disetujui</p>
                                    {/* Gunakan actionCounts dari props */}
                                    <p className="text-2xl font-bold text-emerald-600">{actionCounts.approved}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ditolak</p>
                                    {/* Gunakan actionCounts dari props */}
                                    <p className="text-2xl font-bold text-red-600">{actionCounts.rejected}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-red-50 text-red-700">
                                    <XCircle className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Cari aktivitas..."
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
                                <Select value={actionFilter} onValueChange={handleActionFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Aksi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Aksi</SelectItem>
                                        <SelectItem value="created">Dibuat</SelectItem>
                                        <SelectItem value="updated">Diperbarui</SelectItem>
                                        <SelectItem value="approved">Disetujui</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* History Timeline */}
                <div className="space-y-4">
                    {histories.data.map((history, index) => (
                        <Card key={history.id} className="smooth-hover">
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    {/* Timeline Dot */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full border-2",
                                            getActionColor(history.action).replace('bg-', 'border-').replace('text-', 'bg-')
                                        )} />
                                        {index < histories.data.length - 1 && (
                                            <div className="w-0.5 h-8 bg-gray-200 mt-2 ml-1" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    <Badge variant="outline" className={cn("text-xs", getActionColor(history.action))}>
                                                        <div className="flex items-center">
                                                            {getActionIcon(history.action)}
                                                            <span className="ml-1">
                                                                {history.action_label || getActionLabel(history.action)}
                                                            </span>
                                                        </div>
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">#{history.borrowing_id}</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {history.performed_by_user?.name || 'Sistem'}
                                                            </p>
                                                            <p className="text-gray-500">
                                                                {history.performed_by_user?.email || 'sistem'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Building2 className="h-4 w-4 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {history.borrowing?.id ? `Peminjaman #${history.borrowing.id}` : '-'}
                                                            </p>
                                                            <p className="text-gray-500">
                                                                {history.borrowing?.borrower_name || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium">Waktu</p>
                                                            <p className="text-gray-500">
                                                                {formatDateTime(history.performed_at || history.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {history.comment && (
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-700">
                                                            <span className="font-medium">Catatan: </span>
                                                            {history.comment}
                                                        </p>
                                                    </div>
                                                )}

                                                {history.old_status && history.new_status && (
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-gray-500">Dari:</span>
                                                            <Badge variant="outline" className={cn("text-xs", getStatusColor(history.old_status))}>
                                                                {getStatusLabel(history.old_status, 'borrowing')}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-gray-400">→</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-gray-500">Ke:</span>
                                                            <Badge variant="outline" className={cn("text-xs", getStatusColor(history.new_status))}>
                                                                {getStatusLabel(history.new_status, 'borrowing')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {history.borrowing_id && (
                                                    <Button variant="outline" size="sm" asChild>
                                                   <Link href={route('history.show', history.borrowing_id)}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Lihat
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {histories.data.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada riwayat ditemukan
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || actionFilter !== 'all'
                                    ? 'Coba ubah filter pencarian Anda'
                                    : 'Belum ada aktivitas yang tercatat'
                                }
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {histories.data.length > 0 && histories.last_page > 1 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {histories.from} sampai {histories.to} dari {histories.total} aktivitas
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(histories.current_page - 1)}
                                        disabled={histories.current_page <= 1}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-gray-700">
                                        Halaman {histories.current_page} dari {histories.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(histories.current_page + 1)}
                                        disabled={histories.current_page >= histories.last_page}
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
