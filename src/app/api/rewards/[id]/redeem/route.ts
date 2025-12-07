import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // Session user type is extended at runtime
    const { id: userId } = session.user
    const rewardId = params.id

    try {
        const reward = await prisma.reward.findUnique({
            where: { id: rewardId }
        })

        if (!reward) return new NextResponse("Reward not found", { status: 404 })

        // Check points (Need to fetch fresh user points)
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || user.points < reward.pointsRequired) {
            return new NextResponse("Not enough points", { status: 400 })
        }

        // Deduct points
        await prisma.user.update({
            where: { id: userId },
            data: { points: { decrement: reward.pointsRequired } }
        })

        // Increment redeemed count
        await prisma.reward.update({
            where: { id: rewardId },
            data: { redeemedCount: { increment: 1 } }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
