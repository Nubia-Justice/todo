"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApproveChoreButtonProps {
    choreId: string
}

export function ApproveChoreButton({ choreId }: ApproveChoreButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleApprove() {
        setLoading(true)
        try {
            const res = await fetch(`/api/chores/${choreId}/approve`, {
                method: 'POST'
            })
            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to approve", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            variant="success"
            onClick={handleApprove}
            disabled={loading}
            className="gap-1"
        >
            <Check className="w-4 h-4" />
            {loading ? "..." : "Approve"}
        </Button>
    )
}
