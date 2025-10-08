import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    CheckSquare,
    Clock,
    Search,
    Filter,
    Calendar,
    User,
    Building2,
    Users,
    CheckCircle,
    XCircle,
    Eye,
    MessageCircle,
    AlertCircle,
    Phone,
    MapPin
} from 'lucide-react';
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
import { toast } from 'sonner';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials, debounce } from '@/lib/utils';
import type { PageProps, Borrowing, PaginatedResponse, ApprovalFilters } from '@/types';

interface ApprovalsPageProps extends PageProps {
    approvals: PaginatedResponse<Borrowing>;
    filters: ApprovalFilters;
}

export default function ApprovalsIndex({ auth, approvals, filters = {} }: ApprovalsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>(filters?.status || 'pending');
    const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);

    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const handleSearch = debounce((value: string) => {
        router.get('/Approvals', { 
            ...filters, 
            search: value,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    }, 300);

    const handleStatusFilter = (status: 'pending' | 'all' | 'approved' | 'rejected') => {
        setStatusFilter(status);
        router.get('/Approvals', { 
            ...filters, 
            status: status === 'all' ? undefined : status,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/Approvals', { 
            ...filters, 
            page 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleApprove = () => {
        if (!selectedBorrowing) return;
        
        setActionLoading(selectedBorrowing.id);
            router.post(`/Approvals/${selectedBorrowing.id}/approve`, {
            admin_notes: approvalNotes
        }, {
            preserveState: true,
            onSuccess: () => {
                setSelectedBorrowing(null);
                setApprovalNotes('');
                setDialogOpen(false);
                toast.success('Peminjaman berhasil disetujui');
                router.reload({ only: ['approvals'] });
            },
            onError: (errors) => {
                toast.error('Gagal menyetujui peminjaman');
                console.error('Approval error:', errors);
            },
            onFinish: () => setActionLoading(null)
        });
    };

    const handleReject = () => {
        if (!selectedBorrowing) return;
        
        if (!rejectionReason.trim()) {
            toast.error('Alasan penolakan harus diisi');
            return;
        }
        
        setActionLoading(selectedBorrowing.id);
        router.post(`/Approvals/${selectedBorrowing.id}/reject`, { // ← Ubah dari patch ke post
            rejection_reason: rejectionReason,
            admin_notes: approvalNotes
        }, {
            preserveState: true,
            onSuccess: () => {
                setSelectedBorrowing(null);
                setApprovalNotes('');
                setRejectionReason('');
                setAlertDialogOpen(false);
                toast.success('Peminjaman berhasil ditolak');
                router.reload({ only: ['approvals'] });
            },
            onError: (errors) => {
                toast.error('Gagal menolak peminjaman');
                console.error('Rejection error:', errors);
            },
            onFinish: () => setActionLoading(null)
        });
    };

    const statusCounts = {
        total: approvals.total,
        pending: approvals.data.filter(a => a.status === 'pending').length,
        approved: approvals.data.filter(a => a.status === 'approved').length,
        rejected: approvals.data.filter(a => a.status === 'rejected').length,
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Persetujuan Peminjaman" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Persetujuan Peminjaman
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Kelola persetujuan peminjaman ruangan BPS Riau
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-4 w-4 mr-2" />
                            {statusCounts.pending} menunggu persetujuan
                        </Badge>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Permohonan</p>
                                    <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
                                    <CheckSquare className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Menunggu</p>
                                    <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-yellow-50 text-yellow-700">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Disetujui</p>
                                    <p className="text-2xl font-bold text-emerald-600">{statusCounts.approved}</p>
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
                                    <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
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
                                        placeholder="Cari permohonan..."
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
                                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Menunggu</SelectItem>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="approved">Disetujui</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Approvals List */}
                <div className="space-y-4">
                    {approvals.data.map((borrowing) => (
                        <Card key={borrowing.id} className={cn(
                            "smooth-hover",
                            borrowing.status === 'pending' && "border-l-4 border-l-yellow-400"
                        )}>
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                         {borrowing.room?.name}
                                                    </h3>
                                                    <Badge variant="outline" className={cn("text-xs", getStatusColor(borrowing.status))}>
                                                        {getStatusLabel(borrowing.status, 'borrowing')}
                                                    </Badge>
                                                    {borrowing.status === 'pending' && (
                                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Butuh Persetujuan
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Permohonan #{borrowing.id} • Diajukan {formatDateTime(borrowing.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Borrower Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="space-y-3">
                                                <h4 className="font-medium text-gray-900">Informasi Peminjam</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span>{borrowing.borrower_name}</span>
                                                        <Badge variant="outline" className={cn("text-xs", getStatusColor(borrowing.borrower_category))}>
                                                            {getStatusLabel(borrowing.borrower_category, 'category')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <span>{borrowing.borrower_phone}</span>
                                                    </div>
                                                    {borrowing.borrower_department && (
                                                        <div className="flex items-center space-x-2">
                                                            <Building2 className="h-4 w-4 text-gray-400" />
                                                            <span>{borrowing.borrower_department}</span>
                                                        </div>
                                                    )}
                                                    {borrowing.borrower_institution && (
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin className="h-4 w-4 text-gray-400" />
                                                            <span>{borrowing.borrower_institution}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-medium text-gray-900">Detail Peminjaman</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span>Mulai: {formatDateTime(borrowing.borrowed_at)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span>
                                                            Selesai: {formatDateTime(borrowing.planned_return_at || '')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span>{borrowing.participant_count} peserta</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Purpose */}
                                        {borrowing.purpose && (
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <h4 className="font-medium text-blue-900 mb-2">Tujuan Peminjaman</h4>
                                                <p className="text-sm text-blue-800">{borrowing.purpose}</p>
                                            </div>
                                        )}

                                        {/* Equipment */}
                                        {borrowing.equipment_needed && borrowing.equipment_needed.length > 0 && (
                                            <div className="p-4 bg-orange-50 rounded-lg">
                                                <h4 className="font-medium text-orange-900 mb-2">Peralatan yang Dibutuhkan</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {borrowing.equipment_needed.map((equipment, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {equipment}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {borrowing.notes && (
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-2">Catatan Tambahan</h4>
                                                <p className="text-sm text-gray-700">{borrowing.notes}</p>
                                            </div>
                                        )}

                                        {/* Admin Notes or Rejection Reason */}
                                        {borrowing.admin_notes && (
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <h4 className="font-medium text-blue-900 mb-2">Catatan Admin</h4>
                                                <p className="text-sm text-blue-800">{borrowing.admin_notes}</p>
                                            </div>
                                        )}

                                        {borrowing.rejection_reason && (
                                            <div className="p-4 bg-red-50 rounded-lg">
                                                <h4 className="font-medium text-red-900 mb-2">Alasan Ditolak</h4>
                                                <p className="text-sm text-red-800">{borrowing.rejection_reason}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/Borrowings/${borrowing.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                Detail
                                            </Link>
                                        </Button>

                                        {borrowing.status === 'pending' && isAdmin && (
                                            <>
                                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => {
                                                                setSelectedBorrowing(borrowing);
                                                                setApprovalNotes('');
                                                            }}
                                                            disabled={actionLoading === borrowing.id}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Setujui
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Setujui Peminjaman</DialogTitle>
                                                            <DialogDescription>
                                                                Anda akan menyetujui peminjaman ruang {selectedBorrowing?.room?.name} oleh {selectedBorrowing?.borrower_name}.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <Label htmlFor="approval-notes">Catatan Admin (Opsional)</Label>
                                                                <Textarea
                                                                    id="approval-notes"
                                                                    value={approvalNotes}
                                                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                                                    placeholder="Tambahkan catatan untuk peminjam..."
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                                                Batal
                                                            </Button>
                                                            <Button
                                                                onClick={handleApprove}
                                                                disabled={actionLoading === selectedBorrowing?.id}
                                                            >
                                                                {actionLoading === selectedBorrowing?.id ? 'Memproses...' : 'Setujui Peminjaman'}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                                <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                                                    <AlertDialogTrigger asChild>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedBorrowing(borrowing);
                                                                setRejectionReason('');
                                                                setApprovalNotes('');
                                                            }}
                                                            disabled={actionLoading === borrowing.id}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Tolak
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Tolak Peminjaman</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Anda akan menolak peminjaman ruang {selectedBorrowing?.room?.name} oleh {selectedBorrowing?.borrower_name}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <Label htmlFor="rejection-reason">Alasan Penolakan *</Label>
                                                                <Textarea
                                                                    id="rejection-reason"
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                    placeholder="Jelaskan alasan penolakan..."
                                                                    rows={3}
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="admin-notes-reject">Catatan Admin (Opsional)</Label>
                                                                <Textarea
                                                                    id="admin-notes-reject"
                                                                    value={approvalNotes}
                                                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                                                    placeholder="Tambahkan catatan tambahan..."
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={handleReject}
                                                                disabled={actionLoading === selectedBorrowing?.id}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                {actionLoading === selectedBorrowing?.id ? 'Memproses...' : 'Tolak Peminjaman'}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {approvals.data.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada permohonan ditemukan
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'pending'
                                    ? 'Coba ubah filter pencarian Anda'
                                    : 'Semua permohonan sudah diproses'
                                }
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {approvals.data.length > 0 && approvals.last_page > 1 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {approvals.from} sampai {approvals.to} dari {approvals.total} permohonan
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(approvals.current_page - 1)}
                                        disabled={approvals.current_page <= 1}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-gray-700">
                                        Halaman {approvals.current_page} dari {approvals.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(approvals.current_page + 1)}
                                        disabled={approvals.current_page >= approvals.last_page}
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