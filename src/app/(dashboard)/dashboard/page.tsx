import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { CheckCircle2, Clock, Star, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAvatar } from "@/components/features/user-avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const prisma = new PrismaClient()

type DashboardData = {
    role: 'parent'
    family: {
        users: { id: string; name: string; points: number; avatar: string | null }[]
    }
    pendingChores: number
    completedChores: number
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
        // Parent Data: Family overview
        const family = await prisma.family.findUnique({
            where: { id: familyId },
            include: {
                users: true,
                templates: true,
            }
        })

        const pendingChores = await prisma.choreAssignment.count({
            where: {
                template: { familyId },
                status: "Pending"
            }
        })

        const completedChoresCount = await prisma.choreAssignment.count({
            where: {
                template: { familyId },
                status: "Completed" // Waiting for approval
            }
        })

        // Fetch actual completed chores for approval list
        const choresToApprove = await prisma.choreAssignment.findMany({
            where: {
                template: { familyId },
                status: "Completed"
            },
            include: {
                template: true,
                assignedTo: true
            }
        })

        return { family, pendingChores, completedChoresCount, choresToApprove }
    } else {
        // Child Data: Personal overview
        const myChores = await prisma.choreAssignment.findMany({
            where: {
                assignedToId: userId,
                status: { in: ["Pending", "Completed", "Approved"] } // Show approved recently too? Maybe just pending/completed for now
            },
            include: { template: true },
            orderBy: { dueDate: 'asc' }
        })

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        return { myChores, points: user?.points || 0 }
    }
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user) return null

    // @ts-expect-error -- Session user type is extended at runtime
    const { role, familyId, id } = session.user

    if (!familyId) {
        return <div className="p-4">You are not part of a family yet.</div>
    }

    const data = await getData(id as string, role as string, familyId as string)

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {session.user.name?.split(' ')[0]}!
                </h1>
                <p className="text-gray-500">Here's what's happening today.</p>
            </header>

            {role === 'child' ? (
                // Child View
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <Star className="w-6 h-6 fill-white" />
                                <span className="font-semibold opacity-90">My Points</span>
                            </div>
                            {/* @ts-ignore */}
                            <div className="text-4xl font-bold">{data.points}</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex items-center gap-3 mb-2 text-indigo-600">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="font-semibold">To Do</span>
                            </div>
                            {/* @ts-ignore */}
                            <div className="text-4xl font-bold text-gray-900">{data.myChores.filter(c => c.status === 'Pending').length}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <h2 className="font-semibold text-gray-900">My Chores</h2>
                        </div>
                        <div className="divide-y">
                            {/* @ts-ignore */}
                            {data.myChores.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No chores assigned! 🎉</div>
                            ) : (
                                /* @ts-ignore */
                                data.myChores.map((chore) => (
                                    <div key={chore.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{chore.template.title}</h3>
                                            <p className="text-sm text-gray-500">{chore.template.basePoints} pts • Due {chore.dueDate ? new Date(chore.dueDate).toLocaleDateString() : 'No date'}</p>
                                        </div>
                                        <CompleteChoreButton choreId={chore.id} status={chore.status} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            ) : (
                // Parent View
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex items-center gap-3 mb-2 text-blue-600">
                                <Clock className="w-6 h-6" />
                                <span className="font-semibold">Pending Approval</span>
                            </div>
                            {/* @ts-ignore */}
                            <div className="text-3xl font-bold text-gray-900">{data.completedChoresCount}</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex items-center gap-3 mb-2 text-indigo-600">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="font-semibold">Assigned</span>
                            </div>
                            {/* @ts-ignore */}
                            <div className="text-3xl font-bold text-gray-900">{data.pendingChores}</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex items-center gap-3 mb-2 text-orange-600">
                                <Trophy className="w-6 h-6" />
                                <span className="font-semibold">Family Members</span>
                            </div>
                            {/* @ts-ignore */}
                            <div className="text-3xl font-bold text-gray-900">{data.family.users.length}</div>
                        </div>
                    </div>

                    {/* Pending Approvals Section */}
                    {/* @ts-ignore */}
                    {data.choresToApprove.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="p-4 border-b bg-yellow-50 flex justify-between items-center">
                                <h2 className="font-semibold text-yellow-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Waiting for Approval
                                </h2>
                            </div>
                            <div className="divide-y">
                                {/* @ts-ignore */}
                                {data.choresToApprove.map((chore) => (
                                    <div key={chore.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {chore.assignedTo.name[0]}
                                            </div>
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
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-900">Family Members</h2>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* @ts-expect-error -- Data structure includes users */}
                            {data.family.users.map(user => (
                                <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.points} points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
