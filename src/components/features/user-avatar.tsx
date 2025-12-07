import { User } from "lucide-react"
import { cn } from "../ui/button"

interface UserAvatarProps {
    name?: string | null
    image?: string | null
    className?: string
    size?: "sm" | "md" | "lg"
}

import Image from "next/image"

export function UserAvatar({ name, image, className, size = "md" }: UserAvatarProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
    }

    const sizePixels = {
        sm: 32,
        md: 40,
        lg: 64,
    }

    return (
        <div
            className={cn(
                "rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shrink-0 relative",
                sizeClasses[size],
                className
            )}
        >
            {image ? (
                <Image
                    src={image}
                    alt={name || "User"}
                    width={sizePixels[size]}
                    height={sizePixels[size]}
                    className="object-cover"
                />
            ) : (
                <span>{name?.[0]?.toUpperCase() || <User className="w-1/2 h-1/2" />}</span>
            )}
        </div>
    )
}
