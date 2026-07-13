import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-sky-500 text-white shadow-sm hover:bg-sky-600": variant === "default",
            "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50": variant === "outline",
            "hover:bg-gray-100 hover:text-gray-900": variant === "ghost",
            "bg-red-500 text-white shadow-sm hover:bg-red-600": variant === "destructive",
            "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200": variant === "secondary",
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-12 rounded-md px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
