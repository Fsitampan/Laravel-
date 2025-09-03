import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };
    
    return new Intl.DateTimeFormat('id-ID', { ...defaultOptions, ...options }).format(
        typeof date === 'string' ? new Date(date) : date
    );
}

export function formatDateTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    
    return new Intl.DateTimeFormat('id-ID', { ...defaultOptions, ...options }).format(
        typeof date === 'string' ? new Date(date) : date
    );
}

export function formatTime(date: string | Date): string {
    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(typeof date === 'string' ? new Date(date) : date);
}

export function formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Baru saja';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} jam yang lalu`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} hari yang lalu`;
    } else {
        return formatDate(targetDate);
    }
}

export function formatCurrency(amount: number, currency = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(number: number): string {
    return new Intl.NumberFormat('id-ID').format(number);
}

export function formatDuration(startDate: string | Date, endDate: string | Date): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
        return `${diffInMinutes} menit`;
    } else {
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
    }
}

export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        // Room statuses
        available: 'text-available bg-available-bg border-available',
        occupied: 'text-occupied bg-occupied-bg border-occupied',
        maintenance: 'text-maintenance bg-maintenance-bg border-maintenance',
        
        // Borrowing statuses
        pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        approved: 'text-blue-700 bg-blue-50 border-blue-200',
        rejected: 'text-red-700 bg-red-50 border-red-200',
        active: 'text-green-700 bg-green-50 border-green-200',
        completed: 'text-gray-700 bg-gray-50 border-gray-200',
        cancelled: 'text-red-700 bg-red-50 border-red-200',
        
        // User roles
        'super-admin': 'text-super-admin bg-super-admin-bg border-super-admin',
        admin: 'text-admin bg-admin-bg border-admin',
        user: 'text-user bg-user-bg border-user',
        
        // User categories
        employee: 'text-employee bg-employee-bg border-employee',
        guest: 'text-guest bg-guest-bg border-guest',
        intern: 'text-intern bg-intern-bg border-intern',
        
        // Equipment conditions
        excellent: 'text-green-700 bg-green-50 border-green-200',
        good: 'text-blue-700 bg-blue-50 border-blue-200',
        fair: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        poor: 'text-orange-700 bg-orange-50 border-orange-200',
        broken: 'text-red-700 bg-red-50 border-red-200',
    };
    
    return statusColors[status] || 'text-gray-700 bg-gray-50 border-gray-200';
}

export function getStatusLabel(status: string, type: 'room' | 'borrowing' | 'role' | 'category' | 'condition' = 'borrowing'): string {
    const labels: Record<string, Record<string, string>> = {
        room: {
            available: 'Tersedia',
            occupied: 'Terpakai',
            maintenance: 'Maintenance',
        },
        borrowing: {
            pending: 'Menunggu Persetujuan',
            approved: 'Disetujui',
            rejected: 'Ditolak',
            active: 'Sedang Berlangsung',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        },
        role: {
            'super-admin': 'Super Admin',
            admin: 'Administrator',
            user: 'Pengguna',
        },
        category: {
            employee: 'Pegawai',
            guest: 'Tamu',
            intern: 'Magang',
        },
        condition: {
            excellent: 'Sangat Baik',
            good: 'Baik',
            fair: 'Cukup',
            poor: 'Buruk',
            broken: 'Rusak',
        },
    };
    
    return labels[type]?.[status] || status;
}

export function generateAvatarUrl(name: string): string {
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=2563eb&color=ffffff&size=128&format=svg`;
}

export function getUserInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

export function formatPhone(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Indonesian phone numbers
    if (cleaned.startsWith('62')) {
        return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
        return `+62${cleaned.slice(1)}`;
    } else {
        return `+62${cleaned}`;
    }
}

export function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return Promise.resolve();
        } catch (err) {
            document.body.removeChild(textArea);
            return Promise.reject(err);
        }
    }
}

export function downloadFile(data: BlobPart[], filename: string, type = 'text/plain'): void {
    const blob = new Blob(data, { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>): void => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
}

export function isDateInPast(date: string | Date): boolean {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    return targetDate < new Date();
}

export function isDateInFuture(date: string | Date): boolean {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    return targetDate > new Date();
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
}

export function getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
}

export function convertToLocalTime(utcDate: string | Date): Date {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    return new Date(date.getTime() - (getTimezoneOffset() * 60000));
}

export function convertToUTC(localDate: string | Date): Date {
    const date = typeof localDate === 'string' ? new Date(localDate) : localDate;
    return new Date(date.getTime() + (getTimezoneOffset() * 60000));
}

export function generateRandomId(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function parseJsonSafely<T = any>(json: string, fallback: T | null = null): T | null {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}

export function objectToQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(item => params.append(key, String(item)));
            } else {
                params.append(key, String(value));
            }
        }
    }
    
    return params.toString();
}

export function queryStringToObject(queryString: string): Record<string, any> {
    const params = new URLSearchParams(queryString);
    const result: Record<string, any> = {};
    
    for (const [key, value] of params.entries()) {
        if (result[key]) {
            if (Array.isArray(result[key])) {
                result[key].push(value);
            } else {
                result[key] = [result[key], value];
            }
        } else {
            result[key] = value;
        }
    }
    
    return result;
}

export function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

export function getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

export function kebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

export function camelCase(str: string): string {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, '');
}

export function snakeCase(str: string): string {
    return str
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');
}