import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Users,
    Search,
    Plus,
    Filter,
    Grid3X3,
    List,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Crown,
    Shield,
    UserCheck,
    Mail,
    Phone,
    Building,
    CheckCircle,
    XCircle,
    Download,
    RefreshCw,
    UserPlus,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getStatusLabel, getUserInitials } from '@/lib/utils';
import type { PageProps, User, PaginatedResponse, UserFilters } from '@/types';

interface UsersPageProps extends PageProps {
    users: PaginatedResponse<User>;
    filters: UserFilters;
    stats: {
        total: number;
        active: number;
        inactive: number;
        admins: number;
        super_admins: number;
        regular_users: number;
    };
}

export default function UsersIndex({ auth, users, filters, stats }: UsersPageProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState<string>(filters.role || 'all');
    const [selectedCategory, setSelectedCategory] = useState<string>(filters.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.is_active === true ? 'active' : 
        filters.is_active === false ? 'inactive' : 'all'
    );
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleSearch = (query: string) => {
        router.get('/users', {
            ...filters,
            search: query || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleRoleFilter = (role: string) => {
        router.get('/users', {
            ...filters,
            role: role === 'all' ? undefined : role,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryFilter = (category: string) => {
        router.get('/users', {
            ...filters,
            category: category === 'all' ? undefined : category,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/users', {
            ...filters,
            is_active: status === 'all' ? undefined : status === 'active',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/users', {
            ...filters,
            page
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['users', 'stats'],
            onFinish: () => {
                setTimeout(() => setIsRefreshing(false), 1000);
            }
        });
    };

    const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
        try {
            await router.patch(`/users/${userId}`, {
                is_active: !isActive
            });
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await router.delete(`/users/${userId}`);
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
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
        setSelectedRole(filters.role || 'all');
        setSelectedCategory(filters.category || 'all');
        setSelectedStatus(
            filters.is_active === true ? 'active' : 
            filters.is_active === false ? 'inactive' : 'all'
        );
    }, [filters]);

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super-admin':
                return Crown;
            case 'admin':
                return Shield;
            default:
                return UserCheck;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super-admin':
                return 'text-purple-700 bg-purple-100 border-purple-200';
            case 'admin':
                return 'text-blue-700 bg-blue-100 border-blue-200';
            default:
                return 'text-emerald-700 bg-emerald-100 border-emerald-200';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'employee':
                return 'text-blue-700 bg-blue-100 border-blue-200';
            case 'guest':
                return 'text-orange-700 bg-orange-100 border-orange-200';
            case 'intern':
                return 'text-purple-700 bg-purple-100 border-purple-200';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Pengguna" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Manajemen Pengguna
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Kelola pengguna sistem BPS Riau
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
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/users/export">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/users/create">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Tambah Pengguna
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-blue-700">Total</p>
                                <p className="text-2xl font-bold text-blue-900">{users.total}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-emerald-700">Aktif</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats.active}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-red-700">Tidak Aktif</p>
                                <p className="text-2xl font-bold text-red-900">{stats.inactive}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-purple-700">Super Admin</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.super_admins}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-blue-700">Admin</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.admins}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">Pengguna</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.regular_users}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Cari pengguna..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={selectedRole} onValueChange={handleRoleFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Peran</SelectItem>
                                        <SelectItem value="super-admin">Super Admin</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                        <SelectItem value="user">Pengguna</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        <SelectItem value="employee">Pegawai</SelectItem>
                                        <SelectItem value="guest">Tamu</SelectItem>
                                        <SelectItem value="intern">Magang</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center border rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                {(users.data?.length || 0) === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchQuery ? 'Tidak ada pengguna ditemukan' : 'Belum ada pengguna'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery 
                                    ? `Tidak ada pengguna yang cocok dengan pencarian "${searchQuery}"`
                                    : 'Tambahkan pengguna pertama untuk memulai'
                                }
                            </p>
                            {!searchQuery && (
                                <Button asChild>
                                    <Link href="/users/create">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Tambah Pengguna
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : viewMode === 'table' ? (
                    <>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Pengguna</TableHead>
                                            <TableHead>Peran</TableHead>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead>Kontak</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Bergabung</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data?.map((user) => {
                                            const RoleIcon = getRoleIcon(user.role);
                                            return (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                    {getUserInitials(user.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn("border", getRoleColor(user.role))}>
                                                            <RoleIcon className="h-3 w-3 mr-1" />
                                                            {getStatusLabel(user.role, 'role')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={cn("border", getCategoryColor(user.category))}>
                                                            {getStatusLabel(user.category, 'category')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <p className="text-gray-900">{user.phone || '-'}</p>
                                                            <p className="text-gray-500">{user.department || '-'}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                checked={user.is_active}
                                                                onCheckedChange={() => handleToggleUserStatus(user.id, user.is_active)}
                                                                disabled={user.id === auth.user.id}
                                                            />
                                                            <span className={cn(
                                                                "text-sm",
                                                                user.is_active ? "text-emerald-600" : "text-red-600"
                                                            )}>
                                                                {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-gray-500">
                                                            {formatDateTime(user.created_at, { 
                                                                day: 'numeric', 
                                                                month: 'short', 
                                                                year: 'numeric' 
                                                            })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/users/${user.id}`}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        Detail
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/users/${user.id}/edit`}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {user.id !== auth.user.id && (
                                                                    <>
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
                                                                                    <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Apakah Anda yakin ingin menghapus pengguna {user.name}? 
                                                                                        Tindakan ini tidak dapat dibatalkan.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() => handleDeleteUser(user.id)}
                                                                                        className="bg-red-600 hover:bg-red-700"
                                                                                    >
                                                                                        Hapus
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Pagination for Table View */}
                        {users.last_page > 1 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {users.from} - {users.to} dari {users.total} pengguna
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {users.links?.map((link, index) => (
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
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.data?.map((user) => {
                                const RoleIcon = getRoleIcon(user.role);
                                return (
                                    <Card key={user.id} className="overflow-hidden smooth-hover">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                                            {getUserInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {user.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{user.email}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/users/${user.id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Detail
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/users/${user.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {user.id !== auth.user.id && (
                                                            <>
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
                                                                            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Apakah Anda yakin ingin menghapus pengguna {user.name}? 
                                                                                Tindakan ini tidak dapat dibatalkan.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteUser(user.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Hapus
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <Badge className={cn("border", getRoleColor(user.role))}>
                                                        <RoleIcon className="h-3 w-3 mr-1" />
                                                        {getStatusLabel(user.role, 'role')}
                                                    </Badge>
                                                    <Badge variant="outline" className={cn("border", getCategoryColor(user.category))}>
                                                        {getStatusLabel(user.category, 'category')}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        {user.phone || 'Tidak ada nomor telepon'}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Building className="h-4 w-4 mr-2" />
                                                        {user.department || 'Tidak ada departemen'}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={user.is_active}
                                                            onCheckedChange={() => handleToggleUserStatus(user.id, user.is_active)}
                                                            disabled={user.id === auth.user.id}
                                                        />
                                                        <span className={cn(
                                                            "text-sm",
                                                            user.is_active ? "text-emerald-600" : "text-red-600"
                                                        )}>
                                                            {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDateTime(user.created_at, { 
                                                            day: 'numeric', 
                                                            month: 'short' 
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <Button asChild variant="outline" size="sm" className="flex-1">
                                                    <Link href={`/users/${user.id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Detail
                                                    </Link>
                                                </Button>
                                                <Button asChild size="sm" className="flex-1">
                                                    <Link href={`/users/${user.id}/edit`}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pagination for Grid View */}
                        {users.last_page > 1 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {users.from} - {users.to} dari {users.total} pengguna
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {users.links?.map((link, index) => (
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