import { useState, FormEvent, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PhotoUpload } from '../../components/PhotoUpload';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
    UserPlus, 
    ArrowLeft, 
    Eye, 
    EyeOff, 
    User, 
    Mail, 
    Phone, 
    Building,
    Lock,
    Shield,
    CheckCircle,
    AlertCircle,
    Camera
} from 'lucide-react';
import InputError from '@/components/InputError';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

interface Role {
  value: string;
  label: string;
}

interface CreateUserPageProps extends PageProps {
  roles: Role[];
}

export default function Create({ auth, roles }: CreateUserPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Fix: Proper type for useForm
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'pengguna', // ✅ Fix: Changed from 'user' to 'pengguna'
    category: 'employee',
    department: '',
    phone: '',
    is_active: true as boolean,
    avatar: null as File | null,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // ✅ Fix: Proper route name
    post(route('users.store'), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (errors) => {
        console.error('Form errors:', errors);
      }
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
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeAvatar = () => {
    setData('avatar', null);
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

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Tambah Pengguna" />

      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-secondary p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <UserPlus className="h-5 w-5" />
                  <span className="font-medium">Manajemen Pengguna</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                  Tambah Pengguna Baru
                </h1>
                <p className="text-lg text-white/90 max-w-2xl">
                  Daftarkan pengguna baru ke sistem BPS Riau dengan informasi lengkap dan foto profil
                </p>
              </div>
              <div className="relative">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1522206038088-8698bcefa6a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlb3BsZSUyMHdvcmtpbmd8ZW58MXx8fHwxNzU4NTAzMDc2fDA&ixlib=rb-4.1.0&q=80&w=300"
                  alt="Professional business team"
                  className="w-32 h-32 object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"></div>
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('users.Index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            <span>Pengguna</span> 
            <span className="mx-2">•</span> 
            <span className="font-medium text-foreground">Tambah Baru</span>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto Profil Pengguna
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload foto profil pengguna (opsional) - akan menggunakan inisial jika kosong
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <PhotoUpload
                userName={data.name}
                onPhotoSelect={(file) => setData('avatar', file)}
                onPhotoRemove={removeAvatar}
                previewUrl={previewUrl}
                size="xl"
                className="items-center"
              />
              {errors.avatar && (
                <InputError message={errors.avatar} className="mt-2" />
              )}
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
                <Shield className="h-5 w-5" />
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
                  <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                    <SelectTrigger className={cn("h-11", errors.role && 'border-destructive')}>
                      <SelectValue placeholder="Pilih peran pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pengguna">Pengguna</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <InputError message={errors.role} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={data.category} onValueChange={(value) => setData('category', value)}>
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
                      Aktifkan akun pengguna setelah dibuat
                    </p>
                  </div>
                  <Switch
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked)}
                  />
                </div>
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
                Atur password untuk akses sistem
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={cn("h-11 pr-10", errors.password && 'border-destructive focus-visible:ring-destructive')}
                      placeholder="Minimal 8 karakter"
                      required
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Konfirmasi Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className={cn("h-11 pr-10", errors.password_confirmation && 'border-destructive focus-visible:ring-destructive')}
                      placeholder="Ulangi password"
                      required
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
                      <li>• Password akan dikirim ke email pengguna</li>
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
                  <Link href={route('users.Index')}>
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
                      <UserPlus className="h-5 w-5 mr-2" />
                      Buat Pengguna
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