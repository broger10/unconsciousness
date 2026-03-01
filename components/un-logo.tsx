interface UnLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

export function UnLogo({ size = "md", className = "" }: UnLogoProps) {
  return (
    <span className={`font-bold font-display ${sizes[size]} ${className}`}>
      <span className="text-verdigris">un</span>
      <span className="text-gradient">consciousness</span>
    </span>
  );
}
