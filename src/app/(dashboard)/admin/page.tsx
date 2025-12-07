"use client"

import { useState, useEffect } from "react"
import { Users, PlusCircle, MinusCircle } from "lucide-react"

type User = {
    id: string
    name: string
    role: string
    points: number
    avatar: string | null
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
        fetchMembers()
    }, [])

    async function fetchMembers() {
        try {
            const res = await fetch("/api/family/members")
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error("Failed to fetch members", error)
        }
    }

    async function updatePoints(userId: string, amount: number) {
        try {
            const res = await fetch(`/api/users/${userId}/points`, {
                method: 'POST',
                body: JSON.stringify({ points: amount })
            })
            if (res.ok) {
                // Optimistic update or refetch
                fetchMembers()
            }
        } catch (error) {
            console.error("Failed to update points", error)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Parent Admin</h1>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Family Members & Points
                    </h2>
                </div>
                <div className="divide-y">
                    {users.map(user => (
                        <div key={user.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {user.name[0]}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="font-bold text-lg w-16 text-center">{user.points}</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updatePoints(user.id, -10)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        title="Remove 10 points"
                                    >
                                        <MinusCircle className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => updatePoints(user.id, 10)}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                        title="Add 10 points"
                                    >
                                        <PlusCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
