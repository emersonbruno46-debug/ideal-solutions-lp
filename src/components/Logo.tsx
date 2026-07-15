interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "white";
}

const sizeMap = {
  sm: "h-20",
  md: "h-24",
  lg: "h-40",
  xl: "h-48",
};

const Logo = ({ size = "md", className = "", variant = "default" }: LogoProps) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img 
        src="/logo.svg" 
        alt="ZapAgenda" 
        className={`${sizeMap[size]} w-auto object-contain ${variant === "white" ? "brightness-0 invert" : ""}`}
      />
    </div>
  );
};

export default Logo;
