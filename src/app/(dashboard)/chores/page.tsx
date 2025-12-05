"use client"

import { useState, useEffect } from "react"
import { Plus, CheckCircle2, Clock, XCircle } from "lucide-react"

type Chore = {
    id: string
    template: {
        title: string
        basePoints: number
    }
    assignedTo: {
        name: string
        avatar: string | null
    }
    dueDate: string | null
    status: string
}

export default function ChoresPage() {
    const [chores, setChores] = useState<Chore[]>([])
    const [loading, setLoading] = useState(true)
    const [showAssignModal, setShowAssignModal] = useState(false)
    // In a real app, we'd fetch family members to populate the assign dropdown
    // For MVP, we might need another API endpoint for that or pass it down

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Chores</h1>
                <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Assign Chore
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading chores...</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {chores.map((chore) => (
                        <div key={chore.id} className="bg-white rounded-lg shadow-sm border p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900">{chore.template.title}</h3>
                                    <span className="text-sm font-medium text-indigo-600">+{chore.template.basePoints} pts</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Due: {chore.dueDate ? new Date(chore.dueDate).toLocaleDateString() : 'No date'}
                                </p>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                        {chore.assignedTo?.name?.[0] || '?'}
                                    </div>
                                    <span className="text-sm text-gray-600">{chore.assignedTo?.name}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${chore.status === 'Completed' ? 'bg-yellow-100 text-yellow-800' :
                                        chore.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {chore.status}
                                </span>

                                {chore.status === 'Pending' && (
                                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                        Mark Done
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assign Modal would go here - skipping for brevity in this step */}
        </div>
    )
}
