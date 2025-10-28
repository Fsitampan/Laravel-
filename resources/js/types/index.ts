import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: 'super-admin' | 'admin' | 'pengguna';
    category: 'pegawai' | 'tamu' | 'magang';
    department: string | null;
    phone: string | null;
    address: string | null;
    bio: string | null;
    avatar: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    
    // Permission helper properties (computed on backend)
    can_manage_users?: boolean;
    can_manage_rooms?: boolean;
    can_manage_borrowers?: boolean;
    can_approve_rejects?: boolean;
    can_create_borrowings?: boolean;
    
    // Role helper methods (computed on backend)
    is_super_admin?: boolean;
    is_admin?: boolean;
    is_pengguna?: boolean;
    
    // Formatted properties
    role_label?: string;
    avatar_url?: string;
}

export interface Room {
    id: number;
    code: string;
    name: string;
    full_name?: string;
    description?: string;
    capacity: number;
    status: 'tersedia' | 'dipakai' | 'pemeliharaan';
    facilities?: string[];
    location?: string;
    image?: string;
    image_url: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    current_borrowing?: Borrowing;
    equipment?: RoomEquipment[];
    borrowings_count?: number;
    total_hours_used?: number;
    layouts?: string | string[];     
    layout_images?: string[];          
    notes?: string;                    
    
    
    // Relationships
    creator?: User;
    updater?: User;
    
    // Computed properties
    status_label?: string;
    facilities_text?: string;
    
    // Status helpers
    is_available?: boolean;
    is_occupied?: boolean;
    is_maintenance?: boolean;
}

export interface Borrowing {
    id: number;
    room_id: number;
    user_id: number;
    borrower_name: string;
    borrower_phone: string;
    borrower_category: 'pegawai' | 'tamu' | 'magang';
    borrower_department?: string;
    borrower_institution?: string;
    purpose: string;
    borrowed_at: string;
    returned_at?: string;
    actual_returned_date?: string;
    planned_return_at?: string;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
    notes?: string;
    admin_notes?: string;
    approved_by?: number;
    approved_at?: string;
    rejection_reason?: string;
    participant_count: number;
    equipment_needed?: string[];
    is_recurring: boolean;
    recurring_pattern?: string;
    recurring_end_date?: string;
    created_at: string;
    updated_at: string;
    borrow_date?: string;
    start_time?: string;
    end_time?: string;
    user_name?: string;
    layout_choice?: string | null;
    
    // Relationships
    room?: Room;
    user?: User;
    approver?: User;
    creator?: User;
    history?: BorrowingHistory[];
    
    // Computed properties
    status_label?: string;
    borrower_category_label?: string;
    room_name?: string;
    formatted_borrow_date?: string;
    formatted_time_range?: string;
    
    // Status helpers
    is_pending?: boolean;
    is_approved?: boolean;
    is_rejected?: boolean;
    is_active?: boolean;
    is_completed?: boolean;
}

export interface CreateRoomData extends Record<string, unknown>  {
    name: string;
    full_name?: string;
    description?: string;
    capacity: number;
    facilities?: string[];
    location?: string;
    image_url?: string;
    [key: string]: any;
}

export interface UpdateRoomData {
  name: string;
  full_name?: string;
  description?: string;
  capacity: number;
  facilities: string[];
  location?: string;
  image_url?: string;
  status: 'tersedia' | 'dipakai' | 'pemeliharaan';
  is_active: boolean;
 
}

export interface BorrowingHistory {
    id: number;
    borrowing_id: number;
    action: string;
    old_status: string | null;
    new_status: string | null;
    comment: string | null;
    performed_by: number;
    performed_at: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    borrowing?: Borrowing;
    performer?: User;
    performed_by_user?: Pick<User, 'id' | 'name' | 'email'>;
    
    // Computed properties
    action_label?: string;
    formatted_performed_at?: string;
}

export interface SystemSetting {
    id: number;
    key: string;
    value: string;
    type: 'string' | 'integer' | 'boolean' | 'json';
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

// types/index.ts

export type FormDataType = Record<string, any>;

export interface CreateBorrowingData {
  room_id: number;
  borrower_name: string;
  borrower_phone: string;
  borrower_category: 'pegawai' | 'tamu' | 'magang';
  borrower_department?: string;
  borrower_institution?: string;
  purpose: string;
  borrowed_at: string;
  planned_return_at?: string;
  participant_count: number;
  equipment_needed?: string[];
  notes?: string;
  is_recurring?: boolean;
  recurring_pattern?: string;
  recurring_end_date?: string;
}

export interface UpdateBorrowingData extends Partial<CreateBorrowingData> {
    status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
    admin_notes?: string;
    rejection_reason?: string;
    returned_at?: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
export interface Statistics {
    total_rooms?: number;
    available_rooms?: number;
    occupied_rooms?: number;
    maintenance_rooms?: number;
    total_borrowings?: number;
    pending_borrowings?: number;
    approved_borrowings?: number;
    active_borrowings?: number;
    completed_borrowings?: number;
    total_users?: number;
    active_users?: number;
    inactive_users?: number;
    today_borrowings?: number;
    this_week_borrowings?: number;
    this_month_borrowings?: number;
    [key: string]: number | undefined;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'pengguna';
    category: 'pegawai' | 'tamu' | 'magang';
    phone?: string;
    department?: string;
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password' | 'password_confirmation'>> {
    password?: string;
    password_confirmation?: string;
    is_active?: boolean;
}

export interface DashboardStats {
    total_rooms: number;
    available_rooms: number;
    occupied_rooms: number;
    maintenance_rooms: number;
    total_borrowings_today: number;
    pending_approvals: number;
    active_borrowings: number;
    total_users: number;
    total_borrowings: number;
    completed_borrowings: number;
    cancelled_borrowings: number;
    monthly_bookings: Array<{
        month: string;
        bookings: number;
    }>;
    room_utilization: Array<{
        room_name: string;
        utilization: number;
        total_hours: number;
    }>;
    recent_activities: Array<{
        id: number;
        type: string;
        title: string;
        description: string;
        timestamp: string;
        user?: string;
        room?: string;
        borrowing_id?: number;
    }>;
    user_stats: {
        total: number;
        active: number;
        inactive: number;
        admins: number;
        super_admins: number;
        regular_users: number;
        by_category: {
            employee: number;
            guest: number;
            intern: number;
        };
    };
    borrowing_stats: {
        today: number;
        this_week: number;
        this_month: number;
        pending: number;
        approved: number;
        active: number;
        completed: number;
        rejected: number;
        cancelled: number;
    };
}

export interface ChartData {
    name: string;
    value: number;
    color?: string;
    fill?: string;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface Errors {
    [key: string]: string | string[];
}

export interface SharedData {
    auth: {
        user: User;
    };
    flash?: FlashMessage;
    errors?: Errors;
    ziggy?: Config & { location: string };
    [key: string]: any;
}

export type PageProps<T = Record<string, unknown>> = T & SharedData;

export interface InertiaPageProps {
    auth: {
        user: User;
    };
    flash?: FlashMessage;
    errors?: Errors;
    ziggy?: Config & { location: string };
    laravelVersion?: string;
    phpVersion?: string;
    mustVerifyEmail?: boolean;
    status?: string;
}

// Navigation Types with title property
export interface NavItem {
    label?: string;
    title?: string;
    href: string;
    icon?: React.ComponentType<any> | null;
    active?: boolean;
    permission?: string;
    children?: NavItem[];
}

export interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    adminOnly?: boolean;
    superAdminOnly?: boolean;
    current?: boolean;
    badge?: number;
    children?: NavigationItem[];
    active?: boolean;
}

export interface BreadcrumbItem {
    label?: string;
    title?: string;
    href?: string;
    active?: boolean;
}

export interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    read_at?: string;
    created_at: string;
    updated_at: string;
    
    // Relations
    user?: User;
}

// Form Data Types
export interface RoomFormData {
    name: string;
    code: string;
    description?: string;
    capacity: number;
    status: 'tersedia' | 'dipakai' | 'pemeliharaan';
    location?: string;
    facilities?: string[];
    image?: File | null;
    notes?: string;
}

export interface BorrowingFormData {
    room_id: number;
    borrower_name: string;
    borrower_email: string;
    borrower_phone: string;
    borrower_identification: string;
    borrower_category: 'pegawai' | 'tamu' | 'magang';
    borrower_department?: string;
    borrow_date: string;
    start_time?: string;
    end_time?: string;
    return_date?: string;
    purpose: string;
    notes?: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role: 'super-admin' | 'admin' | 'pengguna';
    department?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: File | null;
    is_active: boolean;
}

export interface ProfileFormData {
    name: string;
    email: string;
    department?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: File | null;
}

// Filter Types
export interface RoomFilters {
    search?: string;
    status?: 'available' | 'occupied' | 'maintenance' | 'all';
    capacity_min?: number;
    capacity_max?: number;
    location?: string;
    has_equipment?: string;
    page?: number;
    per_page?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export interface BorrowingFilters {
      search?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled' | 'all';
    room_id?: number;
    user_id?: number;
    category?: 'pegawai' | 'tamu' | 'magang' | 'all';
    date_from?: string;
    date_to?: string;
    viewAll?: number;
}

export interface UserFilters {
    search?: string;
    role?: 'super-admin' | 'admin' | 'pengguna' | 'all';
    category?: 'pegawai' | 'tamu' | 'magang' | 'all';
    is_active?: boolean | 'all';
    department?: string;
}

export interface HistoryFilters {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    action?: string;
}

export interface ApprovalFilters {
    search?: string;
    status?: 'pending' | 'all';
    room_id?: number;
    category?: 'employee' | 'guest' | 'intern' | 'all';
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

// Option Types
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface StatusOption extends SelectOption {
    color?: string;
    bgColor?: string;
}

// Dashboard Types
export interface DashboardData {
    statistics: Statistics;
    recent_borrowings: Borrowing[];
    room_utilization: ChartData[];
    borrowing_trends: ChartData[];
    category_distribution: ChartData[];
    upcoming_returns: Borrowing[];
    pending_approvals?: Borrowing[];
}

// Approval Types
export interface ApprovalData {
    borrowing: Borrowing;
    comment?: string;
    reason?: string;
}

// Component Props Types
export interface LayoutProps {
    user: User;
    children: React.ReactNode;
}

export interface AuthLayoutProps extends LayoutProps {
    header?: React.ReactNode;
    sidebar?: boolean;
}

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    pagination?: PaginationMeta;
    loading?: boolean;
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    onPageChange?: (page: number) => void;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    path: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url?: string;
    prev_page_url?: string;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}


// Theme Types
export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    foregroundColor: string;
}

// Permission Types
export type Permission = 
    | 'manage-users'
    | 'manage-rooms' 
    | 'manage-borrowers'
    | 'approve-rejects'
    | 'create-borrowings'
    | 'view-reports'
    | 'manage-settings';

export interface Role {
    name: string;
    label: string;
    permissions: Permission[];
}

// Export types for external use
export type {
    Config
};

export interface RoomEquipment {
    id: number;
    room_id: number;
    name: string;
    type?: string;
    quantity: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
    description?: string;
    last_maintenance?: string;
    next_maintenance?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    
    // Relations
    room?: Room;
}

// Utility types
export type RoomStatus = 'tersedia' | 'dipakai' | 'pemeliharaan';
export type BorrowingStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
export type UserRole = 'super-admin' | 'admin' | 'pengguna';
export type BorrowerCategory = 'pegawai' | 'tamu' | 'magang';
export type UserCategory = 'pegawai' | 'tamu' | 'magang';
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'broken';

// Event types for real-time updates
export interface RealtimeEvent {
    type: 'room_status_changed' | 'borrowing_created' | 'borrowing_updated' | 'user_login' | 'user_logout';
    data: any;
    timestamp: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
    onPageChange?: (page: number) => void;
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    actions?: Array<{
        label: string;
        icon?: React.ComponentType<{ className?: string }>;
        onClick: (item: T) => void;
        variant?: 'default' | 'destructive';
        adminOnly?: boolean;
    }>;
}

export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
}