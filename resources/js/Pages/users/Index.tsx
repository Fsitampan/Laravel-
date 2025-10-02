import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { UserAvatar } from '@/components/PhotoUpload';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import {
    Users,
    Plus,
    Search,
    Filter,
    User,
    Mail,
    Phone,
    Shield,
    UserCheck,
    UserX,
    Eye,
    Edit,
    MoreHorizontal,
    Crown,
    Settings,
    UserCog,
    Building,
    Activity,
    TrendingUp,
    ArrowUpRight,
    CheckCircle,
    Download,
    Camera,
    Image as ImageIcon
} from 'lucide-react';
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
import { cn, getStatusColor, getStatusLabel, getUserInitials, debounce } from '@/lib/utils';
import type { PageProps, User as UserType, PaginatedResponse, UserFilters } from '@/types';

interface UsersPageProps extends PageProps {
    users: PaginatedResponse<UserType>;
    filters: UserFilters;
}

export default function UsersIndex({ auth, users, filters }: UsersPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category ?? 'all');
    const [statusFilter, setStatusFilter] = useState<string>(
        filters.is_active === true ? 'active' :
        filters.is_active === false ? 'inactive' : 'all'
    );

    const isSuperAdmin = auth.user.role === 'super-admin';
    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);

    const handleSearch = debounce((value: string) => {
        router.get('/users', { 
            ...filters, 
            search: value,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    }, 300);

    const handleRoleFilter = (role: 'super-admin' | 'admin' | 'pengguna' | 'all') => {
        setRoleFilter(role);
        router.get('/users', { 
            ...filters, 
            role: role === 'all' ? undefined : role,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleCategoryFilter = (category: 'all' | 'pegawai' | 'tamu' | 'magang') => {
        setCategoryFilter(category);
        router.get('/users', { 
            ...filters, 
            category: category === 'all' ? undefined : category,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        const is_active = status === 'active' ? true : status === 'inactive' ? false : undefined;
        router.get('/users', { 
            ...filters, 
            is_active,
            page: 1 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/users', { 
            ...filters, 
            page 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const toggleUserStatus = (userId: number, currentStatus: boolean) => {
        router.patch(`/users/${userId}`, {
            is_active: !currentStatus
        }, {
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['users'] });
            }
        });
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super-admin':
                return <Crown className="h-4 w-4" />;
            case 'admin':
                return <Shield className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super-admin':
                return 'role-super-admin';
            case 'admin':
                return 'role-admin';
            default:
                return 'role-pengguna';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'employee':
                return 'category-employee';
            case 'guest':
                return 'category-guest';
            case 'intern':
                return 'category-intern';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

   
    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'pegawai':
                return 'Pegawai';
            case 'tamu':
                return 'Tamu';
            case 'magang':
                return 'Magang';
            default:
                return 'Tidak Diketahui';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'super-admin':
                return 'Super Admin';
            case 'admin':
                return 'Administrator';
            default:
                return 'Pengguna';
        }
    };

    const statusCounts = {
        total: users.total,
        active: users.data.filter(u => u.is_active).length,
        inactive: users.data.filter(u => !u.is_active).length,
        admins: users.data.filter(u => ['admin', 'super-admin'].includes(u.role)).length,
        users: users.data.filter(u => u.role === 'pengguna').length,
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Pengguna" />

            <div className="space-y-8">
                {/* Enhanced Header with Professional Imagery */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-secondary p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                                    <Users className="h-5 w-5" />
                                    <span className="font-medium">Sistem Manajemen Pengguna</span>
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                                    Manajemen Pengguna
                                </h1>
                                <p className="text-lg text-white/90 max-w-2xl">
                                    Kelola pengguna, peran, dan hak akses sistem BPS Riau dengan kontrol penuh dan keamanan terjamin
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              
                                {isSuperAdmin && (
                                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
                                        <Link href="/users/create">
                                            <Plus className="h-5 w-5 mr-2" />
                                            Tambah Pengguna
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"></div>
                    <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5"></div>
                </div>

                {/* Enhanced Stats Cards with Professional Design */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Total Pengguna
                                    </p>
                                    <p className="text-3xl font-bold tracking-tight text-blue-800">
                                        {statusCounts.total}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-600 ml-1">
                                            Sistem Aktif
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                                        <Users className="h-8 w-8" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Pengguna Aktif
                                    </p>
                                    <p className="text-3xl font-bold tracking-tight text-emerald-800">
                                        {statusCounts.active}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-600 ml-1">
                                            {((statusCounts.active / statusCounts.total) * 100).toFixed(1)}% aktif
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                                        <UserCheck className="h-8 w-8" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100/50"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Tidak Aktif
                                    </p>
                                    <p className="text-3xl font-bold tracking-tight text-red-800">
                                        {statusCounts.inactive}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <UserX className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-600 ml-1">
                                            Perlu perhatian
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                                        <UserX className="h-8 w-8" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100/50"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Administrator
                                    </p>
                                    <p className="text-3xl font-bold tracking-tight text-purple-800">
                                        {statusCounts.admins}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <Crown className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-600 ml-1">
                                            Hak akses tinggi
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                                        <Shield className="h-8 w-8" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100/50"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Pengguna Biasa
                                    </p>
                                    <p className="text-3xl font-bold tracking-tight text-gray-800">
                                        {statusCounts.users}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <User className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-600 ml-1">
                                            Akses standar
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Filters Section */}
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 flex-1">
                                    <div className="relative min-w-0 flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari nama, email, atau departemen..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                handleSearch(e.target.value);
                                            }}
                                            className="pl-9 h-11"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Select value={roleFilter} onValueChange={handleRoleFilter}>
                                            <SelectTrigger className="w-44">
                                                <SelectValue placeholder="Peran" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Peran</SelectItem>
                                                <SelectItem value="super-admin">Super Admin</SelectItem>
                                                <SelectItem value="admin">Administrator</SelectItem>
                                                <SelectItem value="pengguna">Pengguna</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
                                            <SelectTrigger className="w-36">
                                                <SelectValue placeholder="Kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua</SelectItem>
                                                <SelectItem value="pegawai">Pegawai</SelectItem>
                                                <SelectItem value="tamu">Tamu</SelectItem>
                                                <SelectItem value="magang">Magang</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                            <SelectTrigger className="w-36">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Status</SelectItem>
                                                <SelectItem value="active">Aktif</SelectItem>
                                                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {users.data.length} dari {users.total} pengguna
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enhanced Users List with Photo Support */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Daftar Pengguna Terdaftar
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua pengguna sistem BPS Riau dengan kontrol akses berbasis peran
                        </p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                            Foto & Pengguna
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                            Kontak & Departemen
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                            Peran & Kategori
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <UserAvatar 
                                                        user={user}
                                                        size="lg"
                                                        showStatusIndicator={true}
                                                        showRoleIndicator={true}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold truncate text-lg">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                        {user.avatar && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <ImageIcon className="h-3 w-3 text-emerald-600" />
                                                                <span className="text-xs text-emerald-600 font-medium">Foto Profil</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    {user.phone && (
                                                        <div className="flex items-center text-sm">
                                                            <Phone className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                                                            <span className="truncate">{user.phone}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm">
                                                        <Building className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{user.department || 'Tidak ada departemen'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn("border", getRoleColor(user.role))}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {getRoleIcon(user.role)}
                                                            <span>{getRoleLabel(user.role)}</span>
                                                        </div>
                                                    </Badge>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn("border", getCategoryColor(user.category))}
                                                    >
                                                        {getCategoryLabel(user.category)}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <Switch
                                                        checked={user.is_active}
                                                        onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                                                        disabled={user.id === auth.user.id || (user.role === 'super-admin' && !isSuperAdmin)}
                                                        className="data-[state=checked]:bg-emerald-600"
                                                    />
                                                    <Badge 
                                                        variant={user.is_active ? "default" : "secondary"}
                                                        className={user.is_active ? 
                                                            "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200" : 
                                                            "bg-red-100 text-red-800 border-red-200"}
                                                    >
                                                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/users/${user.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {(isSuperAdmin || (isAdmin && user.role !== 'super-admin')) && user.id !== auth.user.id && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/users/${user.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/users/${user.id}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Lihat Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {(isSuperAdmin || (isAdmin && user.role !== 'super-admin')) && user.id !== auth.user.id && (
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/users/${user.id}/edit`}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit Pengguna
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty State */}
                {users.data.length === 0 && (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <div className="relative mb-6">
                                <ImageWithFallback 
                                    src="https://images.unsplash.com/photo-1752170080773-fed7758395c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBvZmZpY2UlMjB0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NTg1MDMwNzB8MA&ixlib=rb-4.1.0&q=80&w=400"
                                    alt="Professional team workspace"
                                    className="w-32 h-32 object-cover rounded-2xl mx-auto shadow-lg"
                                />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Tidak ada pengguna ditemukan
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {searchTerm || roleFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Coba ubah filter pencarian Anda untuk menemukan pengguna yang sesuai'
                                    : 'Belum ada pengguna yang ditambahkan ke sistem BPS Riau'
                                }
                            </p>
                            {isSuperAdmin && !searchTerm && roleFilter === 'all' && categoryFilter === 'all' && statusFilter === 'all' && (
                                <Button size="lg" asChild>
                                    <Link href="/users/create">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Tambah Pengguna Pertama
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Enhanced Pagination */}
                {users.data.length > 0 && users.last_page > 1 && (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan <span className="font-medium">{users.from}</span> sampai <span className="font-medium">{users.to}</span> dari <span className="font-medium">{users.total}</span> pengguna
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(users.current_page - 1)}
                                        disabled={users.current_page <= 1}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <div className="flex items-center gap-1 text-sm">
                                        <span>Halaman</span>
                                        <span className="font-medium">{users.current_page}</span>
                                        <span>dari</span>
                                        <span className="font-medium">{users.last_page}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(users.current_page + 1)}
                                        disabled={users.current_page >= users.last_page}
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