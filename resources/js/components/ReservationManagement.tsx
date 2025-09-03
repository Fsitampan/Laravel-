import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Search, Plus, Calendar, Users, DollarSign, X, Edit, Trash2 } from "lucide-react";
import { useHotel } from "./HotelContext";

interface ReservationFormData {
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  specialRequests: string;
  totalAmount: number;
}

export function ReservationManagement() {
  const {
    reservations,
    guests,
    rooms,
    addReservation,
    updateReservation,
    cancelReservation,
    getAvailableRooms
  } = useHotel();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [formData, setFormData] = useState<ReservationFormData>({
    guestId: "",
    roomId: "",
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    specialRequests: "",
    totalAmount: 0
  });

  const filteredReservations = reservations.filter(reservation => {
    const guest = guests.find(g => g.id === reservation.guestId);
    const room = rooms.find(r => r.id === reservation.roomId);
    
    const matchesSearch = 
      guest?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const upcomingReservations = reservations.filter(r => {
    const today = new Date();
    const checkIn = new Date(r.checkIn);
    return checkIn >= today && r.status === "confirmed";
  });

  const handleInputChange = (field: keyof ReservationFormData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total amount when room or dates change
      if (field === 'roomId' || field === 'checkIn' || field === 'checkOut') {
        const room = rooms.find(r => r.id === updated.roomId);
        if (room && updated.checkIn && updated.checkOut) {
          const days = Math.ceil((new Date(updated.checkOut).getTime() - new Date(updated.checkIn).getTime()) / (1000 * 60 * 60 * 24));
          updated.totalAmount = days * room.price;
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReservation) {
      updateReservation(editingReservation.id, {
        ...formData,
        status: "confirmed"
      });
      setEditingReservation(null);
    } else {
      addReservation({
        ...formData,
        status: "confirmed"
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      guestId: "",
      roomId: "",
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      specialRequests: "",
      totalAmount: 0
    });
    setShowForm(false);
    setEditingReservation(null);
  };

  const handleEdit = (reservation: any) => {
    setEditingReservation(reservation);
    setFormData({
      guestId: reservation.guestId,
      roomId: reservation.roomId,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      specialRequests: reservation.specialRequests || "",
      totalAmount: reservation.totalAmount
    });
    setShowForm(true);
  };

  const handleCancel = (reservationId: string) => {
    if (confirm("Are you sure you want to cancel this reservation?")) {
      cancelReservation(reservationId);
    }
  };

  const availableRooms = getAvailableRooms(formData.checkIn, formData.checkOut);

  const ReservationForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {editingReservation ? "Edit Reservation" : "New Reservation"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={resetForm}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guest">Guest *</Label>
              <Select value={formData.guestId} onValueChange={(value) => handleInputChange("guestId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map(guest => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.firstName} {guest.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="room">Room *</Label>
              <Select value={formData.roomId} onValueChange={(value) => handleInputChange("roomId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.number} - {room.type} (${room.price}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn">Check-in Date *</Label>
              <Input 
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleInputChange("checkIn", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Check-out Date *</Label>
              <Input 
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleInputChange("checkOut", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea 
              id="specialRequests"
              placeholder="Any special requirements..."
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span>Total Amount:</span>
            <span className="font-semibold">${formData.totalAmount}</span>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {editingReservation ? "Update Reservation" : "Create Reservation"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Reservation Management</h1>
          <p className="text-muted-foreground">Manage hotel reservations and bookings</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {showForm && <ReservationForm />}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Reservations ({reservations.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingReservations.length})</TabsTrigger>
          <TabsTrigger value="today">Today's Arrivals</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredReservations.map((reservation) => {
              const guest = guests.find(g => g.id === reservation.guestId);
              const room = rooms.find(r => r.id === reservation.roomId);
              
              return (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3>
                            {guest?.firstName} {guest?.lastName}
                          </h3>
                          <Badge variant={
                            reservation.status === "confirmed" ? "default" : 
                            reservation.status === "pending" ? "secondary" : 
                            "outline"
                          }>
                            {reservation.status}
                          </Badge>
                          <Badge variant="outline">
                            Room {room?.number}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {reservation.checkIn} - {reservation.checkOut}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${reservation.totalAmount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {room?.type} room
                          </div>
                        </div>

                        {reservation.specialRequests && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Special requests:</strong> {reservation.specialRequests}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {reservation.status === "confirmed" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancel(reservation.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(reservation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingReservations.map((reservation) => {
                    const guest = guests.find(g => g.id === reservation.guestId);
                    const room = rooms.find(r => r.id === reservation.roomId);
                    
                    return (
                      <div key={reservation.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div>
                          <h4>{guest?.firstName} {guest?.lastName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Room {room?.number} • {reservation.checkIn} - {reservation.checkOut}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">${reservation.totalAmount}</Badge>
                          <Badge variant="default">Confirmed</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming reservations</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Arrivals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Guests arriving today will be shown here based on their check-in date.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}