import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { Eye, EyeOff, ArrowLeft, Shield, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "./AuthContext";
import { BPSLogo } from "./BPSLogo";

interface LoginPageProps {
  onBack: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await login(formData);
    if (!success) {
      setErrors({ general: "Email atau password tidak valid" });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const demoAccounts = [
    { email: "admin@bps.go.id", role: "Super Admin", password: "password", description: "Full access semua fitur" },
    { email: "ahmad.fauzi@bps.go.id", role: "Admin", password: "password", description: "Kelola ruangan & peminjaman" },
    { email: "siti.nurhaliza@bps.go.id", role: "Admin", password: "password", description: "Kelola ruangan & peminjaman" },
    { email: "rina.safitri@bps.go.id", role: "Pengguna", password: "password", description: "Ajukan peminjaman ruangan" },
    { email: "dedi.kurniawan@bps.go.id", role: "Pengguna", password: "password", description: "Ajukan peminjaman ruangan" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mb-4 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                <BPSLogo className="text-white" size="xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">BPS Riau</h1>
                <p className="text-muted-foreground">Sistem Manajemen Ruangan</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                Selamat Datang Kembali
              </h2>
              <p className="text-lg text-muted-foreground">
                Masuk ke sistem untuk mengakses dashboard manajemen ruangan dengan 
                kontrol akses berdasarkan role pengguna
              </p>
            </div>
          </div>

          {/* Demo Accounts Info */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Akun Demo (Password Sudah Diperbaiki)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Gunakan salah satu akun berikut untuk testing dengan role yang berbeda:
              </p>
              {demoAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{account.email}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{account.role}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{account.description}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        email: account.email,
                        password: account.password
                      }));
                    }}
                  >
                    Gunakan
                  </Button>
                </div>
              ))}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  ✅ Password untuk semua akun demo telah diperbaiki: <strong>password</strong>
                  <br />
                  🔒 Setiap role memiliki akses yang berbeda sesuai hierarki
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Login Form */}
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Masuk Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@bps.go.id"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => handleInputChange("remember", checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Ingat saya
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-lg py-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Masuk
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <Button variant="link" className="text-sm text-muted-foreground">
                  Lupa Password?
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  🔒 Sistem menggunakan keamanan tingkat enterprise dengan role-based access control
                  <br />
                  👑 Super Admin: Full access | 🛡️ Admin: Manage rooms & borrowers | 👤 User: Submit requests
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}