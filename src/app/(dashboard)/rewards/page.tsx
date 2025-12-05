"use client"

import { useState, useEffect } from "react"
import { Gift, Plus, Coins } from "lucide-react"

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
                <button
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Reward
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading rewards...</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rewards.map((reward) => (
                        <div key={reward.id} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-4">
                                <Gift className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{reward.title}</h3>
                            <div className="flex items-center gap-1 text-yellow-600 font-bold mb-4">
                                <Coins className="w-4 h-4" />
                                <span>{reward.pointsRequired} pts</span>
                            </div>
                            <button
                                onClick={() => handleRedeem(reward.id)}
                                className="w-full py-2 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                            >
                                Redeem
                            </button>
                        </div>
                    ))}

                    {rewards.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No rewards available yet. Parents, add some!
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
