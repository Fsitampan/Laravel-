import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps, CreateRoomData } from '@/types';
import { Link } from '@inertiajs/react';

export default function CreateRoom({ auth }: PageProps) {
    const [facilitiesList, setFacilitiesList] = useState<string[]>(['']);
    const [imagePreview, setImagePreview] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm<CreateRoomData>({
        name: '',
        full_name: '',
        description: '',
        capacity: 1,
        facilities: [],
        location: '',
        image_url: '',
        hourly_rate: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/Rooms', {
            onSuccess: () => {
                router.visit('/Rooms');
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
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
        setImagePreview(url);
    };

    const commonFacilities = [
        'Proyektor', 'Whiteboard', 'Air Conditioner', 'WiFi', 'Meja', 'Kursi',
        'Sound System', 'Microphone', 'Podium', 'Laptop', 'Flipchart', 'Marker'
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tambah Ruangan Baru" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/Rooms">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900">
                                Tambah Ruangan Baru
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Isi formulir di bawah untuk menambahkan ruangan baru
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Building2 className="h-5 w-5 mr-2" />
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
                                                className={cn(errors.name && "border-red-500")}
                                                placeholder="A, B, C, Aula, dll"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
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
                                                onChange={(e) => setData('capacity', parseInt(e.target.value) || 1)}
                                                className={cn(errors.capacity && "border-red-500")}
                                            />
                                            {errors.capacity && (
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

                                    <div>
                                        <Label htmlFor="hourly_rate">Tarif per Jam (Opsional)</Label>
                                        <Input
                                            id="hourly_rate"
                                            type="number"
                                            min="0"
                                            value={data.hourly_rate}
                                            onChange={(e) => setData('hourly_rate', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Kosongkan jika gratis
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Facilities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fasilitas Ruangan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">Fasilitas Umum</Label>
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
                                            {facilitiesList.filter(f => !commonFacilities.includes(f)).map((facility, index) => (
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Camera className="h-5 w-5 mr-2" />
                                        Gambar Ruangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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

                                    {imagePreview && (
                                        <div className="mt-4">
                                            <Label>Preview Gambar</Label>
                                            <div className="mt-2 border rounded-lg overflow-hidden">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview ruangan"
                                                    className="w-full h-48 object-cover"
                                                    onError={() => setImagePreview('')}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Ruangan</CardTitle>
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
                                        {data.hourly_rate && data.hourly_rate > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tarif/Jam:</span>
                                                <span className="font-medium">Rp {data.hourly_rate.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {data.facilities && data.facilities.length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium">Fasilitas Terpilih:</Label>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {data.facilities.map((facility, index) => (
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <AlertCircle className="h-5 w-5 mr-2" />
                                        Panduan
                                    </CardTitle>
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
                            <Card>
                                <CardContent className="p-4">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={processing || !data.name || !data.capacity}
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