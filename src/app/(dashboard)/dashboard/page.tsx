import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { CheckCircle2, Clock, Star, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAvatar } from "@/components/features/user-avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ApproveChoreButton } from "@/components/features/approve-chore-button"

const prisma = new PrismaClient()

type DashboardData = {
    role: 'parent'
    family: {
        users: { id: string; name: string; points: number; avatar: string | null }[]
    }
    pendingChores: number
    completedChores: number
    choresToApprove: {
        id: string
        template: { title: string; basePoints: number }
        assignedTo: { name: string; avatar: string | null }
    }[]
} | {
    role: 'child'
    myChores: {
        id: string
        status: string
        dueDate: Date | null
        template: { title: string; basePoints: number }
    }[]
    points: number
}

async function getData(userId: string, role: string, familyId: string): Promise<DashboardData> {
    if (role === 'parent') {
        const family = await prisma.family.findUnique({
            where: { id: familyId },
            include: {
                users: {
                    select: { id: true, name: true, points: true, avatar: true }
                }
            }
        })

        if (!family) throw new Error("Family not found")

        const pendingChores = await prisma.choreAssignment.count({
            where: {
                template: { familyId },
                status: "Pending"
            }
        })

        const completedChores = await prisma.choreAssignment.count({
            where: {
                template: { familyId },
                status: "Completed"
            }
        })

        const choresToApprove = await prisma.choreAssignment.findMany({
            where: {
                template: { familyId },
                status: "Completed"
            },
            include: {
                template: { select: { title: true, basePoints: true } },
                assignedTo: { select: { name: true, avatar: true } }
            }
        })

        return {
            role: 'parent',
            family,
            pendingChores,
            completedChores,
            choresToApprove
        }
    } else {
        const myChores = await prisma.choreAssignment.findMany({
            where: {
                assignedToId: userId,
                status: { in: ["Pending", "Completed", "Approved"] }
            },
            include: { template: { select: { title: true, basePoints: true } } },
            orderBy: { dueDate: 'asc' }
        })

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true }
        })

        return {
            role: 'child',
            myChores,
            points: user?.points || 0
        }
    }
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user) return null

    // @ts-expect-error -- Session user type is extended at runtime
    const { familyId, id, role } = session.user

    if (!familyId) {
        return <div className="p-8 text-center">You are not part of a family yet.</div>
    }

    const data = await getData(id as string, role as string, familyId as string)

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {session.user.name?.split(' ')[0]}!
                </h1>
                <p className="text-gray-500">Here&apos;s what&apos;s happening today.</p>
            </header>

            {data.role === 'child' ? (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-none">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Star className="w-6 h-6 fill-white" />
                                    <span className="font-semibold opacity-90">My Points</span>
                                </div>
                                <div className="text-4xl font-bold">{data.points}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2 text-indigo-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="font-semibold">To Do</span>
                                </div>
                                <div className="text-4xl font-bold text-gray-900">
                                    {data.myChores.filter(c => c.status === 'Pending').length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 py-4">
                            <CardTitle className="text-base">My Chores</CardTitle>
                        </CardHeader>
                        <div className="divide-y">
                            {data.myChores.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No chores assigned! 🎉</div>
                            ) : (
                                data.myChores.map((chore) => (
                                    <div key={chore.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{chore.template.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {chore.template.basePoints} pts • Due {chore.dueDate ? format(chore.dueDate, "MMM d") : 'No date'}
                                            </p>
                                        </div>
                                        <Badge variant={chore.status === 'Completed' ? 'warning' : chore.status === 'Approved' ? 'success' : 'secondary'}>
                                            {chore.status === 'Completed' ? 'Waiting Approval' : chore.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2 text-blue-600">
                                    <Clock className="w-6 h-6" />
                                    <span className="font-semibold">Pending Approval</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{data.completedChores}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2 text-indigo-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="font-semibold">Assigned</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{data.pendingChores}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2 text-orange-600">
                                    <Trophy className="w-6 h-6" />
                                    <span className="font-semibold">Family Members</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900">{data.family.users.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {data.choresToApprove.length > 0 && (
                        <Card>
                            <CardHeader className="border-b bg-yellow-50/50 py-4">
                                <CardTitle className="text-base flex items-center gap-2 text-yellow-900">
                                    <Clock className="w-5 h-5" />
                                    Waiting for Approval
                                </CardTitle>
                            </CardHeader>
                            <div className="divide-y">
                                {data.choresToApprove.map((chore) => (
                                    <div key={chore.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar name={chore.assignedTo.name} image={chore.assignedTo.avatar} size="sm" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">{chore.template.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Completed by {chore.assignedTo.name} • {chore.template.basePoints} pts
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <ApproveChoreButton choreId={chore.id} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="border-b bg-gray-50/50 py-4">
                            <CardTitle className="text-base">Family Members</CardTitle>
                        </CardHeader>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.family.users.map(user => (
                                <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <UserAvatar name={user.name} image={user.avatar} />
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.points} points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}
