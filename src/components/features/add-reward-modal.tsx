import { useState } from "react"
import { Button } from "../ui/button"
import { X } from "lucide-react"

interface AddRewardModalProps {
    onClose: () => void
    onSuccess: () => void
    rewardToEdit?: {
        id: string
        title: string
        pointsRequired: number
    }
}

export function AddRewardModal({ onClose, onSuccess, rewardToEdit }: AddRewardModalProps) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title'),
            pointsRequired: Number(formData.get('points')),
        }

        try {
            const url = rewardToEdit ? `/api/rewards/${rewardToEdit.id}` : '/api/rewards'
            const method = rewardToEdit ? 'PUT' : 'POST'

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
                    <h2 className="text-xl font-bold">{rewardToEdit ? 'Edit Reward' : 'Add New Reward'}</h2>
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
                            defaultValue={rewardToEdit?.title}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Ice Cream"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points Cost</label>
                        <input
                            name="points"
                            type="number"
                            required
                            defaultValue={rewardToEdit?.pointsRequired || 50}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (rewardToEdit ? 'Save Changes' : 'Add Reward')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
