import { auth } from "@/auth"
import { ChoresClient } from "./chores-client"

export default async function ChoresPage() {
    const session = await auth()
    if (!session?.user) return null

    // @ts-expect-error -- Session user type is extended at runtime
    const { role } = session.user

    return <ChoresClient role={role as string} />
}
