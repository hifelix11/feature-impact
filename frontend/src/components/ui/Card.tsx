import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ title, actions, children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-white",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all",
        className
      )}
      onClick={onClick}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          {title && (
            <h3 className="text-sm font-semibold text-text">{title}</h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
