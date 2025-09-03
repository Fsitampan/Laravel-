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
    Building2,
    Search,
    Plus,
    Filter,
    Grid3X3,
    List,
    Eye,
    Edit,
    Trash2,
    Users,
    MapPin,
    Calendar,
    Clock,
    Settings,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    Wrench,
    ChevronDown,
    Download,
    Upload,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, Room, PaginatedResponse, RoomFilters } from '@/types';

interface RoomsPageProps extends PageProps {
    rooms: PaginatedResponse<Room>;
    filters: RoomFilters;
    stats: {
        total: number;
        available: number;
        occupied: number;
        maintenance: number;
    };
}

export default function RoomsIndex({
    auth,
    rooms,
    filters = {},
    stats = { total: 0, available: 0, occupied: 0, maintenance: 0 }
}: RoomsPageProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters?.status || 'all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const handleSearch = (query: string) => {
        router.get('/Rooms', {
            ...filters,
            search: query || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/Rooms', {
            ...filters,
            status: status === 'all' ? undefined : status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['rooms', 'stats'],
            onFinish: () => {
                setTimeout(() => setIsRefreshing(false), 1000);
            }
        });
    };

    const handleDeleteRoom = async (roomId: number) => {
        try {
            await router.delete(`/Rooms/${roomId}`, {
                onSuccess: () => {
                    setSelectedRooms(prev => prev.filter(id => id !== roomId));
                }
            });
        } catch (error) {
            console.error('Failed to delete room:', error);
        }
    };

    const handleBulkStatusChange = async (status: string) => {
        if (selectedRooms.length === 0) return;

        try {
            await router.patch('/Rooms/bulk-update', {
                room_ids: selectedRooms,
                status,
            }, {
                onSuccess: () => {
                    setSelectedRooms([]);
                }
            });
        } catch (error) {
            console.error('Failed to update rooms:', error);
        }
    };

    const toggleRoomSelection = (roomId: number) => {
        setSelectedRooms(prev => 
            prev.includes(roomId) 
                ? prev.filter(id => id !== roomId)
                : [...prev, roomId]
        );
    };

    const toggleAllRoomsSelection = () => {
        if (selectedRooms.length === (rooms.data?.length || 0)) {
            setSelectedRooms([]);
        } else {
            setSelectedRooms(rooms.data?.map(room => room.id) || []);
        }
    };

    const handlePageChange = (page: number) => {
        router.get('/Rooms', {
            ...filters,
            page
        }, {
            preserveState: true,
            replace: true,
        });
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
        available: stats.available,
        occupied: stats.occupied,
        maintenance: stats.maintenance,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return CheckCircle;
            case 'occupied':
                return Users;
            case 'maintenance':
                return Wrench;
            default:
                return Building2;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Ruangan" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Manajemen Ruangan
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Kelola ruangan dan fasilitas BPS Riau
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
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem asChild>
                                            <Link href="/Rooms/export?format=excel">
                                                Export ke Excel
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/Rooms/export?format=pdf">
                                                Export ke PDF
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button asChild>
                                    <Link href="/Rooms/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Ruangan
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Total Ruangan</p>
                                    <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                                </div>
                                <Building2 className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-700">Tersedia</p>
                                    <p className="text-3xl font-bold text-emerald-900">{stats.available}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Terpakai</p>
                                    <p className="text-3xl font-bold text-orange-900">{stats.occupied}</p>
                                </div>
                                <Users className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-700">Maintenance</p>
                                    <p className="text-3xl font-bold text-red-900">{stats.maintenance}</p>
                                </div>
                                <Wrench className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Actions */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Cari ruangan..."
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
                                        <SelectItem value="available">
                                            Tersedia ({statusCounts.available})
                                        </SelectItem>
                                        <SelectItem value="occupied">
                                            Terpakai ({statusCounts.occupied})
                                        </SelectItem>
                                        <SelectItem value="maintenance">
                                            Maintenance ({statusCounts.maintenance})
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                {selectedRooms.length > 0 && isAdmin && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                Aksi Massal ({selectedRooms.length})
                                                <ChevronDown className="h-4 w-4 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleBulkStatusChange('available')}>
                                                Tandai Tersedia
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusChange('maintenance')}>
                                                Tandai Maintenance
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                <div className="flex items-center border rounded-lg p-1">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rooms Grid/List */}
                {(rooms.data?.length || 0) === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchQuery ? 'Tidak ada ruangan ditemukan' : 'Belum ada ruangan'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery 
                                    ? `Tidak ada ruangan yang cocok dengan pencarian "${searchQuery}"`
                                    : 'Tambahkan ruangan pertama untuk memulai manajemen ruangan'
                                }
                            </p>
                            {isAdmin && !searchQuery && (
                                <Button asChild>
                                    <Link href="/Rooms/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Ruangan
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className={cn(
                            viewMode === 'grid' 
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-4'
                        )}>
                            {rooms.data?.map((room) => (
                                <Card key={room.id} className="overflow-hidden smooth-hover">
                                    {viewMode === 'grid' ? (
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start space-x-3">
                                                    {isAdmin && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRooms.includes(room.id)}
                                                            onChange={() => toggleRoomSelection(room.id)}
                                                            className="mt-1 rounded border-gray-300"
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            Ruang {room.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {room.full_name || `Ruangan ${room.name}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn("border", getStatusColor(room.status))}
                                                    >
                                                        {getStatusLabel(room.status, 'room')}
                                                    </Badge>
                                                    {isAdmin && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/Rooms/${room.id}`}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        Detail
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/Rooms/${room.id}/edit`}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Hapus
                                                                        </DropdownMenuItem>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Hapus Ruangan</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Apakah Anda yakin ingin menghapus ruangan {room.name}? 
                                                                                Tindakan ini tidak dapat dibatalkan.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteRoom(room.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Hapus
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Kapasitas: {room.capacity} orang
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    {room.location || 'Lokasi tidak tersedia'}
                                                </div>
                                            </div>

                                            {room.current_borrowing && (
                                                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                                                    <p className="text-sm font-medium text-blue-900 mb-1">
                                                        Sedang Digunakan
                                                    </p>
                                                    <p className="text-sm text-blue-700">
                                                        {room.current_borrowing.borrower_name}
                                                    </p>
                                                    <p className="text-xs text-blue-600">
                                                        {formatDateTime(room.current_borrowing.borrowed_at)}
                                                        {room.current_borrowing.planned_return_at && 
                                                            ` - ${formatDateTime(room.current_borrowing.planned_return_at)}`
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex space-x-2">
                                                <Button asChild variant="outline" size="sm" className="flex-1">
                                                    <Link href={`/rooms/${room.id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Detail
                                                    </Link>
                                                </Button>
                                                {room.status === 'occupied' && (
                                                    <Button asChild size="sm" className="flex-1">
                                                        <Link href={`/Borrowings/Create?room=${room.id}`}>
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            Pinjam
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    ) : (
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {isAdmin && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRooms.includes(room.id)}
                                                            onChange={() => toggleRoomSelection(room.id)}
                                                            className="rounded border-gray-300"
                                                        />
                                                    )}
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                {room.name}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                Ruang {room.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {room.full_name || `Ruangan ${room.name}`}
                                                            </p>
                                                            <div className="flex items-center space-x-4 mt-1">
                                                                <span className="text-sm text-gray-500 flex items-center">
                                                                    <Users className="h-4 w-4 mr-1" />
                                                                    {room.capacity}
                                                                </span>
                                                                <span className="text-sm text-gray-500 flex items-center">
                                                                    <MapPin className="h-4 w-4 mr-1" />
                                                                    {room.location || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn("border", getStatusColor(room.status))}
                                                    >
                                                        {getStatusLabel(room.status, 'room')}
                                                    </Badge>
                                                    <div className="flex items-center space-x-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/rooms/${room.id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Detail
                                                            </Link>
                                                        </Button>
                                                        {room.status === 'available' && (
                                                            <Button asChild size="sm">
                                                                <Link href={`/Borrowings/Create?room=${room.id}`}>
                                                                    <Calendar className="h-4 w-4 mr-2" />
                                                                    Pinjam
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {isAdmin && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/rooms/${room.id}/edit`}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                Hapus
                                                                            </DropdownMenuItem>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Hapus Ruangan</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Apakah Anda yakin ingin menghapus ruangan {room.name}? 
                                                                                    Tindakan ini tidak dapat dibatalkan.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleDeleteRoom(room.id)}
                                                                                    className="bg-red-600 hover:bg-red-700"
                                                                                >
                                                                                    Hapus
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {rooms.last_page > 1 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {rooms.from} - {rooms.to} dari {rooms.total} ruangan
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {rooms.links?.map((link, index) => (
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