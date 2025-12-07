"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, X } from "lucide-react"

interface ApproveChoreButtonProps {
    choreId: string
}

export function ApproveChoreButton({ choreId }: ApproveChoreButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/chores/${choreId}/approve`, {
                method: "POST",
            })

            if (!res.ok) {
                throw new Error("Failed to approve chore")
            }

            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to approve chore")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleApprove}
            disabled={isLoading}
            className="p-1 rounded-full text-green-600 hover:bg-green-50 disabled:opacity-50"
            title="Approve"
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Check className="w-5 h-5" />
            )}
        </button>
    )
}
