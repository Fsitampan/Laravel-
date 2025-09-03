import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BPSLogo } from '@/components/BPSLogo';
import { 
    Building, 
    Users, 
    Calendar, 
    Shield, 
    CheckCircle, 
    Zap,
    LogIn,
    UserPlus,
    ArrowRight 
} from 'lucide-react';

interface WelcomeProps extends PageProps {
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string;
    phpVersion: string;
}

export default function welcome({ 
    auth, 
    canLogin, 
    canRegister, 
    laravelVersion, 
    phpVersion 
}: WelcomeProps) {
    const features = [
        {
            icon: Building,
            title: "Manajemen Ruangan",
            description: "Kelola ruangan dengan sistem status real-time dan informasi lengkap fasilitas.",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            icon: Calendar,
            title: "Sistem Peminjaman",
            description: "Proses peminjaman yang efisien dengan approval workflow yang terstruktur.",
            color: "text-green-600", 
            bgColor: "bg-green-50"
        },
        {
            icon: Users,
            title: "Manajemen Pengguna",
            description: "Sistem role-based dengan akses yang disesuaikan untuk setiap tingkat pengguna.",
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            icon: Shield,
            title: "Keamanan Terjamin",
            description: "Sistem keamanan berlapis dengan enkripsi data dan audit trail lengkap.",
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        }
    ];

    const stats = [
        { label: "Ruangan Tersedia", value: "6+", icon: Building },
        { label: "Kategori Pengguna", value: "3", icon: Users },
        { label: "Status Ruangan", value: "3", icon: CheckCircle },
        { label: "Role Pengguna", value: "3", icon: Shield }
    ];

    return (
        <>
            <Head title="Selamat Datang" />
            
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
                {/* Navigation */}
                <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                                    <BPSLogo className="text-white" size="sm" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-gray-900">BPS Riau</h1>
                                    <p className="text-xs text-gray-600">Sistem Manajemen</p>
                                </div>
                            </div>

                            {/* Auth Links */}
                            {canLogin && (
                                <div className="flex items-center gap-3">
                                    {auth.user ? (
                                        <Link href={route('Dashboard')}>
                                            <Button>
                                                Dashboard
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href={route('login')}>
                                                <Button variant="ghost" className="flex items-center gap-2">
                                                    <LogIn className="h-4 w-4" />
                                                    Masuk
                                                </Button>
                                            </Link>
                                            {canRegister && (
                                                <Link href={route('register')}>
                                                    <Button className="flex items-center gap-2">
                                                        <UserPlus className="h-4 w-4" />
                                                        Daftar
                                                    </Button>
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-8">
                                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-2xl">
                                    <BPSLogo className="text-white" size="xl" />
                                </div>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                Sistem Manajemen
                                <span className="block text-indigo-600">Ruangan Digital</span>
                            </h1>
                            
                            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                                Solusi digital terpadu untuk manajemen ruangan BPS Provinsi Riau. 
                                Kelola peminjaman ruangan dengan efisien dan professional.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {auth.user ? (
                                    <Link href={route('Dashboard')}>
                                        <Button size="lg" className="w-full sm:w-auto">
                                            Masuk ke Dashboard
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link href={route('login')}>
                                                <Button size="lg" className="w-full sm:w-auto">
                                                    <LogIn className="mr-2 h-5 w-5" />
                                                    Masuk ke Sistem
                                                </Button>
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link href={route('register')}>
                                                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                                    <UserPlus className="mr-2 h-5 w-5" />
                                                    Daftar Akun Baru
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                                {stats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex justify-center mb-3">
                                                    <div className="p-3 rounded-xl bg-indigo-50">
                                                        <Icon className="h-6 w-6 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    {stat.value}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {stat.label}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <Badge className="mb-4" variant="outline">
                                <Zap className="w-3 h-3 mr-1" />
                                Fitur Unggulan
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Solusi Lengkap untuk BPS Riau
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Sistem yang dirancang khusus untuk memenuhi kebutuhan operasional 
                                Badan Pusat Statistik Provinsi Riau
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                                        <CardHeader>
                                            <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                                                <Icon className={`h-6 w-6 ${feature.color}`} />
                                            </div>
                                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                                            <CardDescription className="text-base">
                                                {feature.description}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                            Siap Modernisasi Manajemen Ruangan?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-8">
                            Bergabunglah dengan sistem digital BPS Riau dan rasakan kemudahan 
                            dalam mengelola ruangan secara profesional.
                        </p>
                        
                        {!auth.user && canRegister && (
                            <Link href={route('register')}>
                                <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-50">
                                    <UserPlus className="mr-2 h-5 w-5" />
                                    Mulai Sekarang - Gratis
                                </Button>
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                                    <BPSLogo className="text-white" size="xl" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">BPS Provinsi Riau</h3>
                                    <p className="text-sm text-gray-400">Sistem Manajemen Ruangan</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                <span>Laravel v{laravelVersion}</span>
                                <span>PHP v{phpVersion}</span>
                                <span>© 2024 BPS Riau</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}