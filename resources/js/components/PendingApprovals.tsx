import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin, FileText, Eye, AlertTriangle, Hourglass, UserCheck } from "lucide-react";
import { useBPS } from "./BPSContext";
import { useAuth } from "./AuthContext";

export function PendingApprovals() {
  const { 
    borrowers, 
    rooms, 
    users,
    approveBorrowing, 
    rejectBorrowing, 
    canApproveRejects,
    getPendingBorrows 
  } = useBPS();
  const { user: authUser } = useAuth();
  const [selectedBorrowing, setSelectedBorrowing] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Determine if user is admin/super-admin or regular user
  const isAdminUser = canApproveRejects();
  const currentUserId = authUser?.id || "1";

  // Get appropriate borrowings based on user role
  const allPendingBorrowings = borrowers.filter(b => b.status === "pending");
  const userPendingBorrowings = allPendingBorrowings.filter(b => b.createdBy === currentUserId);
  
  // Admin sees all pending, User sees only their own
  const pendingBorrowings = isAdminUser ? allPendingBorrowings : userPendingBorrowings;
  const pendingHistory = getPendingBorrows();

  const handleApprove = () => {
    if (!selectedBorrowing) return;
    approveBorrowing(selectedBorrowing.id);
    setShowApproveDialog(false);
    setSelectedBorrowing(null);
  };

  const handleReject = () => {
    if (!selectedBorrowing || !rejectionReason.trim()) return;
    rejectBorrowing(selectedBorrowing.id, rejectionReason);
    setShowRejectDialog(false);
    setSelectedBorrowing(null);
    setRejectionReason("");
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

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      "pegawai": { label: "Pegawai", className: "category-employee" },
      "tamu": { label: "Tamu", className: "category-guest" },
      "anak-magang": { label: "Anak Magang", className: "category-intern" }
    };
    const cat = categoryMap[category as keyof typeof categoryMap] || { label: category, className: "bg-muted" };
    return <Badge className={cat.className}>{cat.label}</Badge>;
  };

  // Different header content for admin vs user
  const getHeaderContent = () => {
    if (isAdminUser) {
      return {
        title: "Persetujuan Peminjaman Ruangan",
        description: "Kelola dan proses persetujuan permintaan peminjaman ruangan",
        count: allPendingBorrowings.length,
        countLabel: "Menunggu Persetujuan"
      };
    } else {
      return {
        title: "Status Peminjaman Saya",
        description: "Lihat status persetujuan untuk permintaan peminjaman ruangan Anda",
        count: userPendingBorrowings.length,
        countLabel: "Menunggu Persetujuan"
      };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-primary mb-2">{headerContent.title}</h1>
            <p className="text-muted-foreground">{headerContent.description}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{headerContent.count}</div>
            <div className="text-sm text-muted-foreground">{headerContent.countLabel}</div>
          </div>
        </div>
      </div>

      {/* Different empty states based on user role */}
      {pendingBorrowings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            {isAdminUser ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak Ada Peminjaman Pending</h3>
                <p className="text-muted-foreground">
                  Semua permintaan peminjaman telah diproses. Bagus! 🎉
                </p>
              </>
            ) : (
              <>
                <Hourglass className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak Ada Peminjaman Pending</h3>
                <p className="text-muted-foreground">
                  Anda belum memiliki peminjaman yang menunggu persetujuan.
                  <br />
                  Buat peminjaman baru di menu "Peminjaman".
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAdminUser ? (
                <>
                  <UserCheck className="h-5 w-5 text-orange-500" />
                  Daftar Peminjaman Menunggu Persetujuan ({pendingBorrowings.length})
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-orange-500" />
                  Peminjaman Saya Menunggu Persetujuan ({pendingBorrowings.length})
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdminUser && <TableHead>Peminjam</TableHead>}
                  <TableHead>Ruangan</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Keperluan</TableHead>
                  <TableHead>Diajukan</TableHead>
                  <TableHead className="text-right">
                    {isAdminUser ? "Aksi" : "Status"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBorrowings.map((borrowing) => (
                  <TableRow key={borrowing.id} className="hover:bg-muted/50">
                    {/* Show borrower info only for admin */}
                    {isAdminUser && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {borrowing.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{borrowing.name}</p>
                            <div className="flex items-center gap-2">
                              {getCategoryBadge(borrowing.category)}
                              <span className="text-xs text-muted-foreground">{borrowing.department}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{getRoomName(borrowing.roomId)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDateTime(borrowing.borrowDate, borrowing.startTime)}</span>
                        </div>
                        {borrowing.endTime && (
                          <div className="text-xs text-muted-foreground pl-6">
                            Selesai: {borrowing.endTime}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate" title={borrowing.purpose}>
                          {borrowing.purpose}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {isAdminUser ? (
                          <>
                            <p>Oleh: {getCreatorName(borrowing.createdBy)}</p>
                            <p>{borrowing.createdAt}</p>
                          </>
                        ) : (
                          <>
                            <p>Diajukan: {borrowing.createdAt}</p>
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              Menunggu
                            </Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBorrowing(borrowing);
                            setShowDetailDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {/* Admin-only approval actions */}
                        {isAdminUser && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBorrowing(borrowing);
                                setShowApproveDialog(true);
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBorrowing(borrowing);
                                setShowRejectDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* User-specific info for regular users */}
      {!isAdminUser && pendingBorrowings.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informasi Status Persetujuan:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Peminjaman Anda sedang diproses oleh Admin</li>
                  <li>• Anda akan mendapat notifikasi saat status berubah</li>
                  <li>• Jika disetujui, Anda dapat langsung menggunakan ruangan sesuai jadwal</li>
                  <li>• Jika ada perubahan, hubungi Admin melalui menu Settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      {selectedBorrowing && showDetailDialog && (
        <AlertDialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detail Peminjaman Ruangan
              </AlertDialogTitle>
              <AlertDialogDescription>
                Berikut adalah detail lengkap peminjaman ruangan yang sedang menunggu persetujuan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {/* Move the complex content outside of AlertDialogDescription */}
            <div className="px-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nama Peminjam</Label>
                  <p className="font-medium">{selectedBorrowing.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedBorrowing.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Telepon</Label>
                  <p className="font-medium">{selectedBorrowing.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Kategori</Label>
                  <div className="mt-1">{getCategoryBadge(selectedBorrowing.category)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Departemen</Label>
                  <p className="font-medium">{selectedBorrowing.department}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Identitas</Label>
                  <p className="font-medium">{selectedBorrowing.identification}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Ruangan</Label>
                    <p className="font-medium">{getRoomName(selectedBorrowing.roomId)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tanggal Peminjaman</Label>
                    <p className="font-medium">{formatDateTime(selectedBorrowing.borrowDate)}</p>
                  </div>
                  {selectedBorrowing.startTime && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Waktu Mulai</Label>
                      <p className="font-medium">{selectedBorrowing.startTime}</p>
                    </div>
                  )}
                  {selectedBorrowing.endTime && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Waktu Selesai</Label>
                      <p className="font-medium">{selectedBorrowing.endTime}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Keperluan</Label>
                <p className="font-medium">{selectedBorrowing.purpose}</p>
              </div>

              {selectedBorrowing.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Catatan</Label>
                  <p className="font-medium">{selectedBorrowing.notes}</p>
                </div>
              )}

              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-xs text-muted-foreground">Diajukan oleh</Label>
                <p className="font-medium">{getCreatorName(selectedBorrowing.createdBy)}</p>
                <p className="text-sm text-muted-foreground">{selectedBorrowing.createdAt}</p>
              </div>

              {/* Status info for regular users */}
              {!isAdminUser && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <Label className="text-orange-800 font-medium">Status Saat Ini</Label>
                  </div>
                  <p className="text-sm text-orange-700">
                    Peminjaman Anda sedang menunggu persetujuan dari Admin. 
                    Anda akan mendapat notifikasi segera setelah diproses.
                  </p>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Tutup
              </Button>
              
              {/* Admin-only action buttons */}
              {isAdminUser && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowApproveDialog(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setujui
                  </Button>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Admin-only Approve Dialog */}
      {isAdminUser && (
        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-green-600">Setujui Peminjaman Ruangan</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menyetujui peminjaman ruangan untuk {selectedBorrowing?.name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {/* Move complex content outside AlertDialogDescription */}
            <div className="px-6">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Ruangan:</strong> {getRoomName(selectedBorrowing?.roomId)}</p>
                  <p><strong>Tanggal:</strong> {selectedBorrowing && formatDateTime(selectedBorrowing.borrowDate, selectedBorrowing.startTime)}</p>
                  <p><strong>Keperluan:</strong> {selectedBorrowing?.purpose}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Setelah disetujui, peminjam dapat menggunakan ruangan sesuai jadwal.
              </p>
            </div>

            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Ya, Setujui
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Admin-only Reject Dialog */}
      {isAdminUser && (
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Tolak Peminjaman Ruangan</AlertDialogTitle>
              <AlertDialogDescription>
                Anda akan menolak peminjaman ruangan untuk {selectedBorrowing?.name}. Mohon berikan alasan penolakan yang jelas:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="px-6">
              <Textarea
                placeholder="Contoh: Ruangan sudah dipesan untuk kegiatan lain pada waktu yang sama..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Batal
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Tolak Peminjaman
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}