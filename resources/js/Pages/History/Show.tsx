import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Building2,
    User,
    FileText,
    Activity,
    CheckCircle,
    XCircle,
    Ban,
    CheckCircle2,
    Plus,
    Edit,
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { PageProps, Borrowing, BorrowingHistory } from '@/types';

interface HistoryShowProps extends PageProps {
    borrowing: Borrowing;
    histories: BorrowingHistory[];
    relatedBorrowings: Borrowing[];
    canManage: boolean;
}

export default function HistoryShow({ auth, borrowing, histories }: HistoryShowProps) {
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Peminjaman #${borrowing.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link href={route('history.index')}>
                            <Button variant="outline" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Detail Peminjaman
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Informasi rinci mengenai peminjaman ini.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Borrowing Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="shadow-lg rounded-xl">
                            <CardHeader className="border-b p-6">
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-6 w-6 text-gray-700" />
                                    <span>Informasi Peminjam</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Nama Peminjam</p>
                                        <p className="text-base font-semibold text-gray-800">{borrowing.borrower_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Email Peminjam</p>
                                        <p className="text-base font-semibold text-gray-800">{borrowing.user?.email || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Nomor Telepon</p>
                                        <p className="text-base font-semibold text-gray-800">{borrowing.borrower_phone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Departemen</p>
                                        <p className="text-base font-semibold text-gray-800">{borrowing.user?.department || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg rounded-xl">
                            <CardHeader className="border-b p-6">
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-6 w-6 text-gray-700" />
                                    <span>Detail Peminjaman Ruangan</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Ruangan</p>
                                        <p className="text-base font-semibold text-gray-800">{borrowing.room?.name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Tujuan</p>
                                        <p className="text-base font-semibold text-gray-800">{borrowing.purpose}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Status</p>
                                        <Badge
                                            className={cn(getStatusColor(borrowing.status))}
                                        >
                                            {getStatusLabel(borrowing.status)}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Keterangan</p>
                                        <p className="text-base font-semibold text-gray-800">{borrowing.notes || '-'}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Waktu Mulai Peminjaman</p>
                                        <p className="text-base font-semibold text-gray-800">
                                            {borrowing.borrowed_at ? formatDateTime(borrowing.borrowed_at) : '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Waktu Selesai Peminjaman</p>
                                        <p className="text-base font-semibold text-gray-800">
                                            {borrowing.returned_at ? formatDateTime(borrowing.returned_at) : '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Durasi Peminjaman</p>
                                        <p className="text-base font-semibold text-gray-800">
                                            {borrowing.returned_at && borrowing.borrowed_at
                                                ? `${Math.abs(new Date(borrowing.returned_at).getTime() - new Date(borrowing.borrowed_at).getTime()) / (1000 * 60 * 60)} Jam`
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* History Timeline */}
                        <Card className="shadow-lg rounded-xl">
                            <CardHeader className="border-b p-6">
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-6 w-6 text-gray-700" />
                                    <span>Riwayat Aktivitas</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {histories.map((history, index) => (
                                        <div key={history.id} className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full border-2",
                                                    getActionColor(history.action).replace('bg-', 'border-').replace('text-', 'bg-')
                                                )} />
                                                {index < histories.length - 1 && (
                                                    <div className="w-0.5 h-8 bg-gray-200 mt-2 ml-1" />
                                                )}
                                            </div>
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
                                                            <p className="text-sm font-medium text-gray-500">
                                                                {history.performed_by_user?.name || 'Sistem'}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            {history.comment}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-500 text-right">
                                                        {formatDateTime(history.performed_at)}
                                                    </p>
                                                </div>
                                                {history.old_status && history.new_status && (
                                                    <div className="flex items-center space-x-4 text-sm mt-2">
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
                                        </div>
                                    ))}
                                    {histories.length === 0 && (
                                        <p className="text-gray-500 text-center">Belum ada riwayat aktivitas.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="shadow-lg rounded-xl">
                            <CardHeader className="border-b p-6">
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-6 w-6 text-gray-700" />
                                    <span>Informasi Peminjaman</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ID Peminjaman:</span>
                                    <span className="font-semibold">{borrowing.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tanggal Peminjaman:</span>
                                    <span className="font-medium">
                                        {borrowing.borrowed_at ? formatDateTime(borrowing.borrowed_at) : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Waktu Selesai:</span>
                                    <span className="font-medium">
                                        {borrowing.returned_at ? formatDateTime(borrowing.returned_at) : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Dibuat:</span>
                                    <span className="font-medium">{borrowing.created_at ? formatDateTime(borrowing.created_at) : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Diperbarui:</span>
                                    <span className="font-medium">{borrowing.updated_at ? formatDateTime(borrowing.updated_at) : '-'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
