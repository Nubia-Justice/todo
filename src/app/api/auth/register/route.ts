import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.enum(["parent", "child"]),
    familyName: z.string().optional(),
    inviteCode: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name, role, familyName, inviteCode } = registerSchema.parse(body)

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        let familyId = null

        if (role === "parent") {
            if (!familyName) {
                return NextResponse.json(
                    { error: "Family Name is required for parents" },
                    { status: 400 }
                )
            }
            // Create new family
            const family = await prisma.family.create({
                data: {
                    name: familyName,
                    createdBy: "temp-id-placeholder", // Will update after user creation
                },
            })
            familyId = family.id
        } else {
            if (!inviteCode) {
                return NextResponse.json(
                    { error: "Invite Code is required for children" },
                    { status: 400 }
                )
            }
            // Verify invite code (familyId)
            const family = await prisma.family.findUnique({
                where: { id: inviteCode }
            })
            if (!family) {
                return NextResponse.json(
                    { error: "Invalid Invite Code" },
                    { status: 400 }
                )
            }
            familyId = family.id
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                familyId,
            },
        })

        // If parent created family, update createdBy
        if (role === "parent" && familyId) {
            await prisma.family.update({
                where: { id: familyId },
                data: { createdBy: user.id }
            })
        }

        return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

