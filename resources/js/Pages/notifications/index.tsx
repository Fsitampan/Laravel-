import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Bell, 
    Check, 
    X, 
    Eye, 
    Trash2, 
    CheckCheck, 
    Calendar, 
    User, 
    Building2,
    Clock,
    AlertCircle,
    Info,
    CheckCircle,
    XCircle,
    RefreshCw
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatDateTime } from '@/lib/utils';
import type { PageProps, Notification, PaginatedResponse } from '@/types';

interface NotificationsPageProps extends PageProps {
    notifications: PaginatedResponse<Notification>;
    unread_count: number;
}

export default function NotificationsIndex({ auth, notifications, unread_count }: NotificationsPageProps) {
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

    const handleMarkAsRead = (notificationId: number) => {
        router.patch(`/notifications/${notificationId}/mark-read`, {}, {
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['notifications', 'unread_count'] });
            }
        });
    };

    const handleMarkAllAsRead = () => {
        router.patch('/notifications/mark-all-read', {}, {
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['notifications', 'unread_count'] });
            }
        });
    };

    const handleDelete = (notificationId: number) => {
        router.delete(`/notifications/${notificationId}`, {
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['notifications', 'unread_count'] });
            }
        });
    };

    const handleBulkAction = (action: 'read' | 'delete') => {
        if (selectedNotifications.length === 0) return;

        if (action === 'read') {
            router.patch('/notifications/bulk-mark-read', {
                notification_ids: selectedNotifications
            }, {
                preserveState: true,
                onSuccess: () => {
                    setSelectedNotifications([]);
                    router.reload({ only: ['notifications', 'unread_count'] });
                }
            });
        } else if (action === 'delete') {
            router.delete('/notifications/bulk-delete', {
                data: { notification_ids: selectedNotifications },
                preserveState: true,
                onSuccess: () => {
                    setSelectedNotifications([]);
                    router.reload({ only: ['notifications', 'unread_count'] });
                }
            });
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'borrowing_approved':
                return <CheckCircle className="h-5 w-5 text-emerald-600" />;
            case 'borrowing_rejected':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'borrowing_created':
                return <Calendar className="h-5 w-5 text-blue-600" />;
            case 'borrowing_reminder':
                return <Clock className="h-5 w-5 text-orange-600" />;
            case 'room_maintenance':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'system_update':
                return <Info className="h-5 w-5 text-blue-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getNotificationBgColor = (type: string, isRead: boolean) => {
        if (isRead) return 'bg-white';
        
        switch (type) {
            case 'borrowing_approved':
                return 'bg-emerald-50';
            case 'borrowing_rejected':
                return 'bg-red-50';
            case 'borrowing_created':
                return 'bg-blue-50';
            case 'borrowing_reminder':
                return 'bg-orange-50';
            case 'room_maintenance':
                return 'bg-red-50';
            case 'system_update':
                return 'bg-blue-50';
            default:
                return 'bg-gray-50';
        }
    };

    const handlePageChange = (page: number) => {
        router.get('/notifications', { page }, { 
            preserveState: true,
            replace: true 
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            notifications={notifications.data} 
            unread_count={unread_count}
        >
            <Head title="Notifikasi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Notifikasi
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Kelola notifikasi dan pemberitahuan sistem
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Bell className="h-4 w-4 mr-2" />
                            {unread_count} belum dibaca
                        </Badge>
                        <Button variant="outline" onClick={() => router.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        {unread_count > 0 && (
                            <Button onClick={handleMarkAllAsRead}>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Tandai Semua Dibaca
                            </Button>
                        )}
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {selectedNotifications.length} notifikasi terpilih
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleBulkAction('read')}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Tandai Dibaca
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleBulkAction('delete')}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notifications List */}
                <div className="space-y-2">
                    {notifications.data.map((notification) => (
                        <Card 
                            key={notification.id} 
                            className={cn(
                                "smooth-hover cursor-pointer",
                                getNotificationBgColor(notification.type, !!notification.read_at),
                                !notification.read_at && "border-l-4 border-l-blue-400"
                            )}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                    {/* Checkbox */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.includes(notification.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedNotifications([...selectedNotifications, notification.id]);
                                                } else {
                                                    setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className={cn(
                                                    "text-sm font-medium",
                                                    !notification.read_at ? "text-gray-900" : "text-gray-700"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <p className={cn(
                                                    "text-sm",
                                                    !notification.read_at ? "text-gray-700" : "text-gray-500"
                                                )}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <span>{formatDateTime(notification.created_at)}</span>
                                                    {!notification.read_at && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Belum dibaca
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {!notification.read_at && (
                                                        <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Tandai Dibaca
                                                        </DropdownMenuItem>
                                                    )}
                                                    {notification.data?.borrowing_id && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/borrowings/${notification.data.borrowing_id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Lihat Detail
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {notification.data?.room_id && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/Rooms/${notification.data.room_id}`}>
                                                                <Building2 className="h-4 w-4 mr-2" />
                                                                Lihat Ruangan
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Data */}
                                {notification.data && Object.keys(notification.data).length > 0 && (
                                    <div className="mt-3 pl-9">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                                            {notification.data.borrowing_id && (
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Peminjaman #{notification.data.borrowing_id}</span>
                                                </div>
                                            )}
                                            {notification.data.room_name && (
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="h-3 w-3" />
                                                    <span>Ruang {notification.data.room_name}</span>
                                                </div>
                                            )}
                                            {notification.data.user_name && (
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-3 w-3" />
                                                    <span>{notification.data.user_name}</span>
                                                </div>
                                            )}
                                            {notification.data.scheduled_time && (
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDateTime(notification.data.scheduled_time)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {notifications.data.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada notifikasi
                            </h3>
                            <p className="text-gray-600">
                                Anda akan menerima notifikasi untuk aktivitas peminjaman ruangan dan sistem
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {notifications.data.length > 0 && notifications.last_page > 1 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {notifications.from} sampai {notifications.to} dari {notifications.total} notifikasi
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(notifications.current_page - 1)}
                                        disabled={notifications.current_page <= 1}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-gray-700">
                                        Halaman {notifications.current_page} dari {notifications.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(notifications.current_page + 1)}
                                        disabled={notifications.current_page >= notifications.last_page}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
