"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RewardCard } from "@/components/features/reward-card"
import { AddRewardModal } from "@/components/features/add-reward-modal"

type Reward = {
    id: string
    title: string
    pointsRequired: number
}

interface RewardsClientProps {
    role: string
}

export function RewardsClient({ role }: RewardsClientProps) {
    const [rewards, setRewards] = useState<Reward[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [rewardToEdit, setRewardToEdit] = useState<Reward | undefined>(undefined)
    const router = useRouter()

    const isParent = role === 'parent'

    useEffect(() => {
        fetchRewards()
    }, [])

    async function fetchRewards() {
        try {
            const res = await fetch("/api/rewards")
            if (res.ok) {
                const data = await res.json()
                setRewards(data)
            }
        } catch (error) {
            console.error("Failed to fetch rewards", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleRedeem(id: string) {
        if (!confirm("Are you sure you want to redeem this reward?")) return

        try {
            const res = await fetch(`/api/rewards/${id}/redeem`, {
                method: 'POST'
            })
            if (res.ok) {
                alert("Reward redeemed! Waiting for parent approval.")
                router.refresh()
            } else {
                const err = await res.text()
                alert("Failed to redeem: " + err)
            }
        } catch (error) {
            console.error("Failed to redeem", error)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this reward?")) return

        try {
            const res = await fetch(`/api/rewards/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchRewards()
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete reward", error)
        }
    }

    function handleEdit(reward: Reward) {
        setRewardToEdit(reward)
        setShowAddModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Rewards Store</h1>
                {isParent && (
                    <Button onClick={() => {
                        setRewardToEdit(undefined)
                        setShowAddModal(true)
                    }}>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Reward
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading rewards...</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rewards.map((reward) => (
                        <RewardCard
                            key={reward.id}
                            reward={reward}
                            onRedeem={handleRedeem}
                            onEdit={isParent ? handleEdit : undefined}
                            onDelete={isParent ? handleDelete : undefined}
                        />
                    ))}

                    {rewards.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                            No rewards available yet. {isParent ? "Add some!" : "Ask your parents to add some!"}
                        </div>
                    )}
                </div>
            )}

            {showAddModal && (
                <AddRewardModal
                    rewardToEdit={rewardToEdit}
                    onClose={() => {
                        setShowAddModal(false)
                        setRewardToEdit(undefined)
                    }}
                    onSuccess={() => {
                        setShowAddModal(false)
                        setRewardToEdit(undefined)
                        fetchRewards()
                    }}
                />
            )}
        </div>
    )
}
