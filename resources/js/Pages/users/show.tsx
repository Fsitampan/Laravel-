import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/PhotoUpload';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Crown, 
  Shield, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  FileText,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  UserCheck,
  BarChart3,
  Download,
  AlertCircle,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
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
import { cn, formatDateTime, getUserInitials } from '@/lib/utils';
import type { PageProps, User as UserType } from '@/types';

interface Borrowing {
  id: number;
  room: {
    id: number;
    name: string;
    code: string;
  };
  start_date: string;
  end_date: string;
  status: string;
  purpose: string;
  created_at: string;
}

interface Statistics {
  total_borrowings: number;
  active_borrowings: number;
  completed_borrowings: number;
  approved_count: number;
}

interface UserShowPageProps extends PageProps {
  user: UserType;
  statistics: Statistics;
  recentBorrowings: Borrowing[];
}

export default function Show({ auth, user, statistics, recentBorrowings }: UserShowPageProps) {
  const deleteUser = () => {
    router.delete(`/users/${user.id}`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin': return Crown;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin': return 'role-super-admin';
      case 'admin': return 'role-admin';
      default: return 'role-user';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super-admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      default: return 'Pengguna';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'employee': return 'category-employee';
      case 'guest': return 'category-guest';
      case 'intern': return 'category-intern';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'employee': return 'Pegawai';
      case 'guest': return 'Tamu';
      case 'intern': return 'Magang';
      default: return 'Tidak Diketahui';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-occupied';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'status-available';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending': return 'Menunggu';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const canEditUser = () => {
    // Super Admin dapat edit semua kecuali Super Admin lain (tapi bisa edit diri sendiri)
    if (user.role === 'super-admin' && user.id !== auth.user.id) {
      return false;
    }
    return true;
  };

  const canDeleteUser = () => {
    // Tidak bisa hapus diri sendiri atau Super Admin lain
    if (user.id === auth.user.id) return false;
    if (user.role === 'super-admin') return false;
    return true;
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={`Detail Pengguna - ${user.name}`} />

      <div className="space-y-8">
        {/* Enhanced Header with Professional Imagery */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-secondary p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Detail Pengguna</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                  {user.name}
                </h1>
                <p className="text-lg text-white/90 max-w-2xl">
                  Informasi lengkap dan riwayat aktivitas pengguna sistem BPS Riau
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {canEditUser() && (
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
                    <Link href={`/users/${user.id}/edit`}>
                      <Edit className="h-5 w-5 mr-2" />
                      Edit Pengguna
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

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            <span>Pengguna</span> 
            <span className="mx-2">•</span> 
            <span className="font-medium text-foreground">{user.name}</span>
          </div>
        </div>

        {/* Enhanced User Profile Card with Photo */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-shrink-0 text-center lg:text-left">
                <div className="space-y-4">
                  <UserAvatar 
                    user={user}
                    size="xl"
                    showStatusIndicator={true}
                    showRoleIndicator={true}
                    className="mx-auto lg:mx-0"
                  />
                  
                  {/* Photo and role status */}
                  <div className="space-y-2 text-center lg:text-left">
                    <Badge 
                      variant="outline" 
                      className={cn("border", getRoleColor(user.role))}
                    >
                      <RoleIcon className="h-4 w-4 mr-2" />
                      {getRoleLabel(user.role)}
                    </Badge>
                    {user.category && (
                      <Badge 
                        variant="outline" 
                        className={cn("border", getCategoryColor(user.category))}
                      >
                        {getCategoryLabel(user.category)}
                      </Badge>
                    )}
                    {user.avatar && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Camera className="h-3 w-3 mr-1" />
                        Foto Profil
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">{user.name}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge 
                      variant={user.is_active ? "default" : "secondary"}
                      className={user.is_active ? 
                        "bg-emerald-100 text-emerald-800 border-emerald-200" : 
                        "bg-red-100 text-red-800 border-red-200"}
                    >
                      {user.is_active ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                    {user.email_verified_at && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Email Terverifikasi
                      </Badge>
                    )}
                    {user.id === auth.user.id && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Akun Anda
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Informasi Kontak
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        {user.phone && (
                          <div>
                            <span className="text-muted-foreground">Telepon:</span>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Informasi Pekerjaan
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Departemen:</span>
                          <p className="font-medium">{user.department || 'Tidak ada'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Peminjaman:</span>
                          <p className="font-medium">{statistics.total_borrowings} kali</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Informasi Akun
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Terdaftar:</span>
                        <p className="font-medium">{formatDateTime(user.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Diperbarui:</span>
                        <p className="font-medium">{formatDateTime(user.updated_at)}</p>
                      </div>
                      {user.email_verified_at && (
                        <div>
                          <span className="text-muted-foreground">Email Diverifikasi:</span>
                          <p className="font-medium">{formatDateTime(user.email_verified_at)}</p>
                        </div>
                      )}
                      {user.last_login_at && (
                        <div>
                          <span className="text-muted-foreground">Login Terakhir:</span>
                          <p className="font-medium">{formatDateTime(user.last_login_at)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end mt-8 pt-6 border-t">
              {canEditUser() && (
                <Button variant="outline" asChild>
                  <Link href={`/users/${user.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Pengguna
                  </Link>
                </Button>
              )}
              
              {canDeleteUser() && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus Pengguna
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Hapus Pengguna</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus pengguna <strong>{user.name}</strong>? 
                        Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait termasuk foto profil.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteUser} className="bg-destructive hover:bg-destructive/90">
                        Hapus Pengguna
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Statistics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Peminjaman
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-blue-800">
                    {statistics.total_borrowings}
                  </p>
                  <div className="flex items-center mt-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600 ml-1">
                      Semua waktu
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <Activity className="h-8 w-8" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100/50"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Sedang Berlangsung
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-yellow-800">
                    {statistics.active_borrowings}
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600 ml-1">
                      Aktif sekarang
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg">
                    <Clock className="h-8 w-8" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
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
                    Selesai
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-emerald-800">
                    {statistics.completed_borrowings}
                  </p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-600 ml-1">
                      Berhasil
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
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
                    Tingkat Persetujuan
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-purple-800">
                    {statistics.total_borrowings > 0 ? 
                      Math.round((statistics.approved_count / statistics.total_borrowings) * 100) : 0}%
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600 ml-1">
                      Disetujui
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Borrowings */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Riwayat Peminjaman Terbaru
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              10 peminjaman terakhir dari pengguna ini
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {recentBorrowings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-medium">Ruangan</TableHead>
                      <TableHead className="font-medium">Periode</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Keperluan</TableHead>
                      <TableHead className="font-medium">Dibuat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBorrowings.map((borrowing) => (
                      <TableRow key={borrowing.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="font-medium">
                            <p className="font-semibold">{borrowing.room.name}</p>
                            <p className="text-sm text-muted-foreground">{borrowing.room.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">
                              {new Date(borrowing.start_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-muted-foreground">
                              sampai {new Date(borrowing.end_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn("border", getStatusColor(borrowing.status))}
                          >
                            {getStatusLabel(borrowing.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="max-w-xs truncate font-medium" title={borrowing.purpose}>
                            {borrowing.purpose}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(borrowing.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="relative mb-6">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc1ODQ1Mjc5Nnww&ixlib=rb-4.1.0&q=80&w=300"
                    alt="Modern office workspace"
                    className="w-24 h-24 object-cover rounded-xl mx-auto shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Belum Ada Riwayat Peminjaman
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Pengguna ini belum pernah melakukan peminjaman ruangan di sistem BPS Riau.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}