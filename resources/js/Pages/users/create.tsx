import { useState, FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import InputError from '@/components/InputError';
import type { CreateUserData, FormDataType } from '@/types';

interface Role {
  value: string;
  label: string;
}

interface PageProps {
  roles: Role[];
}

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  department: string;
  phone: string;
  address: string;
  bio: string;
}

export default function Create({ roles }: PageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'pengguna',
    department: '',
    phone: '',
    address: '',
    bio: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    post(route('users.store'), {
      onSuccess: () => {
        reset();
      },
    });
  };

  const setSelectedRole = (value: string) => {
    setData('role', value);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link href={route('users.Index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h2 className="text-primary mb-1">Tambah Pengguna Baru</h2>
            <p className="text-muted-foreground">
              Buat akun pengguna baru untuk sistem BPS Riau
            </p>
          </div>
        </div>
      }
    >
      <Head title="Tambah Pengguna" />

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Informasi Pengguna Baru
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b pb-2">
                Informasi Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={errors.name ? 'border-destructive' : ''}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                  <InputError message={errors.name} />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                    placeholder="nama@bps.go.id"
                    required
                  />
                  <InputError message={errors.email} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={errors.password ? 'border-destructive' : ''}
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

                <div>
                  <Label htmlFor="password_confirmation">Konfirmasi Password *</Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className={errors.password_confirmation ? 'border-destructive' : ''}
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
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b pb-2">
                Informasi Pekerjaan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={data.role} onValueChange={setSelectedRole}>
                    <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Pilih role pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.role} />
                </div>

                <div>
                  <Label htmlFor="department">Departemen *</Label>
                  <Input
                    id="department"
                    type="text"
                    value={data.department}
                    onChange={(e) => setData('department', e.target.value)}
                    className={errors.department ? 'border-destructive' : ''}
                    placeholder="Nama departemen"
                    required
                  />
                  <InputError message={errors.department} />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Nomor Telepon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData('phone', e.target.value)}
                  className={errors.phone ? 'border-destructive' : ''}
                  placeholder="08xx-xxxx-xxxx"
                  required
                />
                <InputError message={errors.phone} />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b pb-2">
                Informasi Tambahan
              </h3>
              
              <div>
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  className={errors.address ? 'border-destructive' : ''}
                  placeholder="Alamat lengkap..."
                  rows={3}
                />
                <InputError message={errors.address} />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={data.bio}
                  onChange={(e) => setData('bio', e.target.value)}
                  className={errors.bio ? 'border-destructive' : ''}
                  placeholder="Deskripsi singkat tentang pengguna..."
                  rows={3}
                />
                <InputError message={errors.bio} />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-primary to-primary-dark"
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Menyimpan...
                  </div>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Buat Pengguna
                  </>
                )}
              </Button>
              
              <Link href={route('users.Index')}>
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={processing}
                  className="min-w-24"
                >
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
}