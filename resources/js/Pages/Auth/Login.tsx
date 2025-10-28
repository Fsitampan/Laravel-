import { useEffect, FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Lock, Mail, ArrowRight, Shield, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: Shield
        },
        {
            role: 'Administrator',
            email: 'admin.kepala@bps.go.id',
            password: 'password',
            description: 'Mengelola ruangan dan persetujuan',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: Building2
        },
        {
            role: 'Pengguna',
            email: 'andi.pratama@bps.go.id',
            password: 'password',
            description: 'Peminjaman ruangan',
            color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            icon: Users
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

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                <div className="container mx-auto px-4 py-8 lg:py-12">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)]">
                        {/* Left Side - Branding & Info */}
                        <div className="hidden lg:flex flex-col justify-center space-y-8">
                            {/* Logo & Title */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="h-20 w-20 rounded-2xl bg-white shadow-lg p-3 flex items-center justify-center">
                                        <img 
                                            src="/bpslogo.png" 
                                            alt="BPS Logo" 
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-gray-900">BPS Riau</h1>
                                        <p className="text-lg text-gray-600">SIPERU</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Selamat Datang di Sistem Peminjaman Ruangan
                                    </h2>
                                    <p className="text-lg text-gray-600">
                                        Solusi terpadu untuk mengelola peminjaman ruangan BPS Provinsi Riau dengan efisien dan profesional.
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Kelola Ruangan</h3>
                                    <p className="text-sm text-gray-600">Manajemen ruangan dengan status real-time</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                                        <Users className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Akses Berbasis Role</h3>
                                    <p className="text-sm text-gray-600">Sistem keamanan berlapis dan terstruktur</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Login Form */}
                        <div className="w-full max-w-xl mx-auto lg:mx-0 space-y-6">
                            {/* Mobile Logo */}
                            <div className="lg:hidden text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm border">
                                        <img 
                                            src="/bpslogo.png" 
                                            alt="BPS Logo" 
                                            className="h-12 w-auto object-contain"
                                        />
                                        <div className="text-left">
                                            <h1 className="text-xl font-bold text-gray-900">BPS Riau</h1>
                                            <p className="text-xs text-gray-600">Sistem Manajemen</p>
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Selamat Datang
                                </h2>
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

                            {/* Login Form Card */}
                            <Card className="shadow-xl border-0">
                                <CardHeader className="space-y-2 pb-6">
                                    <CardTitle className="text-2xl font-bold text-gray-900">
                                        Login ke Sistem
                                    </CardTitle>
                                    <CardDescription className="text-base text-gray-600">
                                        Masukkan kredensial Anda untuk mengakses dashboard
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submit} className="space-y-5">
                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={data.email}
                                                    className={cn(
                                                        "pl-11 h-12 text-base",
                                                        errors.email && "border-red-300 focus:border-red-500"
                                                    )}
                                                    autoComplete="username"
                                                    placeholder="nama@bps.go.id"
                                                    onChange={(e) => setData('email', e.target.value)}
                                                />
                                                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={data.password}
                                                    className={cn(
                                                        "pl-11 pr-11 h-12 text-base",
                                                        errors.password && "border-red-300 focus:border-red-500"
                                                    )}
                                                    autoComplete="current-password"
                                                    placeholder="Masukkan password"
                                                    onChange={(e) => setData('password', e.target.value)}
                                                />
                                                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Remember Me & Forgot Password */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="remember"
                                                    checked={data.remember}
                                                    onCheckedChange={(checked) => setData('remember', !!checked)}
                                                />
                                                <Label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                    Ingat saya
                                                </Label>
                                            </div>
                                            
                                            {canResetPassword && (
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition"
                                                >
                                                    Lupa password?
                                                </Link>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    <span>Memproses...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>Masuk ke Dashboard</span>
                                                    <ArrowRight className="h-5 w-5" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Sample Accounts - Demo */}
                            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-blue-900 flex items-center justify-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Akun Demo untuk Testing
                                    </CardTitle>
                                    <CardDescription className="text-blue-700 text-center">
                                        Klik salah satu akun untuk mengisi form secara otomatis
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {sampleAccounts.map((account, index) => {
                                        const IconComponent = account.icon;
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => fillSampleAccount(account.email, account.password)}
                                                className="w-full p-4 text-left rounded-xl border-2 border-blue-200 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", account.color)}>
                                                        <IconComponent className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold border-2", account.color)}>
                                                                {account.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {account.email}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {account.description}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Footer */}
                            <div className="text-center text-sm text-gray-500 pt-4">
                                <p className="font-medium">
                                    © 2024 Badan Pusat Statistik Provinsi Riau
                                </p>
                                <p className="mt-1">
                                    SIPERU - Version 1.0.0
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}