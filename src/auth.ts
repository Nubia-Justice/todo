import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user:", error)
        throw new Error("Failed to fetch user.")
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await getUser(email)
                    if (!user) return null
                    const passwordsMatch = await bcrypt.compare(password, user.password)

                    if (passwordsMatch) return user
                }

                console.log("Invalid credentials")
                return null
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
                // Fetch role from DB to add to session
                const user = await prisma.user.findUnique({ where: { id: token.sub } })
                if (user) {
                    // @ts-ignore
                    session.user.role = user.role
                    // @ts-ignore
                    session.user.familyId = user.familyId
                }
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})
