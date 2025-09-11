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
import { Switch } from '@/components/ui/switch';
import { 
    Building2, 
    Users, 
    MapPin, 
    Plus, 
    Minus, 
    Camera, 
    AlertCircle,
    Save,
    ArrowLeft,
    Settings,
    Trash2,
    X,
    CheckCircle,
    Wrench,
    Upload
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { PageProps, Room } from '@/types';
import { Link } from '@inertiajs/react';

interface EditRoomPageProps extends PageProps {
    room: Room;
}

// Mock data untuk gambar ruangan - dalam production akan dari database
const getRoomImage = (roomName: string): string => {
    const imageMap: { [key: string]: string } = {
        'A': 'https://images.unsplash.com/photo-1745970649957-b4b1f7fde4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25mZXJlbmNlJTIwcm9vbSUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3Mjk3MTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'B': 'https://images.unsplash.com/photo-1692133226337-55e513450a32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMG1lZXRpbmclMjByb29tJTIwb2ZmaWNlfGVufDF8fHx8MTc1NzQwMzg5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'C': 'https://images.unsplash.com/photo-1750768145390-f0ad18d3e65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBtZWV0aW5nJTIwcm9vbSUyMHByb2plY3RvcnxlbnwxfHx8fDE3NTc0MDM5MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'D': 'https://images.unsplash.com/photo-1719845853806-1c54b0ed37c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNjdXNzaW9uJTIwcm9vbSUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzU3NDAzOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'E': 'https://images.unsplash.com/photo-1689150571822-1b573b695391?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpdG9yaXVtJTIwc2VtaW5hciUyMGhhbGx8ZW58MXx8fHwxNzU3NDAzODk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'F': 'https://images.unsplash.com/photo-1589639293663-f9399bb41721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb20lMjBvZmZpY2V8ZW58MXx8fHwxNzU3NDAzODk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    };
    
    const roomCode = roomName?.toString().toUpperCase() || 'A';
    return imageMap[roomCode] || imageMap['A']; // Default fallback
};

export default function EditRoom({ auth, room }: EditRoomPageProps) {
    const [facilitiesList, setFacilitiesList] = useState<string[]>(room.facilities || ['']);
    const [imagePreview, setImagePreview] = useState<string>(room.image_url || '');
    const [imageError, setImageError] = useState<boolean>(false);

   const { data, setData, put, post, patch, processing, errors, reset } = useForm<Record<string, any>>({
      _method: 'PUT',
      name: room.name,
      code: room.code || '',     
      full_name: room.full_name || '',
      description: room.description || '',
      capacity: room.capacity,
      facilities: room.facilities || [],
      location: room.location || '',
      image: null as File | null,
      status: room.status,
      is_active: room.is_active ? 1 : 0,
    });

    const isAdmin = ['admin', 'super-admin'].includes((auth as any).user.role);

    useEffect(() => {
        if (room.facilities && room.facilities.length > 0) {
            setFacilitiesList(room.facilities);
        }
        if (room.image_url) {
            setImagePreview(room.image_url);
        }
    }, [room]);

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/Rooms/${room.id}`, {
        forceFormData: true, // Opsional, tapi baik untuk memastikan pengiriman multipart/form-data
        onSuccess: () => {
            router.visit('/Rooms');
        },
        onError: (errors: Record<string, string>) => {
        console.error('Form errors:', errors);
        }
    });
};

    const handleDelete = () => {
        router.delete(`/Rooms/${room.id}`, {
            onSuccess: () => {
                router.visit('/Rooms');
            }
        });
    };

    const addFacility = () => {
        setFacilitiesList([...facilitiesList, '']);
    };

    const removeFacility = (index: number) => {
        const newList = facilitiesList.filter((_, i) => i !== index);
        setFacilitiesList(newList);
        setData('facilities', newList.filter(item => item.trim() !== ''));
    };

    const updateFacility = (index: number, value: string) => {
        const newList = [...facilitiesList];
        newList[index] = value;
        setFacilitiesList(newList);
        setData('facilities', newList.filter(item => item.trim() !== ''));
    };

    const handleImageUrlChange = (url: string) => {
        setData('image_url', url);
        setImageError(false);
        
        if (url.trim()) {
            // avoid using `new Image()` because there's an import named Image (react icon)
            const img = document.createElement('img');
            img.onload = () => {
                setImagePreview(url);
                setImageError(false);
            };
            img.onerror = () => {
                setImagePreview('');
                setImageError(true);
            };
            img.src = url;
        } else {
            setImagePreview('');
            setImageError(false);
        }
    };

const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
    const file = e.target.files?.[0] || null;
    setData('image', file);
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setImagePreview(room.image_url || '');
    }
};

const clearImageFile = () => {
    setData('image', null);
    setImagePreview(room.image_url || '');
};

    const clearImagePreview = () => {
        setImagePreview('');
        setImageError(false);
        setData('image', '');
    };

    const commonFacilities: string[] = [
        'Proyektor', 'Whiteboard', 'Air Conditioner', 'WiFi', 'Meja', 'Kursi',
        'Sound System', 'Microphone', 'Podium', 'Laptop', 'Flipchart', 'Marker'
    ];

    return (
        <AuthenticatedLayout user={(auth as any).user}>
            <Head title={`Edit Ruang ${room.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/Rooms">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight">
                                    Edit Ruang {room.name}
                                </h1>
                                <p className="text-muted-foreground">
                                    Perbarui informasi dan pengaturan ruangan
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {isAdmin && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Ruangan
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Ruangan</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus ruang {room.name}? 
                                        Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data peminjaman terkait.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Hapus Ruangan
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Current Room Preview */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Preview Ruangan Saat Ini
                                    </CardTitle>
                                    <CardDescription>
                                        Tampilan ruangan berdasarkan data yang ada
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                                        <img
                                            src={getRoomImage(String(data.name))}
                                            alt={`Preview Ruang ${data.name}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                        <div className="absolute bottom-4 left-4">
                                            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                                                <span className="text-white font-semibold text-lg">Ruang {data.name}</span>
                                                <p className="text-white/80 text-sm">{data.capacity} orang</p>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <Badge variant="outline" className="backdrop-blur-sm bg-white/90 text-xs">
                                                {data.status === 'tersedia' && <CheckCircle className="h-4 w-4 mr-1 inline" />}
                                                {data.status === 'dipakai' && <Users className="h-4 w-4 mr-1 inline" />}
                                                {data.status === 'pemeliharaan' && <Wrench className="h-4 w-4 mr-1 inline" />}
                                                {data.status === 'tersedia' ? 'Tersedia' : data.status === 'dipakai' ? 'Dipakai' : 'Pemeliharaan'}
                                            </Badge>
                                        </div>
                                        {data.location && (
                                            <div className="absolute bottom-4 right-4">
                                                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                                                    <span className="text-white/90 text-sm flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {data.location}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Basic Information */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Informasi Dasar
                                    </CardTitle>
                                    <CardDescription>
                                        Edit informasi dasar ruangan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Nama Ruangan *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={cn(errors?.name && "border-red-500")}
                                                placeholder="A, B, C, Aula, dll"
                                            />
                                            {errors?.name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                        <Label htmlFor="code">Kode Ruangan *</Label>
                                        <Input
                                          id="code"
                                          type="text"
                                          value={data.code}
                                          onChange={(e) => setData('code', e.target.value)}
                                          className={cn(errors?.code && "border-red-500")}
                                          placeholder="Contoh: R001"
                                        />
                                        {errors?.code && (
                                          <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                                        )}
                                      </div>

                                        <div>
                                            <Label htmlFor="capacity">Kapasitas (Orang) *</Label>
                                            <Input
                                                id="capacity"
                                                type="number"
                                                min="1"
                                                max="1000"
                                                value={data.capacity}
                                               onChange={(e) => setData('capacity', e.target.value ? parseInt(e.target.value) : '')}
                                                className={cn(errors?.capacity && "border-red-500")}
                                            />
                                            {errors?.capacity && (
                                                <p className="text-sm text-red-600 mt-1">{errors.capacity}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="full_name">Nama Lengkap Ruangan</Label>
                                        <Input
                                            id="full_name"
                                            type="text"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="Ruang Rapat A - Lantai 2"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="location">Lokasi</Label>
                                        <Input
                                            id="location"
                                            type="text"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder="Lantai 2, Gedung Utama"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Deskripsi ruangan, fungsi utama, dll"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Settings */}
                            {isAdmin && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Settings className="h-5 w-5 mr-2" />
                                            Status & Pengaturan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="status">Status Ruangan</Label>
                                                <Select 
                                                    value={data.status} 
                                                    onValueChange={(value) => setData('status', value as any)}
                                                >
                                                    <SelectTrigger className={cn(errors?.status && "border-red-500")}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="tersedia">Tersedia</SelectItem>
                                                        <SelectItem value="dipakai">Terpakai</SelectItem>
                                                        <SelectItem value="pemeliharaan">Maintenance</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors?.status && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onCheckedChange={(checked) => setData('is_active', checked ? 1 : 0)}
                                                />
                                                <Label htmlFor="is_active">Ruangan Aktif</Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Facilities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fasilitas Ruangan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">Fasilitas Umum</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {commonFacilities.map((facility: string) => (
                                                <div key={facility} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`facility-${facility}`}
                                                        checked={facilitiesList.includes(facility)}
                                                        onCheckedChange={(checked: boolean) => {
                                                            if (checked) {
                                                                const newList = [...facilitiesList, facility];
                                                                setFacilitiesList(newList);
                                                                setData('facilities', newList.filter(item => item.trim() !== ''));
                                                            } else {
                                                                const newList = facilitiesList.filter(f => f !== facility);
                                                                setFacilitiesList(newList);
                                                                setData('facilities', newList.filter(item => item.trim() !== ''));
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`facility-${facility}`} className="text-sm">
                                                        {facility}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Fasilitas Tambahan</Label>
                                        <div className="space-y-2 mt-2">
                                            {facilitiesList.filter((f: string) => !commonFacilities.includes(f)).map((facility: string, index: number) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Input
                                                        type="text"
                                                        value={facility}
                                                        onChange={(e) => updateFacility(index, e.target.value)}
                                                        placeholder="Nama fasilitas"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeFacility(index)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addFacility}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Tambah Fasilitas
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                          {/* Image */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Camera className="h-5 w-5 mr-2" />
                                        Gambar Ruangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="image">Pilih File Gambar</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageFileChange}
                                                className="flex-1 cursor-pointer"
                                            />
                                            {data.image && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearImageFile}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Pilih file gambar dari komputer Anda.
                                        </p>
                                    </div>

                                    {imagePreview && (
                                        <div className="mt-4">
                                            <Label>Preview Gambar</Label>
                                            <div className="border rounded-lg overflow-hidden bg-gray-50 mt-2">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview ruangan"
                                                    className="w-full h-48 object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Current Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status Saat Ini</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Status:</span>
                                            <Badge 
                                                variant="outline" 
                                                className={cn("text-xs", 
                                                    room.status === 'tersedia' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                                    room.status === 'dipakai' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                                                    room.status === 'pemeliharaan' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                                                    'border-red-200 bg-red-50 text-red-700'
                                                )}
                                            >
                                                {room.status === 'tersedia' ? 'Tersedia' :
                                                 room.status === 'dipakai' ? 'Terpakai' :
                                                 'Pemeliharaan'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Aktif:</span>
                                            <Badge 
                                                variant="outline" 
                                                className={cn("text-xs", 
                                                    room.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                                    'border-red-200 bg-red-50 text-red-700'
                                                )}
                                            >
                                                {room.is_active ? 'Ya' : 'Tidak'}
                                            </Badge>
                                        </div>
                                        {room.current_borrowing && (
                                            <div className="p-3 bg-orange-50 rounded-lg">
                                                <p className="text-sm font-medium text-orange-800">
                                                    Sedang Dipinjam
                                                </p>
                                                <p className="text-xs text-orange-600">
                                                    {room.current_borrowing.borrower_name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Perubahan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Nama:</span>
                                            <span className="font-medium">{data.name || 'Belum diisi'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Kapasitas:</span>
                                            <span className="font-medium">{data.capacity} orang</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Lokasi:</span>
                                            <span className="font-medium">{data.location || 'Belum diisi'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Fasilitas:</span>
                                            <span className="font-medium">{data.facilities?.length || 0} item</span>
                                        </div>
                                    </div>

                                    {Array.isArray(data.facilities) && data.facilities.length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium">Fasilitas Terpilih:</Label>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {data.facilities.map((facility: string, index: number) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {facility}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Card>
                                <CardContent className="p-4">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={processing || !data.name || !data.capacity}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Perubahan akan disimpan ke database
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
