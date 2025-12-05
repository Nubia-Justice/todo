import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { CheckCircle2, Clock, Star, Trophy } from "lucide-react"

const prisma = new PrismaClient()

async function getData(userId: string, role: string, familyId: string) {
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

        const completedChores = await prisma.choreAssignment.count({
            where: {
                template: { familyId },
                status: "Completed" // Waiting for approval
            }
        })

        return { family, pendingChores, completedChores }
    } else {
        // Child Data: Personal overview
        const myChores = await prisma.choreAssignment.findMany({
            where: {
                assignedToId: userId,
                status: { in: ["Pending", "Completed"] }
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

    // @ts-ignore
    const { role, familyId, id } = session.user

    if (!familyId) {
        return <div className="p-4">You are not part of a family yet.</div>
    }

    const data = await getData(id, role, familyId)

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
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${chore.status === 'Completed'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {chore.status === 'Completed' ? 'Waiting Approval' : 'To Do'}
                                        </span>
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
                            <div className="text-3xl font-bold text-gray-900">{data.completedChores}</div>
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

                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-900">Family Members</h2>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* @ts-ignore */}
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
