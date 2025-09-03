import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar as CalendarIcon, Clock, Users, MapPin, Plus, Minus, Building2 } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import type { PageProps, Room, CreateBorrowingData } from '@/types';

interface CreateBorrowingPageProps extends PageProps {
    rooms: Room[];
    selectedRoom?: Room;
}

export default function CreateBorrowing({ auth, rooms, selectedRoom }: CreateBorrowingPageProps) {
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedRoom_state, setSelectedRoom] = useState<Room | null>(selectedRoom || null);
    const [equipmentList, setEquipmentList] = useState<string[]>(['']);

    // Gunakan CreateBorrowingData atau FormDataType jika masih error
    const { data, setData, post, processing, errors, reset } = useForm<CreateBorrowingData>({
        room_id: selectedRoom?.id || 0,
        borrower_name: auth.user.name || '',
        borrower_phone: auth.user.phone || '',
        borrower_category: auth.user.category || 'employee',
        borrower_department: auth.user.department || '',
        borrower_institution: '',
        purpose: '',
        borrowed_at: '',
        planned_return_at: '',
        participant_count: 1,
        equipment_needed: [],
        notes: '',
        is_recurring: false,
        recurring_pattern: '',
        recurring_end_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('borrowings.store'));
    };

    // Filter available rooms
    const availableRooms = rooms.filter(room => 
        room.status === 'available' && room.is_active
    );

    const handleRoomSelect = (roomId: string) => {
        const room = availableRooms.find(r => r.id === parseInt(roomId));
        setSelectedRoom(room || null);
        setData('room_id', parseInt(roomId));
    };

    const handleDateTimeChange = (field: 'borrowed_at' | 'planned_return_at', date: Date | undefined, time: string) => {
        if (date && time) {
            const [hours, minutes] = time.split(':');
            const dateTime = new Date(date);
            dateTime.setHours(parseInt(hours), parseInt(minutes));
            setData(field, dateTime.toISOString().slice(0, 16));
        }
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Buat Peminjaman Ruangan" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Buat Peminjaman Ruangan
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Isi formulir di bawah untuk mengajukan peminjaman ruangan
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Room Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Building2 className="h-5 w-5 mr-2" />
                                        Pilih Ruangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="room_id">Ruangan</Label>
                                        <Select 
                                            value={data.room_id.toString()} 
                                            onValueChange={handleRoomSelect}
                                        >
                                            <SelectTrigger className={cn(errors.room_id && "border-red-500")}>
                                                <SelectValue placeholder="Pilih ruangan yang tersedia" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRooms.map((room) => (
                                                    <SelectItem key={room.id} value={room.id.toString()}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>Ruang {room.name}</span>
                                                            <Badge variant="outline" className="ml-2">
                                                                {room.capacity} orang
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
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
                                            {selectedRoom_state.facilities && selectedRoom_state.facilities.length > 0 && (
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

                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Peminjam</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="borrower_name">Nama Peminjam</Label>
                                            <Input
                                                id="borrower_name"
                                                type="text"
                                                value={data.borrower_name}
                                                onChange={(e) => setData('borrower_name', e.target.value)}
                                                className={cn(errors.borrower_name && "border-red-500")}
                                                placeholder="Masukkan nama lengkap"
                                            />
                                            {errors.borrower_name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.borrower_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="borrower_phone">Nomor Telepon</Label>
                                            <Input
                                                id="borrower_phone"
                                                type="tel"
                                                value={data.borrower_phone}
                                                onChange={(e) => setData('borrower_phone', e.target.value)}
                                                className={cn(errors.borrower_phone && "border-red-500")}
                                                placeholder="08xxxxxxxxxx"
                                            />
                                            {errors.borrower_phone && (
                                                <p className="text-sm text-red-600 mt-1">{errors.borrower_phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="borrower_category">Kategori</Label>
                                            <Select 
                                                value={data.borrower_category} 
                                                onValueChange={(value) => setData('borrower_category', value as any)}
                                            >
                                                <SelectTrigger className={cn(errors.borrower_category && "border-red-500")}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="employee">Pegawai</SelectItem>
                                                    <SelectItem value="guest">Tamu</SelectItem>
                                                    <SelectItem value="intern">Magang</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.borrower_category && (
                                                <p className="text-sm text-red-600 mt-1">{errors.borrower_category}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="participant_count">Jumlah Peserta</Label>
                                            <Input
                                                id="participant_count"
                                                type="number"
                                                min="1"
                                                max={selectedRoom_state?.capacity || 100}
                                                value={data.participant_count}
                                                onChange={(e) => setData('participant_count', parseInt(e.target.value) || 1)}
                                                className={cn(errors.participant_count && "border-red-500")}
                                            />
                                            {errors.participant_count && (
                                                <p className="text-sm text-red-600 mt-1">{errors.participant_count}</p>
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
                                                disabled={data.borrower_category !== 'guest'}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Schedule */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CalendarIcon className="h-5 w-5 mr-2" />
                                        Jadwal Peminjaman
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="borrowed_at">Mulai</Label>
                                            <Input
                                                id="borrowed_at"
                                                type="datetime-local"
                                                value={data.borrowed_at}
                                                onChange={(e) => setData('borrowed_at', e.target.value)}
                                                className={cn(errors.borrowed_at && "border-red-500")}
                                                min={new Date().toISOString().slice(0, 16)}
                                            />
                                            {errors.borrowed_at && (
                                                <p className="text-sm text-red-600 mt-1">{errors.borrowed_at}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="planned_return_at">Selesai (Estimasi)</Label>
                                            <Input
                                                id="planned_return_at"
                                                type="datetime-local"
                                                value={data.planned_return_at}
                                                onChange={(e) => setData('planned_return_at', e.target.value)}
                                                className={cn(errors.planned_return_at && "border-red-500")}
                                                min={data.borrowed_at || new Date().toISOString().slice(0, 16)}
                                            />
                                            {errors.planned_return_at && (
                                                <p className="text-sm text-red-600 mt-1">{errors.planned_return_at}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recurring Options */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_recurring"
                                                checked={data.is_recurring}
                                                onCheckedChange={(checked) => setData('is_recurring', !!checked)}
                                            />
                                            <Label htmlFor="is_recurring">Peminjaman berulang</Label>
                                        </div>

                                        {data.is_recurring && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200 bg-blue-50 p-4 rounded">
                                                <div>
                                                    <Label htmlFor="recurring_pattern">Pola Pengulangan</Label>
                                                    <Select 
                                                        value={data.recurring_pattern} 
                                                        onValueChange={(value) => setData('recurring_pattern', value)}
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
                                                    <Label htmlFor="recurring_end_date">Tanggal Berakhir</Label>
                                                    <Input
                                                        id="recurring_end_date"
                                                        type="date"
                                                        value={data.recurring_end_date}
                                                        onChange={(e) => setData('recurring_end_date', e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Purpose & Equipment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Keperluan & Peralatan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="purpose">Tujuan Peminjaman</Label>
                                        <Textarea
                                            id="purpose"
                                            value={data.purpose}
                                            onChange={(e) => setData('purpose', e.target.value)}
                                            className={cn(errors.purpose && "border-red-500")}
                                            placeholder="Jelaskan tujuan dan kegiatan yang akan dilakukan"
                                            rows={3}
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Peminjaman</CardTitle>
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
                                        {data.borrowed_at && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Mulai:</span>
                                                <span className="font-medium">
                                                    {formatDateTime(data.borrowed_at)}
                                                </span>
                                            </div>
                                        )}
                                        {data.planned_return_at && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Selesai:</span>
                                                <span className="font-medium">
                                                    {formatDateTime(data.planned_return_at)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
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
                                            <p>Peminjaman harus diajukan minimal H-1 dari tanggal penggunaan</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                            <p>Pastikan jumlah peserta tidak melebihi kapasitas ruangan</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                            <p>Peminjaman akan diproses oleh admin dalam 1x24 jam</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                            <p>Jaga kebersihan dan keutuhan fasilitas ruangan</p>
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
                                        disabled={processing || !data.room_id || !data.borrower_name || !data.purpose || !data.borrowed_at}
                                    >
                                        {processing ? 'Menyimpan...' : 'Ajukan Peminjaman'}
                                    </Button>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Peminjaman akan menunggu persetujuan admin
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