import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { Link, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { FormEventHandler, useState } from 'react';
import type { User } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PhotoUpload } from '@/components/PhotoUpload';
import {
  User as UserIcon,
  Camera,
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  mustVerifyEmail: boolean;
  status?: string;
  user: User;
  className?: string;
}

export default function UpdateProfileInformationForm({
  mustVerifyEmail,
  status,
  user,
  className = '',
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
    name: user.name || '',
    email: user.email || '',
    department: user.department || '',
    phone: user.phone || '',
    avatar: null as File | null,
    remove_avatar: false as boolean,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    patch(route('profile.update'), { forceFormData: true });
  };

  const handlePhotoSelect = (file: File | null) => {
    if (file) {
      setData('avatar', file);
      setData('remove_avatar', false);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePhotoRemove = () => {
    setData('avatar', null);
    setData('remove_avatar', true);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin':
        return Crown;
      case 'admin':
        return Shield;
      default:
        return UserIcon;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'role-super-admin';
      case 'admin':
        return 'role-admin';
      default:
        return 'role-user';
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

  const RoleIcon = getRoleIcon(user.role);
  const displayPhoto = previewUrl || user.avatar_url;

  return (
    <section className={className}>
      <form onSubmit={submit} className="space-y-8">
        {/* Profile Header */}
        <Card className="border-0 bg-muted/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Photo Upload */}
              <div className="flex-shrink-0">
                <PhotoUpload
                  currentPhoto={user.avatar_url}
                  userName={user.name}
                  onPhotoSelect={handlePhotoSelect}
                  onPhotoRemove={handlePhotoRemove}
                  previewUrl={previewUrl}
                  size="xl"
                  className="text-center"
                />
                <InputError message={errors.avatar} className="mt-2 text-center" />
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4 min-w-0">
                <h3 className="text-2xl font-bold">{user.name}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className={cn('border', getRoleColor(user.role))}>
                    <RoleIcon className="h-4 w-4 mr-2" />
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      user.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    )}
                  >
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  {displayPhoto && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Camera className="h-3 w-3 mr-1" />
                      Foto Profil
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.email}</p>
                      <p className="text-muted-foreground">Email BPS</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.department || 'Tidak ada'}</p>
                      <p className="text-muted-foreground">Departemen</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Informasi Personal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <InputLabel htmlFor="name" value="Nama Lengkap *" />
              <TextInput
                id="name"
                className="mt-1 block w-full h-11"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
                autoComplete="name"
              />
              <InputError className="mt-2" message={errors.name} />
            </div>

            <div className="space-y-2">
              <InputLabel htmlFor="email" value="Email BPS *" />
              <TextInput
                id="email"
                type="email"
                className="mt-1 block w-full h-11"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
                autoComplete="username"
              />
              <InputError className="mt-2" message={errors.email} />
            </div>

            <div className="space-y-2">
              <InputLabel htmlFor="department" value="Departemen/Unit Kerja" />
              <TextInput
                id="department"
                type="text"
                className="mt-1 block w-full h-11"
                value={data.department}
                onChange={(e) => setData('department', e.target.value)}
                autoComplete="organization"
              />
              <InputError className="mt-2" message={errors.department} />
            </div>

            <div className="space-y-2">
              <InputLabel htmlFor="phone" value="Nomor Telepon" />
              <TextInput
                id="phone"
                type="tel"
                className="mt-1 block w-full h-11"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                autoComplete="tel"
              />
              <InputError className="mt-2" message={errors.phone} />
            </div>
          </div>

          {/* Email Verification Notice */}
          {mustVerifyEmail && !user.email_verified_at && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-800">Email Belum Diverifikasi</p>
                  <p className="text-sm text-yellow-700">
                    Alamat email Anda belum diverifikasi.
                    <Link
                      href={route('verification.send')}
                      method="post"
                      as="button"
                      className="underline text-yellow-800 hover:text-yellow-900 font-medium ml-1"
                    >
                      Klik di sini untuk mengirim ulang email verifikasi.
                    </Link>
                  </p>
                  {status === 'verification-link-sent' && (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      Link verifikasi baru telah dikirim ke email Anda.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {user.email_verified_at && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Email Terverifikasi</p>
                  <p className="text-sm text-emerald-700">
                    Alamat email Anda telah diverifikasi dan dapat digunakan untuk notifikasi sistem.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 border-t">
          <div className="flex items-center gap-4">
            <PrimaryButton disabled={processing} className="h-11 px-6">
              {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </PrimaryButton>

            <Transition
              show={recentlySuccessful}
              enter="transition ease-in-out"
              enterFrom="opacity-0"
              leave="transition ease-in-out"
              leaveTo="opacity-0"
            >
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                Profil berhasil diperbarui!
              </div>
            </Transition>
          </div>

          <div className="text-sm text-muted-foreground">
            Terakhir diperbarui: {new Date(user.updated_at).toLocaleDateString('id-ID')}
          </div>
        </div>
      </form>
    </section>
  );
}
