import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // @ts-expect-error -- Session user type is extended at runtime
    const { familyId } = session.user
    if (!familyId) return new NextResponse("No family found", { status: 400 })

    try {
        const members = await prisma.user.findMany({
            where: { familyId },
            select: { id: true, name: true, role: true, avatar: true }
        })
        return NextResponse.json(members)
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
