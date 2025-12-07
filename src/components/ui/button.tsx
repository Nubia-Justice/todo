import { ButtonHTMLAttributes, forwardRef } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "destructive"
    size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-indigo-600 text-white hover:bg-indigo-700": variant === "default",
                        "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700": variant === "outline",
                        "hover:bg-gray-100 text-gray-700": variant === "ghost",
                        "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
                        "h-8 px-3 text-xs": size === "sm",
                        "h-10 px-4 py-2": size === "md",
                        "h-12 px-6 text-lg": size === "lg",
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
