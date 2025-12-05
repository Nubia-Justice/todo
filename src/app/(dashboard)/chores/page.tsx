"use client"

import { useState, useEffect } from "react"
import { Plus, CheckCircle2, Clock, XCircle, User } from "lucide-react"
import { useRouter } from "next/navigation"

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
    const router = useRouter()

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
        // In a real app, we'd probably upload a photo here first
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
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
                                        {chore.assignedTo?.avatar ? (
                                            <img src={chore.assignedTo.avatar} alt={chore.assignedTo.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{chore.assignedTo?.name?.[0] || '?'}</span>
                                        )}
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
                                    <button
                                        onClick={() => handleMarkDone(chore.id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Mark Done
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAssignModal && (
                <AssignChoreModal onClose={() => setShowAssignModal(false)} onSuccess={() => {
                    setShowAssignModal(false)
                    fetchChores()
                }} />
            )}
        </div>
    )
}

function AssignChoreModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    // Mock users for now, ideally fetch from API
    const [users, setUsers] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        // Fetch family members
        fetch('/api/family/members').then(res => res.json()).then(setUsers).catch(console.error)
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            basePoints: Number(formData.get('points')),
            assignedToId: formData.get('assignedTo'),
            dueDate: formData.get('dueDate'),
        }

        try {
            const res = await fetch('/api/chores', {
                method: 'POST',
                body: JSON.stringify(data),
            })
            if (res.ok) {
                onSuccess()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Assign New Chore</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Points</label>
                        <input name="points" type="number" required defaultValue={10} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assign To</label>
                        <select name="assignedTo" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input name="dueDate" type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Assigning...' : 'Assign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
