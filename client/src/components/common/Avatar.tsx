interface AvatarProps {
  src?: string | null;
  alt: string;
  initials: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-xs border",
  sm: "w-8 h-8 text-xs border-2",
  md: "w-10 h-10 text-sm border-2",
  lg: "w-14 h-14 text-base border-2",
};

export default function Avatar({
  src,
  alt,
  initials,
  size = "sm",
  className = "",
}: AvatarProps) {
  const sizeClass = sizeMap[size];

  // Only render img if src is a valid non-empty string
  if (src && src.trim() !== "") {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover border-[#CBDDE9] shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#2872A1] text-white font-bold flex items-center justify-center border-[#CBDDE9] shrink-0 ${className}`}
      aria-label={alt}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}