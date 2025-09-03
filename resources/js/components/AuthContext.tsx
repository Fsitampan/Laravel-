import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "pengguna";
  department: string;
  avatar?: string;
  phone?: string;
  address?: string;
  dateJoined?: string;
  bio?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users dengan password yang benar untuk demo
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    name: "Dr. Budi Santoso",
    email: "admin@bps.go.id",
    password: "password",
    role: "super-admin",
    department: "Kepala BPS Provinsi Riau",
    phone: "0812-1234-5678",
    address: "Jl. Sudirman No. 123, Pekanbaru",
    dateJoined: "2020-01-15",
    bio: "Kepala BPS Provinsi Riau dengan pengalaman 15 tahun di bidang statistik",
  },
  {
    id: "2",
    name: "Ahmad Fauzi",
    email: "ahmad.fauzi@bps.go.id",
    password: "password",
    role: "admin",
    department: "Bagian Umum",
    phone: "0813-2345-6789",
    address: "Jl. Riau No. 456, Pekanbaru",
    dateJoined: "2021-03-10",
    bio: "Admin bagian umum yang mengelola fasilitas dan logistik",
  },
  {
    id: "3",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@bps.go.id",
    password: "password",
    role: "admin",
    department: "Statistik Sosial",
    phone: "0814-3456-7890",
    address: "Jl. Hang Tuah No. 789, Pekanbaru",
    dateJoined: "2021-06-20",
    bio: "Spesialis statistik sosial dan demografi",
  },
  {
    id: "4",
    name: "Rina Safitri",
    email: "rina.safitri@bps.go.id",
    password: "password",
    role: "pengguna",
    department: "Statistik Produksi",
    phone: "0815-4567-8901",
    address: "Jl. Diponegoro No. 321, Pekanbaru",
    dateJoined: "2022-01-05",
    bio: "Analis statistik produksi dan pertanian",
  },
  {
    id: "5",
    name: "Dedi Kurniawan",
    email: "dedi.kurniawan@bps.go.id",
    password: "password",
    role: "pengguna",
    department: "Statistik Distribusi",
    phone: "0816-5678-9012",
    address: "Jl. Ahmad Yani No. 654, Pekanbaru",
    dateJoined: "2022-08-12",
    bio: "Spesialis statistik distribusi dan perdagangan",
  },
];

// Storage key constant
const AUTH_STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulasi API call - di production akan menggunakan Inertia post request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email and validate password
      const foundUser = mockUsers.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase() && 
        u.password === credentials.password
      );
      
      if (foundUser) {
        // Remove password from user object before saving
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        
        // Simpan ke localStorage untuk persistensi (di production akan handled by Laravel session)
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
        } catch (error) {
          console.error('Failed to save auth data:', error);
        }
        
        toast.success(`Selamat datang, ${foundUser.name}!`);
        return true;
      }
      
      toast.error("Email atau password tidak valid");
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Terjadi kesalahan saat login");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
    toast.success("Anda telah berhasil keluar");
  }, []);

  const checkAuth = useCallback((): boolean => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Validate user data structure
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.name) {
          setUser(parsedUser);
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear invalid data
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (clearError) {
        console.error('Failed to clear invalid auth data:', clearError);
      }
    }
    return false;
  }, []);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};