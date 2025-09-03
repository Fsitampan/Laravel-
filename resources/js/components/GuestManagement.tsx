import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Search, Plus, Phone, Mail, Calendar, Users, Edit, Trash2, X } from "lucide-react";
import { useHotel } from "./HotelContext";

interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  specialRequests: string;
}

export function GuestManagement() {
  const { 
    guests, 
    rooms, 
    addGuest, 
    updateGuest, 
    deleteGuest, 
    checkInGuest, 
    checkOutGuest,
    getTodaysCheckIns,
    getTodaysCheckOuts,
    getAvailableRooms
  } = useHotel();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("guests");
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    adults: 1,
    children: 0,
    specialRequests: ""
  });

  const filteredGuests = guests.filter(guest =>
    guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.roomNumber?.includes(searchTerm)
  );

  const todaysCheckIns = getTodaysCheckIns();
  const todaysCheckOuts = getTodaysCheckOuts();
  const availableRooms = getAvailableRooms(formData.checkIn, formData.checkOut);

  const handleInputChange = (field: keyof GuestFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGuest) {
      updateGuest(editingGuest.id, {
        ...formData,
        totalAmount: calculateTotal()
      });
      setEditingGuest(null);
    } else {
      addGuest({
        ...formData,
        status: "reserved",
        totalAmount: calculateTotal()
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      adults: 1,
      children: 0,
      specialRequests: ""
    });
    setShowForm(false);
    setEditingGuest(null);
  };

  const calculateTotal = () => {
    const days = Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return days * 150; // Default room rate
  };

  const handleEdit = (guest: any) => {
    setEditingGuest(guest);
    setFormData({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      checkIn: guest.checkIn,
      checkOut: guest.checkOut,
      adults: guest.adults,
      children: guest.children,
      specialRequests: guest.specialRequests || ""
    });
    setShowForm(true);
  };

  const handleDelete = (guestId: string) => {
    if (confirm("Are you sure you want to delete this guest?")) {
      deleteGuest(guestId);
    }
  };

  const handleCheckIn = (guestId: string) => {
    const availableRooms = getAvailableRooms("", "");
    if (availableRooms.length > 0) {
      checkInGuest(guestId, availableRooms[0].id);
    } else {
      alert("No available rooms for check-in");
    }
  };

  const GuestForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {editingGuest ? "Edit Guest" : "Add New Guest"}
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
              <Label htmlFor="firstName">First Name *</Label>
              <Input 
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input 
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input 
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adults">Adults</Label>
              <Select value={formData.adults.toString()} onValueChange={(value) => handleInputChange("adults", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Adult</SelectItem>
                  <SelectItem value="2">2 Adults</SelectItem>
                  <SelectItem value="3">3 Adults</SelectItem>
                  <SelectItem value="4">4 Adults</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="children">Children</Label>
              <Select value={formData.children.toString()} onValueChange={(value) => handleInputChange("children", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 Children</SelectItem>
                  <SelectItem value="1">1 Child</SelectItem>
                  <SelectItem value="2">2 Children</SelectItem>
                  <SelectItem value="3">3 Children</SelectItem>
                </SelectContent>
              </Select>
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
            <span>Estimated Total:</span>
            <span className="font-semibold">${calculateTotal()}</span>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {editingGuest ? "Update Guest" : "Add Guest"}
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
          <h1>Guest Management</h1>
          <p className="text-muted-foreground">Manage guest information and reservations</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {showForm && <GuestForm />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="guests">All Guests ({guests.length})</TabsTrigger>
          <TabsTrigger value="checkin">Today's Check-ins ({todaysCheckIns.length})</TabsTrigger>
          <TabsTrigger value="checkout">Today's Check-outs ({todaysCheckOuts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests by name, email, or room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4">
            {filteredGuests.map((guest) => (
              <Card key={guest.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3>{guest.firstName} {guest.lastName}</h3>
                        <Badge variant={guest.status === "checked-in" ? "default" : guest.status === "reserved" ? "secondary" : "outline"}>
                          {guest.status}
                        </Badge>
                        {guest.roomNumber && (
                          <Badge variant="outline">Room {guest.roomNumber}</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {guest.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {guest.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {guest.checkIn} - {guest.checkOut}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {guest.adults} adults, {guest.children} children
                        </div>
                      </div>

                      {guest.specialRequests && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Special requests:</strong> {guest.specialRequests}
                        </p>
                      )}

                      {guest.totalAmount && (
                        <p className="text-sm font-medium text-green-600">
                          Total: ${guest.totalAmount}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {guest.status === "reserved" && (
                        <Button size="sm" onClick={() => handleCheckIn(guest.id)}>
                          Check In
                        </Button>
                      )}
                      {guest.status === "checked-in" && (
                        <Button variant="outline" size="sm" onClick={() => checkOutGuest(guest.id)}>
                          Check Out
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEdit(guest)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(guest.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checkin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysCheckIns.length > 0 ? (
                <div className="space-y-4">
                  {todaysCheckIns.map((guest) => (
                    <div key={guest.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div>
                        <h4>{guest.firstName} {guest.lastName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {guest.adults} adults, {guest.children} children
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={guest.status === "checked-in" ? "default" : "secondary"}>
                          {guest.status}
                        </Badge>
                        {guest.roomNumber && (
                          <Badge variant="outline">Room {guest.roomNumber}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No check-ins scheduled for today</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Check-outs</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysCheckOuts.length > 0 ? (
                <div className="space-y-4">
                  {todaysCheckOuts.map((guest) => (
                    <div key={guest.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div>
                        <h4>{guest.firstName} {guest.lastName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Room {guest.roomNumber} • ${guest.totalAmount}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={guest.status === "checked-out" ? "outline" : "destructive"}>
                          {guest.status}
                        </Badge>
                        {guest.status === "checked-in" && (
                          <Button size="sm" variant="outline" onClick={() => checkOutGuest(guest.id)}>
                            Check Out
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No check-outs scheduled for today</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}