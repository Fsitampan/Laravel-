import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Trash2 } from 'lucide-react';

export default function Edit({ auth, mustVerifyEmail, status }: PageProps<{ mustVerifyEmail: boolean, status?: string }>) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Profil" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Edit Profil</h1>
                    <p className="text-muted-foreground mt-1">
                        Kelola informasi profil dan pengaturan keamanan akun Anda
                    </p>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <User className="h-5 w-5" />
                                    Informasi Profil
                                </CardTitle>
                                <CardDescription>
                                    Perbarui informasi profil dan alamat email akun Anda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="password" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Lock className="h-5 w-5" />
                                    Ganti Password
                                </CardTitle>
                                <CardDescription>
                                    Pastikan akun Anda menggunakan password yang panjang dan acak agar tetap aman.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UpdatePasswordForm />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="delete" className="space-y-6 mt-6">
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-red-700">
                                    <Trash2 className="h-5 w-5" />
                                    Hapus Akun
                                </CardTitle>
                                <CardDescription className="text-red-600">
                                    Setelah akun Anda dihapus, semua sumber daya dan data akan dihapus secara permanen. 
                                    Sebelum menghapus akun, silakan unduh data atau informasi yang ingin Anda simpan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DeleteUserForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}