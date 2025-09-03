import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, BarChart3, FileText, MapPin, Phone, Mail, Globe, ArrowRight, Shield, CheckCircle, Award, Target, TrendingUp } from "lucide-react";
import { BPSLogo } from "./BPSLogo";

interface WelcomePageProps {
  onLogin: () => void;
}

export function WelcomePage({ onLogin }: WelcomePageProps) {
  const features = [
    {
      icon: BPSLogo,
      title: "Manajemen Ruangan Digital",
      description: "Kelola dan monitor penggunaan ruangan secara real-time dengan sistem terintegrasi berbasis cloud.",
      color: "text-primary",
      delay: "delay-0"
    },
    {
      icon: Users,
      title: "Sistem Registrasi Terpadu",
      description: "Registrasi dan pengelolaan data peminjam dari berbagai kategori dengan validasi otomatis.",
      color: "text-secondary",
      delay: "delay-100"
    },
    {
      icon: BarChart3,
      title: "Workflow Persetujuan",
      description: "Sistem persetujuan berlapis dengan notifikasi real-time dan audit trail lengkap.",
      color: "text-chart-3",
      delay: "delay-200"
    },
    {
      icon: FileText,
      title: "Analytics & Reporting",
      description: "Dashboard analytics komprehensif dengan export data dan visualisasi interaktif.",
      color: "text-chart-4",
      delay: "delay-300"
    }
  ];

  const stats = [
    { label: "Ruangan Dikelola", value: "12", unit: "Ruang", icon: BPSLogo, color: "text-primary" },
    { label: "Pegawai Aktif", value: "180+", unit: "Orang", icon: Users, color: "text-secondary" },
    { label: "Peminjaman/Bulan", value: "450+", unit: "Transaksi", icon: BarChart3, color: "text-chart-3" },
    { label: "Efisiensi Ruang", value: "95%", unit: "Optimal", icon: TrendingUp, color: "text-chart-4" }
  ];

  const achievements = [
    { title: "ISO 9001:2015", desc: "Sertifikasi Sistem Manajemen Mutu", icon: Award },
    { title: "Paperless Office", desc: "100% Digital Transformation", icon: Target },
    { title: "Green Building", desc: "Hemat Energi & Ramah Lingkungan", icon: CheckCircle }
  ];

  const floatingElements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    left: Math.random() * 100,
    animationDuration: Math.random() * 10 + 15,
    delay: Math.random() * 5
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 animate-float"
            style={{
              width: `${element.size}px`,
              height: `${element.size}px`,
              left: `${element.left}%`,
              animationDuration: `${element.animationDuration}s`,
              animationDelay: `${element.delay}s`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse-glow"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <BPSLogo className="text-white transition-transform duration-300 group-hover:rotate-6" size="lg" />
              </div>
              <div className="transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-xl font-bold text-foreground">BPS Provinsi Riau</h1>
                <p className="text-sm text-muted-foreground">Sistem Manajemen Ruangan Digital</p>
              </div>
            </div>
            <Button 
              onClick={onLogin} 
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Shield className="h-4 w-4 mr-2" />
              Masuk Sistem
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-300">
                <BPSLogo className="mr-2" size="sm" />
                Sistem Terpadu BPS Provinsi Riau
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Badan Pusat Statistik
                </span>
                <span className="block mt-2 hover:text-primary transition-colors duration-300">
                  Provinsi Riau
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sistem Manajemen Ruangan Digital yang mengoptimalkan penggunaan fasilitas 
                kantor dengan teknologi cloud computing, workflow automation, dan real-time analytics 
                untuk mendukung transformasi digital pemerintahan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onLogin} 
                size="lg"
                className="bg-gradient-to-r from-primary to-primary-dark text-lg px-8 py-6 hover:from-primary-dark hover:to-secondary transition-all duration-300 hover:scale-105 hover:shadow-xl transform group"
              >
                Akses Sistem
                <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 hover:scale-105"
              >
                <FileText className="h-5 w-5 mr-2" />
                Panduan Sistem
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const delayClass = index === 0 ? "" : index === 1 ? "delay-100" : index === 2 ? "delay-200" : "delay-300";
                return (
                  <div 
                    key={index} 
                    className={`text-center group cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in-up ${delayClass}`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:shadow-lg">
                      <Icon className={`${stat.color} transition-all duration-300 group-hover:scale-110`} size="sm" />
                    </div>
                    <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <div className="text-xs text-muted-foreground opacity-70">{stat.unit}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-3xl animate-pulse-glow"></div>
            <Card className="relative border-2 border-primary/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-primary/30 group">
              <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300">
                <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <BPSLogo className="text-primary transition-transform duration-300 group-hover:rotate-12" size="md" />
                  Informasi Kontak Resmi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group/item hover:bg-primary/5 p-3 rounded-lg transition-all duration-300 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary/20 transition-all duration-300 group-hover/item:scale-110">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Alamat Kantor</p>
                      <p className="text-sm text-muted-foreground">
                        Jl. Pattimura No. 12, Tangkerang Selatan<br />
                        Bukit Raya, Pekanbaru, Riau 28289
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group/item hover:bg-secondary/5 p-3 rounded-lg transition-all duration-300 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover/item:bg-secondary/20 transition-all duration-300 group-hover/item:scale-110">
                      <Phone className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Telepon & Fax</p>
                      <p className="text-sm text-muted-foreground">
                        Tel: (0761) 21162, 21163<br />
                        Fax: (0761) 21162
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group/item hover:bg-chart-3/5 p-3 rounded-lg transition-all duration-300 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center group-hover/item:bg-chart-3/20 transition-all duration-300 group-hover/item:scale-110">
                      <Mail className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="font-medium">Email Resmi</p>
                      <p className="text-sm text-muted-foreground">
                        bps3200@bps.go.id<br />
                        info.riau@bps.go.id
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group/item hover:bg-chart-4/5 p-3 rounded-lg transition-all duration-300 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center group-hover/item:bg-chart-4/20 transition-all duration-300 group-hover/item:scale-110">
                      <Globe className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="font-medium">Website Resmi</p>
                      <p className="text-sm text-muted-foreground">
                        https://riau.bps.go.id<br />
                        Portal Data Statistik Riau
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-foreground">Jam Operasional</p>
                    <p className="text-sm text-muted-foreground">
                      Senin - Kamis: 07:30 - 16:00 WIB<br />
                      Jumat: 07:30 - 16:30 WIB
                    </p>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Saat ini BUKA
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="bg-muted/30 py-12 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Pencapaian & Sertifikasi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              const delayClass = index === 0 ? "" : index === 1 ? "delay-100" : "delay-200";
              return (
                <Card 
                  key={index} 
                  className={`text-center hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer animate-fade-in-up ${delayClass}`}
                >
                  <CardContent className="p-6">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Fitur Sistem Manajemen Ruangan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Solusi terintegrasi untuk mengelola fasilitas kantor dengan efisiensi maksimal, 
              keamanan berlapis, dan analitik mendalam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className={`border-2 border-transparent hover:border-primary/20 transition-all duration-500 hover:shadow-xl group cursor-pointer overflow-hidden animate-fade-in-up ${feature.delay}`}
                >
                  <CardContent className="p-6 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg relative z-10`}>
                      <Icon className={`${feature.color} transition-all duration-300 group-hover:scale-110`} size="lg" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300 relative z-10">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300 relative z-10">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90 group-hover:from-primary group-hover:to-secondary transition-all duration-500"></div>
            <CardContent className="p-12 text-center relative z-10">
              <div className="mb-6">
                <BPSLogo className="text-white mx-auto mb-4" size="xl" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Siap Bergabung dengan Transformasi Digital?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Wujudkan visi Smart Government melalui digitalisasi manajemen ruangan 
                yang efisien, transparan, dan akuntabel sesuai standar pelayanan publik.
              </p>
              <Button 
                onClick={onLogin}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Shield className="h-5 w-5 mr-2" />
                Akses Sistem Sekarang
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-8 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <BPSLogo className="text-white" size="sm" />
              </div>
              <span className="font-semibold text-foreground">BPS Provinsi Riau</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                © 2025 Badan Pusat Statistik Provinsi Riau. Semua hak cipta dilindungi.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sistem Manajemen Ruangan v2.0 | Build with ❤️ for Better Government
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}