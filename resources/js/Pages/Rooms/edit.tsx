import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Building2,
    Users,
    MapPin,
    Edit3,
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Wifi,
    Monitor,
    Coffee,
    Car,
    Zap,
    Wind,
    Volume2,
    Camera,
    Shield,
    Plus,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps, Room } from '@/types';

interface EditRoomProps extends PageProps {
    room: Room;
}

const facilityOptions = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'projector', label: 'Proyektor', icon: Monitor },
    { id: 'ac', label: 'AC', icon: Wind },
    { id: 'sound_system', label: 'Sound System', icon: Volume2 },
    { id: 'whiteboard', label: 'Whiteboard', icon: Edit3 },
    { id: 'coffee_machine', label: 'Mesin Kopi', icon: Coffee },
    { id: 'parking', label: 'Parkir', icon: Car },
    { id: 'power_outlet', label: 'Stop Kontak', icon: Zap },
    { id: 'cctv', label: 'CCTV', icon: Camera },
    { id: 'security', label: 'Security', icon: Shield },
];

const statusOptions = [
    { value: 'available', label: 'Tersedia', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'occupied', label: 'Terpakai', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-red-100 text-red-800 border-red-200' },
];

export default function EditRoom({ auth, room }: EditRoomProps) {
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
    room.facilities ?? []
    );

    const { data, setData, put, processing, errors } = useForm({
        name: room.name || '',
        full_name: room.full_name || '',
        capacity: room.capacity || 0,
        location: room.location || '',
        description: room.description || '',
        status: room.status || 'available',
        facilities: JSON.stringify(selectedFacilities),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('facilities', JSON.stringify(selectedFacilities));
        put(`/Rooms/${room.id}`);
    };

    const toggleFacility = (facilityId: string) => {
        setSelectedFacilities(prev => {
            const newFacilities = prev.includes(facilityId)
                ? prev.filter(id => id !== facilityId)
                : [...prev, facilityId];
            setData('facilities', JSON.stringify(newFacilities));
            return newFacilities;
        });
    };

    const getStatusColor = (status: string) => {
        const statusConfig = statusOptions.find(s => s.value === status);
        return statusConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Ruang ${room.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Edit3 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Edit Ruang {room.name}
                                </h1>
                                <p className="text-gray-600">
                                    Perbarui informasi dan pengaturan ruangan
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className={cn("px-3 py-1", getStatusColor(room.status))}>
                            {statusOptions.find(s => s.value === room.status)?.label}
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/Rooms">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                                        Informasi Dasar
                                    </CardTitle>
                                    <CardDescription>
                                        Informasi utama tentang ruangan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nama Ruangan *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="A, B, C, dll"
                                                className={errors.name ? 'border-red-300' : ''}
                                                required
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Kapasitas *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    min="1"
                                                    max="200"
                                                    value={data.capacity}
                                                    onChange={(e) => setData('capacity', parseInt(e.target.value) || 0)}
                                                    placeholder="20"
                                                    className={errors.capacity ? 'border-red-300' : ''}
                                                    required
                                                />
                                                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            </div>
                                            {errors.capacity && (
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {errors.capacity}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Nama Lengkap</Label>
                                        <Input
                                            id="full_name"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="Ruang Rapat A"
                                            className={errors.full_name ? 'border-red-300' : ''}
                                        />
                                        {errors.full_name && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.full_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Lokasi *</Label>
                                        <div className="relative">
                                            <Input
                                                id="location"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                placeholder="Lantai 2, Gedung Utama"
                                                className={errors.location ? 'border-red-300' : ''}
                                                required
                                            />
                                            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                        {errors.location && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.location}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Deskripsi ruangan, catatan khusus, dll"
                                            rows={3}
                                            className={errors.description ? 'border-red-300' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Facilities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fasilitas Ruangan</CardTitle>
                                    <CardDescription>
                                        Pilih fasilitas yang tersedia di ruangan ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {facilityOptions.map((facility) => {
                                            const isSelected = selectedFacilities.includes(facility.id);
                                            return (
                                                <div
                                                    key={facility.id}
                                                    onClick={() => toggleFacility(facility.id)}
                                                    className={cn(
                                                        "flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                                        isSelected
                                                            ? "border-blue-200 bg-blue-50 text-blue-900"
                                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                                    )}
                                                >
                                                    <facility.icon className={cn(
                                                        "h-4 w-4",
                                                        isSelected ? "text-blue-600" : "text-gray-500"
                                                    )} />
                                                    <span className="text-sm font-medium">{facility.label}</span>
                                                    {isSelected && (
                                                        <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Status & Actions */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status Ruangan</CardTitle>
                                    <CardDescription>
                                        Atur status ketersediaan ruangan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value: 'available' | 'occupied' | 'maintenance') => setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        <div className="flex items-center space-x-2">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                status.value === 'available' ? 'bg-emerald-500' :
                                                                status.value === 'occupied' ? 'bg-orange-500' :
                                                                'bg-red-500'
                                                            )} />
                                                            <span>{status.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {data.status === 'available' && 'Ruangan dapat dipesan dan digunakan.'}
                                            {data.status === 'occupied' && 'Ruangan sedang digunakan atau telah dipesan.'}
                                            {data.status === 'maintenance' && 'Ruangan tidak dapat digunakan karena sedang dalam perbaikan.'}
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Terakhir</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Dibuat:</span>
                                        <span>{new Date(room.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Diperbarui:</span>
                                        <span>{new Date(room.updated_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Button asChild variant="outline">
                            <Link href={`/Rooms/${room.id}`}>
                                Batal
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}