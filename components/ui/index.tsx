// IGMART UI Primitives — Design System Components
"use client";
import { forwardRef } from "react";
import { CheckCircle2, ShieldCheck, Star, Heart } from "lucide-react";

// ═══════════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════════
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "gradient";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary:   "bg-primary hover:bg-primary-hover text-white border border-transparent shadow-[var(--shadow-sm)]",
  secondary: "bg-elevated hover:bg-border-solid text-text border border-border",
  ghost:     "bg-transparent hover:bg-elevated text-text-muted hover:text-text border border-transparent",
  danger:    "bg-danger hover:opacity-90 text-white border border-transparent",
  outline:   "bg-transparent hover:bg-elevated text-text border border-border hover:border-primary/50",
  gradient:  "text-white border border-transparent shadow-[var(--shadow-sm)] hover:opacity-90",
};

const buttonSizeStyles: Record<ButtonSize, string> = {
  xs:   "px-3 py-1.5 text-xs min-h-[32px] rounded-md gap-1.5",
  sm:   "px-4 py-2 text-sm min-h-[36px] rounded-lg gap-1.5",
  md:   "px-5 py-2.5 text-sm min-h-[44px] rounded-lg gap-2",
  lg:   "px-7 py-3 text-[15px] min-h-[48px] rounded-lg gap-2",
  icon: "w-10 h-10 rounded-lg p-0 gap-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, iconRight, fullWidth, children, disabled, className = "", style, ...props }, ref) => {
    const base = `inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed`;
    const variantCls = buttonVariantStyles[variant];
    const sizeCls = buttonSizeStyles[size];
    const gradientStyle = variant === "gradient" ? { background: "var(--gradient-brand)", ...style } : style;

    return (
      <button
        ref={ref}
        className={`${base} ${variantCls} ${sizeCls} ${fullWidth ? "w-full" : ""} ${className}`}
        style={gradientStyle}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";

// ═══════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "hot" | "sale" | "popular" | "new" | "verified" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

const badgeStyles: Record<string, string> = {
  default:  "bg-elevated text-text-muted border border-border",
  hot:      "bg-danger/10 text-danger border border-danger/20",
  sale:     "bg-warning/10 text-warning border border-warning/20",
  popular:  "bg-primary/10 text-primary-hover border border-primary/20",
  new:      "bg-success/10 text-success border border-success/20",
  verified: "bg-success/10 text-success border border-success/20",
  success:  "bg-success/10 text-success border border-success/20",
  warning:  "bg-warning/10 text-warning border border-warning/20",
  danger:   "bg-danger/10 text-danger border border-danger/20",
};

export function Badge({ children, variant = "default", size = "sm", className = "", icon }: BadgeProps) {
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold leading-none ${sizeClass} ${badgeStyles[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════
export function Card({
  children,
  className = "",
  hover = false,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}) {
  return (
    <div
      className={`bg-card border border-border rounded-xl ${padding ? "p-5" : ""} ${
        hover
          ? "transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Input({ label, error, hint, icon, iconRight, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-background border rounded-lg text-text placeholder:text-text-muted focus:outline-none transition-colors min-h-[44px] text-sm ${
            icon ? "pl-10" : "px-3"
          } ${iconRight ? "pr-10" : "pr-3"} py-2.5 ${
            error ? "border-danger focus:border-danger" : "border-border focus:border-primary-hover"
          } ${className}`}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {iconRight}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger font-medium" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-elevated rounded-md ${className}`}
      aria-hidden="true"
      role="presentation"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" aria-hidden="true">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 flex flex-col gap-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-2 flex justify-between items-end">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" aria-hidden="true">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// STARS / RATING
// ═══════════════════════════════════════════════
interface StarsProps {
  rating: number;
  count?: number;
  size?: number;
  showText?: boolean;
  compact?: boolean;
}

export function Stars({ rating, count, size = 14, showText = false, compact = false }: StarsProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
        <Star size={12} fill="var(--color-warning)" color="var(--color-warning)" />
        <span className="text-[12px] font-bold text-text">{rating.toFixed(1)}</span>
        {count !== undefined && (
          <span className="text-[11px] text-text-muted">({count.toLocaleString()})</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5" aria-label={`Rating: ${rating} out of 5`}>
      <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            fill={i <= Math.round(rating) ? "var(--color-warning)" : "transparent"}
            color={i <= Math.round(rating) ? "var(--color-warning)" : "var(--color-border-strong)"}
          />
        ))}
      </span>
      {showText && (
        <span className="text-sm font-bold text-text">
          {rating.toFixed(1)}{" "}
          {count !== undefined && (
            <span className="text-text-muted font-medium text-xs">({count.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// PRICE DISPLAY
// ═══════════════════════════════════════════════
interface PriceDisplayProps {
  price: number;
  originalPrice?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
}

export function PriceDisplay({
  price,
  originalPrice,
  currency = "$",
  size = "md",
  showDiscount = false,
}: PriceDisplayProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const priceSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  const originalSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  return (
    <div className="flex items-end gap-2 flex-wrap">
      <span className={`font-heading font-black text-text leading-none ${priceSize}`}>
        {currency}{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      {originalPrice && (
        <span className={`text-text-muted line-through mb-0.5 font-medium ${originalSize}`}>
          {currency}{originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )}
      {showDiscount && discount > 0 && (
        <span className="text-[11px] font-bold text-danger bg-danger/10 border border-danger/20 px-1.5 py-0.5 rounded-full mb-0.5">
          -{discount}%
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// SELLER AVATAR
// ═══════════════════════════════════════════════
interface SellerAvatarProps {
  username: string;
  isVerified?: boolean;
  size?: number;
}

export function SellerAvatar({ username, isVerified, size = 40 }: SellerAvatarProps) {
  const initials = username.substring(0, 2).toUpperCase();
  return (
    <div className="relative inline-flex flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-heading font-black text-white"
        style={{ background: "var(--gradient-brand)", fontSize: size * 0.38 }}
        aria-label={username}
      >
        {initials}
      </div>
      {isVerified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5" aria-label="Verified">
          <ShieldCheck size={Math.max(size * 0.4, 12)} className="text-success" />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// WISHLIST BUTTON
// ═══════════════════════════════════════════════
interface WishlistButtonProps {
  isWishlisted?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function WishlistButton({ isWishlisted = false, onClick, className = "" }: WishlistButtonProps) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); onClick?.(e); }}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
        isWishlisted
          ? "text-danger bg-danger/10 hover:bg-danger/20"
          : "text-text-muted bg-black/40 hover:bg-black/60 hover:text-danger"
      } ${className}`}
    >
      <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
    </button>
  );
}

// ═══════════════════════════════════════════════
// DIVIDER
// ═══════════════════════════════════════════════
export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-border my-5" />;
  return (
    <div className="flex items-center gap-4 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// SECTION HEADING
// ═══════════════════════════════════════════════
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeading({ eyebrow, title, subtitle, center = false }: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${center ? "text-center" : ""} ${subtitle ? "" : ""}`}>
      {eyebrow && (
        <p className="text-xs font-bold tracking-[0.1em] uppercase text-primary-hover mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl font-heading font-black text-text">{title}</h2>
      {subtitle && (
        <p className="text-text-muted text-[15px] leading-relaxed max-w-2xl mt-2.5 prose-width">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="text-4xl mb-4 opacity-40" aria-hidden="true">{icon}</div>
      )}
      <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {action}
        {secondaryAction}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// STAT CARD  (used in dashboards)
// ═══════════════════════════════════════════════
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconColor?: string;
  change?: string;
  positive?: boolean;
}

export function StatCard({ label, value, icon, iconColor, change, positive }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: iconColor, background: iconColor ? `${iconColor}18` : "var(--color-elevated)" }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <p className="font-heading font-black text-2xl text-text leading-none">{value}</p>
        {change !== undefined && (
          <p className={`text-xs font-bold mb-0.5 ${positive ? "text-success" : "text-text-muted"}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// ALERT / INFO BOX
// ═══════════════════════════════════════════════
interface AlertProps {
  variant?: "success" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertStyles = {
  success: "bg-success/5 border-success/20 text-success",
  warning: "bg-warning/5 border-warning/20 text-warning",
  danger:  "bg-danger/5 border-danger/20 text-danger",
  info:    "bg-primary/5 border-primary/20 text-primary-hover",
};

export function Alert({ variant = "info", icon, title, children, className = "" }: AlertProps) {
  return (
    <div className={`border rounded-xl p-4 flex gap-3 ${alertStyles[variant]} ${className}`} role="alert">
      {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
      <div>
        {title && <p className="text-sm font-bold mb-1">{title}</p>}
        <div className="text-sm font-medium opacity-85 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
