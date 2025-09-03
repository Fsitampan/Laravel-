import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

type RoomStatus = "available" | "occupied" | "maintenance" | "cleaning";
type RoomType = "single" | "double" | "suite" | "deluxe";
type GuestStatus = "checked-in" | "checked-out" | "reserved";

interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  floor: number;
  guestName?: string;
  guestId?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  price: number;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  roomNumber?: string;
  roomId?: string;
  status: GuestStatus;
  adults: number;
  children: number;
  specialRequests?: string;
  totalAmount?: number;
}

interface Reservation {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "cancelled";
  totalAmount: number;
  specialRequests?: string;
  createdAt: string;
}

interface HotelSettings {
  hotelName: string;
  address: string;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  taxRate: number;
  roomPrices: Record<RoomType, number>;
}

interface HotelContextType {
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  settings: HotelSettings;
  
  // Room functions
  updateRoomStatus: (roomId: string, status: RoomStatus, notes?: string) => void;
  assignGuestToRoom: (roomId: string, guestId: string) => void;
  checkOutRoom: (roomId: string) => void;
  
  // Guest functions
  addGuest: (guest: Omit<Guest, "id">) => void;
  updateGuest: (guestId: string, updates: Partial<Guest>) => void;
  deleteGuest: (guestId: string) => void;
  checkInGuest: (guestId: string, roomId: string) => void;
  checkOutGuest: (guestId: string) => void;
  
  // Reservation functions
  addReservation: (reservation: Omit<Reservation, "id" | "createdAt">) => void;
  updateReservation: (reservationId: string, updates: Partial<Reservation>) => void;
  cancelReservation: (reservationId: string) => void;
  
  // Settings functions
  updateSettings: (updates: Partial<HotelSettings>) => void;
  
  // Utility functions
  getAvailableRooms: (checkIn: string, checkOut: string) => Room[];
  getTodaysCheckIns: () => Guest[];
  getTodaysCheckOuts: () => Guest[];
  getStats: () => {
    totalRooms: number;
    occupied: number;
    available: number;
    maintenance: number;
    cleaning: number;
    checkInsToday: number;
    checkOutsToday: number;
    revenue: number;
  };
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

const initialRooms: Room[] = [
  { id: "1", number: "101", type: "single", status: "available", floor: 1, price: 100 },
  { id: "2", number: "102", type: "double", status: "occupied", floor: 1, guestName: "John Smith", guestId: "1", checkIn: "2025-07-15", checkOut: "2025-07-18", price: 150 },
  { id: "3", number: "103", type: "suite", status: "cleaning", floor: 1, price: 300 },
  { id: "4", number: "104", type: "double", status: "maintenance", floor: 1, notes: "AC repair needed", price: 150 },
  { id: "5", number: "105", type: "deluxe", status: "available", floor: 1, price: 200 },
  { id: "6", number: "201", type: "single", status: "occupied", floor: 2, guestName: "Sarah Johnson", guestId: "2", checkIn: "2025-07-16", checkOut: "2025-07-19", price: 100 },
  { id: "7", number: "202", type: "double", status: "available", floor: 2, price: 150 },
  { id: "8", number: "203", type: "suite", status: "occupied", floor: 2, guestName: "Mike Davis", guestId: "3", checkIn: "2025-07-17", checkOut: "2025-07-20", price: 300 },
  { id: "9", number: "204", type: "double", status: "cleaning", floor: 2, price: 150 },
  { id: "10", number: "205", type: "deluxe", status: "available", floor: 2, price: 200 },
  { id: "11", number: "301", type: "single", status: "available", floor: 3, price: 100 },
  { id: "12", number: "302", type: "double", status: "occupied", floor: 3, guestName: "Emma Wilson", guestId: "4", checkIn: "2025-07-16", checkOut: "2025-07-18", price: 150 },
];

const initialGuests: Guest[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    checkIn: "2025-07-15",
    checkOut: "2025-07-18",
    roomNumber: "102",
    roomId: "2",
    status: "checked-in",
    adults: 2,
    children: 0,
    totalAmount: 450,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 987-6543",
    checkIn: "2025-07-16",
    checkOut: "2025-07-19",
    roomNumber: "201",
    roomId: "6",
    status: "checked-in",
    adults: 1,
    children: 1,
    specialRequests: "High floor, quiet room",
    totalAmount: 300,
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Davis",
    email: "mike.davis@email.com",
    phone: "+1 (555) 456-7890",
    checkIn: "2025-07-17",
    checkOut: "2025-07-20",
    roomNumber: "203",
    roomId: "8",
    status: "checked-in",
    adults: 2,
    children: 2,
    totalAmount: 900,
  },
  {
    id: "4",
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma.wilson@email.com",
    phone: "+1 (555) 321-0987",
    checkIn: "2025-07-18",
    checkOut: "2025-07-21",
    status: "reserved",
    adults: 1,
    children: 0,
    totalAmount: 450,
  },
];

const initialReservations: Reservation[] = [
  {
    id: "1",
    guestId: "4",
    roomId: "11",
    checkIn: "2025-07-18",
    checkOut: "2025-07-21",
    status: "confirmed",
    totalAmount: 300,
    createdAt: "2025-07-15",
  },
];

const initialSettings: HotelSettings = {
  hotelName: "Grand Hotel",
  address: "123 Main Street, City, State 12345",
  phone: "+1 (555) 000-0000",
  email: "info@grandhotel.com",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  currency: "USD",
  taxRate: 0.1,
  roomPrices: {
    single: 100,
    double: 150,
    suite: 300,
    deluxe: 200,
  },
};

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [settings, setSettings] = useState<HotelSettings>(initialSettings);

  const updateRoomStatus = (roomId: string, status: RoomStatus, notes?: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, status, notes } : room
    ));
    toast.success(`Room status updated to ${status}`);
  };

  const assignGuestToRoom = (roomId: string, guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    const room = rooms.find(r => r.id === roomId);
    
    if (guest && room) {
      setRooms(prev => prev.map(r => 
        r.id === roomId ? { 
          ...r, 
          status: "occupied", 
          guestName: `${guest.firstName} ${guest.lastName}`,
          guestId: guestId,
          checkIn: guest.checkIn,
          checkOut: guest.checkOut
        } : r
      ));
      
      setGuests(prev => prev.map(g => 
        g.id === guestId ? { 
          ...g, 
          status: "checked-in", 
          roomNumber: room.number,
          roomId: roomId
        } : g
      ));
      
      toast.success(`Guest ${guest.firstName} ${guest.lastName} assigned to room ${room.number}`);
    }
  };

  const checkOutRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room && room.guestId) {
      setRooms(prev => prev.map(r => 
        r.id === roomId ? { 
          ...r, 
          status: "cleaning", 
          guestName: undefined,
          guestId: undefined,
          checkIn: undefined,
          checkOut: undefined
        } : r
      ));
      
      setGuests(prev => prev.map(g => 
        g.id === room.guestId ? { 
          ...g, 
          status: "checked-out", 
          roomNumber: undefined,
          roomId: undefined
        } : g
      ));
      
      toast.success(`Room ${room.number} checked out successfully`);
    }
  };

  const addGuest = (guest: Omit<Guest, "id">) => {
    const newGuest: Guest = {
      ...guest,
      id: Date.now().toString(),
    };
    setGuests(prev => [...prev, newGuest]);
    toast.success(`Guest ${guest.firstName} ${guest.lastName} added successfully`);
  };

  const updateGuest = (guestId: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(g => 
      g.id === guestId ? { ...g, ...updates } : g
    ));
    toast.success("Guest information updated");
  };

  const deleteGuest = (guestId: string) => {
    setGuests(prev => prev.filter(g => g.id !== guestId));
    toast.success("Guest deleted");
  };

  const checkInGuest = (guestId: string, roomId: string) => {
    assignGuestToRoom(roomId, guestId);
  };

  const checkOutGuest = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest && guest.roomId) {
      checkOutRoom(guest.roomId);
    }
  };

  const addReservation = (reservation: Omit<Reservation, "id" | "createdAt">) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReservations(prev => [...prev, newReservation]);
    toast.success("Reservation created successfully");
  };

  const updateReservation = (reservationId: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => 
      r.id === reservationId ? { ...r, ...updates } : r
    ));
    toast.success("Reservation updated");
  };

  const cancelReservation = (reservationId: string) => {
    setReservations(prev => prev.map(r => 
      r.id === reservationId ? { ...r, status: "cancelled" as const } : r
    ));
    toast.success("Reservation cancelled");
  };

  const updateSettings = (updates: Partial<HotelSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    toast.success("Settings updated successfully");
  };

  const getAvailableRooms = (checkIn: string, checkOut: string) => {
    return rooms.filter(room => room.status === "available");
  };

  const getTodaysCheckIns = () => {
    const today = new Date().toISOString().split('T')[0];
    return guests.filter(guest => guest.checkIn === today);
  };

  const getTodaysCheckOuts = () => {
    const today = new Date().toISOString().split('T')[0];
    return guests.filter(guest => guest.checkOut === today);
  };

  const getStats = () => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter(r => r.status === "occupied").length;
    const available = rooms.filter(r => r.status === "available").length;
    const maintenance = rooms.filter(r => r.status === "maintenance").length;
    const cleaning = rooms.filter(r => r.status === "cleaning").length;
    const checkInsToday = getTodaysCheckIns().length;
    const checkOutsToday = getTodaysCheckOuts().length;
    const revenue = guests
      .filter(g => g.status === "checked-in")
      .reduce((sum, g) => sum + (g.totalAmount || 0), 0);

    return {
      totalRooms,
      occupied,
      available,
      maintenance,
      cleaning,
      checkInsToday,
      checkOutsToday,
      revenue,
    };
  };

  return (
    <HotelContext.Provider value={{
      rooms,
      guests,
      reservations,
      settings,
      updateRoomStatus,
      assignGuestToRoom,
      checkOutRoom,
      addGuest,
      updateGuest,
      deleteGuest,
      checkInGuest,
      checkOutGuest,
      addReservation,
      updateReservation,
      cancelReservation,
      updateSettings,
      getAvailableRooms,
      getTodaysCheckIns,
      getTodaysCheckOuts,
      getStats,
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};