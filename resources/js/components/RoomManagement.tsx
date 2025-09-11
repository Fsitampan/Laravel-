import React, { useState } from 'react';

// This is a self-contained React application for room management.
// All UI components, logic, and styling are contained within this single file
// to resolve the compilation errors from external dependencies.

interface Room {
  id: number;
  name: string;
  code: string;
  capacity: number;
  location: string;
  description?: string;
  status: 'available' | 'occupied' | 'maintenance';
  equipment: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const mockRooms: Room[] = [
  {
    id: 1,
    name: 'Ruang A',
    code: 'A',
    capacity: 25,
    location: 'Lantai 1, Sayap Utara',
    description: 'Ruang rapat utama dengan fasilitas presentasi lengkap',
    status: 'available',
    equipment: ['Proyektor', 'AC', 'Whiteboard', 'Microphone', 'WiFi'],
    image_url: 'https://images.unsplash.com/photo-1745970649957-b4b1f7fde4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25mZXJlbmNlJTIwcm9vbSUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3Mjk3MTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-26T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Ruang B',
    code: 'B',
    capacity: 20,
    location: 'Lantai 1, Sayap Selatan',
    description: 'Ruang rapat untuk tim kecil dengan suasana nyaman',
    status: 'occupied',
    equipment: ['TV Monitor', 'AC', 'Whiteboard', 'WiFi'],
    image_url: 'https://images.unsplash.com/photo-1692133226337-55e513450a32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxzbWFsbCUyMG1lZXRpbmclMjByb29tJTIwb2ZmaWNlfGVufDF8fHx8MTc1NzQwMzg5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-26T00:00:00.000Z'
  },
  {
    id: 3,
    name: 'Ruang C',
    code: 'C',
    capacity: 30,
    location: 'Lantai 2, Sayap Utara',
    description: 'Ruang seminar besar untuk acara resmi',
    status: 'maintenance',
    equipment: ['Proyektor', 'Sound System', 'AC', 'Panggung', 'WiFi'],
    image_url: 'https://images.unsplash.com/photo-1750768145390-f0ad18d3e65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBtZWV0aW5nJTIwcm9vbSUyMHByb2plY3RvcnxlbnwxfHx8fDE3NTc0MDM5MDJ8MA&ixlib=rb-4.1.0&q=80&w=3080&utm_source=figma&utm_medium=referral',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-26T00:00:00.000Z'
  },
  {
    id: 4,
    name: 'Ruang D',
    code: 'D',
    capacity: 15,
    location: 'Lantai 2, Sayap Selatan',
    description: 'Ruang diskusi untuk rapat internal',
    status: 'available',
    equipment: ['TV Monitor', 'AC', 'Flipchart', 'WiFi'],
    image_url: 'https://images.unsplash.com/photo-1719845853806-1c54b0ed37c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxkaXNjdXNzaW9uJTIwcm9vbSUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzU3NDAzOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-26T00:00:00.000Z'
  },
  {
    id: 5,
    name: 'Ruang E',
    code: 'E',
    capacity: 40,
    location: 'Lantai 3, Auditorium',
    description: 'Auditorium untuk presentasi besar dan pelatihan',
    status: 'available',
    equipment: ['Proyektor', 'Sound System', 'AC', 'Kursi Auditorium', 'Panggung', 'WiFi'],
    image_url: 'https://images.unsplash.com/photo-1689150571822-1b573b695391?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpdG9yaXVtJTIwc2VtaW5hciUyMGhhbGx8ZW58MXx8fHwxNzU3NDAzODk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-26T00:00:00.000Z'
  },
  {
    id: 6,
    name: 'Ruang F',
    code: 'F',
    capacity: 12,
    location: 'Lantai 3, Ruang Eksekutif',
    description: 'Ruang eksekutif untuk rapat direksi',
    status: 'available',
    equipment: ['Smart TV', 'AC Premium', 'Meja Eksekutif', 'Kursi Kulit', 'WiFi Premium'],
    image_url: 'https://images.unsplash.com/photo-1589639293663-f9399bb41721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxleGVjdXRpdmUlMjBib2FyZHJvb20lMjBvZmZpY2V8ZW58MXx8fHwxNzU3NDAzODk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-26T00:00:00.000Z'
  }
];

// Reusable icons as inline SVG to avoid Lucide-React dependency
const Building2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2H2v-2Z"/><path d="M10 10V2h4v8"/><path d="M10 14V2h4v12"/><path d="M10 18V2h4v16"/>
  </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 3H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/><path d="M8 12h8a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z"/><path d="M12 18h0a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-0a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z"/>
  </svg>
);
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);
const Trash2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M6 15.15V17a2 2 0 0 0 2 2h4"/>
  </svg>
);
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21.75c-4.418 0-8-3.582-8-8s8-8 8-8 8 3.582 8 8-3.582 8-8 8z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-1.22 2.78L10 8l-.94-1.91a2 2 0 0 0-2.83 2.83L7 12l-1.91.94A2 2 0 0 0 4.78 14h-2.7a2 2 0 0 0-2.78-1.22l-1.94-.94A2 2 0 0 0 0 10.78V10h-.44a2 2 0 0 0-2.78-1.22L-4 8l-1.91-.94A2 2 0 0 0-7.83 7.23L-8 12l-1.91-.94A2 2 0 0 0-11.83 7.23L-12 8l-1.91-.94A2 2 0 0 0-11.83 7.23L-12 8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.62"/><path d="M22 4 12 14.01l-3-3"/>
  </svg>
);
const WrenchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l4-4a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0z"/><path d="M10 20l4-4"/><path d="M4 14l-2 2v2a2 2 0 0 0 2 2h2l2-2"/><path d="m14 14 6-6"/><path d="m12 12-4-4"/><path d="m16 18-2 2"/><path d="m18 20-2 2"/><path d="m20 22-2 2"/><path d="m22 24-2 2"/>
  </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

// --- Tailwind CSS Utility Class Combiner ---
// This simple function replaces the 'clsx' or 'tailwind-merge' utility
// to handle conditional class names.
function cn(...classNames: (string | boolean | null | undefined)[]) {
  return classNames.filter(Boolean).join(' ');
}

const getStatusColor = (status: Room['status']) => {
  switch (status) {
    case 'available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'occupied':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'maintenance':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusLabel = (status: Room['status']) => {
  switch (status) {
    case 'available':
      return 'Tersedia';
    case 'occupied':
      return 'Sedang Digunakan';
    case 'maintenance':
      return 'Maintenance';
    default:
      return 'Unknown';
  }
};

const getStatusIcon = (status: Room['status']) => {
  switch (status) {
    case 'available':
      return CheckCircleIcon;
    case 'occupied':
      return UsersIcon;
    case 'maintenance':
      return WrenchIcon;
    default:
      return null;
  }
};

const useToast = () => {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const show = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const ToastComponent = () => (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg transition-transform transform",
        toast.visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        "bg-gray-800 text-white"
      )}
    >
      {toast.message}
    </div>
  );

  return { show, ToastComponent };
};

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
    {children}
  </div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-2">
    {children}
  </div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn("text-lg font-semibold tracking-tight", className)}>
    {children}
  </h3>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500">
    {children}
  </p>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);

const Button = ({ children, className, onClick, variant = 'default', size = 'default' }: { children: React.ReactNode; className?: string; onClick: () => void; variant?: 'default' | 'outline' | 'destructive' | 'secondary'; size?: 'default' | 'sm' }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    'default': "bg-blue-600 text-white hover:bg-blue-700",
    'outline': "border border-gray-300 text-gray-700 hover:bg-gray-100",
    'destructive': "bg-red-600 text-white hover:bg-red-700",
    'secondary': "bg-gray-100 text-gray-900 hover:bg-gray-200"
  };
  const sizes = {
    'default': "h-10 py-2 px-4",
    'sm': "h-8 px-3 text-sm"
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className, variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'secondary' | 'outline' }) => {
  const variants = {
    'default': "bg-gray-900 text-white",
    'secondary': "bg-gray-100 text-gray-800",
    'outline': "text-gray-800 border border-gray-200"
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
      {children}
    </span>
  );
};

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn("flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500", className)}
    {...props}
  />
);

const Label = ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor: string; className?: string }) => (
  <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
    {children}
  </label>
);

const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn("flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500", className)}
    {...props}
  />
);

// Simple implementation for Select
const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {children}
  </select>
);
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>;
const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectValue = () => <></>; // Placeholder

// Dialog/Modal Component
const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  // Simple trigger implementation for the button
  return children;
};
const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>;
const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="space-y-2 text-center sm:text-left">{children}</div>;
const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h3>;
const DialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-gray-500">{children}</p>;
const DialogFooter = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">{children}</div>;

// AlertDialog/Modal Component
const AlertDialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        {children}
      </div>
    </div>
  );
};
const AlertDialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  return children;
};
const AlertDialogContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => <div className="space-y-2 text-center">{children}</div>;
const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold">{children}</h3>;
const AlertDialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-gray-500">{children}</p>;
const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">{children}</div>;
const AlertDialogCancel = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <Button variant="outline" onClick={onClick}>{children}</Button>;
const AlertDialogAction = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick: () => void }) => <Button variant="destructive" onClick={onClick} className={className}>{children}</Button>;


export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // New state for delete confirmation
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: '',
    location: '',
    description: '',
    status: 'available' as Room['status'],
    equipment: [] as string[],
    image_url: ''
  });
  const { show: showToast, ToastComponent } = useToast();

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRoom = () => {
    if (!formData.name || !formData.code || !formData.capacity || !formData.location) {
      showToast('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const newRoom: Room = {
      id: rooms.length + 1,
      name: formData.name,
      code: formData.code,
      capacity: parseInt(formData.capacity),
      location: formData.location,
      description: formData.description,
      status: formData.status,
      equipment: formData.equipment,
      image_url: formData.image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setRooms([...rooms, newRoom]);
    setIsCreateDialogOpen(false);
    resetForm();
    showToast('Ruangan berhasil ditambahkan');
  };

  const handleEditRoom = () => {
    if (!selectedRoom || !formData.name || !formData.code || !formData.capacity || !formData.location) {
      showToast('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const updatedRooms = rooms.map(room => 
      room.id === selectedRoom.id 
        ? {
            ...room,
            name: formData.name,
            code: formData.code,
            capacity: parseInt(formData.capacity),
            location: formData.location,
            description: formData.description,
            status: formData.status,
            equipment: formData.equipment,
            image_url: formData.image_url,
            updated_at: new Date().toISOString()
          }
        : room
    );

    setRooms(updatedRooms);
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedRoom(null);
    showToast('Ruangan berhasil diperbarui');
  };

  const handleDeleteRoom = () => {
    if (selectedRoom) {
      setRooms(rooms.filter(r => r.id !== selectedRoom.id));
      setIsDeleteDialogOpen(false);
      showToast('Ruangan berhasil dihapus');
      setSelectedRoom(null);
    }
  };

  const openEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      code: room.code,
      capacity: room.capacity.toString(),
      location: room.location,
      description: room.description || '',
      status: room.status,
      equipment: room.equipment,
      image_url: room.image_url || ''
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };


  const openDetailDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      capacity: '',
      location: '',
      description: '',
      status: 'available',
      equipment: [],
      image_url: ''
    });
  };

  const availableEquipment = [
    'Proyektor', 'TV Monitor', 'Smart TV', 'AC', 'AC Premium', 'Whiteboard', 
    'Flipchart', 'Microphone', 'Sound System', 'WiFi', 'WiFi Premium', 
    'Panggung', 'Kursi Auditorium', 'Meja Eksekutif', 'Kursi Kulit'
  ];

  const RoomDetailDialog = ({ isOpen, onOpenChange, room }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    room: Room | null;
  }) => {
    if (!room) return null;
    
    const StatusIcon = getStatusIcon(room.status);
    
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{room.name}</DialogTitle>
            <DialogDescription>
              Detail lengkap ruangan dan fasilitasnya
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Room Image */}
            {room.image_url && (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={room.image_url}
                  alt={`Preview ${room.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className={cn("backdrop-blur-sm bg-white/90", getStatusColor(room.status))}>
                    {StatusIcon && <StatusIcon className="h-4 w-4 mr-2" />}
                    {getStatusLabel(room.status)}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                    <h3 className="text-white text-xl font-semibold">{room.name}</h3>
                    <p className="text-white/80 text-sm">{room.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Room Information Grid */}
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2Icon className="h-5 w-5" />
                  Informasi Ruangan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500" htmlFor="code">Kode Ruangan</Label>
                    <p className="text-lg font-semibold">{room.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500" htmlFor="capacity">Kapasitas</Label>
                    <p className="text-lg font-semibold">{room.capacity} orang</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500" htmlFor="location">Lokasi</Label>
                  <p className="flex items-center gap-2 mt-1">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    {room.location}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500" htmlFor="status">Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={cn("", getStatusColor(room.status))}>
                      {StatusIcon && <StatusIcon className="h-4 w-4 mr-2" />}
                      {getStatusLabel(room.status)}
                    </Badge>
                  </div>
                </div>
                {room.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500" htmlFor="description">Deskripsi</Label>
                    <p className="mt-1 text-sm leading-relaxed">{room.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Fasilitas & Peralatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {room.equipment.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {room.equipment.map((equipment) => (
                      <div key={equipment} className="flex items-center gap-3 p-3 rounded-lg bg-gray-100">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        <span className="font-medium">{equipment}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    Tidak ada fasilitas yang terdaftar
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Terakhir diperbarui: {new Date(room.updated_at).toLocaleDateString('id-ID')}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    openEditDialog(room);
                  }}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit Ruangan
                </Button>
                <Button onClick={() => {
                  onOpenChange(false);
                  showToast(`Mulai peminjaman ${room.name}`);
                }}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Buat Peminjaman
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const RoomFormDialog = ({ isOpen, onOpenChange, title, onSubmit }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onSubmit: () => void;
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Lengkapi informasi ruangan di bawah ini
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Ruangan *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Masukkan nama ruangan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode Ruangan *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="A, B, C, dst."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasitas *</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                placeholder="Jumlah orang"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: Room['status']) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="occupied">Sedang Digunakan</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Lantai, sayap, area"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Deskripsi ruangan (opsional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL Gambar Ruangan</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              placeholder="https://example.com/room-image.jpg (opsional)"
            />
            {formData.image_url && (
              <div className="mt-3">
                <Label className="text-sm font-medium text-gray-500">Preview Gambar:</Label>
                <div className="mt-2 relative h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={formData.image_url}
                    alt="Preview ruangan"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Fasilitas</Label>
            <div className="grid grid-cols-3 gap-2">
              {availableEquipment.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={equipment}
                    checked={formData.equipment.includes(equipment)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData, 
                          equipment: [...formData.equipment, equipment]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          equipment: formData.equipment.filter(eq => eq !== equipment)
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <Label htmlFor={equipment} className="text-sm">
                    {equipment}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit}>
            {title.includes('Tambah') ? 'Tambah Ruangan' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  const RoomCard = ({ room }: { room: Room }) => {
    const StatusIcon = getStatusIcon(room.status);
    return (
      <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
        {room.image_url && (
          <div 
            className="relative h-48 overflow-hidden cursor-pointer"
            onClick={() => openDetailDialog(room)}
          >
            <img
              src={room.image_url}
              alt={`Preview ${room.name}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/40 transition-all duration-300" />
            
            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <EyeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className={cn("text-xs backdrop-blur-sm bg-white/90", getStatusColor(room.status))}>
                {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                {getStatusLabel(room.status)}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 group-hover:bg-black/70 transition-all duration-300">
                <span className="text-white font-semibold text-lg">{room.name}</span>
                <p className="text-white/80 text-sm">{room.capacity} orang</p>
              </div>
            </div>
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {!room.image_url && (
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{room.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4" />
                    {room.location}
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-xs", getStatusColor(room.status))}>
                  {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                  {getStatusLabel(room.status)}
                </Badge>
              </div>
            )}

            {room.image_url && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4" />
                {room.location}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <UsersIcon className="h-4 w-4 text-gray-500" />
                <span>Kapasitas: {room.capacity} orang</span>
              </div>
              
              {room.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {room.description}
                </p>
              )}
            </div>

            {room.equipment.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <SettingsIcon className="h-4 w-4" />
                  Fasilitas:
                </div>
                <div className="flex flex-wrap gap-1">
                  {room.equipment.slice(0, 3).map((eq) => (
                    <Badge key={eq} variant="secondary" className="text-xs">
                      {eq}
                    </Badge>
                  ))}
                  {room.equipment.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{room.equipment.length - 3} lainnya
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(room)}>
                <EditIcon className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => openDeleteDialog(room)}>
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="font-[Inter] bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}
      </style>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Manajemen Ruangan
          </h1>
          <p className="text-gray-500">
            Kelola data ruangan dan fasilitasnya
          </p>
        </div>
        
        <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Tambah Ruangan
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Cari ruangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="available">Tersedia</SelectItem>
                    <SelectItem value="occupied">Sedang Digunakan</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Ruangan</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
              <Building2Icon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tersedia</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {rooms.filter(r => r.status === 'available').length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sedang Digunakan</p>
                <p className="text-2xl font-bold text-orange-600">
                  {rooms.filter(r => r.status === 'occupied').length}
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Maintenance</p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms.filter(r => r.status === 'maintenance').length}
                </p>
              </div>
              <WrenchIcon className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => <RoomCard key={room.id} room={room} />)}
      </div>

      <RoomFormDialog 
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tambah Ruangan Baru"
        onSubmit={handleCreateRoom}
      />

      <RoomFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Ruangan"
        onSubmit={handleEditRoom}
      />
      
      <RoomDetailDialog 
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        room={selectedRoom}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ruangan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Ini akan menghapus data ruangan secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRoom}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ToastComponent />
    </div>
  );
}
