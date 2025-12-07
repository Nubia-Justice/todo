import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { UserAvatar } from "./user-avatar"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"

interface ChoreCardProps {
    chore: {
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
        dueDate: string | Date | null
        status: string
    }
    onMarkDone?: (id: string) => void
    onEdit?: (chore: ChoreCardProps['chore']) => void
    onDelete?: (id: string) => void
    showAssignee?: boolean
}

export function ChoreCard({ chore, onMarkDone, onEdit, onDelete, showAssignee = true }: ChoreCardProps) {
    const isPending = chore.status === "Pending"
    const isCompleted = chore.status === "Completed"
    const isApproved = chore.status === "Approved"

    return (
        <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow group relative">
            <CardContent className="p-4 flex flex-col h-full">
                {(onEdit || onDelete) && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                                onClick={() => onEdit(chore)}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                                onClick={() => onDelete(chore.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                )}

                <div>
                    <div className="flex justify-between items-start mb-2 pr-16">
                        <h3 className="font-semibold text-gray-900 line-clamp-1" title={chore.template.title}>
                            {chore.template.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-indigo-600 shrink-0 bg-indigo-50 px-2 py-0.5 rounded-full">
                            +{chore.template.basePoints} pts
                        </span>
                    </div>

                    {chore.template.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2" title={chore.template.description}>
                            {chore.template.description}
                        </p>
                    )}

                    <p className="text-sm text-gray-500 mb-4">
                        Due: {chore.dueDate ? format(new Date(chore.dueDate), "MMM d, yyyy") : "No date"}
                    </p>

                    {showAssignee && chore.assignedTo && (
                        <div className="flex items-center gap-2 mb-4">
                            <UserAvatar name={chore.assignedTo.name} image={chore.assignedTo.avatar} size="sm" />
                            <span className="text-sm text-gray-600 truncate">{chore.assignedTo.name}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                    <Badge
                        variant={
                            isCompleted ? "warning" : isApproved ? "success" : "secondary"
                        }
                    >
                        {isCompleted ? "Waiting Approval" : chore.status}
                    </Badge>

                    {isPending && onMarkDone && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            onClick={() => onMarkDone(chore.id)}
                        >
                            Mark Done
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

