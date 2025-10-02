import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
    Building2, 
    Users, 
    MapPin, 
    Calendar, 
    Clock,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Wrench,
    User,
    Phone,
    Mail,
    Camera,
    Timer,
    CalendarDays,
    Activity,
    FileText,
    ChevronRight
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, Borrowing } from '@/types';

interface ShowBorrowingPageProps extends PageProps {
    borrowing: Borrowing;
}

// Mock data untuk gambar ruangan - dalam production akan dari database
const getRoomImage = (roomName: string): string => {
    const imageMap: { [key: string]: string } = {
        'A': 'https://images.unsplash.com/photo-1745970649957-b4b1f7fde4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25mZXJlbmNlJTIwcm9vbSUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3Mjk3MTExfDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'B': 'https://images.unsplash.com/photo-1692133226337-55e513450a32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMG1lZXRpbmclMjByb29tJTIwb2ZmaWNlfGVufDF8fHx8MTc1NzQwMzg5MHww&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'C': 'https://images.unsplash.com/photo-1750768145390-f0ad18d3e65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBtZWV0aW5nJTIwcm9vbSUyMHByb2plY3RvcnxlbnwxfHx8fDE3NTc0MDM5MDJ8MA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'D': 'https://images.unsplash.com/photo-1719845853806-1c54b0ed37c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNjdXNzaW9uJTIwcm9vbSUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzU3NDAzOTA2fDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'E': 'https://images.unsplash.com/photo-1689150571822-1b573b695391?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpdG9yaXVtJTIwc2VtaW5hciUyMGhhbGx8ZW58MXx8fHwxNzU3NDAzODk0fDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'F': 'https://images.unsplash.com/photo-1589639293663-f9399bb41721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb20lMjBvZmZpY2V8ZW58MXx8fHwxNzU3NDAzODk4fDA&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral'
    };
    
    const roomCode = roomName.toUpperCase();
    return imageMap[roomCode] || imageMap['A']; // Default fallback
};

export default function ShowBorrowing({ auth, borrowing }: ShowBorrowingPageProps) {
    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <AlertCircle className="h-4 w-4" />;
            case 'active':
                return <Timer className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getDuration = () => {
        if (borrowing.borrowed_at && (borrowing.returned_at || borrowing.planned_return_at)) {
            const start = new Date(borrowing.borrowed_at);
            const end = new Date(borrowing.returned_at || borrowing.planned_return_at || '');
            const diff = end.getTime() - start.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours} jam ${minutes} menit`;
        }
        return '-';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Peminjaman #${borrowing.id} - Detail`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/Borrowings">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight">
                                    Peminjaman #{borrowing.id}
                                </h1>
                                <p className="text-muted-foreground">
                                    Detail peminjaman ruangan dan informasi terkait
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Room Preview Image */}
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <div className="relative h-64 sm:h-80">
                                <img
                                    src={getRoomImage(borrowing.room?.name || 'A')}
                                    alt={`Preview Ruang ${borrowing.room?.name}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <Badge variant="outline" className={cn("backdrop-blur-sm bg-white/90", getStatusColor(borrowing.status))}>
                                        {getStatusIcon(borrowing.status)}
                                        <span className="ml-2">{getStatusLabel(borrowing.status, 'borrowing')}</span>
                                    </Badge>
                                </div>
                                
                                {/* Room Info Overlay */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4">
                                        <h2 className="text-white text-2xl font-bold">Ruang {borrowing.room?.name}</h2>
                                        <div className="flex items-center gap-4 mt-2 text-white/90 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{borrowing.participant_count} dari {borrowing.room?.capacity} orang</span>
                                            </div>
                                            {borrowing.room?.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{borrowing.room.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Borrowing Information */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Informasi Peminjaman
                                </CardTitle>
                                <CardDescription>
                                    Detail lengkap tentang peminjaman ruangan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Borrower Information */}
                                <div>
                                    <h3 className="font-medium mb-4">Informasi Peminjam</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                    {getUserInitials(borrowing.borrower_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{borrowing.borrower_name}</p>
                                                <p className="text-sm text-muted-foreground">Peminjam</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{borrowing.borrower_phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="w-fit">
                                                    {borrowing.borrower_category === 'pegawai' ? 'Pegawai' :
                                                     borrowing.borrower_category === 'tamu' ? 'Tamu' : 'Magang'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Schedule Information */}
                                <div>
                                    <h3 className="font-medium mb-4">Jadwal & Durasi</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarDays className="h-4 w-4" />
                                                <span>Waktu Mulai</span>
                                            </div>
                                            <p className="font-medium">{formatDateTime(borrowing.borrowed_at)}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>{borrowing.returned_at ? 'Waktu Selesai' : 'Target Selesai'}</span>
                                            </div>
                                            <p className="font-medium">
                                                {formatDateTime(borrowing.returned_at || borrowing.planned_return_at || '')}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Timer className="h-4 w-4" />
                                                <span>Durasi</span>
                                            </div>
                                            <p className="font-medium">{getDuration()}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Purpose & Equipment */}
                                <div>
                                    <h3 className="font-medium mb-4">Tujuan & Keperluan</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Tujuan Peminjaman</p>
                                            <div className="p-3 bg-muted rounded-lg">
                                                <p className="text-sm">{borrowing.purpose}</p>
                                            </div>
                                        </div>
                                        
                                        {borrowing.equipment_needed && borrowing.equipment_needed.length > 0 && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">Peralatan yang Dibutuhkan</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {borrowing.equipment_needed.map((equipment, index) => (
                                                        <Badge key={index} variant="outline">
                                                            {equipment}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {borrowing.notes && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">Catatan Tambahan</p>
                                                <div className="p-3 bg-muted rounded-lg">
                                                    <p className="text-sm">{borrowing.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Admin Notes & Status Updates */}
                                {(borrowing.admin_notes || borrowing.rejection_reason) && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h3 className="font-medium mb-4">Catatan Admin</h3>
                                            <div className="space-y-3">
                                                {borrowing.admin_notes && (
                                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                        <div className="flex items-start gap-2">
                                                            <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-sm font-medium text-blue-900 mb-1">Catatan Admin</p>
                                                                <p className="text-sm text-blue-800">{borrowing.admin_notes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {borrowing.rejection_reason && (
                                                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                                        <div className="flex items-start gap-2">
                                                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-sm font-medium text-red-900 mb-1">Alasan Penolakan</p>
                                                                <p className="text-sm text-red-800">{borrowing.rejection_reason}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Aksi Cepat</CardTitle>
                                <CardDescription>
                                    Tindakan yang dapat dilakukan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                    <Link href={`/rooms/${borrowing.room?.id}`}>
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Lihat Detail Ruangan
                                        <ChevronRight className="h-4 w-4 ml-auto" />
                                    </Link>
                                </Button>
                                
                                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                    <Link href="/Borrowings">
                                        <Activity className="h-4 w-4 mr-2" />
                                        Daftar Peminjaman
                                        <ChevronRight className="h-4 w-4 ml-auto" />
                                    </Link>
                                </Button>

                                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                    <Link href="/Borrowings/create">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Buat Peminjaman Baru
                                        <ChevronRight className="h-4 w-4 ml-auto" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Status History */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Status Peminjaman</CardTitle>
                                <CardDescription>
                                    Timeline status peminjaman
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">Peminjaman Dibuat</p>
                                            <p className="text-muted-foreground text-xs">
                                                {formatDateTime(borrowing.created_at || '')}
                                            </p>
                                        </div>
                                    </div>

                                    {borrowing.status !== 'pending' && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-full",
                                                borrowing.status === 'approved' ? "bg-emerald-100" :
                                                borrowing.status === 'rejected' ? "bg-red-100" : "bg-gray-100"
                                            )}>
                                                {getStatusIcon(borrowing.status)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{getStatusLabel(borrowing.status, 'borrowing')}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatDateTime(borrowing.updated_at || '')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {borrowing.returned_at && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">Peminjaman Selesai</p>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatDateTime(borrowing.returned_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Room Details */}
                        {borrowing.room && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Info Ruangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Nama:</span>
                                            <span className="font-medium">Ruang {borrowing.room.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Kapasitas:</span>
                                            <span className="font-medium">{borrowing.room.capacity} orang</span>
                                        </div>
                                        {borrowing.room.location && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Lokasi:</span>
                                                <span className="font-medium">{borrowing.room.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {borrowing.room.facilities && borrowing.room.facilities.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium mb-2">Fasilitas:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {borrowing.room.facilities.slice(0, 4).map((facility, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {facility}
                                                    </Badge>
                                                ))}
                                                {borrowing.room.facilities.length > 4 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{borrowing.room.facilities.length - 4} lainnya
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}