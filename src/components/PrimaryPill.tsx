import type { ButtonHTMLAttributes } from "react";
export function PrimaryPill({
  secondary = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button
      className={`pill ${secondary ? "secondary" : "primary"} ${className}`}
      {...props}
    />
  );
}
