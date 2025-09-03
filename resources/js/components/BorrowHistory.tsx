import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Calendar,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Hourglass,
  FileText,
  Award,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
  X
} from "lucide-react";
import { useBPS } from "./BPSContext";
import { useAuth } from "./AuthContext";

interface BorrowHistoryProps {
  initialTab?: string;
}

export function BorrowHistory({ initialTab = "all" }: BorrowHistoryProps) {
  const { 
    borrowers, 
    rooms, 
    users,
    canViewAllHistory,
    canManageBorrowers,
    isReadOnly
  } = useBPS();
  const { user: authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedBorrower, setSelectedBorrower] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  const currentUserId = authUser?.id || "1";

  // Filter borrowers based on permissions
  const allBorrowers = canViewAllHistory() ? borrowers : borrowers.filter(b => b.createdBy === currentUserId);

  // Further filter based on search and filters
  const filteredBorrowers = allBorrowers.filter(borrower => {
    const matchesSearch = 
      borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (borrower.roomName && borrower.roomName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || borrower.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || borrower.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Separate borrowers by status for tabs
  const pendingBorrowers = filteredBorrowers.filter(b => b.status === "pending");
  const approvedBorrowers = filteredBorrowers.filter(b => b.status === "approved");
  const activeBorrowers = filteredBorrowers.filter(b => b.status === "active");
  const completedBorrowers = filteredBorrowers.filter(b => b.status === "completed");
  const rejectedBorrowers = filteredBorrowers.filter(b => b.status === "rejected");
  const cancelledBorrowers = filteredBorrowers.filter(b => b.status === "cancelled");

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "pending": { 
        label: "Menunggu Persetujuan", 
        className: "bg-orange-100 text-orange-800 border-orange-200",
        icon: Hourglass
      },
      "approved": { 
        label: "Disetujui", 
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle
      },
      "active": { 
        label: "Sedang Berlangsung", 
        className: "bg-green-100 text-green-800 border-green-200",
        icon: Clock
      },
      "completed": { 
        label: "Selesai", 
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Award
      },
      "rejected": { 
        label: "Ditolak", 
        className: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle
      },
      "cancelled": { 
        label: "Dibatalkan", 
        className: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle
      }
    };
    const stat = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      className: "bg-muted",
      icon: FileText
    };
    const IconComponent = stat.icon;
    return (
      <Badge className={stat.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {stat.label}
      </Badge>
    );
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

  const getApproverName = (approverId?: string) => {
    if (!approverId) return "N/A";
    const approver = users.find(u => u.id === approverId);
    return approver ? approver.name : "Unknown";
  };

  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return time ? `${dateStr} pukul ${time}` : dateStr;
  };

  const exportToCSV = () => {
    const csvData = filteredBorrowers.map(borrower => ({
      Nama: borrower.name,
      Email: borrower.email,
      Kategori: borrower.category,
      Departemen: borrower.department,
      Ruangan: getRoomName(borrower.roomId),
      "Tanggal Peminjaman": borrower.borrowDate,
      "Waktu Mulai": borrower.startTime || "N/A",
      "Waktu Selesai": borrower.endTime || "N/A",
      Status: borrower.status,
      Keperluan: borrower.purpose,
      "Diajukan Tanggal": borrower.createdAt,
      "Disetujui Oleh": getApproverName(borrower.approvedBy),
      "Alasan Penolakan": borrower.rejectionReason || "N/A"
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-peminjaman-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const renderBorrowerTable = (borrowers: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          {canViewAllHistory() && <TableHead>Peminjam</TableHead>}
          <TableHead>Ruangan</TableHead>
          <TableHead>Jadwal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Persetujuan</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {borrowers.map((borrower) => (
          <TableRow key={borrower.id} className="hover:bg-muted/50">
            {canViewAllHistory() && (
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
            )}
            
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
                  <span className="text-sm">{formatDateTime(borrower.borrowDate, borrower.startTime)}</span>
                </div>
                {borrower.endTime && (
                  <div className="text-xs text-muted-foreground pl-6">
                    Selesai: {borrower.endTime}
                  </div>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              {getStatusBadge(borrower.status)}
              {!canViewAllHistory() && (
                <div className="text-xs text-muted-foreground mt-1">
                  Diajukan: {borrower.createdAt}
                </div>
              )}
            </TableCell>

            <TableCell>
              <div className="text-xs space-y-1">
                {/* Approval Information */}
                {borrower.status === "approved" || borrower.status === "active" || borrower.status === "completed" ? (
                  <div className="text-green-700">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Disetujui</span>
                    </div>
                    {borrower.approvedBy && (
                      <div className="text-muted-foreground">
                        Oleh: {getApproverName(borrower.approvedBy)}
                      </div>
                    )}
                    {borrower.approvedAt && (
                      <div className="text-muted-foreground">
                        {borrower.approvedAt}
                      </div>
                    )}
                  </div>
                ) : borrower.status === "rejected" ? (
                  <div className="text-red-700">
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      <span>Ditolak</span>
                    </div>
                    {borrower.rejectedBy && (
                      <div className="text-muted-foreground">
                        Oleh: {getApproverName(borrower.rejectedBy)}
                      </div>
                    )}
                    {borrower.rejectedAt && (
                      <div className="text-muted-foreground">
                        {borrower.rejectedAt}
                      </div>
                    )}
                  </div>
                ) : borrower.status === "pending" ? (
                  <div className="text-orange-700">
                    <div className="flex items-center gap-1">
                      <Hourglass className="h-3 w-3" />
                      <span>Menunggu</span>
                    </div>
                    <div className="text-muted-foreground">
                      Diajukan: {borrower.createdAt}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedBorrower(borrower);
                  setShowDetailModal(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const getTabCounts = () => ({
    all: filteredBorrowers.length,
    pending: pendingBorrowers.length,
    approved: approvedBorrowers.length + activeBorrowers.length,
    completed: completedBorrowers.length,
    rejected: rejectedBorrowers.length + cancelledBorrowers.length
  });

  const tabCounts = getTabCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-500 p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-pink-300 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {canViewAllHistory() ? "Riwayat Peminjaman Ruangan" : "Riwayat Peminjaman Saya"}
            </h1>
            <p className="text-white/90">
              {canViewAllHistory() 
                ? "Kelola dan pantau seluruh riwayat peminjaman ruangan" 
                : "Lihat riwayat lengkap peminjaman ruangan Anda"}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{filteredBorrowers.length}</div>
            <div className="text-sm text-white/90">Total Riwayat</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-400 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Pending</p>
                <p className="text-2xl font-bold">{tabCounts.pending}</p>
              </div>
              <Hourglass className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-400 to-blue-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Disetujui</p>
                <p className="text-2xl font-bold">{tabCounts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-400 to-green-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Selesai</p>
                <p className="text-2xl font-bold">{tabCounts.completed}</p>
              </div>
              <Award className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-400 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Ditolak</p>
                <p className="text-2xl font-bold">{tabCounts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-400 to-purple-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90">Total</p>
                <p className="text-2xl font-bold">{tabCounts.all}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau ruangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Persetujuan</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="active">Sedang Berlangsung</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="pegawai">Pegawai</SelectItem>
                <SelectItem value="tamu">Tamu</SelectItem>
                <SelectItem value="anak-magang">Anak Magang</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table with Tabs */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="relative">
                  Semua
                  {tabCounts.all > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
                      {tabCounts.all}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {tabCounts.pending > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white text-xs">
                      {tabCounts.pending}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved" className="relative">
                  Disetujui
                  {tabCounts.approved > 0 && (
                    <Badge className="ml-2 bg-blue-500 text-white text-xs">
                      {tabCounts.approved}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="relative">
                  Selesai
                  {tabCounts.completed > 0 && (
                    <Badge className="ml-2 bg-green-500 text-white text-xs">
                      {tabCounts.completed}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="rejected" className="relative">
                  Ditolak
                  {tabCounts.rejected > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {tabCounts.rejected}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="p-6">
              {renderBorrowerTable(filteredBorrowers)}
            </TabsContent>

            <TabsContent value="pending" className="p-6">
              {renderBorrowerTable(pendingBorrowers)}
            </TabsContent>

            <TabsContent value="approved" className="p-6">
              {renderBorrowerTable([...approvedBorrowers, ...activeBorrowers])}
            </TabsContent>

            <TabsContent value="completed" className="p-6">
              {renderBorrowerTable(completedBorrowers)}
            </TabsContent>

            <TabsContent value="rejected" className="p-6">
              {renderBorrowerTable([...rejectedBorrowers, ...cancelledBorrowers])}
            </TabsContent>
          </Tabs>

          {filteredBorrowers.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Tidak ada riwayat</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Tidak ada riwayat yang sesuai dengan filter yang dipilih."
                  : "Belum ada riwayat peminjaman ruangan."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedBorrower && showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">Detail Riwayat Peminjaman</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Status and Timeline */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Status & Timeline</h3>
                  {getStatusBadge(selectedBorrower.status)}
                </div>
                
                <div className="space-y-3">
                  {/* Submission */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Peminjaman Diajukan</p>
                      <p className="text-sm text-muted-foreground">
                        Oleh: {getCreatorName(selectedBorrower.createdBy)} pada {selectedBorrower.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Approval/Rejection */}
                  {(selectedBorrower.status === "approved" || 
                    selectedBorrower.status === "active" || 
                    selectedBorrower.status === "completed") && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700">Peminjaman Disetujui</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedBorrower.approvedBy && (
                            <>Oleh: {getApproverName(selectedBorrower.approvedBy)}</>
                          )}
                          {selectedBorrower.approvedAt && (
                            <> pada {selectedBorrower.approvedAt}</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedBorrower.status === "rejected" && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-red-700">Peminjaman Ditolak</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedBorrower.rejectedBy && (
                            <>Oleh: {getApproverName(selectedBorrower.rejectedBy)}</>
                          )}
                          {selectedBorrower.rejectedAt && (
                            <> pada {selectedBorrower.rejectedAt}</>
                          )}
                        </p>
                        {selectedBorrower.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-800">
                              <strong>Alasan Penolakan:</strong> {selectedBorrower.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedBorrower.status === "pending" && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Hourglass className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-orange-700">Menunggu Persetujuan</p>
                        <p className="text-sm text-muted-foreground">
                          Sedang diproses oleh admin
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Informasi Peminjam</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Nama Lengkap</Label>
                    <p className="font-medium">{selectedBorrower.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedBorrower.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Telepon</Label>
                    <p className="font-medium">{selectedBorrower.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Kategori</Label>
                    <div className="mt-1">{getCategoryBadge(selectedBorrower.category)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Departemen</Label>
                    <p className="font-medium">{selectedBorrower.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Nomor Identitas</Label>
                    <p className="font-medium">{selectedBorrower.identification}</p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Informasi Peminjaman</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Ruangan</Label>
                    <p className="font-medium">{getRoomName(selectedBorrower.roomId)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Tanggal Peminjaman</Label>
                    <p className="font-medium">{formatDateTime(selectedBorrower.borrowDate)}</p>
                  </div>
                  {selectedBorrower.startTime && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Waktu Mulai</Label>
                      <p className="font-medium">{selectedBorrower.startTime} WIB</p>
                    </div>
                  )}
                  {selectedBorrower.endTime && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Waktu Selesai</Label>
                      <p className="font-medium">{selectedBorrower.endTime} WIB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose and Notes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Keperluan & Catatan</h3>
                <div>
                  <Label className="text-sm text-muted-foreground">Keperluan Peminjaman</Label>
                  <p className="font-medium">{selectedBorrower.purpose}</p>
                </div>
                {selectedBorrower.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Catatan Tambahan</Label>
                    <p className="font-medium">{selectedBorrower.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}