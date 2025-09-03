import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    CheckSquare,
    XCircle,
    Clock,
    Building2,
    User,
    Calendar,
    Phone,
    MessageSquare,
    Eye,
    Check,
    X,
    AlertTriangle,
    Search,
    Filter,
    RefreshCw,
    Users,
    MapPin
} from 'lucide-react';
import { cn, formatDateTime, formatRelativeTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, Borrowing, PaginatedResponse } from '@/types';

interface ApprovalsPageProps extends PageProps {
    pending_approvals: PaginatedResponse<Borrowing>;
    recent_decisions: Borrowing[];
    stats: {
        total_pending: number;
        approved_today: number;
        rejected_today: number;
        avg_response_time: string;
    };
}

export default function Index({ auth, pending_approvals, recent_decisions, stats }: ApprovalsPageProps) {
    const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleApprove = (borrowingId: number) => {
        setLoading(borrowingId);
        router.post(`/Approvals/${borrowingId}/approve`, {
            admin_notes: approvalNotes,
        }, {
            onSuccess: () => {
                setApprovalNotes('');
                setSelectedBorrowing(null);
            },
            onFinish: () => setLoading(null),
        });
    };

    const handleReject = (borrowingId: number) => {
        setLoading(borrowingId);
        router.post(`/Approvals/${borrowingId}/reject`, {
            rejection_reason: rejectionReason,
            admin_notes: approvalNotes,
        }, {
            onSuccess: () => {
                setRejectionReason('');
                setApprovalNotes('');
                setSelectedBorrowing(null);
            },
            onFinish: () => setLoading(null),
        });
    };

   const filterPendingApprovals = (pending_approvals?.data || []);

    // Check if user has approval access
    if (!['admin', 'super-admin'].includes(auth.user.role)) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Persetujuan Peminjaman" />
                <Card className="border-2 border-dashed border-red-200">
                    <CardContent className="p-12 text-center">
                        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-medium mb-3 text-red-900">Akses Ditolak</h3>
                        <p className="text-red-700 mb-6">
                            Anda tidak memiliki izin untuk mengakses halaman persetujuan peminjaman.
                            Fitur ini hanya tersedia untuk Administrator dan Super Admin.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Kembali ke Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Persetujuan Peminjaman" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 flex items-center">
                            <CheckSquare className="h-8 w-8 mr-3 text-orange-600" />
                            Persetujuan Peminjaman
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Kelola persetujuan peminjaman ruangan yang masuk
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <Button 
                            variant="outline" 
                            onClick={() => router.reload()} 
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Menunggu Persetujuan</p>
                                    <p className="text-3xl font-bold text-orange-900">{stats?.total_pending ?? 0}</p>
                                </div>
                                <Clock className="h-12 w-12 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Disetujui Hari Ini</p>
                                    <p className="text-3xl font-bold text-green-900">{stats?.approved_today ?? 0}</p>
                                </div>
                                <Check className="h-12 w-12 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-700">Ditolak Hari Ini</p>
                                    <p className="text-3xl font-bold text-red-900">{stats?.rejected_today ?? 0}</p>
                                </div>
                                <X className="h-12 w-12 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Rata-rata Respons</p>
                                    <p className="text-3xl font-bold text-blue-900">{stats?.avg_response_time ?? 0}</p>
                                </div>
                                <Clock className="h-12 w-12 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="pending" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pending" className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Menunggu Persetujuan ({stats?.total_pending ?? 0})
                        </TabsTrigger>
                        <TabsTrigger value="recent" className="flex items-center">
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Keputusan Terbaru
                        </TabsTrigger>
                    </TabsList>

                    {/* Pending Approvals Tab */}
                    <TabsContent value="pending" className="space-y-6">
                        {/* Search */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Cari peminjam, ruangan, atau tujuan..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Approvals List */}
                        <div className="space-y-4">
                            {filterPendingApprovals.length > 0 ? (
                                filterPendingApprovals.map((borrowing) => (
                                    <Card key={borrowing.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 space-y-4">
                                                    {/* Header Info */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                    {getUserInitials(borrowing.borrower_name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                    {borrowing.borrower_name}
                                                                </h3>
                                                                <p className="text-sm text-gray-600">
                                                                    {borrowing.borrower_phone} • 
                                                                    {getStatusLabel(borrowing.borrower_category, 'category')}
                                                                </p>
                                                                {borrowing.borrower_department && (
                                                                    <p className="text-sm text-gray-500">
                                                                        {borrowing.borrower_department}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="text-right">
                                                            <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Menunggu Persetujuan
                                                            </Badge>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {formatRelativeTime(borrowing.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Booking Details */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <Building2 className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-sm font-medium">Ruang {borrowing.room?.name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {borrowing.room?.location}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {formatDateTime(borrowing.borrowed_at)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Waktu Mulai
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <Users className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {borrowing.participant_count} orang
                                                                </p>
                                                                <p className="text-xs text-gray-500">Jumlah Peserta</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {borrowing.planned_return_at ? 
                                                                        formatDateTime(borrowing.planned_return_at) : 
                                                                        'Tidak ditentukan'
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">Selesai</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Purpose */}
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-2">Tujuan Peminjaman:</h4>
                                                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                                                            {borrowing.purpose}
                                                        </p>
                                                    </div>

                                                    {/* Equipment */}
                                                    {borrowing.equipment_needed && borrowing.equipment_needed.length > 0 && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2">Peralatan Tambahan:</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {borrowing.equipment_needed.map((equipment, index) => (
                                                                    <Badge key={index} variant="secondary">
                                                                        {equipment}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Notes */}
                                                    {borrowing.notes && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2">Catatan Tambahan:</h4>
                                                            <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                                                                {borrowing.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator className="my-4" />

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/Borrowings/${borrowing.id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Detail Lengkap
                                                    </Link>
                                                </Button>

                                                <div className="flex items-center space-x-3">
                                                    {/* Reject Dialog */}
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => setSelectedBorrowing(borrowing)}
                                                                disabled={loading === borrowing.id}
                                                            >
                                                                <X className="h-4 w-4 mr-2" />
                                                                Tolak
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Tolak Peminjaman</DialogTitle>
                                                                <DialogDescription>
                                                                    Berikan alasan penolakan untuk peminjaman {selectedBorrowing?.borrower_name}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Alasan Penolakan *</label>
                                                                    <Textarea
                                                                        value={rejectionReason}
                                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                                        placeholder="Masukkan alasan penolakan..."
                                                                        rows={3}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Catatan Admin</label>
                                                                    <Textarea
                                                                        value={approvalNotes}
                                                                        onChange={(e) => setApprovalNotes(e.target.value)}
                                                                        placeholder="Catatan internal (opsional)..."
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline">Batal</Button>
                                                                <Button 
                                                                    variant="destructive"
                                                                    onClick={() => selectedBorrowing && handleReject(selectedBorrowing.id)}
                                                                    disabled={!rejectionReason.trim() || loading === selectedBorrowing?.id}
                                                                >
                                                                    {loading === selectedBorrowing?.id ? 'Memproses...' : 'Tolak Peminjaman'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    {/* Approve Dialog */}
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => setSelectedBorrowing(borrowing)}
                                                                disabled={loading === borrowing.id}
                                                            >
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Setujui
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Setujui Peminjaman</DialogTitle>
                                                                <DialogDescription>
                                                                    Konfirmasi persetujuan peminjaman ruangan untuk {selectedBorrowing?.borrower_name}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                                    <h4 className="font-medium text-green-900 mb-2">Ringkasan Peminjaman:</h4>
                                                                    <div className="space-y-1 text-sm text-green-800">
                                                                        <p>Ruang: {selectedBorrowing?.room?.name}</p>
                                                                        <p>Waktu: {selectedBorrowing && formatDateTime(selectedBorrowing.borrowed_at)}</p>
                                                                        <p>Peserta: {selectedBorrowing?.participant_count} orang</p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Catatan Persetujuan</label>
                                                                    <Textarea
                                                                        value={approvalNotes}
                                                                        onChange={(e) => setApprovalNotes(e.target.value)}
                                                                        placeholder="Catatan untuk peminjam (opsional)..."
                                                                        rows={3}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline">Batal</Button>
                                                                <Button 
                                                                    onClick={() => selectedBorrowing && handleApprove(selectedBorrowing.id)}
                                                                    disabled={loading === selectedBorrowing?.id}
                                                                >
                                                                    {loading === selectedBorrowing?.id ? 'Memproses...' : 'Setujui Peminjaman'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <CheckSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {searchTerm ? 'Tidak ada hasil pencarian' : 'Tidak ada peminjaman yang menunggu persetujuan'}
                                        </h3>
                                        <p className="text-gray-600">
                                            {searchTerm ? 
                                                'Coba ubah kata kunci pencarian Anda.' :
                                                'Semua permintaan peminjaman sudah diproses.'
                                            }
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Recent Decisions Tab */}
                    <TabsContent value="recent" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Keputusan Terbaru</CardTitle>
                                <CardDescription>
                                    Riwayat keputusan persetujuan yang telah Anda buat
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {(recent_decisions ?? []).length > 0 ? (
    <div className="space-y-4">
        {(recent_decisions ?? []).map((borrowing) => (
            <div 
                key={borrowing.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
            >
                <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getUserInitials(borrowing.borrower_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-medium">{borrowing.borrower_name}</h4>
                        <p className="text-sm text-gray-600">
                            Ruang {borrowing.room?.name} • {formatRelativeTime(borrowing.approved_at || borrowing.updated_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge 
                        variant="outline" 
                        className={cn("border", getStatusColor(borrowing.status))}
                    >
                        {getStatusLabel(borrowing.status, 'borrowing')}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/Borrowings/${borrowing.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        ))}
    </div>
) : (
    <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">Belum ada keputusan terbaru.</p>
    </div>
)}

                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}