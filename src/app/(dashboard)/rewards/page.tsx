import { auth } from "@/auth"
import { RewardsClient } from "./rewards-client"

export default async function RewardsPage() {
    const session = await auth()
    if (!session?.user) return null

    // @ts-expect-error -- Session user type is extended at runtime
    const { role } = session.user

    return <RewardsClient role={role as string} />
}
