import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const createRewardSchema = z.object({
    title: z.string().min(1),
    pointsRequired: z.coerce.number().min(1),
})

export async function GET() {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-expect-error -- Session user type is extended at runtime
    const { familyId } = session.user
    if (!familyId) return new NextResponse("No family found", { status: 400 })

    try {
        const rewards = await prisma.reward.findMany({
            where: { familyId, isActive: true },
            orderBy: { pointsRequired: 'asc' }
        })
        return NextResponse.json(rewards)
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-expect-error -- Session user type is extended at runtime
    const { role, familyId } = session.user

    if (role !== 'parent') {
        return new NextResponse("Only parents can create rewards", { status: 403 })
    }

    try {
        const json = await req.json()
        const body = createRewardSchema.parse(json)

        const reward = await prisma.reward.create({
            data: {
                familyId,
                title: body.title,
                pointsRequired: body.pointsRequired,
            }
        })

        return NextResponse.json(reward)
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
