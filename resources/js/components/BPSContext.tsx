import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface Room {
  id: string;
  name: string;
  status: "tersedia" | "dipakai" | "pemeliharaan";
  capacity: number;
  facilities: string[];
  description?: string;
  imageUrl?: string;
}

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: "pegawai" | "tamu" | "anak-magang";
  department: string;
  identification: string;
  borrowDate: string;
  returnDate: string;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  roomName?: string;
  purpose: string;
  notes?: string;
  status: "pending" | "approved" | "active" | "completed" | "rejected" | "cancelled";
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  returnedAt?: string;
  returnedBy?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "pengguna";
  department: string;
  isOnline: boolean;
  lastActive: string;
  avatar?: string;
}

interface BPSContextType {
  // Data
  rooms: Room[];
  borrowers: Borrower[];
  users: User[];
  
  // Room management
  addRoom: (roomData: Omit<Room, "id">) => void;
  updateRoom: (id: string, roomData: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  // Borrower management
  addBorrower: (borrowerData: Omit<Borrower, "id" | "status" | "createdAt">) => void;
  updateBorrower: (id: string, borrowerData: Partial<Borrower>) => void;
  deleteBorrower: (id: string) => void;
  approveBorrowing: (id: string) => void;
  rejectBorrowing: (id: string, reason: string) => void;
  returnBorrowing: (id: string) => void;
  
  // User management
  addUser: (userData: Omit<User, "id" | "isOnline" | "lastActive">) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Utility functions
  getAvailableRooms: () => Room[];
  getPendingBorrows: () => Borrower[];
  
  // Permission helpers
  canManageRooms: () => boolean;
  canManageBorrowers: () => boolean;
  canManageUsers: () => boolean;
  canApproveRejects: () => boolean;
  canCreateBorrowings: () => boolean;
  canViewAllHistory: () => boolean;
  isReadOnly: () => boolean;
}

const BPSContext = createContext<BPSContextType | undefined>(undefined);

export function BPSProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  
  // Mock data - in real app, this would come from your Laravel API
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "Ruang Rapat A",
      status: "tersedia",
      capacity: 12,
      facilities: ["Proyektor", "AC", "WiFi", "Whiteboard"],
      description: "Ruang rapat utama dengan fasilitas lengkap untuk presentasi",
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
    },
    {
      id: "2", 
      name: "Ruang Rapat B",
      status: "dipakai",
      capacity: 8,
      facilities: ["AC", "WiFi", "TV"],
      description: "Ruang rapat kecil untuk diskusi tim",
      imageUrl: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop"
    },
    {
      id: "3",
      name: "Ruang Seminar C", 
      status: "tersedia",
      capacity: 50,
      facilities: ["Proyektor", "Sound System", "AC", "WiFi", "Podium"],
      description: "Ruang seminar besar untuk acara resmi",
      imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400&h=300&fit=crop"
    },
    {
      id: "4",
      name: "Ruang Kerja D",
      status: "pemeliharaan", 
      capacity: 6,
      facilities: ["AC", "WiFi"],
      description: "Ruang kerja tim kecil",
      imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop"
    },
    {
      id: "5",
      name: "Ruang Training E",
      status: "tersedia",
      capacity: 30,
      facilities: ["Proyektor", "AC", "WiFi", "Whiteboard", "Flipchart"],
      description: "Ruang pelatihan dengan layout fleksibel",
      imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop"
    },
    {
      id: "6",
      name: "Ruang Eksekutif F",
      status: "tersedia", 
      capacity: 4,
      facilities: ["AC", "WiFi", "TV", "Coffee Machine"],
      description: "Ruang meeting eksekutif dengan suasana premium",
      imageUrl: "https://images.unsplash.com/photo-1567521464027-f491e79a2e0d?w=400&h=300&fit=crop"
    }
  ]);

  const [borrowers, setBorrowers] = useState<Borrower[]>([
    {
      id: "1",
      name: "Ahmad Fauzi",
      email: "ahmad.fauzi@bps.go.id",
      phone: "081234567890",
      category: "pegawai",
      department: "Divisi Statistik Sosial",
      identification: "1371012345678901",
      borrowDate: "2024-01-15",
      returnDate: "2024-01-15",
      startTime: "09:00",
      endTime: "12:00",
      roomId: "2",
      roomName: "Ruang Rapat B",
      purpose: "Rapat koordinasi tim bulanan",
      status: "active",
      createdAt: "2024-01-10 14:30",
      createdBy: "1",
      approvedAt: "2024-01-11 09:15",
      approvedBy: "2"
    },
    {
      id: "2", 
      name: "Siti Nurhaliza",
      email: "siti.nurhaliza@email.com",
      phone: "081234567891",
      category: "tamu",
      department: "Universitas Riau",
      identification: "1371012345678902", 
      borrowDate: "2024-01-20",
      returnDate: "2024-01-20",
      startTime: "14:00",
      endTime: "16:00",
      roomId: "1",
      roomName: "Ruang Rapat A",
      purpose: "Presentasi hasil penelitian kemiskinan daerah",
      status: "pending",
      createdAt: "2024-01-18 10:20",
      createdBy: "3"
    },
    {
      id: "3",
      name: "Budi Santoso", 
      email: "budi.santoso@bps.go.id",
      phone: "081234567892",
      category: "pegawai",
      department: "Divisi Statistik Produksi",
      identification: "1371012345678903",
      borrowDate: "2024-01-12",
      returnDate: "2024-01-12", 
      startTime: "10:00",
      endTime: "11:30",
      roomId: "3",
      roomName: "Ruang Seminar C",
      purpose: "Workshop analisis data pertanian",
      status: "completed",
      createdAt: "2024-01-08 16:45",
      createdBy: "1",
      approvedAt: "2024-01-09 08:30",
      approvedBy: "2",
      returnedAt: "2024-01-12 11:30",
      returnedBy: "2"
    },
    {
      id: "4",
      name: "Maya Kartika",
      email: "maya.kartika@email.com", 
      phone: "081234567893",
      category: "anak-magang",
      department: "Magang STIS Jakarta",
      identification: "3171012345678904",
      borrowDate: "2024-01-25",
      returnDate: "2024-01-25",
      startTime: "08:00", 
      endTime: "10:00",
      roomId: "5",
      roomName: "Ruang Training E",
      purpose: "Presentasi akhir program magang",
      status: "rejected",
      createdAt: "2024-01-22 11:15",
      createdBy: "4",
      rejectedAt: "2024-01-23 14:20",
      rejectedBy: "2",
      rejectionReason: "Ruangan sudah dipesan untuk kegiatan lain pada waktu yang sama"
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Superadmin BPS",
      email: "superadmin@bps.go.id", 
      role: "super-admin",
      department: "IT Administration",
      isOnline: true,
      lastActive: "2024-01-20 15:30"
    },
    {
      id: "2",
      name: "Admin Ruangan",
      email: "admin@bps.go.id",
      role: "admin", 
      department: "Tata Usaha",
      isOnline: true,
      lastActive: "2024-01-20 15:25"
    },
    {
      id: "3",
      name: "Ahmad Fauzi",
      email: "ahmad.fauzi@bps.go.id",
      role: "pengguna",
      department: "Divisi Statistik Sosial", 
      isOnline: false,
      lastActive: "2024-01-20 12:45"
    },
    {
      id: "4",
      name: "Maya Kartika", 
      email: "maya.kartika@email.com",
      role: "pengguna",
      department: "Magang STIS Jakarta",
      isOnline: false,
      lastActive: "2024-01-19 16:20"
    }
  ]);

  // Permission helpers
  const canManageRooms = () => {
    return authUser?.role === "super-admin" || authUser?.role === "admin";
  };

  const canManageBorrowers = () => {
    return authUser?.role === "super-admin" || authUser?.role === "admin";
  };

  const canManageUsers = () => {
    return authUser?.role === "super-admin";
  };

  const canApproveRejects = () => {
    return authUser?.role === "super-admin" || authUser?.role === "admin";
  };

  const canCreateBorrowings = () => {
    return true; // All authenticated users can create borrowings
  };

  const canViewAllHistory = () => {
    return authUser?.role === "super-admin" || authUser?.role === "admin";
  };

  const isReadOnly = () => {
    return authUser?.role === "pengguna";
  };

  // Room management functions
  const addRoom = (roomData: Omit<Room, "id">) => {
    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString()
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const updateRoom = (id: string, roomData: Partial<Room>) => {
    setRooms(prev => prev.map(room => 
      room.id === id ? { ...room, ...roomData } : room
    ));
  };

  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(room => room.id !== id));
  };

  // Borrower management functions
  const addBorrower = (borrowerData: Omit<Borrower, "id" | "status" | "createdAt">) => {
    const newBorrower: Borrower = {
      ...borrowerData,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toLocaleString('id-ID')
    };
    setBorrowers(prev => [...prev, newBorrower]);
  };

  const updateBorrower = (id: string, borrowerData: Partial<Borrower>) => {
    setBorrowers(prev => prev.map(borrower => 
      borrower.id === id ? { ...borrower, ...borrowerData } : borrower
    ));
  };

  const deleteBorrower = (id: string) => {
    setBorrowers(prev => prev.filter(borrower => borrower.id !== id));
  };

  const approveBorrowing = (id: string) => {
    setBorrowers(prev => prev.map(borrower => 
      borrower.id === id ? { 
        ...borrower, 
        status: "approved",
        approvedAt: new Date().toLocaleString('id-ID'),
        approvedBy: authUser?.id || "1"
      } : borrower
    ));
  };

  const rejectBorrowing = (id: string, reason: string) => {
    setBorrowers(prev => prev.map(borrower => 
      borrower.id === id ? { 
        ...borrower, 
        status: "rejected",
        rejectedAt: new Date().toLocaleString('id-ID'),
        rejectedBy: authUser?.id || "1",
        rejectionReason: reason
      } : borrower
    ));
  };

  const returnBorrowing = (id: string) => {
    setBorrowers(prev => prev.map(borrower => 
      borrower.id === id ? { 
        ...borrower, 
        status: "completed",
        returnedAt: new Date().toLocaleString('id-ID'),
        returnedBy: authUser?.id || "1"
      } : borrower
    ));
  };

  // User management functions
  const addUser = (userData: Omit<User, "id" | "isOnline" | "lastActive">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      isOnline: false,
      lastActive: new Date().toLocaleString('id-ID')
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  // Utility functions
  const getAvailableRooms = () => {
    return rooms.filter(room => room.status === "tersedia");
  };

  const getPendingBorrows = () => {
    return borrowers.filter(borrower => borrower.status === "pending");
  };

  const contextValue: BPSContextType = {
    // Data
    rooms,
    borrowers,
    users,
    
    // Room management
    addRoom,
    updateRoom,
    deleteRoom,
    
    // Borrower management
    addBorrower,
    updateBorrower,
    deleteBorrower,
    approveBorrowing,
    rejectBorrowing,
    returnBorrowing,
    
    // User management
    addUser,
    updateUser,
    deleteUser,
    
    // Utility functions
    getAvailableRooms,
    getPendingBorrows,
    
    // Permission helpers
    canManageRooms,
    canManageBorrowers,
    canManageUsers,
    canApproveRejects,
    canCreateBorrowings,
    canViewAllHistory,
    isReadOnly
  };

  return <BPSContext.Provider value={contextValue}>{children}</BPSContext.Provider>;
}

export function useBPS() {
  const context = useContext(BPSContext);
  if (context === undefined) {
    throw new Error("useBPS must be used within a BPSProvider");
  }
  return context;
}