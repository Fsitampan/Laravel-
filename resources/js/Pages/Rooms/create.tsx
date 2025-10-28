import { useState } from 'react';
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
    Building2, 
    Users, 
    MapPin, 
    Plus, 
    Minus, 
    Camera, 
    AlertCircle,
    Save,
    ArrowLeft,
    X,
    Upload,
    Image,
    CheckCircle,
    Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import { Link } from '@inertiajs/react';

// Mock data for room images - in production this would be from a database
const getRoomImage = (roomName: string): string => {
    const imageMap: { [key: string]: string } = {
        'A': 'https://images.unsplash.com/photo-1745970649957-b4b1f7fde4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25mZXJlbmNlJTIBcm9vbSUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3Mjk3MTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'B': 'https://images.unsplash.com/photo-1692133226337-55e513450a32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxzbWFsbCUyMG1lZXRpbmclMjByb29tJTIwb2ZmaWNlfGVufDF8fHx8MTc1NzQwMzg5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'C': 'https://images.unsplash.com/photo-1750768145390-f0ad18d3e65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBtZWV0aW5nJTIBcm9vbSUyMHByb2plY3RvcnxlbnwxfHx8fDE3NTc0MDM5MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'D': 'https://images.unsplash.com/photo-1719845853806-1c54b0ed37c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxkaXNjdXNzaW9uJTIBcm9vbSUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzU3NDAzOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'E': 'https://images.unsplash.com/photo-1689150571822-1b573b695391?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxhdWRpdG9yaXVtJTIBc2VtaW5hciUyMGhhbGx8ZW58MXx8fHwxNzU3NDAzODk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'F': 'https://images.unsplash.com/photo-1589639293663-f9399bb41721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxl4GVjdXRpdmUlMjBib2FyZHJvb20lMjBvZmZpY2V8ZW58MXx8fHwxNzU3NDAzODk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    };
    
    const roomCode = roomName.toUpperCase();
    return imageMap[roomCode] || imageMap['A']; // Default fallback
};

export default function CreateRoom({ auth }: PageProps) {
    const [facilitiesList, setFacilitiesList] = useState<string[]>(['']);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageError, setImageError] = useState<boolean>(false);
    const [useLocalImage, setUseLocalImage] = useState<boolean>(false);

    const { data, setData, put, post, patch, processing, errors, reset } = useForm<Record<string, any>>({
        name: '',
        code: '',
        full_name: '',
        description: '',
        capacity: 1,
        status: 'tersedia',
        facilities: [],
        location: '',
        image: null,
        image_url: '',
        notes: '',
        layouts: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
        const submitData: any = {
            name: data.name,
            code: data.code,
            full_name: data.full_name || '',
            description: data.description || '',
            capacity: data.capacity,
            status: data.status,
            location: data.location || '',
            notes: data.notes || '',
            // ✅ FIX: Convert facilities ke JSON string
            facilities: JSON.stringify(data.facilities || []),
        };
        
        // Tambahkan image jika ada
        if (data.image) {
            submitData.image = data.image;
        } else if (data.image_url) {
            submitData.image_url = data.image_url;
        }
        
        // ✅ Tambahkan layouts (Inertia akan handle array of Files)
        if (data.layouts && Array.isArray(data.layouts) && data.layouts.length > 0) {
            submitData.layouts = data.layouts;
        }
        
        // ✅ Gunakan router.post langsung
        router.post('/Rooms', submitData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                router.visit('/Rooms');
            },
            onError: (errors: Record<string, string>) => {
                console.error('Form errors:', errors);
            }
        });
    };

    const addFacility = () => {
        setFacilitiesList([...facilitiesList, '']);
    };

    const removeFacility = (index: number) => {
        const newList = facilitiesList.filter((_: string, i: number) => i !== index);
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
            // Test if URL is valid by creating a new image
            // @ts-ignore
            const img = new Image();
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

    const clearImagePreview = () => {
        setImagePreview('');
        setImageError(false);
        setData('image_url', '');
        setData('image', null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setImageError(true);
                return;
            }
            
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                setImageError(true);
                return;
            }

            setData('image', file);
            setData('image_url', ''); // Clear URL if using local image
            setImageError(false);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const commonFacilities = [
        'Proyektor', 'Whiteboard', 'Air Conditioner', 'WiFi', 'Meja', 'Kursi',
        'Sound System', 'Microphone', 'Podium', 'Laptop', 'Flipchart', 'Marker'
    ];

    // Fungsi ambil layout ruangan dari storage publik
    const getRoomLayout = (roomName: string): string => {
        return `/storage/rooms/${roomName.toLowerCase()}.jpg`; 
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tambah Ruangan Baru" />

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
                                    Tambah Ruangan Baru
                                </h1>
                                <p className="text-muted-foreground">
                                    Isi formulir di bawah untuk menambahkan ruangan baru
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Preview Image */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Preview Ruangan
                                    </CardTitle>
                                    <CardDescription>
                                        Preview gambar ruangan berdasarkan gambar yang dipilih
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                                        {imagePreview  ? (
                                            <>
                                                    <img 
                                                        src={imagePreview}
                                                        alt={`Preview Ruang ${data.name || 'Ruangan'}`}
                                                        className="w-full h-full object-cover"
                                                        />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                                <div className="absolute bottom-4 left-4">
                                                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                                                        <span className="text-white font-semibold text-lg">Ruang {data.name}</span>
                                                        <p className="text-white/80 text-sm">{data.capacity} orang</p>
                                                    </div>
                                                </div>
                                                {data.status && (
                                                    <div className="absolute top-4 right-4">
                                                        <Badge variant="outline" className="backdrop-blur-sm bg-white/90">
                                                            {data.status === 'tersedia' && <CheckCircle className="h-4 w-4 mr-1" />}
                                                            {data.status === 'dipakai' && <Users className="h-4 w-4 mr-1" />}
                                                            {data.status === 'pemeliharaan' && <Wrench className="h-4 w-4 mr-1" />}
                                                            {data.status === 'tersedia' ? 'Tersedia' : 
                                                             data.status === 'dipakai' ? 'Dipakai' : 'Pemeliharaan'}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-muted-foreground">Masukkan gambar ruangan untuk melihat preview</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Layout Ruangan */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Layout Ruangan
                                    </CardTitle>
                                    <CardDescription>
                                        Denah layout berdasarkan gambar layout ruangan yang dimasukkan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative h-64 rounded-lg overflow-hidden bg-muted">
                                       {data.layouts && data.layouts.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {data.layouts.map((file: File, index: number) => {
                                            const url = URL.createObjectURL(file);
                                            return (
                                                <div key={index} className="relative">
                                                <img
                                                    src={url}
                                                    alt={`Layout ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border"
                                                />
                                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                                    Layout {index + 1}
                                                </span>
                                                </div>
                                            );
                                            })}
                                        </div>
                                        ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            Belum ada gambar layout yang dipilih
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
                                        Informasi dasar ruangan yang akan ditambahkan
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
                                                className={cn(errors.name && "border-red-500")}
                                                placeholder="A, B, C, Aula, dll"
                                            />
                                            {errors.name && (
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
                                                className={cn(errors.code && "border-red-500")}
                                                placeholder="R001, AULA-01, dll"
                                            />
                                            {errors.code && (
                                                <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="capacity">Kapasitas (Orang) *</Label>
                                            <Input
                                                id="capacity"
                                                type="number"
                                                min="1"
                                                max="1000"
                                                value={data.capacity}
                                                onChange={(e) => setData('capacity', parseInt(e.target.value) || 1)}
                                                className={cn(errors.capacity && "border-red-500")}
                                            />
                                            {errors.capacity && (
                                                <p className="text-sm text-red-600 mt-1">{errors.capacity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="status">Status Ruangan *</Label>
                                            <Select value={data.status} onValueChange={(value: 'tersedia' | 'dipakai' | 'pemeliharaan') => setData('status', value)}>
                                                <SelectTrigger className={cn(errors.status && "border-red-500")}>
                                                    <SelectValue placeholder="Pilih status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tersedia">Tersedia</SelectItem>
                                                    <SelectItem value="dipakai">Dipakai</SelectItem>
                                                    <SelectItem value="pemeliharaan">Pemeliharaan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <p className="text-sm text-red-600 mt-1">{errors.status}</p>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <div>
                                            <Label htmlFor="notes">Catatan</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Catatan tambahan tentang ruangan"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Facilities */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Fasilitas Ruangan
                                    </CardTitle>
                                    <CardDescription>
                                        Pilih fasilitas yang tersedia di ruangan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">Fasilitas Umum</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {commonFacilities.map((facility: string) => (
                                                <div key={facility} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`facility-${facility}`}
                                                        checked={Array.isArray(data.facilities) && data.facilities.includes(facility)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                const newList = [...(Array.isArray(data.facilities) ? data.facilities : []), facility];
                                                                setData('facilities', newList);
                                                            } else {
                                                                const newList = (Array.isArray(data.facilities) ? data.facilities : []).filter((f: string) => f !== facility);
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
                                            {facilitiesList.filter((f: string) => !commonFacilities.includes(f)).map((facility: string, index: number) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Input
                                                        type="text"
                                                        value={facility}
                                                        onChange={(e) => updateFacility(facilitiesList.indexOf(facility), e.target.value)}
                                                        placeholder="Nama fasilitas"
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

                            {/* Image */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5" />
                                        Upload Gambar Ruangan
                                    </CardTitle>
                                    <CardDescription>
                                        Upload gambar ruangan atau gunakan URL gambar
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <Button
                                                type="button"
                                                variant={useLocalImage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    setUseLocalImage(true);
                                                    setData('image_url', '');
                                                    clearImagePreview();
                                                }}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload File
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={!useLocalImage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    setUseLocalImage(false);
                                                    setData('image', null);
                                                    clearImagePreview();
                                                }}
                                            >
                                                <Image className="h-4 w-4 mr-2" />
                                                URL Gambar
                                            </Button>
                                        </div>

                                        {useLocalImage ? (
                                            <div>
                                                <Label htmlFor="image">Upload Gambar</Label>
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/jpg"
                                                    onChange={handleImageUpload}
                                                    className={cn(errors.image && "border-red-500")}
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Format: JPEG, PNG, JPG. Maksimal 2MB
                                                </p>
                                                {errors.image && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.image}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <Label htmlFor="image_url">URL Gambar</Label>
                                                <Input
                                                    id="image_url"
                                                    type="url"
                                                    value={data.image_url}
                                                    onChange={(e) => handleImageUrlChange(e.target.value)}
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Masukkan URL gambar ruangan
                                                </p>
                                            </div>
                                        )}

                                        {imageError && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {useLocalImage 
                                                    ? 'File harus berupa gambar dengan format JPEG, PNG, atau JPG dan maksimal 2MB'
                                                    : 'URL gambar tidak valid atau tidak dapat dimuat'
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {imagePreview && !imageError && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label>Preview Gambar</Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearImagePreview}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview ruangan"
                                                    className="w-full h-48 object-cover"
                                                    onError={() => {
                                                        setImageError(true);
                                                        setImagePreview('');
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Layout Ruangan */}
                        <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                            <Camera className="h-5 w-5 mr-2" />
                            Layout Ruangan
                            </CardTitle>
                            <CardDescription>
                            Unggah satu atau beberapa gambar layout ruangan
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                            <Label htmlFor="layouts">Pilih File Gambar</Label>
                            <Input
                                id="layouts"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                    setData("layouts", Array.from(files));
                                } else {
                                    setData("layouts", []);
                                }
                                }}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Kamu bisa unggah beberapa gambar layout. Maksimal 2 MB per file.
                            </p>
                            </div>

                            {/* Preview Layouts */}
                            {data.layouts && Array.isArray(data.layouts) && data.layouts.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                {data.layouts.map((file: File, index: number) => {
                                const url = URL.createObjectURL(file);
                                return (
                                    <div key={index} className="relative">
                                    <img
                                        src={url}
                                        alt={`Layout ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border"
                                    />
                                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                        Layout {index + 1}
                                    </span>
                                    </div>
                                );
                                })}
                            </div>
                            )}
                        </CardContent>
                        </Card>


                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Ringkasan Ruangan
                                    </CardTitle>
                                    <CardDescription>
                                        Ringkasan data ruangan yang akan disimpan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Nama:</span>
                                            <span className="font-medium">{data.name || 'Belum diisi'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Kode:</span>
                                            <span className="font-medium">{data.code || 'Belum diisi'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Kapasitas:</span>
                                            <span className="font-medium">{data.capacity} orang</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="font-medium">
                                                {data.status === 'tersedia' ? 'Tersedia' : 
                                                 data.status === 'dipakai' ? 'Dipakai' : 
                                                 data.status === 'pemeliharaan' ? 'Pemeliharaan' : 'Belum dipilih'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Lokasi:</span>
                                            <span className="font-medium">{data.location || 'Belum diisi'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Fasilitas:</span>
                                            <span className="font-medium">{(data.facilities as string[] | undefined)?.length || 0} item</span>
                                        </div>
                                    </div>

                                    {data.facilities && (data.facilities as string[]).length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium">Fasilitas Terpilih:</Label>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {(data.facilities as string[]).map((facility, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {facility}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Guidelines */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Panduan Pengisian
                                    </CardTitle>
                                    <CardDescription>
                                        Tips untuk mengisi formulir dengan benar
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-start space-x-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                            <p>Nama ruangan sebaiknya singkat dan mudah diingat</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                            <p>Pastikan kapasitas sesuai dengan ukuran ruangan sebenarnya</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                            <p>Lengkapi fasilitas untuk memudahkan peminjam</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                            <p>Gambar akan membantu identifikasi ruangan</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-6">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={processing || !data.name || !data.code || !data.capacity || !data.status}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Menyimpan...' : 'Simpan Ruangan'}
                                    </Button>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Ruangan akan aktif setelah disimpan
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