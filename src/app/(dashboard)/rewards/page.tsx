"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RewardCard } from "@/components/features/reward-card"

type Reward = {
    id: string
    title: string
    pointsRequired: number
}

export default function RewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>([])
    const [loading, setLoading] = useState(true)

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
            } else {
                const err = await res.text()
                alert("Failed to redeem: " + err)
            }
        } catch (error) {
            console.error("Failed to redeem", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Rewards Store</h1>
                <Button>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Reward
                </Button>
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
                        />
                    ))}

                    {rewards.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                            No rewards available yet. Parents, add some!
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
