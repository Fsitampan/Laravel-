import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Settings,
    User,
    Bell,
    Shield,
    Database,
    Palette,
    Globe,
    Clock,
    Save,
    RotateCcw,
    Lock,
    Key,
    Mail,
    Smartphone,
    Monitor,
    Download,
    Upload,
    Trash2,
    AlertTriangle,
    CheckCircle,
    Crown,
    Users,
    Building2,
    FileText,
    HardDrive,
    Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps, User as UserType, SystemSetting } from '@/types';

interface SettingsPageProps extends PageProps {
    settings?: {
        system: Record<string, any>;
        notifications: Record<string, any>;
        security: Record<string, any>;
    };
    system_info?: {
        version: string;
        database_size: string;
        storage_usage: string;
        cache_size: string;
    };
}

export default function SettingsIndex({ auth, settings = {}, system_info }: SettingsPageProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState<string | null>(null);

    // Profile Form
    const { data: profileData, setData: setProfileData, put: putProfile, processing: profileProcessing, errors: profileErrors } = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        phone: auth.user.phone || '',
        department: auth.user.department || '',
    });

    // Password Form
    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Notification Form
    const { data: notificationData, setData: setNotificationData, put: putNotifications, processing: notificationProcessing } = useForm({
        email_notifications: settings.notifications?.email_notifications ?? true,
        sms_notifications: settings.notifications?.sms_notifications ?? false,
        push_notifications: settings.notifications?.push_notifications ?? true,
        approval_notifications: settings.notifications?.approval_notifications ?? true,
        reminder_notifications: settings.notifications?.reminder_notifications ?? true,
        system_notifications: settings.notifications?.system_notifications ?? true,
    });

    // System Form (Admin/Super Admin only)
    const { data: systemData, setData: setSystemData, put: putSystem, processing: systemProcessing } = useForm({
        site_name: settings.system?.site_name ?? 'BPS Riau - Sistem Manajemen Ruangan',
        site_description: settings.system?.site_description ?? 'Sistem Manajemen Ruangan Badan Pusat Statistik Provinsi Riau',
        default_booking_duration: settings.system?.default_booking_duration ?? 120,
        max_booking_duration: settings.system?.max_booking_duration ?? 480,
        advance_booking_days: settings.system?.advance_booking_days ?? 30,
        auto_approve: settings.system?.auto_approve ?? false,
        maintenance_mode: settings.system?.maintenance_mode ?? false,
        timezone: settings.system?.timezone ?? 'Asia/Jakarta',
    });

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        putProfile('/Settings/Profile');
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword('/Settings/Profile', {
            onSuccess: () => resetPassword(),
        });
    };

    const handleNotificationUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        putNotifications('/Settings/notifications');
    };

    const handleSystemUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        putSystem('/Settings/System');
    };

    const canAccessSystemSettings = ['admin', 'super-admin'].includes(auth.user.role);
    const canAccessAdvancedSettings = auth.user.role === 'super-admin';

    const settingsTabs = [
        {
            id: 'profile',
            label: 'Profil',
            icon: User,
            available: true,
        },
        {
            id: 'notifications',
            label: 'Notifikasi',
            icon: Bell,
            available: true,
        },
        {
            id: 'appearance',
            label: 'Tampilan',
            icon: Palette,
            available: true,
        },
        {
            id: 'system',
            label: 'Sistem',
            icon: Settings,
            available: canAccessSystemSettings,
        },
        {
            id: 'security',
            label: 'Keamanan',
            icon: Shield,
            available: canAccessAdvancedSettings,
        },
        {
            id: 'database',
            label: 'Database',
            icon: Database,
            available: canAccessAdvancedSettings,
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pengaturan Sistem" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 flex items-center">
                            <Settings className="h-8 w-8 mr-3 text-blue-600" />
                            Pengaturan Sistem
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Kelola preferensi dan konfigurasi sistem Anda
                        </p>
                    </div>
                    <Badge variant="outline" className={cn(
                        "px-3 py-1",
                        auth.user.role === 'super-admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        auth.user.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                    )}>
                        {auth.user.role === 'super-admin' && <Crown className="h-3 w-3 mr-1" />}
                        {auth.user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {auth.user.role === 'pengguna' && <User className="h-3 w-3 mr-1" />}
                        {auth.user.role === 'super-admin' ? 'Super Administrator' :
                         auth.user.role === 'admin' ? 'Administrator' : 'Pengguna'}
                    </Badge>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                        {settingsTabs.filter(tab => tab.available).map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
                                <tab.icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Profile Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Profil</CardTitle>
                                    <CardDescription>
                                        Perbarui informasi profil dan data kontak Anda
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nama Lengkap</Label>
                                            <Input
                                                id="name"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData('name', e.target.value)}
                                                placeholder="Nama lengkap Anda"
                                            />
                                            {profileErrors.name && (
                                                <p className="text-sm text-red-600">{profileErrors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData('email', e.target.value)}
                                                placeholder="email@bps.go.id"
                                            />
                                            {profileErrors.email && (
                                                <p className="text-sm text-red-600">{profileErrors.email}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Nomor Telepon</Label>
                                            <Input
                                                id="phone"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData('phone', e.target.value)}
                                                placeholder="08XX-XXXX-XXXX"
                                            />
                                            {profileErrors.phone && (
                                                <p className="text-sm text-red-600">{profileErrors.phone}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="department">Departemen/Unit</Label>
                                            <Input
                                                id="department"
                                                value={profileData.department}
                                                onChange={(e) => setProfileData('department', e.target.value)}
                                                placeholder="Nama departemen atau unit kerja"
                                            />
                                        </div>

                                        <Button type="submit" disabled={profileProcessing}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {profileProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Change Password */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ubah Password</CardTitle>
                                    <CardDescription>
                                        Pastikan akun Anda menggunakan password yang panjang dan acak untuk tetap aman
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">Password Saat Ini</Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                placeholder="Password saat ini"
                                            />
                                            {passwordErrors.current_password && (
                                                <p className="text-sm text-red-600">{passwordErrors.current_password}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password Baru</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                placeholder="Password baru"
                                            />
                                            {passwordErrors.password && (
                                                <p className="text-sm text-red-600">{passwordErrors.password}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                placeholder="Konfirmasi password baru"
                                            />
                                            {passwordErrors.password_confirmation && (
                                                <p className="text-sm text-red-600">{passwordErrors.password_confirmation}</p>
                                            )}
                                        </div>

                                        <Button type="submit" disabled={passwordProcessing}>
                                            <Key className="h-4 w-4 mr-2" />
                                            {passwordProcessing ? 'Mengubah...' : 'Ubah Password'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferensi Notifikasi</CardTitle>
                                <CardDescription>
                                    Atur jenis notifikasi yang ingin Anda terima
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleNotificationUpdate} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4 text-gray-600" />
                                                    <Label className="font-medium">Email Notifications</Label>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Terima notifikasi melalui email
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationData.email_notifications}
                                                onCheckedChange={(checked) => setNotificationData('email_notifications', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <Smartphone className="h-4 w-4 text-gray-600" />
                                                    <Label className="font-medium">SMS Notifications</Label>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Terima notifikasi melalui SMS
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationData.sms_notifications}
                                                onCheckedChange={(checked) => setNotificationData('sms_notifications', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <Monitor className="h-4 w-4 text-gray-600" />
                                                    <Label className="font-medium">Push Notifications</Label>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Terima notifikasi browser/aplikasi
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationData.push_notifications}
                                                onCheckedChange={(checked) => setNotificationData('push_notifications', checked)}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-gray-600" />
                                                    <Label className="font-medium">Persetujuan Peminjaman</Label>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Notifikasi status persetujuan peminjaman
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationData.approval_notifications}
                                                onCheckedChange={(checked) => setNotificationData('approval_notifications', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-gray-600" />
                                                    <Label className="font-medium">Pengingat Peminjaman</Label>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Pengingat sebelum waktu peminjaman
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationData.reminder_notifications}
                                                onCheckedChange={(checked) => setNotificationData('reminder_notifications', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <Bell className="h-4 w-4 text-gray-600" />
                                                    <Label className="font-medium">Notifikasi Sistem</Label>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Notifikasi pemeliharaan dan update sistem
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationData.system_notifications}
                                                onCheckedChange={(checked) => setNotificationData('system_notifications', checked)}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={notificationProcessing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {notificationProcessing ? 'Menyimpan...' : 'Simpan Preferensi'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tema & Tampilan</CardTitle>
                                    <CardDescription>
                                        Sesuaikan tampilan sistem sesuai preferensi Anda
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Tema</Label>
                                        <Select defaultValue="system">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">Terang</SelectItem>
                                                <SelectItem value="dark">Gelap</SelectItem>
                                                <SelectItem value="system">Mengikuti Sistem</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bahasa</Label>
                                        <Select defaultValue="id">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Zona Waktu</Label>
                                        <Select defaultValue="Asia/Jakarta">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Asia/Jakarta">WIB (Jakarta)</SelectItem>
                                                <SelectItem value="Asia/Makassar">WITA (Makassar)</SelectItem>
                                                <SelectItem value="Asia/Jayapura">WIT (Jayapura)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan Pengaturan
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Layout & Navigation</CardTitle>
                                    <CardDescription>
                                        Pengaturan tata letak dan navigasi
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label className="font-medium">Sidebar Collapsed</Label>
                                            <p className="text-sm text-gray-600">
                                                Mulai dengan sidebar yang diciutkan
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label className="font-medium">Animasi</Label>
                                            <p className="text-sm text-gray-600">
                                                Aktifkan animasi transisi
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label className="font-medium">Compact Mode</Label>
                                            <p className="text-sm text-gray-600">
                                                Tampilan lebih padat untuk layar kecil
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* System Tab - Admin/Super Admin only */}
                    {canAccessSystemSettings && (
                        <TabsContent value="system" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Konfigurasi Sistem</CardTitle>
                                    <CardDescription>
                                        Pengaturan dasar sistem manajemen ruangan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSystemUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="site_name">Nama Sistem</Label>
                                                <Input
                                                    id="site_name"
                                                    value={systemData.site_name}
                                                    onChange={(e) => setSystemData('site_name', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="timezone">Zona Waktu</Label>
                                                <Select 
                                                    value={systemData.timezone}
                                                    onValueChange={(value) => setSystemData('timezone', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                                                        <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                                                        <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="default_booking_duration">Durasi Default (menit)</Label>
                                                <Input
                                                    id="default_booking_duration"
                                                    type="number"
                                                    min="30"
                                                    max="480"
                                                    value={systemData.default_booking_duration}
                                                    onChange={(e) => setSystemData('default_booking_duration', parseInt(e.target.value))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="max_booking_duration">Durasi Maksimal (menit)</Label>
                                                <Input
                                                    id="max_booking_duration"
                                                    type="number"
                                                    min="60"
                                                    max="1440"
                                                    value={systemData.max_booking_duration}
                                                    onChange={(e) => setSystemData('max_booking_duration', parseInt(e.target.value))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="advance_booking_days">Pemesanan Maksimal (hari)</Label>
                                                <Input
                                                    id="advance_booking_days"
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={systemData.advance_booking_days}
                                                    onChange={(e) => setSystemData('advance_booking_days', parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="site_description">Deskripsi Sistem</Label>
                                            <Textarea
                                                id="site_description"
                                                value={systemData.site_description}
                                                onChange={(e) => setSystemData('site_description', e.target.value)}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <Label className="font-medium">Persetujuan Otomatis</Label>
                                                    <p className="text-sm text-gray-600">
                                                        Setujui peminjaman secara otomatis tanpa review admin
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={systemData.auto_approve}
                                                    onCheckedChange={(checked) => setSystemData('auto_approve', checked)}
                                                />
                                            </div>

                                            {canAccessAdvancedSettings && (
                                                <div className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
                                                    <div>
                                                        <Label className="font-medium text-orange-900">Mode Maintenance</Label>
                                                        <p className="text-sm text-orange-700">
                                                            Nonaktifkan akses sistem untuk pemeliharaan
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={systemData.maintenance_mode}
                                                        onCheckedChange={(checked) => setSystemData('maintenance_mode', checked)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <Button type="submit" disabled={systemProcessing}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {systemProcessing ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Security Tab - Super Admin only */}
                    {canAccessAdvancedSettings && (
                        <TabsContent value="security" className="space-y-6">
                            <Card className="border-red-200">
                                <CardHeader>
                                    <CardTitle className="text-red-900">Pengaturan Keamanan</CardTitle>
                                    <CardDescription className="text-red-700">
                                        Konfigurasi keamanan sistem - hanya untuk Super Administrator
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <Shield className="h-4 w-4" />
                                        <AlertDescription>
                                            Perubahan pengaturan keamanan dapat mempengaruhi seluruh sistem. Pastikan Anda memahami dampak dari setiap perubahan.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <Label className="font-medium">Two-Factor Authentication</Label>
                                                <p className="text-sm text-gray-600">
                                                    Wajibkan 2FA untuk semua pengguna admin
                                                </p>
                                            </div>
                                            <Switch />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <Label className="font-medium">Session Timeout</Label>
                                                <p className="text-sm text-gray-600">
                                                    Auto logout setelah tidak aktif (menit)
                                                </p>
                                            </div>
                                            <Select defaultValue="60">
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="30">30 menit</SelectItem>
                                                    <SelectItem value="60">60 menit</SelectItem>
                                                    <SelectItem value="120">2 jam</SelectItem>
                                                    <SelectItem value="480">8 jam</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <Label className="font-medium">Password Policy</Label>
                                                <p className="text-sm text-gray-600">
                                                    Minimum 8 karakter, huruf besar, kecil, angka
                                                </p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                    </div>

                                    <Button variant="destructive">
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan Pengaturan Keamanan
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Database Tab - Super Admin only */}
                    {canAccessAdvancedSettings && (
                        <TabsContent value="database" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informasi Database</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {system_info && (
                                            <>
                                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                    <span className="font-medium text-blue-900">Versi Sistem</span>
                                                    <span className="text-blue-700">{system_info.version}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                                    <span className="font-medium text-emerald-900">Ukuran Database</span>
                                                    <span className="text-emerald-700">{system_info.database_size}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                                    <span className="font-medium text-orange-900">Storage Usage</span>
                                                    <span className="text-orange-700">{system_info.storage_usage}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                                    <span className="font-medium text-purple-900">Cache Size</span>
                                                    <span className="text-purple-700">{system_info.cache_size}</span>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-orange-200">
                                    <CardHeader>
                                        <CardTitle className="text-orange-900">Backup & Restore</CardTitle>
                                        <CardDescription className="text-orange-700">
                                            Kelola backup database sistem
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button className="w-full">
                                            <Download className="h-4 w-4 mr-2" />
                                            Buat Backup Sekarang
                                        </Button>
                                        
                                        <Button variant="outline" className="w-full">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Restore dari Backup
                                        </Button>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label>Backup Otomatis</Label>
                                            <Select defaultValue="daily">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="disabled">Nonaktif</SelectItem>
                                                    <SelectItem value="daily">Harian</SelectItem>
                                                    <SelectItem value="weekly">Mingguan</SelectItem>
                                                    <SelectItem value="monthly">Bulanan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                Backup berisi data sensitif. Pastikan file backup disimpan dengan aman.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="text-red-900">Zona Bahaya</CardTitle>
                                    <CardDescription className="text-red-700">
                                        Tindakan yang tidak dapat dibatalkan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Hapus Semua Data Log
                                        </Button>
                                        
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Reset Sistem ke Default
                                        </Button>
                                    </div>

                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            Tindakan di zona bahaya akan menghapus data secara permanen dan tidak dapat dibatalkan.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}