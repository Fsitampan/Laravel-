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
    Building2,
    Plus,
    Search,
    Filter,
    Users,
    MapPin,
    Settings,
    Eye,
    Edit,
    Calendar,
    AlertCircle,
    CheckCircle,
    Wrench,
    Grid3X3,
    List,
    MoreHorizontal,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { cn, getStatusColor, getStatusLabel, debounce } from '@/lib/utils';
import type { PageProps, Room, PaginatedResponse, RoomFilters } from '@/types';

interface RoomsPageProps extends PageProps {
    rooms: PaginatedResponse<Room>;
    filters: RoomFilters;
}

// Mock data untuk gambar ruangan - dalam production akan dari database
// Ambil gambar dari database, fallback ke Unsplash
    const getRoomImage = (room: Room): string => {
     return room.image_url;
    };



export default function RoomsIndex({ auth, rooms, filters }: RoomsPageProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const handleSearch = debounce((value: string) => {
        router.get('/Rooms', { 
            ...filters, 
            search: value,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    }, 300);

    const handleStatusFilter = (status: "available" | "occupied" | "maintenance" | "all") => {
        setStatusFilter(status);
        router.get('/Rooms', { 
            ...filters, 
            status: status === 'all' ? undefined : status,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/Rooms', { 
            ...filters, 
            page 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

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

    const openDetailDialog = (room: Room) => {
        setSelectedRoom(room);
        setIsDetailDialogOpen(true);
    };

    const RoomDetailDialog = ({ isOpen, onOpenChange, room }: {
        isOpen: boolean;
        onOpenChange: (open: boolean) => void;
        room: Room | null;
    }) => {
        if (!room) return null;
        
        const StatusIcon = getStatusIcon(room.status);
        const roomImage = getRoomImage(room);

        
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Ruang {room.name}</DialogTitle>
                        <DialogDescription>
                            Detail lengkap ruangan dan fasilitasnya
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        {/* Room Image */}
                        <div className="relative h-64 rounded-lg overflow-hidden">
                           <img
                            src={roomImage}
                            alt={`Preview Ruang ${room.name}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute top-4 right-4">
                                <Badge variant="outline" className={cn("backdrop-blur-sm bg-white/90", getStatusColor(room.status))}>
                                    {StatusIcon}
                                    <span className="ml-2">{getStatusLabel(room.status, 'room')}</span>
                                </Badge>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <h3 className="text-white text-xl font-semibold">Ruang {room.name}</h3>
                                    <p className="text-white/80 text-sm">{room.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Room Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Informasi Ruangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Kode Ruangan</span>
                                            <p className="text-lg font-semibold">#{room.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Kapasitas</span>
                                            <p className="text-lg font-semibold">{room.capacity} orang</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Lokasi</span>
                                        <p className="flex items-center gap-2 mt-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {room.location || 'Lokasi tidak tersedia'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                                        <div className="mt-1">
                                            <Badge variant="outline" className={cn("", getStatusColor(room.status))}>
                                                {StatusIcon}
                                                <span className="ml-2">{getStatusLabel(room.status, 'room')}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                    {room.full_name && (
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Nama Lengkap</span>
                                            <p className="mt-1 text-sm leading-relaxed">{room.full_name}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Status & Aktivitas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {room.current_borrowing ? (
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users className="h-4 w-4 text-orange-600" />
                                                    <span className="font-medium text-orange-800">Sedang Dipinjam</span>
                                                </div>
                                                <p className="text-sm text-orange-700">
                                                    <strong>Peminjam:</strong> {room.current_borrowing.borrower_name}
                                                </p>
                                                {room.current_borrowing.purpose && (
                                                    <p className="text-sm text-orange-700">
                                                        <strong>Keperluan:</strong> {room.current_borrowing.purpose}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                                            <p className="font-medium text-emerald-800">Ruangan Tersedia</p>
                                            <p className="text-sm text-muted-foreground">
                                                Siap untuk dipinjam
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Ruangan #{room.id} • {room.capacity} orang
                            </div>
                            <div className="flex gap-2">
                                {isAdmin && (
                                    <Button variant="outline" asChild>
                                        <Link href={`/Rooms/${room.id}/edit`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Ruangan
                                        </Link>
                                    </Button>
                                )}
                                {room.status === 'tersedia' && (
                                    <Button asChild>
                                        <Link href={`/Borrowings/Create?room=${room.id}`}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Buat Peminjaman
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    const statusCounts = {
        total: rooms.total,
        available: rooms.data.filter(r => r.status === 'tersedia').length,
        occupied: rooms.data.filter(r => r.status === 'dipakai').length,
        maintenance: rooms.data.filter(r => r.status === 'pemeliharaan').length,
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Ruangan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Manajemen Ruangan
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola data ruangan dan fasilitasnya
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        {isAdmin && (
                            <Button asChild>
                                <Link href="/Rooms/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Ruangan
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Ruangan</p>
                                    <p className="text-2xl font-bold">{statusCounts.total}</p>
                                </div>
                                <Building2 className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tersedia</p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {statusCounts.available}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sedang Digunakan</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {statusCounts.occupied}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {statusCounts.maintenance}
                                    </p>
                                </div>
                                <Wrench className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari ruangan..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            handleSearch(e.target.value);
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="available">Tersedia</SelectItem>
                                            <SelectItem value="occupied">Sedang Digunakan</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rooms Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {rooms.data.map((room) => {
                            const StatusIcon = getStatusIcon(room.status);
                            const roomImage = getRoomImage(room);
                            
                            return (
                                <Card key={room.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                                    {/* Room Image */}
                                    <div 
                                        className="relative h-48 overflow-hidden cursor-pointer"
                                        onClick={() => openDetailDialog(room)}
                                    >
                                        <img
                                            src={roomImage}
                                            alt={`Preview Ruang ${room.name}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/40 transition-all duration-300" />
                                        
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <Eye className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                        
                                        <div className="absolute top-3 right-3">
                                            <Badge variant="outline" className={cn("text-xs backdrop-blur-sm bg-white/90", getStatusColor(room.status))}>
                                                {StatusIcon}
                                                <span className="ml-1">{getStatusLabel(room.status, 'room')}</span>
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-3 left-3">
                                            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 group-hover:bg-black/70 transition-all duration-300">
                                                <span className="text-white font-semibold text-lg"> {room.name}</span>
                                                <p className="text-white/80 text-sm">{room.capacity} orang</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                {room.location || 'Lokasi tidak tersedia'}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>Kapasitas: {room.capacity} orang</span>
                                                </div>
                                                
                                                {room.full_name && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {room.full_name}
                                                    </p>
                                                )}
                                            </div>

                                            {room.current_borrowing && (
                                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                    <p className="text-sm font-medium text-orange-800">
                                                        Sedang Dipinjam
                                                    </p>
                                                    <p className="text-xs text-orange-600">
                                                        {room.current_borrowing.borrower_name}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                         <Link href={`/Rooms/${room.id}`}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Detail
                                                        </Link>
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/Rooms/${room.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                                
                                                {room.status === 'tersedia' && (
                                                    <Button size="sm" asChild>
                                                        <Link href={`/Borrowings/Create?room=${room.id}`}>
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            Pinjam
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ruangan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Kapasitas
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lokasi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {rooms.data.map((room) => (
                                            <tr key={room.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            Ruang {room.name}
                                                        </div>
                                                        {room.full_name && (
                                                            <div className="text-sm text-gray-500">
                                                                {room.full_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="outline" className={cn("text-xs", getStatusColor(room.status))}>
                                                        <div className="flex items-center">
                                                            {getStatusIcon(room.status)}
                                                            <span className="ml-1">{getStatusLabel(room.status, 'room')}</span>
                                                        </div>
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {room.capacity} orang
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {room.location || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/Rooms/${room.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {room.status === 'tersedia' && (
                                                            <Button size="sm" asChild>
                                                                <Link href={`/borrowings/create?room=${room.id}`}>
                                                                    <Calendar className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {isAdmin && (
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={`/Rooms/${room.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {rooms.data.length === 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">Tidak Ada Ruangan</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all' ? 'Tidak ada ruangan yang cocok dengan pencarian Anda.' : 'Belum ada ruangan yang terdaftar.'}
                            </p>
                            {isAdmin && !searchTerm && statusFilter === 'all' && (
                                <Button asChild>
                                    <Link href="/Rooms/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Ruangan Pertama
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {rooms.data.length > 0 && rooms.last_page > 1 && (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {rooms.from} sampai {rooms.to} dari {rooms.total} ruangan
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(rooms.current_page - 1)}
                                        disabled={rooms.current_page <= 1}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Halaman {rooms.current_page} dari {rooms.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(rooms.current_page + 1)}
                                        disabled={rooms.current_page >= rooms.last_page}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Room Detail Dialog */}
                <RoomDetailDialog
                    isOpen={isDetailDialogOpen}
                    onOpenChange={setIsDetailDialogOpen}
                    room={selectedRoom}
                />
            </div>
        </AuthenticatedLayout>
    );
}