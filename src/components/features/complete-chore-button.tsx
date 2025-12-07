"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

interface CompleteChoreButtonProps {
    choreId: string
    status: string
}

export function CompleteChoreButton({ choreId, status }: CompleteChoreButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleComplete = async () => {
        if (status !== "Pending") return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/chores/${choreId}/complete`, {
                method: "POST",
            })

            if (!res.ok) {
                throw new Error("Failed to complete chore")
            }

            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to mark as complete")
        } finally {
            setIsLoading(false)
        }
    }

    if (status === "Completed") {
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Waiting Approval
            </span>
        )
    }

    if (status === "Approved") {
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Done
            </span>
        )
    }

    return (
        <button
            onClick={handleComplete}
            disabled={isLoading}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
        >
            {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <CheckCircle2 className="w-3 h-3" />
            )}
            Mark Complete
        </button>
    )
}
