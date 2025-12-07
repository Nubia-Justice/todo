"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChoreCard } from "@/components/features/chore-card"
import { AssignChoreModal } from "@/components/features/assign-chore-modal"

type Chore = {
    id: string
    template: {
        title: string
        basePoints: number
        description?: string | null
    }
    assignedTo?: {
        name: string
        avatar: string | null
    }
    assignedToId: string
    dueDate: string | null
    status: string
}

interface ChoresClientProps {
    role: string
}

export function ChoresClient({ role }: ChoresClientProps) {
    const [chores, setChores] = useState<Chore[]>([])
    const [loading, setLoading] = useState(true)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [choreToEdit, setChoreToEdit] = useState<Chore | undefined>(undefined)
    const router = useRouter()

    const isParent = role === 'parent'

    useEffect(() => {
        fetchChores()
    }, [])

    async function fetchChores() {
        try {
            const res = await fetch("/api/chores")
            if (res.ok) {
                const data = await res.json()
                setChores(data)
            }
        } catch (error) {
            console.error("Failed to fetch chores", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleMarkDone(id: string) {
        try {
            const res = await fetch(`/api/chores/${id}/complete`, {
                method: 'POST'
            })
            if (res.ok) {
                fetchChores()
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to mark done", error)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this chore?")) return

        try {
            const res = await fetch(`/api/chores/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchChores()
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete chore", error)
        }
    }

    function handleEdit(chore: Chore) {
        setChoreToEdit(chore)
        setShowAssignModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Chores</h1>
                {isParent && (
                    <Button onClick={() => {
                        setChoreToEdit(undefined)
                        setShowAssignModal(true)
                    }}>
                        <Plus className="w-5 h-5 mr-2" />
                        Assign Chore
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading chores...</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {chores.map((chore) => (
                        <ChoreCard
                            key={chore.id}
                            chore={chore}
                            onMarkDone={handleMarkDone}
                            onEdit={isParent ? handleEdit : undefined}
                            onDelete={isParent ? handleDelete : undefined}
                        />
                    ))}
                    {chores.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                            No chores found. {isParent ? "Assign one to get started!" : "You're all caught up!"}
                        </div>
                    )}
                </div>
            )}

            {showAssignModal && (
                <AssignChoreModal
                    choreToEdit={choreToEdit}
                    onClose={() => {
                        setShowAssignModal(false)
                        setChoreToEdit(undefined)
                    }}
                    onSuccess={() => {
                        setShowAssignModal(false)
                        setChoreToEdit(undefined)
                        fetchChores()
                    }}
                />
            )}
        </div>
    )
}
