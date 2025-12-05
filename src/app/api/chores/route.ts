import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Schema for creating a chore
const createChoreSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    basePoints: z.coerce.number().min(0),
    assignedToId: z.string().min(1),
    dueDate: z.string().optional(), // ISO string
})

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-ignore
    const { role, familyId, id } = session.user

    if (!familyId) return new NextResponse("No family found", { status: 400 })

    try {
        if (role === 'parent') {
            // Parents see all chores in the family
            const chores = await prisma.choreAssignment.findMany({
                where: { template: { familyId } },
                include: {
                    template: true,
                    assignedTo: { select: { name: true, avatar: true } }
                },
                orderBy: { dueDate: 'asc' }
            })
            return NextResponse.json(chores)
        } else {
            // Children see only their chores
            const chores = await prisma.choreAssignment.findMany({
                where: { assignedToId: id },
                include: { template: true },
                orderBy: { dueDate: 'asc' }
            })
            return NextResponse.json(chores)
        }
    } catch (error) {
        console.error("Failed to fetch chores:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-ignore
    const { role, familyId } = session.user

    if (role !== 'parent') {
        return new NextResponse("Only parents can assign chores", { status: 403 })
    }

    try {
        const json = await req.json()
        const body = createChoreSchema.parse(json)

        // 1. Create Template (or reuse if we had a template selection UI, for MVP we create new one each time or implicit)
        // For this MVP, let's create a template for each assignment to keep it simple, 
        // or we could check if a template exists. Let's create a template.

        const template = await prisma.choreTemplate.create({
            data: {
                familyId,
                title: body.title,
                description: body.description,
                basePoints: body.basePoints,
                frequency: 'one-time', // Default for now
            }
        })

        // 2. Create Assignment
        const assignment = await prisma.choreAssignment.create({
            data: {
                templateId: template.id,
                assignedToId: body.assignedToId,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                status: 'Pending',
            }
        })

        return NextResponse.json(assignment)
    } catch (error) {
        console.error("Failed to create chore:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
