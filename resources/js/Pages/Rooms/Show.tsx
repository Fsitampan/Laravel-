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
    User,
    Phone,
    Mail,
    Camera,
    Eye,
    History,
    Settings,
    Plus,
    Activity
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, Room } from '@/types';

interface ShowRoomPageProps extends PageProps {
    room: Room;
}

// Mock data untuk gambar ruangan - dalam production akan dari database
const getRoomImage = (roomName: string): string => {
    const imageMap: { [key: string]: string } = {
        'A': 'https://images.unsplash.com/photo-1745970649957-b4b1f7fde4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25mZXJlbmNlJTIwcm9vbSUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3Mjk3MTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'B': 'https://images.unsplash.com/photo-1692133226337-55e513450a32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMG1lZXRpbmclMjByb29tJTIwb2ZmaWNlfGVufDF8fHx8MTc1NzQwMzg5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'C': 'https://images.unsplash.com/photo-1750768145390-f0ad18d3e65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBtZWV0aW5nJTIwcm9vbSUyMHByb2plY3RvcnxlbnwxfHx8fDE3NTc0MDM5MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'D': 'https://images.unsplash.com/photo-1719845853806-1c54b0ed37c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNjdXNzaW9uJTIwcm9vbSUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzU3NDAzOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'E': 'https://images.unsplash.com/photo-1689150571822-1b573b695391?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpdG9yaXVtJTIwc2VtaW5hciUyMGhhbGx8ZW58MXx8fHwxNzU3NDAzODk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'F': 'https://images.unsplash.com/photo-1589639293663-f9399bb41721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb20lMjBvZmZpY2V8ZW58MXx8fHwxNzU3NDAzODk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    };
    
    const roomCode = roomName.toUpperCase();
    return imageMap[roomCode] || imageMap['A']; // Default fallback
};

export default function ShowRoom({ auth, room }: ShowRoomPageProps) {
    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return <CheckCircle className="h-4 w-4" />;
            case 'occupied':
                return <Users className="h-4 w-4" />;
            case 'maintenance':
                return <Wrench className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getFacilityIcon = (facility: string) => {
        const lowerFacility = facility.toLowerCase();
        if (lowerFacility.includes('wifi') || lowerFacility.includes('internet')) {
            return <Wifi className="h-4 w-4" />;
        }
        if (lowerFacility.includes('proyektor') || lowerFacility.includes('projector')) {
            return <Monitor className="h-4 w-4" />;
        }
        if (lowerFacility.includes('sound') || lowerFacility.includes('audio') || lowerFacility.includes('microphone')) {
            return <Volume2 className="h-4 w-4" />;
        }
        return <Star className="h-4 w-4" />;
    };

    const recentBookings = room.current_borrowing ? [room.current_borrowing] : [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Ruang ${room.name} - Detail`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/rooms">
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
                        {room.status === 'tersedia' && (
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
                                    src={getRoomImage(room.name)}
                                    alt={`Preview Ruang ${room.name}`}
                                    className="w-full h-full object-cover"
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
                                            <label className="text-sm font-medium text-gray-500">Nama Ruangan</label>
                                            <p className="text-lg font-medium">{room.name}</p>
                                        </div>
                                        {room.full_name && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
                                                <p className="text-lg">{room.full_name}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Kapasitas</label>
                                            <div className="flex items-center space-x-2">
                                                <Users className="h-5 w-5 text-gray-400" />
                                                <span className="text-lg font-medium">{room.capacity} orang</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant="outline" className={cn("text-sm", getStatusColor(room.status))}>
                                                    <div className="flex items-center">
                                                        {getStatusIcon(room.status)}
                                                        <span className="ml-1">{getStatusLabel(room.status, 'room')}</span>
                                                    </div>
                                                </Badge>
                                                {!room.is_active && (
                                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
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
                            </CardContent>
                        </Card>

                        {/* Facilities */}
                        {room.facilities && room.facilities.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fasilitas Tersedia</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {room.facilities.map((facility, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="h-5 w-5 mr-2" />
                                        Peminjaman Aktif
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
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
                                                <p className="text-sm text-orange-700">
                                                    {room.current_borrowing.borrower_phone}
                                                </p>
                                                <div className="mt-2 space-y-1 text-sm text-orange-600">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Mulai: {formatDateTime(room.current_borrowing.borrowed_at)}</span>
                                                    </div>
                                                    {room.current_borrowing.planned_return_at && (
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Estimasi selesai: {formatDateTime(room.current_borrowing.planned_return_at)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4" />
                                                        <span>{room.current_borrowing.participant_count} peserta</span>
                                                    </div>
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
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Aksi Cepat</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {room.status === 'tersedia' && room.is_active && (
                                    <Button className="w-full" asChild>
                                        <Link href={`/borrowings/create?room=${room.id}`}>
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistik Ruangan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Peminjaman</span>
                                        <span className="font-medium">{room.borrowings_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Jam Digunakan</span>
                                        <span className="font-medium">{room.total_hours_used || 0} jam</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Status Saat Ini</span>
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
                                </div>
                            </CardContent>
                        </Card>

                        {/* Room Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Tambahan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID Ruangan</span>
                                        <span className="font-medium">#{room.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dibuat</span>
                                        <span className="font-medium">{formatDateTime(room.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Terakhir Diupdate</span>
                                        <span className="font-medium">{formatDateTime(room.updated_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Info for Support */}
                        <Card>
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