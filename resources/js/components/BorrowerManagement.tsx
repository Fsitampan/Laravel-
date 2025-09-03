import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Search, UserPlus, Edit, Trash2, Eye, X, Clock, MapPin, Calendar, CheckCircle, XCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { useBPS } from "./BPSContext";
import { useAuth } from "./AuthContext";

interface NewBorrowerData {
  name: string;
  email: string;
  phone: string;
  category: "pegawai" | "tamu" | "anak-magang";
  department: string;
  identification: string;
  borrowDate: string;
  returnDate: string;
  startTime: string;
  endTime: string;
  roomId: string;
  purpose: string;
  notes: string;
}

interface BorrowerManagementProps {
  initialShowForm?: boolean;
}

export function BorrowerManagement({ initialShowForm = false }: BorrowerManagementProps) {
  const { 
    borrowers, 
    rooms,
    users,
    addBorrower, 
    updateBorrower, 
    deleteBorrower,
    approveBorrowing,
    rejectBorrowing,
    returnBorrowing,
    canManageBorrowers,
    canApproveRejects,
    canCreateBorrowings,
    isReadOnly,
    getAvailableRooms 
  } = useBPS();
  const { user: authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(initialShowForm);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<any>(null);
  const [newBorrowerData, setNewBorrowerData] = useState<NewBorrowerData>({
    name: "",
    email: "",
    phone: "",
    category: "pegawai",
    department: "",
    identification: "",
    borrowDate: "",
    returnDate: "",
    startTime: "",
    endTime: "",
    roomId: "",
    purpose: "",
    notes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredBorrowers = borrowers.filter(borrower =>
    borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableRooms = getAvailableRooms();
  const selectedRoom = rooms.find(r => r.id === newBorrowerData.roomId);

  // Generate time options (07:00 - 18:00, every 30 minutes)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 7; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newBorrowerData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!newBorrowerData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(newBorrowerData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!newBorrowerData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    }

    if (!newBorrowerData.department.trim()) {
      newErrors.department = "Departemen wajib diisi";
    }

    if (!newBorrowerData.identification.trim()) {
      newErrors.identification = "Nomor identitas wajib diisi";
    }

    if (!newBorrowerData.borrowDate) {
      newErrors.borrowDate = "Tanggal peminjaman wajib diisi";
    }

    if (!newBorrowerData.returnDate) {
      newErrors.returnDate = "Tanggal pengembalian wajib diisi";
    } else if (newBorrowerData.borrowDate && newBorrowerData.returnDate < newBorrowerData.borrowDate) {
      newErrors.returnDate = "Tanggal pengembalian tidak boleh sebelum tanggal peminjaman";
    }

    if (!newBorrowerData.startTime) {
      newErrors.startTime = "Waktu mulai wajib diisi";
    }

    if (!newBorrowerData.endTime) {
      newErrors.endTime = "Waktu selesai wajib diisi";
    } else if (newBorrowerData.startTime && newBorrowerData.endTime <= newBorrowerData.startTime) {
      newErrors.endTime = "Waktu selesai harus setelah waktu mulai";
    }

    if (!newBorrowerData.roomId) {
      newErrors.roomId = "Ruangan wajib dipilih";
    }

    if (!newBorrowerData.purpose.trim()) {
      newErrors.purpose = "Keperluan wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBorrower = () => {
    if (!validateForm()) {
      return;
    }

    // Get room name for the borrowing
    const room = rooms.find(r => r.id === newBorrowerData.roomId);
    const roomName = room ? room.name : "";

    addBorrower({
      ...newBorrowerData,
      roomName,
      createdBy: authUser?.id || "1"
    });
    
    setShowAddForm(false);
    setNewBorrowerData({
      name: "",
      email: "",
      phone: "",
      category: "pegawai",
      department: "",
      identification: "",
      borrowDate: "",
      returnDate: "",
      startTime: "",
      endTime: "",
      roomId: "",
      purpose: "",
      notes: ""
    });
    setErrors({});
  };

  const handleDeleteBorrower = () => {
    if (selectedBorrower) {
      deleteBorrower(selectedBorrower.id);
      setShowDeleteDialog(false);
      setSelectedBorrower(null);
    }
  };

  const handleApproveBorrowing = (borrowerId: string) => {
    approveBorrowing(borrowerId);
  };

  const handleRejectBorrowing = (borrowerId: string, reason: string = "Ditolak oleh admin") => {
    rejectBorrowing(borrowerId, reason);
  };

  const handleReturnBorrowing = (borrowerId: string) => {
    returnBorrowing(borrowerId);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "pending": { label: "Menunggu Persetujuan", className: "bg-orange-100 text-orange-800 border-orange-200" },
      "approved": { label: "Disetujui", className: "bg-blue-100 text-blue-800 border-blue-200" },
      "active": { label: "Sedang Berlangsung", className: "bg-green-100 text-green-800 border-green-200" },
      "completed": { label: "Selesai", className: "bg-gray-100 text-gray-800 border-gray-200" },
      "rejected": { label: "Ditolak", className: "bg-red-100 text-red-800 border-red-200" },
      "cancelled": { label: "Dibatalkan", className: "bg-red-100 text-red-800 border-red-200" }
    };
    const stat = statusMap[status as keyof typeof statusMap] || { label: status, className: "bg-muted" };
    return <Badge className={stat.className}>{stat.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      "pegawai": { label: "Pegawai", className: "category-employee" },
      "tamu": { label: "Tamu", className: "category-guest" },
      "anak-magang": { label: "Anak Magang", className: "category-intern" }
    };
    const cat = categoryMap[category as keyof typeof categoryMap] || { label: category, className: "bg-muted" };
    return <Badge className={cat.className}>{cat.label}</Badge>;
  };

  const getRoomName = (roomId?: string) => {
    if (!roomId) return "Belum ditentukan";
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : "Ruang tidak ditemukan";
  };

  const getCreatorName = (createdBy: string) => {
    const creator = users.find(u => u.id === createdBy);
    return creator ? creator.name : "Unknown";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belum dikembalikan";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return timeString + " WIB";
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-primary mb-2">
              {canManageBorrowers() ? "Manajemen Peminjam" : "Peminjaman Ruangan"}
            </h1>
            <p className="text-muted-foreground">
              {canManageBorrowers() ? 
                "Kelola data peminjam dan status peminjaman ruangan" :
                "Ajukan permintaan peminjaman ruangan"}
            </p>
          </div>
          {canCreateBorrowings() && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-primary to-primary-dark"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Peminjaman
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan nama, email, atau departemen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Borrowers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Peminjaman ({filteredBorrowers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peminjam</TableHead>
                <TableHead>Ruangan</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diajukan</TableHead>
                <TableHead>Dikembalikan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBorrowers.map((borrower) => (
                <TableRow key={borrower.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {borrower.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{borrower.name}</p>
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(borrower.category)}
                          <span className="text-xs text-muted-foreground">{borrower.department}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getRoomName(borrower.roomId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{borrower.borrowDate}</span>
                      </div>
                      {(borrower.startTime || borrower.endTime) && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(borrower.startTime)} - {formatTime(borrower.endTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(borrower.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      <p>Oleh: {getCreatorName(borrower.createdBy)}</p>
                      <p>{borrower.createdAt}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {borrower.status === "completed" && borrower.returnedAt ? (
                        <div className="text-green-700">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Dikembalikan</span>
                          </div>
                          <p className="text-muted-foreground">{formatDate(borrower.returnedAt)}</p>
                          {borrower.returnedBy && (
                            <p className="text-muted-foreground">
                              Oleh: {getCreatorName(borrower.returnedBy)}
                            </p>
                          )}
                        </div>
                      ) : borrower.status === "active" ? (
                        <div className="text-orange-700">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Belum dikembalikan</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <span>-</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBorrower(borrower)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Return Action - Only for active borrowings */}
                      {canManageBorrowers() && borrower.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReturnBorrowing(borrower.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Approval Actions */}
                      {canApproveRejects() && borrower.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveBorrowing(borrower.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectBorrowing(borrower.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Delete Action */}
                      {canManageBorrowers() && !isReadOnly() && borrower.status !== "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBorrower(borrower);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBorrowers.length === 0 && (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada peminjaman</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tidak ada peminjaman yang sesuai dengan pencarian." : "Belum ada peminjaman ruangan."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Borrower Modal - Same as before */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-primary">Tambah Peminjaman Ruangan Baru</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Informasi Peminjam</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={newBorrowerData.name}
                      onChange={(e) => setNewBorrowerData(prev => ({ ...prev, name: e.target.value }))}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newBorrowerData.email}
                      onChange={(e) => setNewBorrowerData(prev => ({ ...prev, email: e.target.value }))}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      value={newBorrowerData.phone}
                      onChange={(e) => setNewBorrowerData(prev => ({ ...prev, phone: e.target.value }))}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Kategori *</Label>
                    <Select
                      value={newBorrowerData.category}
                      onValueChange={(value: "pegawai" | "tamu" | "anak-magang") => 
                        setNewBorrowerData(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pegawai">Pegawai</SelectItem>
                        <SelectItem value="tamu">Tamu</SelectItem>
                        <SelectItem value="anak-magang">Anak Magang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Departemen/Instansi *</Label>
                    <Input
                      id="department"
                      value={newBorrowerData.department}
                      onChange={(e) => setNewBorrowerData(prev => ({ ...prev, department: e.target.value }))}
                      className={errors.department ? "border-destructive" : ""}
                    />
                    {errors.department && <p className="text-sm text-destructive mt-1">{errors.department}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="identification">Nomor Identitas (KTP/SIM) *</Label>
                    <Input
                      id="identification"
                      value={newBorrowerData.identification}
                      onChange={(e) => setNewBorrowerData(prev => ({ ...prev, identification: e.target.value }))}
                      className={errors.identification ? "border-destructive" : ""}
                    />
                    {errors.identification && <p className="text-sm text-destructive mt-1">{errors.identification}</p>}
                  </div>
                </div>
              </div>

              {/* Room and Schedule Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Informasi Ruangan & Jadwal</h3>
                
                <div>
                  <Label htmlFor="roomId">Pilih Ruangan *</Label>
                  <Select
                    value={newBorrowerData.roomId}
                    onValueChange={(value) => setNewBorrowerData(prev => ({ ...prev, roomId: value }))}
                  >
                    <SelectTrigger className={errors.roomId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Pilih ruangan yang tersedia" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{room.name}</span>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-xs text-muted-foreground">
                                Kapasitas: {room.capacity}
                              </span>
                              <Badge className="status-available text-xs">Tersedia</Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                      {availableRooms.length === 0 && (
                        <SelectItem value="" disabled>
                          Tidak ada ruangan yang tersedia
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.roomId && <p className="text-sm text-destructive mt-1">{errors.roomId}</p>}
                  
                  {/* Room Details */}
                  {selectedRoom && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm">
                        <p><strong>Kapasitas:</strong> {selectedRoom.capacity} orang</p>
                        <p><strong>Fasilitas:</strong> {selectedRoom.facilities.join(", ")}</p>
                        {selectedRoom.description && (
                          <p><strong>Deskripsi:</strong> {selectedRoom.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="borrowDate">Tanggal Peminjaman *</Label>
                    <Input
                      id="borrowDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={newBorrowerData.borrowDate}
                      onChange={(e) => setNewBorrowerData(prev => ({ ...prev, borrowDate: e.target.value }))}
                      className={errors.borrowDate ? "border-destructive" : ""}
                    />
                    {errors.borrowDate && <p className="text-sm text-destructive mt-1">{errors.borrowDate}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="returnDate">Tanggal Pengembalian *</Label>
                    <Input
                      id="returnDate"
                      type="date"
                      min={newBorrowerData.borrowDate || new Date().toISOString().split('T')[0]}
                      value={newBorrowerData.returnDate}
                      onChange={(e) => setNewBorrowerData(prev => ({ ...prev, returnDate: e.target.value }))}
                      className={errors.returnDate ? "border-destructive" : ""}
                    />
                    {errors.returnDate && <p className="text-sm text-destructive mt-1">{errors.returnDate}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Waktu Mulai *</Label>
                    <Select
                      value={newBorrowerData.startTime}
                      onValueChange={(value) => setNewBorrowerData(prev => ({ ...prev, startTime: value }))}
                    >
                      <SelectTrigger className={errors.startTime ? "border-destructive" : ""}>
                        <SelectValue placeholder="Pilih waktu mulai" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time} WIB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.startTime && <p className="text-sm text-destructive mt-1">{errors.startTime}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="endTime">Waktu Selesai *</Label>
                    <Select
                      value={newBorrowerData.endTime}
                      onValueChange={(value) => setNewBorrowerData(prev => ({ ...prev, endTime: value }))}
                    >
                      <SelectTrigger className={errors.endTime ? "border-destructive" : ""}>
                        <SelectValue placeholder="Pilih waktu selesai" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions
                          .filter(time => !newBorrowerData.startTime || time > newBorrowerData.startTime)
                          .map((time) => (
                          <SelectItem key={time} value={time}>
                            {time} WIB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.endTime && <p className="text-sm text-destructive mt-1">{errors.endTime}</p>}
                  </div>
                </div>
              </div>

              {/* Purpose and Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Keperluan & Catatan</h3>
                
                <div>
                  <Label htmlFor="purpose">Keperluan Peminjaman *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Contoh: Rapat koordinasi tim, presentasi project, workshop training..."
                    value={newBorrowerData.purpose}
                    onChange={(e) => setNewBorrowerData(prev => ({ ...prev, purpose: e.target.value }))}
                    className={errors.purpose ? "border-destructive" : ""}
                  />
                  {errors.purpose && <p className="text-sm text-destructive mt-1">{errors.purpose}</p>}
                </div>

                <div>
                  <Label htmlFor="notes">Catatan Tambahan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Catatan atau permintaan khusus (opsional)"
                    value={newBorrowerData.notes}
                    onChange={(e) => setNewBorrowerData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Informasi Penting:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Permintaan peminjaman akan diproses oleh admin terlebih dahulu</li>
                      <li>• Pastikan waktu yang dipilih tidak bertabrakan dengan kegiatan lain</li>
                      <li>• Harap datang tepat waktu sesuai jadwal yang telah ditentukan</li>
                      <li>• Hubungi admin jika ada perubahan atau pembatalan</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddBorrower} className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajukan Peminjaman
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBorrower && !showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-primary">Detail Peminjaman</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedBorrower(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {selectedBorrower.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedBorrower.name}</h3>
                  <p className="text-muted-foreground">{selectedBorrower.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryBadge(selectedBorrower.category)}
                    {getStatusBadge(selectedBorrower.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nomor Telepon</Label>
                  <p className="text-sm">{selectedBorrower.phone}</p>
                </div>
                <div>
                  <Label>Departemen</Label>
                  <p className="text-sm">{selectedBorrower.department}</p>
                </div>
                <div>
                  <Label>Nomor Identitas</Label>
                  <p className="text-sm">{selectedBorrower.identification}</p>
                </div>
                <div>
                  <Label>Ruangan</Label>
                  <p className="text-sm">{getRoomName(selectedBorrower.roomId)}</p>
                </div>
                <div>
                  <Label>Tanggal Peminjaman</Label>
                  <p className="text-sm">{selectedBorrower.borrowDate}</p>
                </div>
                <div>
                  <Label>Tanggal Pengembalian</Label>
                  <p className="text-sm">{selectedBorrower.returnDate}</p>
                </div>
                {selectedBorrower.startTime && (
                  <div>
                    <Label>Waktu Mulai</Label>
                    <p className="text-sm">{formatTime(selectedBorrower.startTime)}</p>
                  </div>
                )}
                {selectedBorrower.endTime && (
                  <div>
                    <Label>Waktu Selesai</Label>
                    <p className="text-sm">{formatTime(selectedBorrower.endTime)}</p>
                  </div>
                )}
              </div>

              <div>
                <Label>Keperluan</Label>
                <p className="text-sm">{selectedBorrower.purpose}</p>
              </div>

              {selectedBorrower.notes && (
                <div>
                  <Label>Catatan</Label>
                  <p className="text-sm">{selectedBorrower.notes}</p>
                </div>
              )}

              {selectedBorrower.rejectionReason && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <Label className="text-red-800">Alasan Penolakan</Label>
                  <p className="text-sm text-red-700">{selectedBorrower.rejectionReason}</p>
                </div>
              )}

              {selectedBorrower.returnedAt && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <Label className="text-green-800">Informasi Pengembalian</Label>
                  <p className="text-sm text-green-700">
                    Dikembalikan pada: {formatDate(selectedBorrower.returnedAt)}
                  </p>
                  {selectedBorrower.returnedBy && (
                    <p className="text-sm text-green-700">
                      Oleh: {getCreatorName(selectedBorrower.returnedBy)}
                    </p>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground border-t pt-4">
                <p>Diajukan oleh: {getCreatorName(selectedBorrower.createdBy)} pada {selectedBorrower.createdAt}</p>
                {selectedBorrower.approvedBy && (
                  <p>Disetujui oleh: {getCreatorName(selectedBorrower.approvedBy)} pada {selectedBorrower.approvedAt}</p>
                )}
                {selectedBorrower.rejectedBy && (
                  <p>Ditolak oleh: {getCreatorName(selectedBorrower.rejectedBy)} pada {selectedBorrower.rejectedAt}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Peminjaman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus peminjaman dari <strong>{selectedBorrower?.name}</strong>?
              <br />
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteBorrower}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Peminjaman
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}