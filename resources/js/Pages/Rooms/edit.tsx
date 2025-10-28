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
    room: Room & {
        computed_image_url?: string;
        layout_images?: string[];
    };
}

export default function EditRoom({ auth, room }: EditRoomPageProps) {
        const [facilitiesList, setFacilitiesList] = useState<string[]>(() => {
        try {
            if (typeof room.facilities === 'string') {
                const parsed = JSON.parse(room.facilities);
                return Array.isArray(parsed) ? parsed : [''];
            }
            return Array.isArray(room.facilities) ? room.facilities : [''];
        } catch {
            return [''];
        }
    });

    const [imagePreview, setImagePreview] = useState<string>(room.image || '');
    const [imageError, setImageError] = useState<boolean>(false);
    
    // ✅ State untuk preview layout baru
    const [newLayoutPreviews, setNewLayoutPreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm<Record<string, any>>({
        _method: 'PUT',
        name: room.name || '',
        code: room.code || '',
        full_name: room.full_name || '',
        description: room.description || '',
        capacity: room.capacity || 1,
        status: room.status,
        facilities: Array.isArray(room.facilities)
        ? room.facilities
        : (typeof room.facilities === 'string'
            ? JSON.parse(room.facilities)
            : []),
        location: room.location || '',
        image: null as File | null,
        layouts: [] as File[],
        is_active: room.is_active,
    });

    const isAdmin = ['admin', 'super-admin'].includes((auth as any).user.role);

    useEffect(() => {
        // selalu set array hasil normalisasi sehingga .filter/.map aman dipanggil
        const normalized = normalizeFacilities(room.facilities);
        setFacilitiesList(normalized.length > 0 ? normalized : ['']);

        if (room.image_url) {
            setImagePreview(room.image_url);
        }
    }, [room]);


    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", data.name);
    formData.append("code", data.code);
    formData.append("full_name", data.full_name || "");
    formData.append("description", data.description || "");
    formData.append("capacity", String(data.capacity));
    formData.append("status", data.status);
    formData.append("location", data.location || "");
    formData.append("is_active", data.is_active ? "true" : "false");

    // hanya kirim gambar jika user memilih file baru
    if (data.image) {
        formData.append("image", data.image);
    }

    // hanya kirim layout baru jika dipilih
    if (data.layouts.length > 0) {
        data.layouts.forEach((file: File, i: number) => {
        formData.append(`layouts[${i}]`, file);
        });
    }

    formData.append("facilities", JSON.stringify(data.facilities));

    router.post(`/Rooms/${room.id}`, formData, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => router.visit("/Rooms"),
        onError: (errors) => console.error("Form errors:", errors),
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

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(room.image_url || '');
            setData('image', null);
        }
    };

    const clearImageFile = () => {
        setData('image', null);
        setImagePreview(room.image_url || '');
    };

    // ✅ Handle multiple layout files dengan preview
    const handleLayoutsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            setData('layouts', fileArray);
            
            // Buat preview untuk setiap file
            const previews: string[] = [];
            fileArray.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    previews.push(event.target?.result as string);
                    if (previews.length === fileArray.length) {
                        setNewLayoutPreviews(previews);
                    }
                };
                reader.readAsDataURL(file);
            });
        } else {
            setData('layouts', []);
            setNewLayoutPreviews([]);
        }
    };

    // ✅ Clear layout baru
    const clearNewLayouts = () => {
        setData('layouts', []);
        setNewLayoutPreviews([]);
        // Reset input file
        const fileInput = document.getElementById('layouts') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const commonFacilities: string[] = [
        'Proyektor', 'Whiteboard', 'Air Conditioner', 'WiFi', 'Meja', 'Kursi',
        'Sound System', 'Microphone', 'Podium', 'Laptop', 'Flipchart', 'Marker'
    ];

    const getRoomLayout = (roomName: string): string => {
        return `/storage/rooms/${roomName.toLowerCase()}.jpg`; 
    };

        const normalizeFacilities = (f: any): string[] => {
    if (!f) return [];
    if (Array.isArray(f)) return f;
    if (typeof f === 'string') {
        // coba parse JSON terlebih dahulu
        try {
        const parsed = JSON.parse(f);
        if (Array.isArray(parsed)) return parsed;
        } catch {
        // bukan JSON, lanjut ke split koma
        }
        return f.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
    };

    // ✅ Parse layouts dengan aman
    const getExistingLayouts = (): string[] => {
        if (!room.layouts) return [];
        
        try {
            if (typeof room.layouts === 'string') {
                const parsed = JSON.parse(room.layouts);
                return Array.isArray(parsed) ? parsed : [];
            }
            if (Array.isArray(room.layouts)) {
                return room.layouts;
            }
        } catch (err) {
            console.warn('Gagal parse layouts:', err);
        }
        
        return [];
    };

    const existingLayouts = getExistingLayouts();

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
                                        Tindakan ini tidak dapat dibatalkan.
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
                                </CardHeader>
                                <CardContent>
                                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                                        <img
                                            src={imagePreview}
                                            alt={`Preview Ruang ${data.name}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { 
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e5e7eb/6b7280?text=No+Image'; 
                                            }}
                                        />
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
                                            />
                                            {errors?.code && (
                                                <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="capacity">Kapasitas *</Label>
                                            <Input
                                                id="capacity"
                                                type="number"
                                                min="1"
                                                value={data.capacity}
                                                onChange={(e) => setData('capacity', parseInt(e.target.value) || 1)}
                                                className={cn(errors?.capacity && "border-red-500")}
                                            />
                                            {errors?.capacity && (
                                                <p className="text-sm text-red-600 mt-1">{errors.capacity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="status">Status *</Label>
                                            <Select 
                                                value={data.status} 
                                                onValueChange={(value) => setData('status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tersedia">Tersedia</SelectItem>
                                                    <SelectItem value="dipakai">Terpakai</SelectItem>
                                                    <SelectItem value="pemeliharaan">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="full_name">Nama Lengkap</Label>
                                        <Input
                                            id="full_name"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="location">Lokasi</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    {isAdmin && (
                                        <div className="flex items-center space-x-2">
                                           <Switch
                                            id="is_active"
                                            checked={!!data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                            <Label htmlFor="is_active">Ruangan Aktif</Label>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Facilities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fasilitas Ruangan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Fasilitas Umum</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {commonFacilities.map((facility) => (
                                                <div key={facility} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`facility-${facility}`}
                                                        checked={facilitiesList.includes(facility)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                const newList = [...facilitiesList, facility];
                                                                setFacilitiesList(newList);
                                                                setData('facilities', newList);
                                                            } else {
                                                                const newList = facilitiesList.filter(f => f !== facility);
                                                                setFacilitiesList(newList);
                                                                setData('facilities', newList);
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
                                            {facilitiesList.filter(f => !commonFacilities.includes(f)).map((facility, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Input
                                                        type="text"
                                                        value={facility}
                                                        onChange={(e) => updateFacility(facilitiesList.indexOf(facility), e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeFacility(facilitiesList.indexOf(facility))}
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

                            {/* Image Upload */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Camera className="h-5 w-5 mr-2" />
                                        Gambar Ruangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="image">Upload Gambar Baru</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageFileChange}
                                                className="flex-1"
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
                                            Kosongkan jika tidak ingin mengubah gambar
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ✅ Layout Ruangan - IMPROVED */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Camera className="h-5 w-5 mr-2" />
                                        Layout Ruangan
                                    </CardTitle>
                                    <CardDescription>
                                        Tambah atau ganti layout ruangan (layout lama akan diganti)
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Upload Layout Baru */}
                                    <div>
                                        <Label htmlFor="layouts">Upload Layout Baru (Multiple Files)</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="layouts"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleLayoutsChange}
                                                className="flex-1"
                                            />
                                            {data.layouts.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearNewLayouts}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.layouts.length > 0 
                                                ? `${data.layouts.length} file baru dipilih. Layout lama akan diganti.`
                                                : 'Kosongkan jika tidak ingin mengubah layout'
                                            }
                                        </p>
                                    </div>

                                    {/* Preview Layout Baru */}
                                    {newLayoutPreviews.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                Preview Layout Baru ({newLayoutPreviews.length}):
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {newLayoutPreviews.map((preview, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={preview}
                                                            alt={`Layout Baru ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                                                        />
                                                        <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                                                            Baru {index + 1}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Layout Lama */}
                                    {existingLayouts.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                Layout Saat Ini ({existingLayouts.length}):
                                                {data.layouts.length > 0 && (
                                                    <span className="text-orange-600 ml-2 text-xs">
                                                        (akan diganti jika Anda upload layout baru)
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {existingLayouts.map((path, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={`/${path}`}
                                                            alt={`Layout Lama ${index + 1}`}
                                                            className={cn(
                                                                "w-full h-32 object-cover rounded-lg border",
                                                                data.layouts.length > 0 && "opacity-50"
                                                            )}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 
                                                                    'https://placehold.co/400x300/e5e7eb/6b7280?text=No+Layout';
                                                            }}
                                                        />
                                                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                                            Lama {index + 1}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {existingLayouts.length === 0 && newLayoutPreviews.length === 0 && (
                                        <p className="text-sm text-gray-500 italic text-center py-4">
                                            Belum ada layout tersimpan. Upload file untuk menambahkan layout.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nama:</span>
                                            <span className="font-medium">{data.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Kapasitas:</span>
                                            <span className="font-medium">{data.capacity} orang</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <Badge variant="outline">
                                                {data.status === 'tersedia' ? 'Tersedia' :
                                                 data.status === 'dipakai' ? 'Terpakai' : 'Maintenance'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Fasilitas:</span>
                                            <span className="font-medium">{data.facilities?.length || 0} item</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Layout Baru:</span>
                                            <span className="font-medium">
                                                {data.layouts.length > 0 ? `${data.layouts.length} file` : 'Tidak ada'}
                                            </span>
                                        </div>
                                    </div>

                                    {data.layouts.length > 0 && (
                                        <div className="pt-3 border-t">
                                            <p className="text-xs text-orange-600">
                                                ⚠️ Layout lama akan diganti dengan {data.layouts.length} layout baru
                                            </p>
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