interface BPSLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function BPSLogo({ className = "", size = "md" }: BPSLogoProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <svg 
      viewBox="0 0 120 120" 
      className={`${sizeClasses[size]} ${className}`}
      fill="currentColor"
    >
      {/* Outer Circle Border - Indonesian National Element */}
      <circle 
        cx="60" 
        cy="60" 
        r="58" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3"
      />
      
      {/* Inner Circle Background */}
      <circle cx="60" cy="60" r="55" fill="currentColor" opacity="0.05"/>
      
      {/* Top Banner with Garuda Wings Style */}
      <path 
        d="M30 25 Q60 15 90 25 L85 35 Q60 25 35 35 Z" 
        fill="currentColor" 
        opacity="0.8"
      />
      
      {/* Central Building Icon - Government Institution */}
      <g transform="translate(35, 30)">
        {/* Main Building */}
        <rect x="10" y="15" width="30" height="35" fill="currentColor" stroke="white" strokeWidth="1"/>
        <rect x="12" y="17" width="26" height="31" fill="white"/>
        
        {/* Building Columns */}
        <rect x="14" y="17" width="2" height="31" fill="currentColor"/>
        <rect x="19" y="17" width="2" height="31" fill="currentColor"/>
        <rect x="24" y="17" width="2" height="31" fill="currentColor"/>
        <rect x="29" y="17" width="2" height="31" fill="currentColor"/>
        <rect x="34" y="17" width="2" height="31" fill="currentColor"/>
        
        {/* Roof */}
        <polygon points="8,15 25,8 42,15" fill="currentColor"/>
        <polygon points="10,15 25,10 40,15" fill="white"/>
        
        {/* Flag Pole */}
        <rect x="24" y="0" width="1" height="10" fill="currentColor"/>
        <rect x="25" y="2" width="6" height="4" fill="#ff0000"/>
        <rect x="25" y="6" width="6" height="4" fill="white"/>
        
        {/* Windows Pattern */}
        <rect x="16" y="20" width="2" height="2" fill="currentColor"/>
        <rect x="21" y="20" width="2" height="2" fill="currentColor"/>
        <rect x="26" y="20" width="2" height="2" fill="currentColor"/>
        <rect x="31" y="20" width="2" height="2" fill="currentColor"/>
        
        <rect x="16" y="25" width="2" height="2" fill="currentColor"/>
        <rect x="21" y="25" width="2" height="2" fill="currentColor"/>
        <rect x="26" y="25" width="2" height="2" fill="currentColor"/>
        <rect x="31" y="25" width="2" height="2" fill="currentColor"/>
        
        <rect x="16" y="30" width="2" height="2" fill="currentColor"/>
        <rect x="21" y="30" width="2" height="2" fill="currentColor"/>
        <rect x="26" y="30" width="2" height="2" fill="currentColor"/>
        <rect x="31" y="30" width="2" height="2" fill="currentColor"/>
        
        <rect x="16" y="35" width="2" height="2" fill="currentColor"/>
        <rect x="21" y="35" width="2" height="2" fill="currentColor"/>
        <rect x="26" y="35" width="2" height="2" fill="currentColor"/>
        <rect x="31" y="35" width="2" height="2" fill="currentColor"/>
        
        {/* Main Entrance */}
        <rect x="22" y="40" width="6" height="8" fill="currentColor"/>
        <rect x="23" y="41" width="4" height="7" fill="white"/>
      </g>
      
      {/* Statistical Data Bars - Left Side */}
      <g transform="translate(15, 45)">
        <rect x="0" y="15" width="3" height="20" fill="currentColor" opacity="0.7"/>
        <rect x="5" y="10" width="3" height="25" fill="currentColor" opacity="0.7"/>
        <rect x="10" y="5" width="3" height="30" fill="currentColor" opacity="0.7"/>
        <rect x="15" y="12" width="3" height="23" fill="currentColor" opacity="0.7"/>
      </g>
      
      {/* Statistical Data Bars - Right Side */}
      <g transform="translate(85, 45)">
        <rect x="0" y="8" width="3" height="27" fill="currentColor" opacity="0.7"/>
        <rect x="5" y="18" width="3" height="17" fill="currentColor" opacity="0.7"/>
        <rect x="10" y="12" width="3" height="23" fill="currentColor" opacity="0.7"/>
        <rect x="15" y="6" width="3" height="29" fill="currentColor" opacity="0.7"/>
      </g>
      
      {/* Statistical Chart Elements */}
      <g transform="translate(25, 70)">
        {/* Pie Chart Representation */}
        <circle cx="15" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
        <path d="M15 2 A8 8 0 0 1 23 10 L15 10 Z" fill="currentColor" opacity="0.4"/>
        <path d="M23 10 A8 8 0 0 1 15 18 L15 10 Z" fill="currentColor" opacity="0.3"/>
        
        {/* Line Chart */}
        <g transform="translate(35, 0)">
          <polyline 
            points="0,15 5,8 10,12 15,5 20,10 25,3" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            opacity="0.6"
          />
          <circle cx="0" cy="15" r="1.5" fill="currentColor"/>
          <circle cx="5" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="10" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="5" r="1.5" fill="currentColor"/>
          <circle cx="20" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="25" cy="3" r="1.5" fill="currentColor"/>
        </g>
      </g>
      
      {/* BPS Text */}
      <text 
        x="60" 
        y="98" 
        textAnchor="middle" 
        fontSize="14" 
        fontWeight="bold" 
        fill="currentColor"
      >
        BPS
      </text>
      
      {/* PROVINSI RIAU Text */}
      <text 
        x="60" 
        y="110" 
        textAnchor="middle" 
        fontSize="8" 
        fill="currentColor"
        opacity="0.8"
      >
        PROVINSI RIAU
      </text>
      
      {/* Decorative Elements - Indonesian Motif */}
      <g opacity="0.3">
        <circle cx="20" cy="20" r="2" fill="currentColor"/>
        <circle cx="100" cy="20" r="2" fill="currentColor"/>
        <circle cx="20" cy="100" r="2" fill="currentColor"/>
        <circle cx="100" cy="100" r="2" fill="currentColor"/>
        
        {/* Corner ornaments */}
        <path d="M15 25 Q20 20 25 25 Q20 30 15 25" fill="currentColor"/>
        <path d="M95 25 Q100 20 105 25 Q100 30 95 25" fill="currentColor"/>
        <path d="M15 95 Q20 100 25 95 Q20 90 15 95" fill="currentColor"/>
        <path d="M95 95 Q100 100 105 95 Q100 90 95 95" fill="currentColor"/>
      </g>
    </svg>
  );
}