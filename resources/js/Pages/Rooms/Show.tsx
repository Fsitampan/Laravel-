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
    Edit,
    CheckCircle,
    AlertCircle,
    Wrench,
    Star,
    Wifi,
    Monitor,
    Volume2,
    Camera,
    Eye,
    History,
    Plus,
    ImageIcon,
    Phone,
    Mail,
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, Room } from '@/types';

interface ShowRoomPageProps extends PageProps {
    room: Room & {
        image_url?: string;
        layout_images?: string[];
    };
    stats?: {
        total_bookings?: number;
        active_bookings?: number;
        completed_bookings?: number;
        monthly_bookings?: number;
    };
}

export default function ShowRoom({ auth, room, stats }: ShowRoomPageProps) {
    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'tersedia':
            case 'available':
                return <CheckCircle className="h-4 w-4" />;
            case 'dipakai':
            case 'occupied':
                return <Users className="h-4 w-4" />;
            case 'pemeliharaan':
            case 'maintenance':
                return <Wrench className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getFacilityIcon = (facility: string) => {
        const lower = facility.toLowerCase();
        if (lower.includes('wifi')) return <Wifi className="h-4 w-4" />;
        if (lower.includes('proyektor') || lower.includes('projector')) return <Monitor className="h-4 w-4" />;
        if (lower.includes('sound') || lower.includes('audio')) return <Volume2 className="h-4 w-4" />;
        return <Star className="h-4 w-4" />;
    };

    // ✅ Data sudah diproses di backend
    const imageUrl = room.image_url || `https://placehold.co/800x600/e2e8f0/7c3aed?text=Ruang+${encodeURIComponent(room.name)}`;
    const layoutImages = room.layout_images || [];
    const facilities = Array.isArray(room.facilities) ? room.facilities : [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Ruang ${room.name} - Detail`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/Rooms">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight">
                                    {room.full_name || `Ruang ${room.name}`}
                                </h1>
                                <p className="text-muted-foreground">
                                    Detail informasi dan status ruangan
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {room.status === 'tersedia' && room.is_active && (
                            <Button asChild>
                                <Link href={`/Borrowings/Create?room=${room.id}`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Peminjaman
                                </Link>
                            </Button>
                        )}
                        {isAdmin && (
                            <Button variant="outline" asChild>
                                <Link href={`/Rooms/${room.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Ruangan
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Room Preview Image */}
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <div className="relative h-64 sm:h-80">
                                <img
                                    src={imageUrl}
                                    alt={`Preview Ruang ${room.name}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                        (e.target as HTMLImageElement).src = 
                                            `https://placehold.co/800x600/e2e8f0/7c3aed?text=Ruang+${encodeURIComponent(room.name)}`; 
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                
                                {/* Room Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <Badge variant="outline" className={cn("backdrop-blur-sm bg-white/90", getStatusColor(room.status))}>
                                        {getStatusIcon(room.status)}
                                        <span className="ml-2">{getStatusLabel(room.status, 'room')}</span>
                                    </Badge>
                                </div>
                                
                                {/* Room Info Overlay */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4">
                                        <h2 className="text-white text-2xl font-bold">Ruang {room.name}</h2>
                                        <div className="flex items-center gap-4 mt-2 text-white/90 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>Kapasitas {room.capacity} orang</span>
                                            </div>
                                            {room.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{room.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* ✅ Layout Ruangan */}
                        {layoutImages.length > 0 && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Layout Ruangan
                                    </CardTitle>
                                    <CardDescription>
                                        Terdapat {layoutImages.length} layout untuk ruangan ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {layoutImages.map((imageUrl, index) => (
                                            <div key={index} className="relative group rounded-lg overflow-hidden border bg-muted hover:shadow-lg transition-shadow">
                                                <img
                                                    src={imageUrl}
                                                    alt={`Layout ${index + 1}`}
                                                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 
                                                            'https://placehold.co/400x300/e5e7eb/6b7280?text=Layout+' + (index + 1);
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="absolute bottom-2 left-2 right-2">
                                                        <div className="flex items-center justify-between text-white text-sm">
                                                            <span className="font-medium">Layout {index + 1}</span>
                                                            <Eye className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 left-2">
                                                    <Badge variant="secondary" className="text-xs bg-white/90">
                                                        <ImageIcon className="h-3 w-3 mr-1" />
                                                        {index + 1}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        {/* Room Details */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Informasi Ruangan
                                </CardTitle>
                                <CardDescription>
                                    Detail lengkap tentang ruangan dan fasilitasnya
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Kode Ruangan</label>
                                            <p className="text-lg font-medium">{room.code}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Nama Ruangan</label>
                                            <p className="text-lg font-medium">{room.name}</p>
                                        </div>
                                        {room.full_name && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
                                                <p className="text-lg">{room.full_name}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Kapasitas</label>
                                            <div className="flex items-center space-x-2">
                                                <Users className="h-5 w-5 text-gray-400" />
                                                <span className="text-lg font-medium">{room.capacity} orang</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant="outline" className={cn("text-sm", getStatusColor(room.status))}>
                                                    {getStatusIcon(room.status)}
                                                    <span className="ml-1">{getStatusLabel(room.status, 'room')}</span>
                                                </Badge>
                                                {!room.is_active && (
                                                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                                        Tidak Aktif
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {room.location && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Lokasi</label>
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-5 w-5 text-gray-400" />
                                                    <span className="text-lg">{room.location}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {room.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                                            <p className="text-gray-700 mt-2 leading-relaxed">{room.description}</p>
                                        </div>
                                    </>
                                )}

                                {room.notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Catatan</label>
                                            <p className="text-gray-700 mt-2 leading-relaxed">{room.notes}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Facilities */}
                        {facilities.length > 0 && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5" />
                                        Fasilitas Tersedia
                                    </CardTitle>
                                    <CardDescription>
                                        {facilities.length} fasilitas yang tersedia di ruangan ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {facilities.map((facility, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex-shrink-0 text-blue-600">
                                                    {getFacilityIcon(facility)}
                                                </div>
                                                <span className="text-sm font-medium">{facility}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Current Borrowing */}
                        {room.current_borrowing && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Peminjaman Aktif
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-orange-100 text-orange-700">
                                                {getUserInitials(room.current_borrowing.borrower_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-orange-900">
                                                {room.current_borrowing.borrower_name}
                                            </h4>
                                            {room.current_borrowing.user_name && (
                                                <p className="text-sm text-orange-700">
                                                    {room.current_borrowing.user_name}
                                                </p>
                                            )}
                                            <div className="mt-2 space-y-1 text-sm text-orange-600">
                                                {room.current_borrowing.borrow_date && (
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{room.current_borrowing.borrow_date}</span>
                                                    </div>
                                                )}
                                                {room.current_borrowing.start_time && (
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{room.current_borrowing.start_time} - {room.current_borrowing.end_time || 'Selesai'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {room.current_borrowing.purpose && (
                                                <div className="mt-3 p-2 bg-white rounded text-sm">
                                                    <span className="font-medium">Tujuan: </span>
                                                    {room.current_borrowing.purpose}
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/Borrowings/${room.current_borrowing.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                Detail
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Aksi Cepat</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {room.status === 'tersedia' && room.is_active && (
                                    <Button className="w-full" asChild>
                                        <Link href={`/Borrowings/create?room=${room.id}`}>
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Pinjam Ruangan
                                        </Link>
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/History?room_id=${room.id}`}>
                                        <History className="h-4 w-4 mr-2" />
                                        Lihat Riwayat
                                    </Link>
                                </Button>
                                {isAdmin && (
                                    <>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/Rooms/${room.id}/edit`}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Ruangan
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/Borrowings?room_id=${room.id}`}>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Kelola Peminjaman
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        {stats && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Statistik Ruangan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Peminjaman</span>
                                        <span className="font-medium">{stats.total_bookings || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Peminjaman Aktif</span>
                                        <span className="font-medium">{stats.active_bookings || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Selesai</span>
                                        <span className="font-medium">{stats.completed_bookings || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Bulan Ini</span>
                                        <span className="font-medium">{stats.monthly_bookings || 0}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <Badge variant="outline" className={cn("text-xs", getStatusColor(room.status))}>
                                            {getStatusLabel(room.status, 'room')}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Ruangan Aktif</span>
                                        <Badge variant="outline" className={cn("text-xs", 
                                            room.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                            'border-red-200 bg-red-50 text-red-700'
                                        )}>
                                            {room.is_active ? 'Ya' : 'Tidak'}
                                        </Badge>
                                    </div>
                                    {layoutImages.length > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Jumlah Layout</span>
                                            <span className="font-medium">{layoutImages.length} gambar</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Room Info */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Informasi Tambahan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ID Ruangan</span>
                                    <span className="font-medium">#{room.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Kode</span>
                                    <span className="font-medium">{room.code}</span>
                                </div>
                                {room.created_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dibuat</span>
                                        <span className="font-medium">{formatDateTime(room.created_at)}</span>
                                    </div>
                                )}
                                {room.updated_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Terakhir Diupdate</span>
                                        <span className="font-medium">{formatDateTime(room.updated_at)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Bantuan & Dukungan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>Ada masalah dengan ruangan ini?</p>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4" />
                                            <span>Hubungi Admin: (0761) 123-4567</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4" />
                                            <span>Email: admin@bps.riau.go.id</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}