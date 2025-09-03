import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    Building2,
    Users,
    MapPin,
    Settings,
    Edit,
    Trash2,
    Calendar,
    Clock,
    ArrowLeft,
    Wifi,
    Monitor,
    Mic,
    AirVent,
    Projector,
    Coffee,
    Car,
    Shield,
    AlertCircle,
    CheckCircle,
    XCircle,
    Wrench,
    Eye,
    Plus
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, Room, Borrowing, RoomEquipment } from '@/types';

interface RoomShowPageProps extends PageProps {
    room: Room & {
        equipment?: RoomEquipment[];
        current_borrowing?: Borrowing;
        recent_borrowings?: Borrowing[];
        upcoming_borrowings?: Borrowing[];
    };
}

export default function Show({ auth, room }: RoomShowPageProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const canManageRoom = ['admin', 'super-admin'].includes(auth.user.role);
    
    const handleDelete = async () => {
        setIsDeleting(true);
        router.delete(`/Rooms/${room.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    const getFacilityIcon = (facility: string) => {
        const facilityLower = facility.toLowerCase();
        
        if (facilityLower.includes('wifi') || facilityLower.includes('internet')) return Wifi;
        if (facilityLower.includes('proyektor') || facilityLower.includes('projector')) return Projector;
        if (facilityLower.includes('monitor') || facilityLower.includes('tv') || facilityLower.includes('lcd')) return Monitor;
        if (facilityLower.includes('microphone') || facilityLower.includes('mic') || facilityLower.includes('sound')) return Mic;
        if (facilityLower.includes('ac') || facilityLower.includes('pendingin')) return AirVent;
        if (facilityLower.includes('coffee') || facilityLower.includes('kopi') || facilityLower.includes('minuman')) return Coffee;
        if (facilityLower.includes('parkir') || facilityLower.includes('parking')) return Car;
        if (facilityLower.includes('security') || facilityLower.includes('keamanan')) return Shield;
        
        return CheckCircle;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return CheckCircle;
            case 'occupied':
                return Clock;
            case 'maintenance':
                return Wrench;
            default:
                return AlertCircle;
        }
    };

    const facilities = Array.isArray(room.facilities) ? room.facilities : [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Ruang ${room.name} - Detail`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/Rooms">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 flex items-center">
                                <Building2 className="h-8 w-8 mr-3 text-blue-600" />
                                Ruang {room.name}
                            </h1>
                            <p className="mt-1 text-gray-600">
                                {room.full_name || `Detail ruangan ${room.name}`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {room.status === 'available' && (
                            <Button asChild>
                                <Link href={`/Borrowings/Create?room=${room.id}`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Pinjam Ruangan
                                </Link>
                            </Button>
                        )}
                        
                        {canManageRoom && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={`/Rooms/${room.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Link>
                                </Button>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Hapus
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Hapus Ruangan</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Apakah Anda yakin ingin menghapus Ruang {room.name}? 
                                                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {isDeleting ? 'Menghapus...' : 'Hapus'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </div>
                </div>

                {/* Room Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Status</p>
                                    <div className="flex items-center mt-2">
                                        {(() => {
                                            const StatusIcon = getStatusIcon(room.status);
                                            return <StatusIcon className="h-5 w-5 mr-2" />;
                                        })()}
                                        <Badge 
                                            variant="outline" 
                                            className={cn("border", getStatusColor(room.status))}
                                        >
                                            {getStatusLabel(room.status, 'room')}
                                        </Badge>
                                    </div>
                                </div>
                                <div className={cn(
                                    "h-12 w-12 rounded-lg flex items-center justify-center",
                                    room.status === 'available' ? 'bg-green-100' :
                                    room.status === 'occupied' ? 'bg-orange-100' : 'bg-red-100'
                                )}>
                                    <Building2 className={cn(
                                        "h-6 w-6",
                                        room.status === 'available' ? 'text-green-600' :
                                        room.status === 'maintenance' ? 'text-orange-600' : 'text-red-600'
                                    )} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Kapasitas</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {room.capacity} orang
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Lokasi</p>
                                    <p className="text-lg font-medium text-gray-900 mt-2">
                                        {room.location || 'Tidak tersedia'}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Borrowing Alert */}
                {room.current_borrowing && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-orange-900">
                                        Sedang Digunakan
                                    </h4>
                                    <p className="text-sm text-orange-800 mt-1">
                                        {room.current_borrowing.borrower_name} - {room.current_borrowing.purpose}
                                    </p>
                                    <p className="text-xs text-orange-700 mt-2">
                                        {formatDateTime(room.current_borrowing.borrowed_at)}
                                        {room.current_borrowing.planned_return_at && (
                                            <> sampai {formatDateTime(room.current_borrowing.planned_return_at)}</>
                                        )}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/Borrowings/${room.current_borrowing.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Detail
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                        <TabsTrigger value="facilities">Fasilitas</TabsTrigger>
                        <TabsTrigger value="equipment">Inventaris</TabsTrigger>
                        <TabsTrigger value="bookings">Peminjaman</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Deskripsi Ruangan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {room.description ? (
                                    <p className="text-gray-700 leading-relaxed">
                                        {room.description}
                                    </p>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Building2 className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                        <p>Belum ada deskripsi untuk ruangan ini.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {room.image_url && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Foto Ruangan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={room.image_url}
                                            alt={`Ruang ${room.name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Facilities Tab */}
                    <TabsContent value="facilities" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Fasilitas Tersedia</CardTitle>
                                <CardDescription>
                                    Daftar fasilitas yang tersedia di ruangan ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {facilities.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {facilities.map((facility, index) => {
                                            const FacilityIcon = getFacilityIcon(facility);
                                            return (
                                                <div 
                                                    key={index}
                                                    className="flex items-center p-3 bg-gray-50 rounded-lg border"
                                                >
                                                    <FacilityIcon className="h-5 w-5 text-blue-600 mr-3" />
                                                    <span className="text-gray-900">{facility}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Settings className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                        <p>Belum ada informasi fasilitas.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Equipment Tab */}
                    <TabsContent value="equipment" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventaris Peralatan</CardTitle>
                                <CardDescription>
                                    Daftar peralatan dan kondisinya di ruangan ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {room.equipment && room.equipment.length > 0 ? (
                                    <div className="space-y-4">
                                        {room.equipment.map((equipment) => (
                                            <div 
                                                key={equipment.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {equipment.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Jumlah: {equipment.quantity} • {equipment.type}
                                                    </p>
                                                    {equipment.description && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {equipment.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "border",
                                                        getStatusColor(equipment.condition)
                                                    )}
                                                >
                                                    {getStatusLabel(equipment.condition, 'condition')}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Settings className="h-12 w-12 mx-auto opacity-30 mb-3" />
                                        <p>Belum ada data inventaris peralatan.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Bookings Tab */}
                    <TabsContent value="bookings" className="space-y-6">
                        {/* Upcoming Bookings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Peminjaman Mendatang</CardTitle>
                                <CardDescription>
                                    Jadwal peminjaman yang akan datang
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {room.upcoming_borrowings && room.upcoming_borrowings.length > 0 ? (
                                    <div className="space-y-3">
                                        {room.upcoming_borrowings.map((borrowing) => (
                                            <div key={borrowing.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {borrowing.borrower_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {borrowing.purpose}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatDateTime(borrowing.borrowed_at)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge 
                                                        variant="outline"
                                                        className={cn("border", getStatusColor(borrowing.status))}
                                                    >
                                                        {getStatusLabel(borrowing.status, 'borrowing')}
                                                    </Badge>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/Borrowings/${borrowing.id}`}>
                                                            <Eye className="h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <Calendar className="h-10 w-10 mx-auto opacity-30 mb-2" />
                                        <p>Belum ada peminjaman mendatang.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Bookings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat Peminjaman Terbaru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {room.recent_borrowings && room.recent_borrowings.length > 0 ? (
                                    <div className="space-y-3">
                                        {room.recent_borrowings.slice(0, 5).map((borrowing) => (
                                            <div key={borrowing.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {borrowing.borrower_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {borrowing.purpose}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatDateTime(borrowing.borrowed_at)}
                                                        {borrowing.returned_at && (
                                                            <> - {formatDateTime(borrowing.returned_at)}</>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge 
                                                        variant="outline"
                                                        className={cn("border", getStatusColor(borrowing.status))}
                                                    >
                                                        {getStatusLabel(borrowing.status, 'borrowing')}
                                                    </Badge>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/Borrowings/${borrowing.id}`}>
                                                            <Eye className="h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <Calendar className="h-10 w-10 mx-auto opacity-30 mb-2" />
                                        <p>Belum ada riwayat peminjaman.</p>
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