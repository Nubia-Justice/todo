import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-expect-error -- Session user type is extended at runtime
    const { role, id: userId } = session.user

    if (role !== 'parent') {
        return new NextResponse("Only parents can approve chores", { status: 403 })
    }

    const choreId = params.id

    try {
        // Start a transaction to update status and add points
        await prisma.$transaction(async (tx) => {
            const assignment = await tx.choreAssignment.findUnique({
                where: { id: choreId },
                include: { template: true }
            })

            if (!assignment) throw new Error("Chore not found")
            if (assignment.status !== 'Completed') throw new Error("Chore is not ready for approval")

            // 1. Update assignment status
            await tx.choreAssignment.update({
                where: { id: choreId },
                data: { status: "Approved" }
            })

            // 2. Update completion log
            // Find the latest completion log for this assignment
            const log = await tx.choreCompletionLog.findFirst({
                where: { assignmentId: choreId },
                orderBy: { timestamp: 'desc' }
            })

            if (log) {
                await tx.choreCompletionLog.update({
                    where: { id: log.id },
                    data: {
                        approvedById: userId,
                        approvedAt: new Date()
                    }
                })
            }

            // 3. Add points to user
            await tx.user.update({
                where: { id: assignment.assignedToId },
                data: {
                    points: { increment: assignment.template.basePoints }
                }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to approve chore:", error)
        return new NextResponse(error instanceof Error ? error.message : "Internal Server Error", { status: 500 })
    }
}
