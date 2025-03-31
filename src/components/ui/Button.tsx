import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-default focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary:
      "bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white focus:ring-[var(--primary)]",
    secondary:
      "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] focus:ring-[var(--text-secondary)]",
    danger:
      "bg-[var(--danger)] hover:bg-opacity-90 text-white focus:ring-[var(--danger)]",
    success:
      "bg-[var(--success)] hover:bg-opacity-90 text-white focus:ring-[var(--success)]"
  };

  const sizeStyles = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg"
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const disabledStyle =
    disabled || isLoading ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
