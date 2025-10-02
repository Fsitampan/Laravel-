import { useState, FormEvent, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
  Edit as EditIcon, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Crown, 
  Shield, 
  User,
  Mail,
  Phone,
  Building,
  Lock,
  UserCog,
  CheckCircle,
  AlertCircle,
  Settings,
  Camera
} from 'lucide-react';
import InputError from '@/components/InputError';
import { cn, getUserInitials } from '@/lib/utils';
import type { PageProps, User as UserType, UpdateUserData } from '@/types';

interface Role {
  value: string;
  label: string;
}

interface EditUserPageProps extends PageProps {
  user: UserType;
  roles: Role[];
}

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  category: string;
  department: string;
  phone: string;
  is_active: boolean;
  avatar: File | null;
  remove_avatar: boolean;
}

export default function Edit({ auth, user, roles }: EditUserPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, errors } =  useForm<Record<string, any>>({
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    role: user.role,
    category: user.category || 'employee',
    department: user.department || '',
    phone: user.phone || '',
    is_active: user.is_active,
    avatar: null,
    remove_avatar: false,
    _method: 'PUT',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
      post(`/users/${user.id}`, {
    forceFormData: true,
  });
};

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      setData('avatar', file);
      setData('remove_avatar', false);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeAvatar = () => {
    setData('avatar', null);
    setData('remove_avatar', true);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

  const canChangeRole = () => {
    // Tidak bisa mengubah role Super Admin lain atau diri sendiri
    if (user.id === auth.user.id) return false;
    if (user.role === 'super-admin') return false;
    return true;
  };

  const RoleIcon = getRoleIcon(user.role);

  // Determine which avatar to show
  const getCurrentAvatarSrc = () => {
    if (data.remove_avatar) return null;
    if (previewUrl) return previewUrl;
    return user.avatar;
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={`Edit Pengguna - ${user.name}`} />

      <div className="space-y-8">
        {/* Enhanced Header with Professional Imagery */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-secondary p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <EditIcon className="h-5 w-5" />
                  <span className="font-medium">Edit Pengguna</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                  Edit {user.name}
                </h1>
                <p className="text-lg text-white/90 max-w-2xl">
                  Perbarui informasi, foto profil, dan pengaturan akun pengguna sistem BPS Riau
                </p>
              </div>
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl">
                  {getCurrentAvatarSrc() ? (
                    <AvatarImage src={getCurrentAvatarSrc()!} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-white/20 to-white/10 text-white text-3xl font-bold backdrop-blur-sm">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
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
            <span className="font-medium text-foreground">Edit {user.name}</span>
          </div>
        </div>

        {/* Current User Info Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Informasi Pengguna Saat Ini
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Data yang tersimpan di sistem
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground text-xl font-bold">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-2xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                  <Badge 
                    variant={user.is_active ? "default" : "secondary"}
                    className={user.is_active ? 
                      "bg-emerald-100 text-emerald-800 border-emerald-200" : 
                      "bg-red-100 text-red-800 border-red-200"}
                  >
                    {user.is_active ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                  {user.id === auth.user.id && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Akun Anda
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Edit Foto Profil
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Perbarui atau hapus foto profil pengguna - kosongkan untuk menggunakan inisial
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <PhotoUpload
                currentPhoto={user.avatar}
                userName={data.name}
                onPhotoSelect={(file) => {
                  setData('avatar', file);
                  setData('remove_avatar', false);
                }}
                onPhotoRemove={() => {
                  setData('avatar', null);
                  setData('remove_avatar', true);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                previewUrl={previewUrl}
                size="xl"
                className="items-center"
              />
            </CardContent>
          </Card>

          {/* Personal Information Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Data dasar identitas pengguna
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={cn("h-11", errors.name && 'border-destructive focus-visible:ring-destructive')}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                  <InputError message={errors.name} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={cn("h-11", errors.email && 'border-destructive focus-visible:ring-destructive')}
                    placeholder="nama@bps.go.id"
                    required
                  />
                  <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Nomor Telepon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className={cn("h-11", errors.phone && 'border-destructive focus-visible:ring-destructive')}
                    placeholder="081234567890"
                  />
                  <InputError message={errors.phone} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Departemen *
                  </Label>
                  <Input
                    id="department"
                    type="text"
                    value={data.department}
                    onChange={(e) => setData('department', e.target.value)}
                    className={cn("h-11", errors.department && 'border-destructive focus-visible:ring-destructive')}
                    placeholder="Bagian/Seksi"
                    required
                  />
                  <InputError message={errors.department} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pengaturan Akun
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Konfigurasi peran dan hak akses pengguna
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Peran *</Label>
                  <Select 
                    value={data.role} 
                    onValueChange={(value) => setData('role', value)}
                    disabled={!canChangeRole()}
                  >
                    <SelectTrigger className={cn("h-11", errors.role && 'border-destructive')}>
                      <SelectValue placeholder="Pilih peran pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Pengguna</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <InputError message={errors.role} />
                  {!canChangeRole() && (
                    <p className="text-xs text-muted-foreground">
                      {user.id === auth.user.id 
                        ? "Tidak dapat mengubah role diri sendiri"
                        : "Tidak dapat mengubah role Super Admin lain"
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select 
                    value={data.category} 
                    onValueChange={(value) => setData('category', value)}
                  >
                    <SelectTrigger className={cn("h-11", errors.category && 'border-destructive')}>
                      <SelectValue placeholder="Pilih kategori pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Pegawai</SelectItem>
                      <SelectItem value="guest">Tamu</SelectItem>
                      <SelectItem value="intern">Magang</SelectItem>
                    </SelectContent>
                  </Select>
                  <InputError message={errors.category} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Status Aktif
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mengatur apakah pengguna dapat mengakses sistem
                    </p>
                  </div>
                  <Switch
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked)}
                    disabled={user.id === auth.user.id}
                  />
                </div>
                {user.id === auth.user.id && (
                  <p className="text-xs text-muted-foreground">
                    Tidak dapat menonaktifkan akun sendiri
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Keamanan Akun
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ubah password untuk keamanan yang lebih baik
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password Baru
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={cn("h-11 pr-10", errors.password && 'border-destructive focus-visible:ring-destructive')}
                      placeholder="Kosongkan jika tidak ingin mengubah"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <InputError message={errors.password} />
                  <p className="text-xs text-muted-foreground">
                    Minimal 8 karakter jika ingin mengubah password
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Konfirmasi Password Baru
                  </Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className={cn("h-11 pr-10", errors.password_confirmation && 'border-destructive focus-visible:ring-destructive')}
                      placeholder="Ulangi password baru"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <InputError message={errors.password_confirmation} />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">
                      Kebijakan Password BPS Riau
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Minimal 8 karakter</li>
                      <li>• Kombinasi huruf besar, huruf kecil, dan angka</li>
                      <li>• Hindari penggunaan informasi pribadi</li>
                      <li>• Kosongkan field password jika tidak ingin mengubah</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={processing}
                  className="sm:order-1" 
                  asChild
                >
                  <Link href="/users">
                    Batal
                  </Link>
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={processing}
                  size="lg"
                  className="sm:order-2 bg-gradient-to-r from-primary to-primary-dark"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}