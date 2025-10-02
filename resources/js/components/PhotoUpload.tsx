import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera, 
  Upload, 
  X, 
  User,
  Image as ImageIcon,
  AlertCircle,
  Shield
} from 'lucide-react';
import { cn, getUserInitials } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface PhotoUploadProps {
  currentPhoto?: string | null;
  userName: string;
  onPhotoSelect: (file: File | null) => void;
  onPhotoRemove: () => void;
  previewUrl?: string | null;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showControls?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24', 
  lg: 'h-32 w-32',
  xl: 'h-40 w-40'
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-4xl'
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8', 
  xl: 'h-12 w-12'
};

export function PhotoUpload({
  currentPhoto,
  userName,
  onPhotoSelect,
  onPhotoRemove,
  previewUrl,
  disabled = false,
  size = 'lg',
  showControls = true,
  className
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Pilih file gambar yang valid (JPG, PNG, GIF)');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB');
        return;
      }

      onPhotoSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB');
        return;
      }
      onPhotoSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const displayPhoto = previewUrl || currentPhoto;
  const hasPhoto = Boolean(displayPhoto);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative group">
        <div
          className={cn(
            "relative cursor-pointer transition-all duration-300",
            dragOver && "scale-105",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={triggerFileInput}
        >
          <Avatar className={cn(
            sizeClasses[size], 
            "border-4 border-background shadow-xl transition-all duration-300",
            !disabled && "group-hover:shadow-2xl group-hover:scale-105",
            dragOver && "ring-4 ring-primary ring-opacity-50"
          )}>
            {displayPhoto ? (
              <AvatarImage 
                src={displayPhoto} 
                alt={userName}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className={cn(
                "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground font-bold",
                textSizeClasses[size]
              )}>
                {userName ? getUserInitials(userName) : <User className={iconSizeClasses[size]} />}
              </AvatarFallback>
            )}
          </Avatar>
          
          {/* Photo overlay controls */}
          {showControls && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                  className="rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {hasPhoto && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPhotoRemove();
                    }}
                    className="rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Photo status indicator */}
          <div className="absolute -bottom-2 -right-2 bg-background border-4 border-background rounded-full p-1">
            {hasPhoto ? (
              <div className="bg-emerald-100 text-emerald-600 rounded-full p-1">
                <ImageIcon className="h-4 w-4" />
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground rounded-full p-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Drag overlay */}
        {dragOver && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20 border-2 border-dashed border-primary rounded-full backdrop-blur-sm">
            <div className="text-center text-primary">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Lepaskan untuk upload</p>
            </div>
          </div>
        )}
      </div>

      {showControls && (
        <div className="text-center space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              disabled={disabled}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {hasPhoto ? 'Ganti Foto' : 'Upload Foto'}
            </Button>
            
            {hasPhoto && (
              <Button
                type="button"
                variant="outline"
                onClick={onPhotoRemove}
                disabled={disabled}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Hapus Foto
              </Button>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground max-w-xs">
            <p>Format: JPG, PNG, GIF. Maksimal 2MB</p>
            <p>Drag & drop foto atau klik tombol upload</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}

// Enhanced User Avatar Component with Photo Support
interface UserAvatarProps {
  user: {
    id: number;
    name: string;
    avatar?: string | null;
    role?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusIndicator?: boolean;
  showRoleIndicator?: boolean;
  className?: string;
}

export function UserAvatar({ 
  user, 
  size = 'md', 
  showStatusIndicator = false,
  showRoleIndicator = false,
  className 
}: UserAvatarProps) {
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return <Camera className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn(
        sizeClasses[size], 
        "border-2 border-background shadow-sm transition-transform hover:scale-105"
      )}>
        {user.avatar ? (
          <AvatarImage 
            src={user.avatar} 
            alt={user.name}
            className="object-cover"
          />
        ) : (
          <AvatarFallback className={cn(
            "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground font-bold",
            textSizeClasses[size]
          )}>
            {getUserInitials(user.name)}
          </AvatarFallback>
        )}
      </Avatar>
      
      {/* Photo status indicator */}
      {showStatusIndicator && (
        <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full p-1">
          {user.avatar ? (
            <div className="bg-emerald-100 text-emerald-600 rounded-full p-1">
              <ImageIcon className="h-3 w-3" />
            </div>
          ) : (
            <div className="bg-muted text-muted-foreground rounded-full p-1">
              <User className="h-3 w-3" />
            </div>
          )}
        </div>
      )}

      {/* Role indicator */}
      {showRoleIndicator && user.role && (
        <div className="absolute -top-1 -left-1 bg-background border-2 border-background rounded-full p-1">
          <div className={cn("rounded-full p-1", getRoleColor(user.role))}>
            {getRoleIcon(user.role)}
          </div>
        </div>
      )}
    </div>
  );
}