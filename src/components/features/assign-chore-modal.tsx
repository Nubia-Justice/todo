import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { X } from "lucide-react"

interface AssignChoreModalProps {
    onClose: () => void
    onSuccess: () => void
    choreToEdit?: {
        id: string
        template: {
            title: string
            basePoints: number
            description?: string | null
        }
        assignedToId: string
        dueDate: string | Date | null
    }
}

export function AssignChoreModal({ onClose, onSuccess, choreToEdit }: AssignChoreModalProps) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        fetch('/api/family/members')
            .then(res => res.json())
            .then(setUsers)
            .catch(console.error)
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
            const url = choreToEdit ? `/api/chores/${choreToEdit.id}` : '/api/chores'
            const method = choreToEdit ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{choreToEdit ? 'Edit Chore' : 'Assign New Chore'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            name="title"
                            required
                            defaultValue={choreToEdit?.template.title}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Wash dishes"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            defaultValue={choreToEdit?.template.description || ''}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Optional details..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                        <input
                            name="points"
                            type="number"
                            required
                            defaultValue={choreToEdit?.template.basePoints || 10}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select
                            name="assignedTo"
                            required
                            defaultValue={choreToEdit?.assignedToId}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            name="dueDate"
                            type="date"
                            defaultValue={choreToEdit?.dueDate ? new Date(choreToEdit.dueDate).toISOString().split('T')[0] : ''}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (choreToEdit ? 'Save Changes' : 'Assign')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
