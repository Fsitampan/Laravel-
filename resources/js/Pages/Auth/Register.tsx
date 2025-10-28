import { useEffect, FormEventHandler, useState } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    User, 
    Mail, 
    Lock, 
    Phone, 
    Building, 
    ArrowRight, 
    CheckCircle, 
    Eye, 
    EyeOff,
    AlertCircle,
    Shield,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        department: '',
        phone: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    const features = [
        {
            icon: CheckCircle,
            title: 'Akses Cepat',
            description: 'Login sekali untuk akses semua fitur sistem'
        },
        {
            icon: Shield,
            title: 'Aman & Terpercaya',
            description: 'Data Anda dilindungi dengan enkripsi tingkat tinggi'
        },
        {
            icon: FileText,
            title: 'Riwayat Lengkap',
            description: 'Lacak semua aktivitas peminjaman Anda'
        }
    ];

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
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
                                        Bergabung dengan SIPERU BPS Provinsi Riau
                                    </h2>
                                    <p className="text-lg text-gray-600">
                                        Daftarkan diri Anda untuk mendapatkan akses ke sistem peminjaman ruangan yang efisien dan profesional.
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-4">
                                {features.map((feature, index) => {
                                    const IconComponent = feature.icon;
                                    return (
                                        <div key={index} className="flex items-start space-x-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                <IconComponent className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                                                <p className="text-sm text-gray-600">{feature.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Already have account */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                                <p className="text-gray-700 mb-3">
                                    <span className="font-semibold">Sudah punya akun?</span>
                                </p>
                                <Link href={route('login')}>
                                    <Button variant="outline" className="w-full sm:w-auto border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        Login ke Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Side - Registration Form */}
                        <div className="w-full max-w-xl mx-auto lg:mx-0">
                            {/* Mobile Logo */}
                            <div className="lg:hidden text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg p-3 flex items-center justify-center">
                                        <img 
                                            src="/bpslogo.png" 
                                            alt="BPS Logo" 
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Daftar Akun Baru
                                </h2>
                            </div>

                            {/* Registration Form Card */}
                            <Card className="shadow-xl border-0">
                                <CardHeader className="space-y-2 pb-6">
                                    <CardTitle className="text-2xl font-bold text-gray-900">
                                        Buat Akun Baru
                                    </CardTitle>
                                    <CardDescription className="text-base text-gray-600">
                                        Lengkapi form di bawah untuk membuat akun Anda
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submit} className="space-y-5">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                                Nama Lengkap *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={data.name}
                                                    className={cn(
                                                        "pl-11 h-12 text-base",
                                                        errors.name && "border-red-300 focus:border-red-500"
                                                    )}
                                                    autoComplete="name"
                                                    placeholder="Masukkan nama lengkap"
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    required
                                                />
                                                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            </div>
                                            {errors.name && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                                Email Address *
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
                                                    required
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

                                        {/* Department Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="department" className="text-sm font-semibold text-gray-700">
                                                Departemen/Unit Kerja
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="department"
                                                    name="department"
                                                    value={data.department}
                                                    className={cn(
                                                        "pl-11 h-12 text-base",
                                                        errors.department && "border-red-300 focus:border-red-500"
                                                    )}
                                                    autoComplete="organization"
                                                    placeholder="Contoh: Statistik Sosial"
                                                    onChange={(e) => setData('department', e.target.value)}
                                                />
                                                <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            </div>
                                            {errors.department && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    {errors.department}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                                                Nomor Telepon
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    name="phone"
                                                    value={data.phone}
                                                    className={cn(
                                                        "pl-11 h-12 text-base",
                                                        errors.phone && "border-red-300 focus:border-red-500"
                                                    )}
                                                    autoComplete="tel"
                                                    placeholder="08xx-xxxx-xxxx"
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                />
                                                <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            </div>
                                            {errors.phone && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                                Password *
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
                                                    autoComplete="new-password"
                                                    placeholder="Minimal 8 karakter"
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    required
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

                                        {/* Password Confirmation Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">
                                                Konfirmasi Password *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    type={showPasswordConfirmation ? "text" : "password"}
                                                    name="password_confirmation"
                                                    value={data.password_confirmation}
                                                    className={cn(
                                                        "pl-11 pr-11 h-12 text-base",
                                                        errors.password_confirmation && "border-red-300 focus:border-red-500"
                                                    )}
                                                    autoComplete="new-password"
                                                    placeholder="Ulangi password"
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    required
                                                />
                                                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                                >
                                                    {showPasswordConfirmation ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                                    {errors.password_confirmation}
                                                </p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    <span>Memproses...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>Daftar Sekarang</span>
                                                    <ArrowRight className="h-5 w-5" />
                                                </div>
                                            )}
                                        </Button>

                                        {/* Login Link - Mobile */}
                                        <div className="lg:hidden text-center pt-4 border-t">
                                            <p className="text-sm text-gray-600">
                                                Sudah punya akun?{' '}
                                                <Link
                                                    href={route('login')}
                                                    className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                                                >
                                                    Login di sini
                                                </Link>
                                            </p>
                                        </div>
                                    </form>

                                    {/* Terms & Conditions */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-xs text-center text-gray-500 leading-relaxed">
                                            Dengan mendaftar, Anda menyetujui{' '}
                                            <a href="#" className="text-indigo-600 hover:underline">
                                                Syarat & Ketentuan
                                            </a>{' '}
                                            dan{' '}
                                            <a href="#" className="text-indigo-600 hover:underline">
                                                Kebijakan Privasi
                                            </a>{' '}
                                            kami
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Footer */}
                            <div className="text-center text-sm text-gray-500 mt-6">
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