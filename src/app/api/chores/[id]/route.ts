import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const updateChoreSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    basePoints: z.coerce.number().min(0).optional(),
    assignedToId: z.string().min(1).optional(),
    dueDate: z.string().optional(),
})

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-expect-error -- Session user type is extended at runtime
    const { role, familyId } = session.user

    if (role !== 'parent') {
        return new NextResponse("Only parents can delete chores", { status: 403 })
    }

    try {
        const assignment = await prisma.choreAssignment.findUnique({
            where: { id: params.id },
            include: { template: true }
        })

        if (!assignment) return new NextResponse("Chore not found", { status: 404 })
        if (assignment.template.familyId !== familyId) return new NextResponse("Unauthorized", { status: 403 })

        await prisma.choreAssignment.delete({
            where: { id: params.id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Failed to delete chore:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-expect-error -- Session user type is extended at runtime
    const { role, familyId } = session.user

    if (role !== 'parent') {
        return new NextResponse("Only parents can edit chores", { status: 403 })
    }

    try {
        const json = await req.json()
        const body = updateChoreSchema.parse(json)

        const assignment = await prisma.choreAssignment.findUnique({
            where: { id: params.id },
            include: { template: true }
        })

        if (!assignment) return new NextResponse("Chore not found", { status: 404 })
        if (assignment.template.familyId !== familyId) return new NextResponse("Unauthorized", { status: 403 })

        // Update template if title/points changed
        if (body.title || body.basePoints || body.description) {
            await prisma.choreTemplate.update({
                where: { id: assignment.templateId },
                data: {
                    title: body.title,
                    description: body.description,
                    basePoints: body.basePoints,
                }
            })
        }

        // Update assignment if assignee/date changed
        if (body.assignedToId || body.dueDate) {
            await prisma.choreAssignment.update({
                where: { id: params.id },
                data: {
                    assignedToId: body.assignedToId,
                    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to update chore:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
