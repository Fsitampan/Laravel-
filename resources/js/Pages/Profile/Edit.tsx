import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
    User, 
    Lock, 
    Trash2, 
    Download, 
    Edit,
    Shield,
    Crown,
    Activity,
    Settings,
    Camera
} from 'lucide-react';

export default function EditProfile({ auth, mustVerifyEmail, status }: PageProps<{ mustVerifyEmail: boolean, status?: string }>) {
    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super-admin':
                return Crown;
            case 'admin':
                return Shield;
            default:
                return User;
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

    const RoleIcon = getRoleIcon(auth.user.role);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Profil" />

            <div className="space-y-8">
                {/* Enhanced Header with Professional Imagery */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-secondary p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                                    <User className="h-5 w-5" />
                                    <span className="font-medium">Edit Profil</span>
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                                    Edit Profil Saya
                                </h1>
                                <p className="text-lg text-white/90 max-w-2xl">
                                    Perbarui informasi profil, foto, dan pengaturan keamanan akun BPS Riau Anda
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"></div>
                    <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5"></div>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-12">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Informasi Profil
                        </TabsTrigger>
                        <TabsTrigger value="password" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Ganti Password
                        </TabsTrigger>
                        <TabsTrigger value="delete" className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Hapus Akun
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6 mt-6">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="flex items-center gap-3">
                                    <Camera className="h-5 w-5" />
                                    Informasi Profil & Foto
                                </CardTitle>
                                <CardDescription>
                                    Perbarui informasi profil, foto, dan alamat email akun Anda di sistem BPS Riau.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    user={auth.user}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="password" className="space-y-6 mt-6">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="flex items-center gap-3">
                                    <Lock className="h-5 w-5" />
                                    Ganti Password
                                </CardTitle>
                                <CardDescription>
                                    Pastikan akun BPS Riau Anda menggunakan password yang kuat, panjang dan acak agar tetap aman dari ancaman keamanan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <UpdatePasswordForm />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="delete" className="space-y-6 mt-6">
                        <Card className="border-destructive/20 bg-destructive/5 shadow-lg">
                            <CardHeader className="border-b border-destructive/20 bg-destructive/10">
                                <CardTitle className="flex items-center gap-3 text-destructive">
                                    <Trash2 className="h-5 w-5" />
                                    Hapus Akun Permanen
                                </CardTitle>
                                <CardDescription className="text-destructive/80">
                                    <strong>Peringatan:</strong> Setelah akun BPS Riau Anda dihapus, semua sumber daya, data, dan riwayat aktivitas akan dihapus secara permanen. 
                                    Sebelum menghapus akun, silakan unduh data atau informasi yang ingin Anda simpan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <DeleteUserForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}