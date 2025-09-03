import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { 
  Building, 
  Users, 
  Shield,
  Bell,
  Database,
  Crown,
  User,
  Circle,
  Camera,
  Edit,
  Save
} from "lucide-react";
import { useBPS } from "./BPSContext";
import { useAuth } from "./AuthContext";

interface SettingsProps {
  initialTab?: string;
}

export function Settings({ initialTab = "profile" }: SettingsProps) {
  const { rooms, borrowers, users, canManageUsers } = useBPS();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Safe fallback for currentUser
  const userProfile = currentUser || {
    id: "1",
    name: "Guest User",
    email: "guest@bps.go.id",
    role: "pengguna" as const,
    department: "Unknown",
    phone: "",
    address: "",
    bio: "",
    avatar: "",
    dateJoined: new Date().toISOString().split('T')[0]
  };

  const [profileData, setProfileData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone || "",
    address: userProfile.address || "",
    bio: userProfile.bio || "",
    avatar: userProfile.avatar || ""
  });

  // Auto-switch tab ketika initialTab berubah
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Update profile data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || ""
      });
    }
  }, [currentUser]);

  const [bpsSettings, setBpsSettings] = useState({
    officeName: "Badan Pusat Statistik Provinsi Riau",
    address: "Jl. Pattimura No. 12, Pekanbaru, Riau 28131",
    phone: "(0761) 21162",
    email: "bps3200@bps.go.id",
    website: "https://riau.bps.go.id",
    operatingHours: "07:30 - 16:00",
    maxBorrowDays: 7,
    autoReturnReminder: true,
    maintenanceMode: false,
  });

  const [notifications, setNotifications] = useState({
    borrowReminder: true,
    returnReminder: true,
    maintenanceAlerts: true,
    newUserRegistration: true,
    systemUpdates: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would call an API to update the user profile
    console.log("Saving profile:", profileData);
    setIsEditingProfile(false);
  };

  const handleSettingsChange = (field: string, value: any) => {
    setBpsSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = () => {
    console.log("Settings saved:", bpsSettings);
  };

  const systemStats = {
    totalRooms: rooms.length,
    totalBorrowers: borrowers.length,
    totalUsers: users.length,
    activeBorrows: borrowers.filter(b => b.status === "active").length,
    availableRooms: rooms.filter(r => r.status === "tersedia").length,
    occupancyRate: Math.round((rooms.filter(r => r.status === "dipakai").length / Math.max(rooms.length, 1)) * 100)
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super-admin": return Crown;
      case "admin": return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin": return "role-super-admin";
      case "admin": return "role-admin";
      default: return "role-user";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-chart-3/10 to-chart-4/10 p-6 rounded-xl border border-chart-3/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-chart-3 mb-2">Pengaturan Sistem</h1>
            <p className="text-muted-foreground">
              Kelola profile dan konfigurasi sistem manajemen ruangan BPS Riau
              {initialTab && (
                <span className="ml-2 text-chart-3">
                  • Tab: {initialTab === "profile" ? "Profile" : 
                           initialTab === "bps" ? "Info BPS" : 
                           initialTab === "users" ? "Pengguna" : 
                           initialTab === "notifications" ? "Notifikasi" : "Sistem"}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bps">Info BPS</TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Pengguna
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (isEditingProfile) {
                      handleSaveProfile();
                    } else {
                      setIsEditingProfile(true);
                    }
                  }}
                >
                  {isEditingProfile ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isEditingProfile ? "Simpan" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {userProfile.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditingProfile && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{userProfile.name}</h3>
                    <Badge className={getRoleColor(userProfile.role)}>
                      {userProfile.role === "super-admin" ? "Super Admin" : 
                       userProfile.role === "admin" ? "Admin" : "Pengguna"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Circle className="h-2 w-2 text-green-500 fill-current" />
                      <span className="text-sm text-muted-foreground">Online</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{userProfile.department}</p>
                  <p className="text-sm text-muted-foreground">
                    Bergabung sejak: {userProfile.dateJoined || "Unknown"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange("name", e.target.value)}
                      disabled={!isEditingProfile}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                      disabled={!isEditingProfile}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                      disabled={!isEditingProfile}
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleProfileChange("address", e.target.value)}
                      disabled={!isEditingProfile}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleProfileChange("bio", e.target.value)}
                      disabled={!isEditingProfile}
                      placeholder="Ceritakan sedikit tentang diri Anda"
                    />
                  </div>
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Simpan Perubahan
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileData({
                        name: userProfile.name,
                        email: userProfile.email,
                        phone: userProfile.phone || "",
                        address: userProfile.address || "",
                        bio: userProfile.bio || "",
                        avatar: userProfile.avatar || ""
                      });
                    }}
                  >
                    Batal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bps" className="space-y-4">
          {canManageUsers() ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informasi BPS Provinsi Riau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officeName">Nama Instansi</Label>
                    <Input
                      id="officeName"
                      value={bpsSettings.officeName}
                      onChange={(e) => handleSettingsChange("officeName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={bpsSettings.website}
                      onChange={(e) => handleSettingsChange("website", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={bpsSettings.address}
                    onChange={(e) => handleSettingsChange("address", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telepon</Label>
                    <Input
                      id="phone"
                      value={bpsSettings.phone}
                      onChange={(e) => handleSettingsChange("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bpsSettings.email}
                      onChange={(e) => handleSettingsChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full bg-gradient-to-r from-primary to-primary-dark">
                  Simpan Pengaturan BPS
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Akses Terbatas</h3>
                <p className="text-muted-foreground">
                  Anda tidak memiliki akses untuk mengelola pengaturan BPS.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {canManageUsers() ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Manajemen Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {users.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <div key={user.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge className={getRoleColor(user.role)}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {user.role === "super-admin" ? "Super Admin" : 
                               user.role === "admin" ? "Admin" : "Pengguna"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.department}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm text-muted-foreground">
                            {user.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Akses Terbatas</h3>
                <p className="text-muted-foreground">
                  Anda tidak memiliki akses untuk melihat manajemen pengguna.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Pengaturan Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                    <p className="text-sm text-muted-foreground">
                      Pengaturan notifikasi untuk {key}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={() => handleNotificationChange(key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Informasi Sistem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Ruangan:</span>
                    <Badge variant="outline">{systemStats.totalRooms}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Peminjam:</span>
                    <Badge variant="outline">{systemStats.totalBorrowers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pengguna:</span>
                    <Badge variant="outline">{systemStats.totalUsers}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Peminjaman Aktif:</span>
                    <Badge variant="outline">{systemStats.activeBorrows}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ruangan Tersedia:</span>
                    <Badge variant="outline">{systemStats.availableRooms}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Okupansi:</span>
                    <Badge variant="outline">{systemStats.occupancyRate}%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}