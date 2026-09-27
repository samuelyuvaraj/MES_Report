import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./ui.css";
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { label: string; children: ReactNode; badge?: boolean; }
export function IconButton({ label, children, badge, className = "", ...props }: IconButtonProps) { return <button aria-label={label} title={label} className={`icon-button ${className}`} {...props}>{children}{badge && <span className="icon-button__badge" />}</button>; }
