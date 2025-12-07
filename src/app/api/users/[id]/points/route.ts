import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const updatePointsSchema = z.object({
    points: z.number(), // Delta or absolute? Let's do delta for simplicity in UI, or absolute. Let's do delta.
    reason: z.string().optional(),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-expect-error -- Session user type is extended at runtime
    const { role, familyId } = session.user

    if (role !== 'parent') {
        return new NextResponse("Only parents can manage points", { status: 403 })
    }

    const userId = params.id

    try {
        const json = await req.json()
        const { points } = updatePointsSchema.parse(json)

        // Verify user belongs to family
        const targetUser = await prisma.user.findUnique({ where: { id: userId } })
        if (!targetUser || targetUser.familyId !== familyId) {
            return new NextResponse("User not found in family", { status: 404 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { points: { increment: points } }
        })

        return NextResponse.json(updatedUser)
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

