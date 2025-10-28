import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
    AlertCircle, 
    Calendar as CalendarIcon, 
    Clock, 
    Users, 
    MapPin, 
    Plus, 
    Minus, 
    Building2,
    ArrowLeft,
    Save,
    Camera,
    CheckCircle,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDateTime } from '@/lib/utils';
import type { PageProps, Room, CreateBorrowingData } from '@/types';
import { Link } from '@inertiajs/react';

interface CreateBorrowingPageProps extends PageProps {
    rooms: Room[];
    selectedRoom?: Room;
}

// Helper untuk mendapatkan gambar ruangan
const getRoomImage = (room: Room): string => {
    if (room.image_url) return room.image_url;
    if (room.image) return `/storage/${room.image}`;
    return "https://placehold.co/600x400/e5e7eb/6b7280?text=No+Image";
};

export default function CreateBorrowing({ auth, rooms, selectedRoom }: CreateBorrowingPageProps) {
    const [selectedRoom_state, setSelectedRoom] = useState<Room | null>(selectedRoom || null);
    const [equipmentList, setEquipmentList] = useState<string[]>(['']);
    const [selectedLayoutPreview, setSelectedLayoutPreview] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm<Record<string, any>>({
        room_id: selectedRoom?.id || 0,
        borrower_name: auth.user.name || '',
        borrower_phone: auth.user.phone || '',
        borrower_category: auth.user.category || 'pegawai',
        borrower_department: auth.user.department || '',
        borrower_institution: '',
        purpose: '',
        borrow_date: '',
        start_time: '',
        end_time: '',
        return_date: '',
        participant_count: 1,
        equipment_needed: [],
        notes: '',
        is_recurring: false,
        recurring_pattern: '',
        recurring_end_date: '',
        layout_choice: '', 
    });

    // Filter available rooms
    const availableRooms = rooms.filter(room => 
        room.status === 'tersedia' && room.is_active
    );

    // ✅ Fungsi untuk menghitung durasi peminjaman
    const getDuration = () => {
        if (!data.borrow_date || !data.start_time || !data.end_time) {
            return '--';
        }

        try {
            // Gabungkan tanggal dan waktu
            const startDateTime = new Date(`${data.borrow_date}T${data.start_time}`);
            const endDate = data.return_date || data.borrow_date;
            const endDateTime = new Date(`${endDate}T${data.end_time}`);

            // Hitung selisih dalam milidetik
            const diffMs = endDateTime.getTime() - startDateTime.getTime();
            
            if (diffMs <= 0) {
                return '--';
            }

            // Konversi ke jam dan menit
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            if (hours === 0 && minutes === 0) {
                return '--';
            }

            if (hours === 0) {
                return `${minutes} menit`;
            }

            if (minutes === 0) {
                return `${hours} jam`;
            }

            return `${hours} jam ${minutes} menit`;
        } catch (error) {
            console.error('Error calculating duration:', error);
            return '--';
        }
    };

// Ganti handleSubmit Anda dengan ini:

     const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMIT ===');
    console.log('Form Data:', data);
    
    // Basic validation
    if (!data.room_id || data.room_id === 0) {
        toast.error('Silakan pilih ruangan');
        return;
    }
    
    if (!data.borrower_name.trim()) {
        toast.error('Nama peminjam harus diisi');
        return;
    }
    
    if (!data.borrower_phone.trim()) {
        toast.error('Nomor telepon harus diisi');
        return;
    }
    
    if (!data.purpose.trim()) {
        toast.error('Tujuan peminjaman harus diisi');
        return;
    }
    
    if (!data.borrow_date) {
        toast.error('Tanggal peminjaman harus diisi');
        return;
    }
    
    if (!data.start_time) {
        toast.error('Jam mulai harus diisi');
        return;
    }

    if (!data.end_time) {
        toast.error('Jam selesai harus diisi');
        return;
    }

    // Validate tanggal tidak di masa lalu
    const borrowDate = new Date(`${data.borrow_date}T${data.start_time}`);
    const now = new Date();
    if (borrowDate < now) {
        toast.error('Waktu peminjaman tidak boleh di masa lampau');
        return;
    }
    
    // Validate end time is after start time
    const endDate = data.return_date || data.borrow_date;
    const endDateTime = new Date(`${endDate}T${data.end_time}`);
    if (endDateTime <= borrowDate) {
        toast.error('Waktu selesai harus setelah waktu mulai');
        return;
    }
    
    // Validate participant count doesn't exceed room capacity
    if (selectedRoom_state && data.participant_count > selectedRoom_state.capacity) {
        toast.error(`Jumlah peserta tidak boleh melebihi kapasitas ruangan (${selectedRoom_state.capacity} orang)`);
        return;
    }
    
    if (data.is_recurring) {
        if (!data.recurring_pattern) {
            toast.error('Pola pengulangan harus dipilih untuk peminjaman berulang');
            return;
        }
        if (!data.recurring_end_date) {
            toast.error('Tanggal berakhir harus diisi untuk peminjaman berulang');
            return;
        }
    }

    console.log('✅ All validation passed');
    console.log('📤 Submitting to:', route('Borrowings.store'));

    // ✅ SOLUSI TERBAIK: Gunakan post() dari useForm
    // Data sudah ada di state, langsung post aja
    post(route('Borrowings.store'), {
        preserveScroll: true,
        onSuccess: () => {
            console.log('✅ Submit success!');
            toast.success('Peminjaman berhasil diajukan');
            // Redirect ke index
            router.visit(route('Borrowings.Index'));
        },
        onError: (errors) => {
            console.error('❌ Form errors:', errors);
            
            // Log setiap error
            Object.entries(errors).forEach(([field, message]) => {
                console.error(`Error ${field}:`, message);
            });
            
            // Tampilkan error pertama
            const firstError = Object.values(errors)[0] as string;
            if (firstError) {
                toast.error(firstError);
            } else {
                toast.error('Terjadi kesalahan saat mengajukan peminjaman');
            }
        },
    });
};
    const handleRoomSelect = (roomId: string) => {
        const room = availableRooms.find(r => r.id === parseInt(roomId));
        setSelectedRoom(room || null);
        setData('room_id', parseInt(roomId));
        
        // Reset layout choice ketika ganti ruangan
        setData('layout_choice', '');
        setSelectedLayoutPreview('');
    };

    const handleLayoutSelect = (layoutUrl: string) => {
        setData('layout_choice', layoutUrl);
        setSelectedLayoutPreview(layoutUrl);
    };

    const addEquipment = () => {
        setEquipmentList([...equipmentList, '']);
    };

    const removeEquipment = (index: number) => {
        const newList = equipmentList.filter((_, i) => i !== index);
        setEquipmentList(newList);
        setData('equipment_needed', newList.filter(item => item.trim() !== ''));
    };

    const updateEquipment = (index: number, value: string) => {
        const newList = [...equipmentList];
        newList[index] = value;
        setEquipmentList(newList);
        setData('equipment_needed', newList.filter(item => item.trim() !== ''));
    };

    useEffect(() => {
        if (selectedRoom) {
            setSelectedRoom(selectedRoom);
            setData('room_id', selectedRoom.id);
        }
    }, [selectedRoom]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Buat Peminjaman Ruangan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/Borrowings">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight">
                                    Buat Peminjaman Ruangan
                                </h1>
                                <p className="text-muted-foreground">
                                    Isi formulir di bawah untuk mengajukan peminjaman ruangan baru
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Room Preview */}
                            {selectedRoom_state && (
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="h-5 w-5" />
                                            Preview Ruangan Terpilih
                                        </CardTitle>
                                        <CardDescription>
                                            Tampilan ruangan yang akan dipinjam
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                                            <img
                                                src={getRoomImage(selectedRoom_state)}
                                                alt={`Preview Ruang ${selectedRoom_state.name}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                    "https://placehold.co/600x400/e5e7eb/6b7280?text=No+Image";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                                                    <h3 className="text-white font-semibold text-lg">Ruang {selectedRoom_state.name}</h3>
                                                    <div className="flex items-center gap-4 mt-1 text-white/90 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>Kapasitas {selectedRoom_state.capacity} orang</span>
                                                        </div>
                                                        {selectedRoom_state.location && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>{selectedRoom_state.location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <Badge variant="outline" className="backdrop-blur-sm bg-white/90">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Tersedia
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Room Selection */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Pilih Ruangan
                                    </CardTitle>
                                    <CardDescription>
                                        Pilih ruangan yang tersedia untuk dipinjam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="room_id">Ruangan *</Label>
                                        <Select 
                                            name="room_id"   
                                            value={data.room_id.toString()} 
                                            onValueChange={handleRoomSelect}
                                        >
                                            <SelectTrigger id="room_id" className={cn(errors.room_id && "border-red-500")}>
                                                <SelectValue placeholder="Pilih ruangan yang tersedia" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRooms.length === 0 ? (
                                                    <div className="p-2 text-center text-gray-500">
                                                        Tidak ada ruangan tersedia
                                                    </div>
                                                ) : (
                                                    availableRooms.map((room) => (
                                                        <SelectItem key={room.id} value={room.id.toString()}>
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>{room.name}</span>
                                                                <Badge variant="outline" className="ml-2">
                                                                    {room.capacity} orang
                                                                </Badge>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.room_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.room_id}</p>
                                        )}
                                    </div>

                                    {selectedRoom_state && (
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h3 className="font-medium text-blue-900 mb-2">
                                                {selectedRoom_state.full_name || `Ruangan ${selectedRoom_state.name}`}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Kapasitas: {selectedRoom_state.capacity} orang
                                                </div>
                                                {selectedRoom_state.location && (
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 mr-2" />
                                                        {selectedRoom_state.location}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedRoom_state.description && (
                                                <p className="text-sm text-blue-600 mt-2">
                                                    {selectedRoom_state.description}
                                                </p>
                                            )}
                                            
                                            {selectedRoom_state.facilities && Array.isArray(selectedRoom_state.facilities) && selectedRoom_state.facilities.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-blue-900 mb-2">Fasilitas:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedRoom_state.facilities.map((facility, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {facility}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* ✅ Layout Selection - Hanya muncul jika ruangan punya layout */}
                            {selectedRoom_state?.layout_images && Array.isArray(selectedRoom_state.layout_images) && selectedRoom_state.layout_images.length > 0 && (
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            Pilih Layout Ruangan (Opsional)
                                        </CardTitle>
                                        <CardDescription>
                                            Pilih tata letak ruangan yang diinginkan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="layout_choice">Layout</Label>
                                            <Select
                                                name="layout_choice"
                                                value={data.layout_choice || ""}
                                                onValueChange={handleLayoutSelect}
                                            >
                                                <SelectTrigger id="layout_choice">
                                                    <SelectValue placeholder="Pilih layout ruangan (opsional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectedRoom_state.layout_images.map((layoutUrl: string, index: number) => (
                                                        <SelectItem key={index} value={layoutUrl}>
                                                            Layout {index + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Preview Layout yang dipilih */}
                                        {selectedLayoutPreview && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Preview Layout:</p>
                                                <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                                    <img
                                                        src={selectedLayoutPreview}
                                                        alt="Preview Layout Ruangan"
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src =
                                                                "https://placehold.co/600x400/e5e7eb/6b7280?text=Layout+Not+Found";
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Gallery semua layout tersedia */}
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Semua Layout Tersedia:</p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {selectedRoom_state.layout_images.map((layoutUrl: string, index: number) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleLayoutSelect(layoutUrl)}
                                                        className={cn(
                                                            "relative h-32 rounded-lg overflow-hidden border-2 transition-all hover:border-blue-500",
                                                            data.layout_choice === layoutUrl 
                                                                ? "border-blue-500 ring-2 ring-blue-200" 
                                                                : "border-gray-200"
                                                        )}
                                                    >
                                                        <img
                                                            src={layoutUrl}
                                                            alt={`Layout ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    "https://placehold.co/300x200/e5e7eb/6b7280?text=Layout+" + (index + 1);
                                                            }}
                                                        />
                                                        {data.layout_choice === layoutUrl && (
                                                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                                <CheckCircle className="h-8 w-8 text-blue-600" />
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center">
                                                            Layout {index + 1}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Personal Information */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Informasi Peminjam
                                    </CardTitle>
                                    <CardDescription>
                                        Data diri dan kontak peminjam ruangan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="borrower_name">Nama Peminjam *</Label>
                                            <Input
                                                id="borrower_name"
                                                type="text"
                                                value={data.borrower_name}
                                                onChange={(e) => setData('borrower_name', e.target.value)}
                                                className={cn(errors.borrower_name && "border-red-500")}
                                                placeholder="Masukkan nama lengkap"
                                                required
                                            />
                                            {errors.borrower_name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.borrower_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="borrower_phone">Nomor Telepon *</Label>
                                            <Input
                                                id="borrower_phone"
                                                type="tel"
                                                value={data.borrower_phone}
                                                onChange={(e) => setData('borrower_phone', e.target.value)}
                                                className={cn(errors.borrower_phone && "border-red-500")}
                                                placeholder="08xxxxxxxxxx"
                                                required
                                            />
                                            {errors.borrower_phone && (
                                                <p className="text-sm text-red-600 mt-1">{errors.borrower_phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="borrower_category">Kategori *</Label>
                                            <Select 
                                                value={data.borrower_category} 
                                                onValueChange={(value) => setData('borrower_category', value as any)}
                                            >
                                                <SelectTrigger id="borrower_category" className={cn(errors.borrower_category && "border-red-500")}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pegawai">Pegawai</SelectItem>
                                                    <SelectItem value="tamu">Tamu</SelectItem>
                                                    <SelectItem value="anak-magang">Magang</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.borrower_category && (
                                                <p className="text-sm text-red-600 mt-1">{errors.borrower_category}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="participant_count">Jumlah Peserta *</Label>
                                            <Input
                                                id="participant_count"
                                                type="number"
                                                min="1"
                                                max={selectedRoom_state?.capacity || 100}
                                                value={data.participant_count}
                                                onChange={(e) => setData('participant_count', parseInt(e.target.value) || 1)}
                                                className={cn(errors.participant_count && "border-red-500")}
                                                required
                                            />
                                            {errors.participant_count && (
                                                <p className="text-sm text-red-600 mt-1">{errors.participant_count}</p>
                                            )}
                                            {selectedRoom_state && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Maksimal {selectedRoom_state.capacity} orang
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="borrower_department">Departemen</Label>
                                            <Input
                                                id="borrower_department"
                                                type="text"
                                                value={data.borrower_department}
                                                onChange={(e) => setData('borrower_department', e.target.value)}
                                                placeholder="Departemen/Unit kerja"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="borrower_institution">Institusi (Jika Tamu)</Label>
                                            <Input
                                                id="borrower_institution"
                                                type="text"
                                                value={data.borrower_institution}
                                                onChange={(e) => setData('borrower_institution', e.target.value)}
                                                placeholder="Nama institusi asal"
                                                disabled={data.borrower_category !== 'tamu'}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Schedule */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        Jadwal Peminjaman
                                    </CardTitle>
                                    <CardDescription>
                                        Tentukan tanggal, jam mulai, dan jam selesai peminjaman ruangan
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Tanggal Pinjam & Tanggal Selesai */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="borrow_date">Tanggal Pinjam *</Label>
                                            <Input
                                                id="borrow_date"
                                                type="date"
                                                value={data.borrow_date}
                                                onChange={(e) => setData("borrow_date", e.target.value)}
                                                className={cn(errors.borrow_date && "border-red-500")}
                                                min={new Date().toISOString().split("T")[0]}
                                                required
                                            />
                                            {errors.borrow_date && (
                                                <p className="text-sm text-red-600 mt-1">{errors.borrow_date}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="return_date">Tanggal Selesai (Opsional)</Label>
                                            <Input
                                                id="return_date"
                                                type="date"
                                                value={data.return_date}
                                                onChange={(e) => setData("return_date", e.target.value)}
                                                className={cn(errors.return_date && "border-red-500")}
                                                min={data.borrow_date || new Date().toISOString().split("T")[0]}
                                            />
                                            {errors.return_date && (
                                                <p className="text-sm text-red-600 mt-1">{errors.return_date}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Jam Mulai & Jam Selesai */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="start_time">Jam Mulai *</Label>
                                            <Input
                                                id="start_time"
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e) => setData("start_time", e.target.value)}
                                                className={cn(errors.start_time && "border-red-500")}
                                                required
                                            />
                                            {errors.start_time && (
                                                <p className="text-sm text-red-600 mt-1">{errors.start_time}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="end_time">Jam Selesai *</Label>
                                            <Input
                                                id="end_time"
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e) => setData("end_time", e.target.value)}
                                                className={cn(errors.end_time && "border-red-500")}
                                                min={data.start_time}
                                                required
                                            />
                                            {errors.end_time && (
                                                <p className="text-sm text-red-600 mt-1">{errors.end_time}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* ✅ Durasi - Sekarang berfungsi dengan baik */}
                                    {data.borrow_date && data.start_time && data.end_time && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-900">
                                                    Durasi peminjaman: <span className="font-bold">{getDuration()}</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recurring Options */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_recurring"
                                                name="is_recurring"
                                                checked={data.is_recurring}
                                                onCheckedChange={(checked) => setData("is_recurring", !!checked)}
                                            />
                                            <Label htmlFor="is_recurring">Peminjaman berulang</Label>
                                        </div>

                                        {data.is_recurring && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200 bg-blue-50 p-4 rounded">
                                                <div>
                                                    <Label htmlFor="recurring_pattern">Pola Pengulangan *</Label>
                                                    <Select
                                                        value={data.recurring_pattern}
                                                        onValueChange={(value) => setData("recurring_pattern", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih pola pengulangan" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="daily">Harian</SelectItem>
                                                            <SelectItem value="weekly">Mingguan</SelectItem>
                                                            <SelectItem value="monthly">Bulanan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="recurring_end_date">Tanggal Berakhir *</Label>
                                                    <Input
                                                        id="recurring_end_date"
                                                        type="date"
                                                        value={data.recurring_end_date}
                                                        onChange={(e) =>
                                                            setData("recurring_end_date", e.target.value)
                                                        }
                                                        min={new Date().toISOString().split("T")[0]}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Purpose & Equipment */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Keperluan & Peralatan
                                    </CardTitle>
                                    <CardDescription>
                                        Jelaskan tujuan dan peralatan yang dibutuhkan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="purpose">Tujuan Peminjaman *</Label>
                                        <Textarea
                                            id="purpose"
                                            value={data.purpose}
                                            onChange={(e) => setData('purpose', e.target.value)}
                                            className={cn(errors.purpose && "border-red-500")}
                                            placeholder="Jelaskan tujuan dan kegiatan yang akan dilakukan"
                                            rows={3}
                                            required
                                        />
                                        {errors.purpose && (
                                            <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Peralatan yang Dibutuhkan (Opsional)</Label>
                                        <div className="space-y-2 mt-2">
                                            {equipmentList.map((equipment, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Input
                                                        id={`equipment_${index}`}
                                                        name="equipment_needed[]"
                                                        type="text"
                                                        value={equipment}
                                                        onChange={(e) => updateEquipment(index, e.target.value)}
                                                        placeholder="Nama peralatan"
                                                        className="flex-1"
                                                    />
                                                    {equipmentList.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeEquipment(index)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addEquipment}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Tambah Peralatan
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Catatan Tambahan</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Catatan atau permintaan khusus"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Save className="h-5 w-5" />
                                        Ringkasan Peminjaman
                                    </CardTitle>
                                    <CardDescription>
                                        Review data peminjaman sebelum diajukan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Ruangan:</span>
                                            <span className="font-medium">
                                                {selectedRoom_state ? `Ruang ${selectedRoom_state.name}` : 'Belum dipilih'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Peminjam:</span>
                                            <span className="font-medium">{data.borrower_name || 'Belum diisi'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Peserta:</span>
                                            <span className="font-medium">{data.participant_count} orang</span>
                                        </div>
                                        {data.borrow_date && data.start_time && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Mulai:</span>
                                                <span className="font-medium">
                                                    {new Date(`${data.borrow_date}T${data.start_time}`).toLocaleString('id-ID', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {(data.return_date || data.borrow_date) && data.end_time && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Selesai:</span>
                                                <span className="font-medium">
                                                    {new Date(`${data.return_date || data.borrow_date}T${data.end_time}`).toLocaleString('id-ID', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {data.borrow_date && data.start_time && data.end_time && (
                                            <div className="flex justify-between text-sm pt-2 border-t">
                                                <span className="text-gray-600">Durasi:</span>
                                                <span className="font-bold text-blue-600">{getDuration()}</span>
                                            </div>
                                        )}
                                        {data.layout_choice && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Layout:</span>
                                                <Badge variant="outline">Dipilih</Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Information */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Informasi Penting
                                    </CardTitle>
                                    <CardDescription>
                                        Hal-hal yang perlu diperhatikan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-gray-600">
                                    <p>• Peminjaman akan diproses oleh admin</p>
                                    <p>• Konfirmasi akan dikirim via notifikasi</p>
                                    <p>• Pastikan data yang diisi sudah benar</p>
                                    <p>• Ruangan harus diserahkan sesuai waktu</p>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Card className="border-0 shadow-sm sticky top-6">
                                <CardContent className="p-6">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Memproses...' : 'Ajukan Peminjaman'}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        Peminjaman akan direview oleh admin
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}