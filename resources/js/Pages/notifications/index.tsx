import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    Bell, 
    Check, 
    CheckCheck, 
    Trash2, 
    Search, 
    Calendar,
    Users,
    Building2,
    UserPlus,
    UserCog,
    UserMinus,
    PlusCircle,
    Edit,
    XCircle,
    Ban,
    CheckCircle,
    Clock,
    AlertTriangle,
    AlertCircle,
    Info,
    Filter,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const getCsrfToken = (): string => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        console.error('CSRF token not found');
        return '';
    }
    return token;
};

// Types
interface NotificationData {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    data?: any;
    read_at?: string | null;
    created_at: string;
    updated_at: string;
    time_ago?: string;
    icon?: string;
    color?: string;
    category?: string;
    priority?: string;
}

interface NotificationStats {
    total: number;
    unread: number;
    read: number;
    by_category: {
        user: number;
        room: number;
        borrowing: number;
        system: number;
    };
}

interface PageProps {
    auth: {
        user: any;
    };
    initialNotifications: NotificationData[];
    initialStats: NotificationStats;
}

// Utility functions
const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Icon mapping
const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, any> = {
        'user_registered': UserPlus,
        'user_profile_updated': UserCog,
        'user_deleted': UserMinus,
        'room_created': PlusCircle,
        'room_updated': Edit,
        'room_deleted': Trash2,
        'room_maintenance': AlertTriangle,
        'room_available': CheckCircle,
        'borrowing_created': AlertCircle,
        'borrowing_approved': CheckCircle,
        'borrowing_rejected': XCircle,
        'borrowing_cancelled': Ban,
        'borrowing_completed': Check,
        'borrowing_reminder': Clock,
        'borrowing_updated': Edit,
        'borrowing_deleted': Trash2,
        'system_update': Info,
        'system_maintenance': AlertTriangle, // ← Tambahkan ini
        'system_alert': AlertTriangle, // ← Tambahkan ini
    };
    return iconMap[type] || Bell;
};

const getNotificationTypeColor = (type: string) => {
    if (type.startsWith('user_')) return 'purple';
    if (type.startsWith('room_')) return 'orange';
    if (type.startsWith('borrowing_')) return 'blue';
    return 'gray';
};

    const getNotificationTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'user_registered': 'Pengguna Baru',
            'user_profile_updated': 'Profil Diperbarui',
            'user_deleted': 'Pengguna Dihapus',
            'room_created': 'Ruangan Dibuat',
            'room_updated': 'Ruangan Diperbarui',
            'room_deleted': 'Ruangan Dihapus',
            'room_maintenance': 'Maintenance',
            'room_available': 'Ruangan Tersedia',
            'borrowing_created': 'Peminjaman Baru',
            'borrowing_approved': 'Disetujui',
            'borrowing_rejected': 'Ditolak',
            'borrowing_cancelled': 'Dibatalkan',
            'borrowing_completed': 'Selesai',
            'borrowing_reminder': 'Pengingat',
            'borrowing_updated': 'Diperbarui',
            'borrowing_deleted': 'Dihapus',
            'system_update': 'Pembaruan Sistem',
            'system_maintenance': 'Pemeliharaan Sistem', // ← Tambahkan ini
            'system_alert': 'Peringatan Sistem', // ← Tambahkan ini
        };
        return labels[type] || type;
    };

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
    <Card className="border-dashed">
        <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">{message}</p>
        </CardContent>
    </Card>
);

// Notification item component
const NotificationItem = ({
    notification,
    selected,
    onSelect,
    onMarkAsRead,
}: {
    notification: NotificationData;
    selected: boolean;
    onSelect: (id: number) => void;
    onMarkAsRead: (id: number) => void;
}) => {
    const Icon = getNotificationIcon(notification.type);
    const color = notification.color || getNotificationTypeColor(notification.type);
    const isUnread = !notification.read_at;

    const colorClasses: Record<string, string> = {
        purple: 'bg-purple-100 text-purple-700',
        blue: 'bg-blue-100 text-blue-700',
        orange: 'bg-orange-100 text-orange-700',
        green: 'bg-emerald-100 text-emerald-700',
        red: 'bg-red-100 text-red-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        gray: 'bg-gray-100 text-gray-700',
    };

    return (
        <Card className={cn("transition-all hover:shadow-md", isUnread && "border-primary")}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Checkbox
                        checked={selected}
                        onCheckedChange={() => onSelect(notification.id)}
                        className="mt-1"
                    />
                    <div className={cn("p-2 rounded-lg shrink-0", colorClasses[color] || colorClasses.gray)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={cn("font-semibold", isUnread && "text-primary")}>
                                    {notification.title}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                    {getNotificationTypeLabel(notification.type)}
                                </Badge>
                                {isUnread && (
                                    <Badge variant="default" className="text-xs">
                                        Baru
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {isUnread && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onMarkAsRead(notification.id)}
                                        className="h-8"
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Tandai Dibaca
                                    </Button>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                            {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{notification.time_ago || formatDateTime(notification.created_at)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function NotificationsIndex({ auth, initialNotifications, initialStats }: PageProps) {
    const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications || []);
    const [stats, setStats] = useState<NotificationStats>(initialStats);
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch notifications and stats
    const fetchNotifications = async () => {
        setLoading(true);
            try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Accept': 'application/json'
                },
            });
            if (!response.ok) {
                const txt = await response.text();
                throw new Error(`HTTP ${response.status}: ${txt}`);
            }
            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            toast.error('Gagal memuat notifikasi');
        } finally {
            setLoading(false);
        }
    };

      const fetchStats = async () => {
        try {
            const response = await fetch('/api/notifications/statistics', {
                headers: {
                    'Accept': 'application/json'
                },
            });
            if (!response.ok) {
                const txt = await response.text();
                throw new Error(`HTTP ${response.status}: ${txt}`);
            }
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Dipanggil saat mount
    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, []);

    // Mark as read
    const handleMarkAsRead = async (id: number | string) => {
        try {
            const response = await fetch(`/api/notifications/${id}/mark-read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const txt = await response.text();
                throw new Error(`HTTP ${response.status}: ${txt}`);
            }

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            await fetchStats();
            toast.success('Notifikasi ditandai sebagai dibaca');
        } catch (error) {
            console.error('Error marking as read:', error);
            toast.error('Gagal menandai notifikasi');
        }
    };

    // Mark all as read
     const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const txt = await response.text();
                throw new Error(`HTTP ${response.status}: ${txt}`);
            }

            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            await fetchStats();
            toast.success('Semua notifikasi ditandai sebagai dibaca');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Gagal menandai semua notifikasi');
        }
    };

    // Delete selected
        const handleDeleteSelected = async () => {
        if (selectedNotifications.length === 0) {
            toast.error('Pilih notifikasi terlebih dahulu');
            return;
        }

        if (!confirm(`Hapus ${selectedNotifications.length} notifikasi yang dipilih?`)) {
            return;
        }

        try {
            // opsi: panggil bulk-delete endpoint atau loop DELETE per id
            await Promise.all(
                selectedNotifications.map(id =>
                    fetch(`/api/notifications/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'Accept': 'application/json',
                        },
                    })
                )
            );

            setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
            setSelectedNotifications([]);
            await fetchStats();
            toast.success(`${selectedNotifications.length} notifikasi telah dihapus`);
        } catch (error) {
            console.error('Error deleting notifications:', error);
            toast.error('Gagal menghapus notifikasi');
        }
    };

    // Filter notifications
     const filteredNotifications = notifications.filter(n => {
        const matchesSearch = searchTerm === '' || 
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.message.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const unreadNotifications = filteredNotifications.filter(n => !n.read_at);
    const userNotifications = filteredNotifications.filter(n => (n.type || '').toString().startsWith('user_'));
    const roomNotifications = filteredNotifications.filter(n => (n.type || '').toString().startsWith('room_'));
    const borrowingNotifications = filteredNotifications.filter(n => (n.type || '').toString().startsWith('borrowing_'));
    const systemNotifications = filteredNotifications.filter(n => (n.type || '').toString().startsWith('system_'));

    // Select all handler
    const handleSelectAll = (notifs: NotificationData[]) => {
        if (selectedNotifications.length === notifs.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(notifs.map(n => n.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Notifikasi</h2>
                        <p className="text-sm text-muted-foreground">Kelola dan pantau semua notifikasi sistem</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedNotifications.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteSelected}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus ({selectedNotifications.length})
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Tandai Semua Dibaca
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Notifikasi" />

            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Belum Dibaca</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                                </div>
                                <Bell className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pengguna</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.by_category.user}</p>
                                </div>
                                <Users className="h-8 w-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Ruangan</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.by_category.room}</p>
                                </div>
                                <Building2 className="h-8 w-8 text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Peminjaman</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.by_category.borrowing}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Cari notifikasi berdasarkan judul, pesan, atau tipe..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications List with Tabs */}
                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">
                            Semua ({filteredNotifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="unread">
                            Belum Dibaca ({unreadNotifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="users">
                            <Users className="h-4 w-4 mr-1" />
                            Pengguna ({userNotifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="rooms">
                            <Building2 className="h-4 w-4 mr-1" />
                            Ruangan ({roomNotifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="borrowings">
                            <Calendar className="h-4 w-4 mr-1" />
                            Peminjaman ({borrowingNotifications.length})
                        </TabsTrigger>
                         <TabsTrigger value="system">
                            <Info className="h-4 w-4 mr-1" />
                            System ({systemNotifications.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-3">
                        {filteredNotifications.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSelectAll(filteredNotifications)}
                                    >
                                        {selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0
                                            ? 'Batal Pilih'
                                            : 'Pilih Semua'}
                                    </Button>
                                </div>
                                {filteredNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        selected={selectedNotifications.includes(notification.id)}
                                        onSelect={(id) => {
                                            setSelectedNotifications(prev =>
                                                prev.includes(id)
                                                    ? prev.filter(n => n !== id)
                                                    : [...prev, id]
                                            );
                                        }}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </>
                        ) : (
                            <EmptyState message="Tidak ada notifikasi yang ditemukan" />
                        )}
                    </TabsContent>

                    <TabsContent value="unread" className="space-y-3">
                        {unreadNotifications.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSelectAll(unreadNotifications)}
                                    >
                                        {selectedNotifications.length === unreadNotifications.length && unreadNotifications.length > 0
                                            ? 'Batal Pilih'
                                            : 'Pilih Semua'}
                                    </Button>
                                </div>
                                {unreadNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        selected={selectedNotifications.includes(notification.id)}
                                        onSelect={(id) => {
                                            setSelectedNotifications(prev =>
                                                prev.includes(id)
                                                    ? prev.filter(n => n !== id)
                                                    : [...prev, id]
                                            );
                                        }}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </>
                        ) : (
                            <EmptyState message="Tidak ada notifikasi yang belum dibaca" />
                        )}
                    </TabsContent>

                    <TabsContent value="users" className="space-y-3">
                        {userNotifications.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSelectAll(userNotifications)}
                                    >
                                        {selectedNotifications.length === userNotifications.length && userNotifications.length > 0
                                            ? 'Batal Pilih'
                                            : 'Pilih Semua'}
                                    </Button>
                                </div>
                                {userNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        selected={selectedNotifications.includes(notification.id)}
                                        onSelect={(id) => {
                                            setSelectedNotifications(prev =>
                                                prev.includes(id)
                                                    ? prev.filter(n => n !== id)
                                                    : [...prev, id]
                                            );
                                        }}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </>
                        ) : (
                            <EmptyState message="Tidak ada notifikasi pengguna" />
                        )}
                    </TabsContent>

                    <TabsContent value="rooms" className="space-y-3">
                        {roomNotifications.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSelectAll(roomNotifications)}
                                    >
                                        {selectedNotifications.length === roomNotifications.length && roomNotifications.length > 0
                                            ? 'Batal Pilih'
                                            : 'Pilih Semua'}
                                    </Button>
                                </div>
                                {roomNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        selected={selectedNotifications.includes(notification.id)}
                                        onSelect={(id) => {
                                            setSelectedNotifications(prev =>
                                                prev.includes(id)
                                                    ? prev.filter(n => n !== id)
                                                    : [...prev, id]
                                            );
                                        }}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </>
                        ) : (
                            <EmptyState message="Tidak ada notifikasi ruangan" />
                        )}
                    </TabsContent>

                    <TabsContent value="borrowings" className="space-y-3">
                        {borrowingNotifications.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSelectAll(borrowingNotifications)}
                                    >
                                        {selectedNotifications.length === borrowingNotifications.length && borrowingNotifications.length > 0
                                            ? 'Batal Pilih'
                                            : 'Pilih Semua'}
                                    </Button>
                                </div>
                                {borrowingNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        selected={selectedNotifications.includes(notification.id)}
                                        onSelect={(id) => {
                                            setSelectedNotifications(prev =>
                                                prev.includes(id)
                                                    ? prev.filter(n => n !== id)
                                                    : [...prev, id]
                                            );
                                        }}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))}
                            </>
                        ) : (
                            <EmptyState message="Tidak ada notifikasi peminjaman" />
                        )}
                    </TabsContent>

                     <TabsContent value="system" className="space-y-3">
        {systemNotifications.length > 0 ? (
            <>
                <div className="flex items-center justify-between mb-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll(systemNotifications)}
                    >
                        {selectedNotifications.length === systemNotifications.length && systemNotifications.length > 0
                            ? 'Batal Pilih'
                            : 'Pilih Semua'}
                    </Button>
                </div>
                {systemNotifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        selected={selectedNotifications.includes(notification.id)}
                        onSelect={(id) => {
                            setSelectedNotifications(prev =>
                                prev.includes(id)
                                    ? prev.filter(n => n !== id)
                                    : [...prev, id]
                            );
                        }}
                        onMarkAsRead={handleMarkAsRead}
                    />
                ))}
            </>
        ) : (
            <EmptyState message="Tidak ada notifikasi sistem" />
        )}
    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
