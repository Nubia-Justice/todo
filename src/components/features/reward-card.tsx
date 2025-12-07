import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Gift, Coins, Pencil, Trash2 } from "lucide-react"

interface RewardCardProps {
    reward: {
        id: string
        title: string
        pointsRequired: number
    }
    onRedeem: (id: string) => void
    onEdit?: (reward: RewardCardProps['reward']) => void
    onDelete?: (id: string) => void
}

export function RewardCard({ reward, onRedeem, onEdit, onDelete }: RewardCardProps) {
    return (
        <Card className="flex flex-col items-center text-center hover:shadow-md transition-shadow group relative">
            <CardContent className="p-6 w-full flex flex-col items-center">
                {(onEdit || onDelete) && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                                onClick={() => onEdit(reward)}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                                onClick={() => onDelete(reward.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                )}

                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-4">
                    <Gift className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1" title={reward.title}>
                    {reward.title}
                </h3>
                <div className="flex items-center gap-1 text-yellow-600 font-bold mb-4">
                    <Coins className="w-4 h-4" />
                    <span>{reward.pointsRequired} pts</span>
                </div>
                <Button
                    onClick={() => onRedeem(reward.id)}
                    className="w-full bg-gray-900 hover:bg-gray-800"
                >
                    Redeem
                </Button>
            </CardContent>
        </Card>
    )
}

