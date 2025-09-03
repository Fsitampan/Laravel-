import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { BPSLogo } from '@/components/BPSLogo';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    // Sample accounts for demo
    const sampleAccounts = [
        {
            role: 'Super Admin',
            email: 'superadmin@bps.go.id',
            password: 'password',
            description: 'Akses penuh ke sistem',
            color: 'bg-purple-100 text-purple-800 border-purple-200'
        },
        {
            role: 'Administrator',
            email: 'admin.kepala@bps.go.id',
            password: 'password',
            description: 'Mengelola ruangan dan persetujuan',
            color: 'bg-blue-100 text-blue-800 border-blue-200'
        },
        {
            role: 'Pengguna',
            email: 'andi.pratama@bps.go.id',
            password: 'password',
            description: 'Peminjaman ruangan',
            color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        }
    ];

    const fillSampleAccount = (email: string, password: string) => {
        setData({
            ...data,
            email,
            password
        });
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo Header */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center space-x-4 p-6 bg-white rounded-2xl shadow-sm border">
                                <BPSLogo size="xl" />
                                <div className="text-left">
                                    <h1 className="text-2xl font-bold text-gray-900">BPS Riau</h1>
                                    <p className="text-sm text-gray-600">Sistem Manajemen Ruangan</p>
                                </div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                            Selamat Datang
                        </h2>
                        <p className="text-gray-600">
                            Masuk ke akun Anda untuk menggunakan sistem
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <Alert className="border-green-200 bg-green-50">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {status}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-xl text-center text-gray-900">
                                Login ke Sistem
                            </CardTitle>
                            <CardDescription className="text-center text-gray-600">
                                Masukkan email dan password Anda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className={cn(
                                                "pl-10 focus-ring",
                                                errors.email && "border-red-300 focus:border-red-500"
                                            )}
                                            autoComplete="username"
                                            placeholder="nama@bps.go.id"
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            className={cn(
                                                "pl-10 pr-10 focus-ring",
                                                errors.password && "border-red-300 focus:border-red-500"
                                            )}
                                            autoComplete="current-password"
                                            placeholder="Masukkan password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', !!checked)}
                                        />
                                        <Label htmlFor="remember" className="text-sm text-gray-700">
                                            Ingat saya
                                        </Label>
                                    </div>
                                    
                                    {canResetPassword && (
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 smooth-transition"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Memproses...</span>
                                        </div>
                                    ) : (
                                        'Masuk ke Sistem'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Sample Accounts */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-blue-900 text-center">
                                Akun Demo
                            </CardTitle>
                            <CardDescription className="text-blue-700 text-center">
                                Klik untuk mengisi otomatis (untuk testing)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {sampleAccounts.map((account, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => fillSampleAccount(account.email, account.password)}
                                    className="w-full p-3 text-left rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-300 hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className={cn("px-2 py-1 rounded text-xs font-medium border", account.color)}>
                                                    {account.role}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-blue-900">
                                                {account.email}
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                {account.description}
                                            </p>
                                        </div>
                                        <div className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">
                                            Klik untuk isi
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-500">
                        <p>
                            © 2024 Badan Pusat Statistik Provinsi Riau
                        </p>
                        <p className="mt-1">
                            Sistem Manajemen Ruangan - Versi 1.0
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}