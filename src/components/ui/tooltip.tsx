import * as React from "react"

// Safe no-op Tooltip primitives to avoid runtime issues
// They keep the same API surface we use but do not rely on @radix-ui/react-tooltip

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const Tooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const TooltipTrigger = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { asChild?: boolean }>(
  ({ children, asChild, ...props }, ref) => {
    // Render children directly when asChild to preserve semantics
    if (asChild && React.isValidElement(children)) return children as any;
    return (
      <span ref={ref as any} {...props}>
        {children}
      </span>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, children, ...props }, ref) => (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  )
);
TooltipContent.displayName = "TooltipContent";
