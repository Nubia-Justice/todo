import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-ignore
    const { id: userId } = session.user
    // In Next.js App Router, params are awaited in the component but passed as object in route handlers? 
    // Actually for route handlers in 15+ it might be different but for 14 it's standard.
    // Wait, the route path needs to be defined properly.
    // This file should be in src/app/api/chores/[id]/complete/route.ts

    // We need to parse the ID from the URL if it's not passed in params correctly in the helper
    // But standard Next.js route handler signature is (req, { params })

    const choreId = params.id

    try {
        const assignment = await prisma.choreAssignment.findUnique({
            where: { id: choreId }
        })

        if (!assignment) return new NextResponse("Chore not found", { status: 404 })

        if (assignment.assignedToId !== userId) {
            return new NextResponse("Not assigned to you", { status: 403 })
        }

        await prisma.choreAssignment.update({
            where: { id: choreId },
            data: { status: "Completed" }
        })

        // Log completion
        await prisma.choreCompletionLog.create({
            data: {
                assignmentId: choreId,
                submittedById: userId,
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
